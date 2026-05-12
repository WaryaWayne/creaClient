export const prerender = false

import type { APIRoute } from "astro"
import { db, contactFormSubmissions } from "@workspace/db"
import { getFormSchemaErrors } from "../../lib/form-schema-errors"
import * as Data from "effect/Data"
import * as DateTime from "effect/DateTime"
import * as Duration from "effect/Duration"
import * as Effect from "effect/Effect"
import * as Result from "effect/Result"
import * as Schema from "effect/Schema"
import * as SchemaGetter from "effect/SchemaGetter"
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

const ContactSubmissionFieldsSchema = Schema.Struct({
  name: OptionalString.pipe(
    Schema.check(
      Schema.isNonEmpty({ message: "Enter your name." }),
      Schema.isMaxLength(160, {
        message: "Name must be 160 characters or fewer.",
      })
    )
  ),
  email: OptionalString.pipe(
    Schema.decode({
      decode: SchemaGetter.toLowerCase<string>(),
      encode: SchemaGetter.toLowerCase<string>(),
    }),
    Schema.check(
      Schema.isNonEmpty({ message: "Enter your email address." }),
      Schema.isPattern(EMAIL_REGEX, {
        message: "Enter a valid email address.",
      }),
      Schema.isMaxLength(320, {
        message: "Email must be 320 characters or fewer.",
      })
    )
  ),
  phone: OptionalString.pipe(
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
  ),
  budget: OptionalString.pipe(
    Schema.check(
      Schema.isNonEmpty({ message: "Enter your monthly ad budget." }),
      Schema.isMaxLength(160, {
        message: "Monthly ad budget must be 160 characters or fewer.",
      })
    )
  ),
  message: OptionalString.pipe(
    Schema.check(
      Schema.isMaxLength(2_000, {
        message: "Message must be 2000 characters or fewer.",
      })
    )
  ),
  honeypot: OptionalString,
  "cf-turnstile-response": OptionalString,
})

const ContactSubmissionSchema = Schema.Unknown.pipe(
  Schema.decodeTo(ContactSubmissionFieldsSchema, {
    decode: SchemaGetter.transform<
      typeof ContactSubmissionFieldsSchema.Encoded,
      unknown
    >((value) =>
      value && typeof value === "object" && !Array.isArray(value) ? value : {}
    ),
    encode: SchemaGetter.transform<
      unknown,
      typeof ContactSubmissionFieldsSchema.Encoded
    >((value) => value),
  })
)

const HoneypotSchema = Schema.Unknown.pipe(
  Schema.decodeTo(Schema.Struct({ honeypot: OptionalString }), {
    decode: SchemaGetter.transform<{ readonly honeypot?: unknown }, unknown>(
      (value) =>
        value && typeof value === "object" && !Array.isArray(value) ? value : {}
    ),
    encode: SchemaGetter.transform<unknown, { readonly honeypot?: unknown }>(
      (value) => value
    ),
  })
)

type ContactSubmission = Schema.Schema.Type<
  typeof ContactSubmissionFieldsSchema
>

const emptyContactSubmission: ContactSubmission = {
  name: "",
  email: "",
  phone: "",
  budget: "",
  message: "",
  honeypot: "",
  "cf-turnstile-response": "",
}

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

type TelegramPayload = {
  name: string
  email: string
  phone: string
  budget: string
  message: string
  timestamp: string
  ip: string
}

const buildTelegramMessage = (payload: TelegramPayload) =>
  [
    "*New contact form submission*",
    "",
    `*Name:* ${formatTelegramValue(payload.name)}`,
    `*Email:* ${formatTelegramValue(payload.email)}`,
    `*Phone:* ${formatTelegramValue(payload.phone)}`,
    `*Budget:* ${formatTelegramValue(payload.budget)}`,
    `*Message:* ${formatTelegramValue(payload.message)}`,
    "",
    `*Submitted:* ${formatTelegramValue(payload.timestamp)}`,
    // `*IP:* ${formatTelegramValue(payload.ip)}`,
    // Do not need to send IP with a contact form to telegram. TODO: edit if needed
  ].join("\n")

