export const prerender = false

import type { APIRoute } from "astro"
import { db, contactFormSubmissions } from "@workspace/db"
import { getFormSchemaErrors } from "../../lib/form-schema-errors"
import * as Data from "effect/Data"
import * as DateTime from "effect/DateTime"
import * as Duration from "effect/Duration"
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"
import * as SchemaGetter from "effect/SchemaGetter"
import * as Result from "effect/Result"
import * as FetchHttpClient from "effect/unstable/http/FetchHttpClient"
import * as HttpClient from "effect/unstable/http/HttpClient"
import * as HttpBody from "effect/unstable/http/HttpBody"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_REGEX = /^[+]?[\d\s().-]{7,20}$/
const TELEGRAM_API_BASE_URL = "https://api.telegram.org"
const TURNSTILE_SITEVERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify"
const TELEGRAM_FETCH_TIMEOUT_MS = 30_000

const telegramBotToken = import.meta.env.TELEGRAM_BOT_TOKEN
const mainAgentTelegramId = import.meta.env.TELEGRAM_USER_ID
const turnstileSecretKey = import.meta.env.TURNSTILE_SECRET_KEY

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
    },
  })

const getString = (value: unknown) =>
  typeof value === "string" ? value.trim() : ""

const escapeTelegramMarkdown = (value: string) =>
  value.replace(/[_*[\]()~`>#+\-=|{}.!\\]/g, "\\$&")

const formatTelegramValue = (value: string) =>
  value ? escapeTelegramMarkdown(value) : "\\-"

const getIp = (request: Request) => {
  const cfIp = request.headers.get("cf-connecting-ip")
  if (cfIp) return cfIp

  const forwardedFor = request.headers.get("x-forwarded-for")
  if (forwardedFor) return forwardedFor.split(",")[0]?.trim() ?? ""

  const realIp = request.headers.get("x-real-ip")
  if (realIp) return realIp

  return ""
}

class RequestBodyParseError extends Data.TaggedError("RequestBodyParseError")<{
  cause: unknown
}> {}

const toRequestBodyParseError = (error: unknown) =>
  new RequestBodyParseError({ cause: error })

const verifyTurnstileToken = Effect.fn("verifyTurnstileToken")(function* (
  token: string,
  ip: string
) {
  const httpClient = yield* HttpClient.HttpClient
  if (!token || !turnstileSecretKey) return false

  const body = new FormData()
  body.append("secret", turnstileSecretKey)
  body.append("response", token)
  if (ip) body.append("remoteip", ip)

  const response = yield* httpClient.post(TURNSTILE_SITEVERIFY_URL, {
    accept: "application/json",
    body: HttpBody.formData(body),
  })

  if (response.status !== 200) return false

  const result = (yield* response.json) as { success?: boolean }
  return result.success === true
})

const NormalizedString = Schema.Unknown.pipe(
  Schema.decodeTo(Schema.String, {
    decode: SchemaGetter.transform<string, unknown>((value) =>
      typeof value === "string" ? value.trim() : ""
    ),
    encode: SchemaGetter.transform<unknown, string>((value) => value),
  })
)

const OptionalString = NormalizedString.pipe(
  Schema.withDecodingDefault(Effect.succeed(""))
)

const EmailString = OptionalString.pipe(
  Schema.decode({
    decode: SchemaGetter.toLowerCase<string>(),
    encode: SchemaGetter.toLowerCase<string>(),
  }),
  Schema.check(
    Schema.isMinLength(1, { message: "Enter your email address." }),
    Schema.isPattern(EMAIL_REGEX, { message: "Enter a valid email address." }),
    Schema.isMaxLength(320, {
      message: "Email must be 320 characters or fewer.",
    })
  )
)

const PhoneString = OptionalString.pipe(
  Schema.check(
    Schema.makeFilter<string>((phone) => {
      if (!phone) return true
      if (!PHONE_REGEX.test(phone)) return "Enter a valid phone number."

      const digitsOnly = phone.replace(/\D/g, "")
      return digitsOnly.length >= 7 && digitsOnly.length <= 15
        ? true
        : "Enter a valid phone number."
    })
  )
)

const MessageString = OptionalString.pipe(
  Schema.check(
    Schema.isMaxLength(1_000, {
      message: "Note must be 1000 characters or fewer.",
    })
  )
)

const PageString = OptionalString.pipe(
  Schema.check(
    Schema.isMaxLength(255, {
      message: "Page must be 255 characters or fewer.",
    })
  )
)

const SourceString = OptionalString.pipe(
  Schema.check(
    Schema.isMaxLength(255, {
      message: "Source must be 255 characters or fewer.",
    })
  )
)

const OfferKeyString = OptionalString.pipe(
  Schema.check(
    Schema.isMaxLength(255, {
      message: "Offer key must be 255 characters or fewer.",
    })
  )
)

const AuditLeadFieldsSchema = Schema.Struct({
  email: EmailString,
  phone: PhoneString,
  message: MessageString,
  page: PageString,
  source: SourceString,
  offerKey: OfferKeyString,
})

const AuditLeadSchema = Schema.Unknown.pipe(
  Schema.decodeTo(AuditLeadFieldsSchema, {
    decode: SchemaGetter.transform<
      typeof AuditLeadFieldsSchema.Encoded,
      unknown
    >((value) =>
      value && typeof value === "object" && !Array.isArray(value) ? value : {}
    ),
    encode: SchemaGetter.transform<
      unknown,
      typeof AuditLeadFieldsSchema.Encoded
    >((value) => value),
  })
)

const validateSubmission = (raw: unknown) => {
  const result = Schema.decodeUnknownResult(AuditLeadSchema)(raw)

  if (Result.isFailure(result)) {
    return {
      values: {
        email: "",
        phone: "",
        message: "",
        page: "",
        source: "",
        offerKey: "",
      },
      errors: getFormSchemaErrors(result.failure),
    }
  }

  return { values: result.success, errors: {} }
}

const buildTelegramMessage = (payload: {
  email: string
  phone: string
  message: string
  source: string
  page: string
  offerKey: string
  timestamp: string
}) =>
  [
    "*New sample audit opt\\-in*",
    "",
    `*Email:* ${formatTelegramValue(payload.email)}`,
    `*Phone:* ${formatTelegramValue(payload.phone)}`,
    `*Offer:* ${formatTelegramValue(payload.offerKey)}`,
    `*Source:* ${formatTelegramValue(payload.source)}`,
    `*Page:* ${formatTelegramValue(payload.page)}`,
    `*Note:* ${formatTelegramValue(payload.message)}`,
    "",
    `*Submitted:* ${formatTelegramValue(payload.timestamp)}`,
  ].join("\n")

const sendTelegramNotification = Effect.fn("sendTelegramNotification")(
  function* (payload: {
    email: string
    phone: string
    message: string
    source: string
    page: string
    offerKey: string
    timestamp: string
  }) {
    const httpClient = yield* HttpClient.HttpClient

    if (!telegramBotToken || !mainAgentTelegramId) {
      yield* Effect.logWarning(
        "[SAMPLE AUDIT LEAD] Telegram notification skipped: missing env"
      )
      return
    }

    const body = yield* HttpBody.json({
      chat_id: mainAgentTelegramId,
      text: buildTelegramMessage(payload),
      parse_mode: "MarkdownV2",
      disable_web_page_preview: true,
    })

    const response = yield* httpClient.post(
      `${TELEGRAM_API_BASE_URL}/bot${telegramBotToken}/sendMessage`,
      {
        accept: "application/json",
        body,
      }
    )

    if (response.status !== 200) {
      const details = yield* response.text
      return yield* Effect.die(
        new Error(
          `Telegram sendMessage failed with ${response.status}: ${details}`
        )
      )
    }
  }
)

const queueTelegramNotification = (payload: {
  email: string
  phone: string
  message: string
  source: string
  page: string
  offerKey: string
  timestamp: string
}) => {
  void Effect.runPromise(
    sendTelegramNotification(payload).pipe(
      Effect.timeout(Duration.millis(TELEGRAM_FETCH_TIMEOUT_MS)),
      Effect.catchCause((cause) =>
        Effect.logError(
          "[SAMPLE AUDIT LEAD] Telegram notification failed",
          cause
        )
      ),
      Effect.provide(FetchHttpClient.layer)
    )
  )
}

const parseRequestBody = Effect.fn("parseAuditLeadRequestBody")(function* (
  request: Request
) {
  const contentType = request.headers.get("content-type") ?? ""

  return yield* Effect.tryPromise({
    try: async (): Promise<Record<string, unknown>> => {
      if (contentType.includes("application/json")) {
        const body = await request.json()
        return body && typeof body === "object" && !Array.isArray(body)
          ? (body as Record<string, unknown>)
          : {}
      }

      const formData = await request.formData()
      return Object.fromEntries(formData.entries())
    },
    catch: toRequestBodyParseError,
  })
})

const getCurrentTimestamp = () =>
  DateTime.now.pipe(Effect.map(DateTime.formatIso))

export const POST: APIRoute = async ({ request }) => {
  try {
    const rawResult = await Effect.runPromise(
      parseRequestBody(request).pipe(Effect.result)
    )

    if (Result.isFailure(rawResult)) {
      await Effect.runPromise(
        Effect.logWarning(
          "[SAMPLE AUDIT LEAD] Invalid request body",
          rawResult.failure
        )
      )

      return jsonResponse(
        { ok: false, errors: { form: "Invalid request body." } },
        400
      )
    }

    const raw = rawResult.success

    if (getString(raw.honeypot)) {
      return jsonResponse({ ok: true })
    }

    const { values, errors } = validateSubmission(raw)
    const timestamp = await Effect.runPromise(getCurrentTimestamp())
    const ip = getIp(request)
    const turnstileToken = getString(raw["cf-turnstile-response"])

    if (Object.keys(errors).length > 0) {
      return jsonResponse({ ok: false, errors }, 400)
    }

    const turnstileValid = await Effect.runPromise(
      verifyTurnstileToken(turnstileToken, ip).pipe(
        Effect.provide(FetchHttpClient.layer)
      )
    )

    if (!turnstileValid) {
      return jsonResponse(
        {
          ok: false,
          errors: {
            turnstile: "Complete the security check and try again.",
          },
        },
        400
      )
    }

    const noteLines = [
      "Sample audit finding opt-in.",
      values.message ? `Visitor note: ${values.message}` : "",
      values.source ? `Source: ${values.source}` : "",
      values.page ? `Page: ${values.page}` : "",
      values.offerKey ? `Offer: ${values.offerKey}` : "",
    ].filter(Boolean)

    await db.insert(contactFormSubmissions).values({
      name: "Sample audit opt-in",
      email: values.email,
      phone: values.phone || null,
      budget: "Not provided - sample audit opt-in",
      message: noteLines.join("\n"),
      ip: ip || null,
      submittedAt: timestamp,
    })

    queueTelegramNotification({
      ...values,
      timestamp,
    })

    return jsonResponse({ ok: true })
  } catch (error) {
    await Effect.runPromise(
      Effect.logError("[SAMPLE AUDIT LEAD] Error handling submission", error)
    )
    return jsonResponse({ ok: false }, 500)
  }
}