const sendTelegramContactNotification = Effect.fn(
  "sendTelegramContactNotification"
)(function* (payload: TelegramPayload) {
  const httpClient = yield* HttpClient.HttpClient

  if (!telegramBotToken || !mainAgentTelegramId) {
    yield* Effect.logWarning(
      "[CONTACT FORM] Telegram notification skipped: missing env"
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
})

const queueTelegramContactNotification = (payload: TelegramPayload) => {
  void Effect.runPromise(
    sendTelegramContactNotification(payload).pipe(
      Effect.timeout(Duration.millis(TELEGRAM_FETCH_TIMEOUT_MS)),
      Effect.catchCause((cause) =>
        Effect.logError("[CONTACT FORM] Telegram notification failed", cause)
      ),
      Effect.provide(FetchHttpClient.layer)
    )
  )
}

const parseRequestBody = Effect.fn("parseContactFormRequestBody")(function* (
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

const hasHoneypot = (raw: unknown) => {
  const result = Schema.decodeUnknownResult(HoneypotSchema)(raw)
  return Result.isFailure(result) ? false : result.success.honeypot.length > 0
}

const getCurrentTimestamp = () =>
  DateTime.now.pipe(Effect.map(DateTime.formatIso))

const validateSubmission = (raw: unknown) => {
  const result = Schema.decodeUnknownResult(ContactSubmissionSchema)(raw, {
    errors: "all",
  })

  if (Result.isFailure(result)) {
    return {
      values: emptyContactSubmission,
      errors: getFormSchemaErrors(result.failure),
    }
  }

  return {
    values: result.success,
    errors: {},
  }
}

export const POST: APIRoute = async (context) => {
  try {
    const { request } = context
    const rawResult = await Effect.runPromise(
      parseRequestBody(request).pipe(Effect.result)
    )

    if (Result.isFailure(rawResult)) {
      await Effect.runPromise(
        Effect.logWarning(
          "[CONTACT FORM] Invalid request body",
          rawResult.failure
        )
      )

      return jsonResponse(
        { ok: false, errors: { form: "Invalid request body." } },
        400
      )
    }

    const raw = rawResult.success

    if (hasHoneypot(raw)) {
      return jsonResponse({ ok: true })
    }

    const { values, errors } = validateSubmission(raw)
    const timestamp = await Effect.runPromise(getCurrentTimestamp())
    const ip = getIp(request)
    const turnstileToken = values["cf-turnstile-response"]

    const payload = {
      name: values.name,
      email: values.email,
      phone: values.phone,
      budget: values.budget,
      message: values.message,
      timestamp,
      ip,
    }

    if (Object.keys(errors).length > 0) {
      await Effect.runPromise(
        Effect.logWarning("[CONTACT FORM] Validation failed", { errors })
      )

      return jsonResponse(
        {
          ok: false,
          errors,
        },
        400
      )
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

    // console.log("[CONTACT FORM]", payload)

    await db.insert(contactFormSubmissions).values({
      name: values.name,
      email: values.email,
      phone: values.phone || null,
      budget: values.budget,
      message: values.message || null,
      ip: ip || null,
      submittedAt: timestamp,
    })

    queueTelegramContactNotification(payload)

    // const datePrefix = timestamp.slice(0, 10)
    // const key = `contact-form/${datePrefix}/${crypto.randomUUID()}.json`
    // await env.CONTACT_BUCKET.put(key, JSON.stringify(payload))

    return jsonResponse({ ok: true })
  } catch (error) {
    await Effect.runPromise(
      Effect.logError("[CONTACT FORM] Error handling submission", error)
    )
    return jsonResponse({ ok: false }, 500)
  }
}
