import { useCallback, useEffect, useId, useRef, useState } from "react"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import { Mail, Phone, SearchCheck, Send } from "lucide-react"
import {
  getCompanyPhoneNumber,
  getCompanyPhoneNumberDisplay,
  getContactEmail,
} from "@/lib/site-config"
import type { ZarazOfferKey } from "@/lib/zaraz"

type LeadFormResult = {
  ok?: boolean
  errors?: Record<string, string>
}

type SubmitStatus = "idle" | "submitting" | "success" | "error"

const sampleAuditLeadAction = "/api/sample-audit-lead"
const contactEmail = getContactEmail()
const companyPhoneNumber = getCompanyPhoneNumber()
const companyPhoneNumberDisplay = getCompanyPhoneNumberDisplay()
const submissionFallbackError =
  "Something went wrong. Email or call us directly below."
const TURNSTILE_SCRIPT_ID = "cloudflare-turnstile-api"
const TURNSTILE_SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"

let turnstileLoadPromise: Promise<void> | null = null

const getTurnstileTheme = () =>
  document.documentElement.classList.contains("dark") ? "dark" : "light"

const loadTurnstile = () => {
  if (window.turnstile) return Promise.resolve()
  if (turnstileLoadPromise) return turnstileLoadPromise

  turnstileLoadPromise = new Promise<void>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      `#${TURNSTILE_SCRIPT_ID}, script[src="${TURNSTILE_SCRIPT_SRC}"]`
    )
    const script = existingScript ?? document.createElement("script")

    const handleLoad = () => resolve()
    const handleError = () => {
      turnstileLoadPromise = null
      reject(new Error("Failed to load Cloudflare Turnstile."))
    }

    script.addEventListener("load", handleLoad, { once: true })
    script.addEventListener("error", handleError, { once: true })

    if (!existingScript) {
      script.id = TURNSTILE_SCRIPT_ID
      script.src = TURNSTILE_SCRIPT_SRC
      script.async = true
      script.defer = true
      document.head.append(script)
    }
  })

  return turnstileLoadPromise
}

export const AuditSampleDialog = ({
  offerKey = "adsAudit",
  source = "payment-cta-button",
  triggerLabel = "Not Sure?",
  turnstileSiteKey = "",
}: {
  offerKey?: ZarazOfferKey
  source?: string
  triggerLabel?: string
  turnstileSiteKey?: string
}) => {
  const id = useId()
  const [isOpen, setIsOpen] = useState(false)
  const [status, setStatus] = useState<SubmitStatus>("idle")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const turnstileContainerRef = useRef<HTMLDivElement>(null)
  const turnstileInputRef = useRef<HTMLInputElement>(null)
  const turnstileWidgetIdRef = useRef("")

  const emailId = `${id}-email`
  const phoneId = `${id}-phone`
  const messageId = `${id}-message`

  const setTurnstileToken = useCallback((token: string) => {
    if (turnstileInputRef.current) {
      turnstileInputRef.current.value = token
    }
  }, [])

  const renderTurnstile = useCallback(() => {
    if (!turnstileSiteKey) return
    if (!turnstileContainerRef.current) return
    if (!window.turnstile || turnstileWidgetIdRef.current) return

    turnstileWidgetIdRef.current = window.turnstile.render(
      turnstileContainerRef.current,
      {
        sitekey: turnstileSiteKey,
        theme: getTurnstileTheme(),
        size: "flexible",
        callback: setTurnstileToken,
        "expired-callback": () => setTurnstileToken(""),
        "error-callback": () => setTurnstileToken(""),
      }
    )
  }, [setTurnstileToken, turnstileSiteKey])

  const requestTurnstile = useCallback(() => {
    if (!turnstileSiteKey) return

    void loadTurnstile()
      .then(renderTurnstile)
      .catch(() => {
        setErrors((currentErrors) => ({
          ...currentErrors,
          turnstile:
            "The security check could not load. Email or call us directly below.",
        }))
      })
  }, [renderTurnstile, turnstileSiteKey])

  useEffect(() => {
    return () => {
      if (turnstileWidgetIdRef.current) {
        window.turnstile?.remove(turnstileWidgetIdRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!isOpen) {
      setTurnstileToken("")

      if (turnstileWidgetIdRef.current) {
        window.turnstile?.remove(turnstileWidgetIdRef.current)
        turnstileWidgetIdRef.current = ""
      }

      return
    }

    const container = turnstileContainerRef.current
    if (!container) return

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries, activeObserver) => {
          if (!entries.some((entry) => entry.isIntersecting)) return

          activeObserver.disconnect()
          requestTurnstile()
        },
        { rootMargin: "160px" }
      )

      observer.observe(container)

      return () => observer.disconnect()
    }

    requestTurnstile()
  }, [isOpen, requestTurnstile, setTurnstileToken])

  const submitLead = async (event: {
    preventDefault: () => void
    currentTarget: HTMLFormElement
  }) => {
    event.preventDefault()

    const form = event.currentTarget
    const formData = new FormData(form)

    setStatus("submitting")
    setErrors({})

    if (turnstileSiteKey && !formData.get("cf-turnstile-response")) {
      requestTurnstile()
      setStatus("error")
      setErrors({
        turnstile: "Complete the security check and try again.",
      })
      return
    }

    try {
      const response = await fetch(sampleAuditLeadAction, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.get("email"),
          phone: formData.get("phone"),
          message: formData.get("message"),
          honeypot: formData.get("honeypot"),
          "cf-turnstile-response": formData.get("cf-turnstile-response"),
          offerKey,
          source,
          page: window.location.pathname,
        }),
      })

      const result = (await response.json()) as LeadFormResult

      if (!response.ok || !result.ok) {
        const responseErrors = result.errors ?? {}

        setErrors(
          Object.keys(responseErrors).length > 0
            ? responseErrors
            : { form: submissionFallbackError }
        )
        setStatus("error")
        return
      }

      form.reset()
      setTurnstileToken("")
      window.turnstile?.reset(turnstileWidgetIdRef.current)
      setStatus("success")
    } catch {
      setStatus("error")
      setErrors({
        form: submissionFallbackError,
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            // size="sm"
            // className={`h-auto min-h-9 border-primary/40 bg-background/80 px-4 py-2 text-sm font-semibold whitespace-normal normal-case hover:border-primary ${className ?? ""}`.trim()}
          />
        }
      >
        {triggerLabel}
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto border border-border bg-background p-0 text-foreground shadow-2xl sm:max-w-lg">
        <div className="border-b border-border bg-primary/10 px-5 py-5 pr-12">
          <DialogHeader>
            <div className="mb-3 flex h-10 w-10 items-center justify-center border border-primary/40 bg-background text-primary">
              <SearchCheck className="h-5 w-5" aria-hidden="true" />
            </div>
            <DialogTitle className="text-2xl leading-tight font-black text-foreground">
              Want one audit finding first?
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed text-foreground">
              Send your email and we will reply with one useful issue we would
              look at before you spend more on ads.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-5 pb-5">
          {status === "success" ? (
            <div className="space-y-4 py-5">
              <div>
                <p className="text-lg font-black text-foreground">We got it.</p>
                <p className="mt-2 text-sm leading-relaxed text-foreground">
                  We will send the sample finding to your inbox. If you want to
                  move faster, call or email us directly.
                </p>
              </div>
              <ContactLinks />
            </div>
          ) : (
            <>
              <form
                className="space-y-4 py-5"
                onClick={requestTurnstile}
                onFocus={requestTurnstile}
                onSubmit={submitLead}
              >
                <div>
                  <label
                    htmlFor={emailId}
                    className="mb-2 block text-xs font-bold tracking-widest text-foreground uppercase"
                  >
                    Email *
                  </label>
                  <Input
                    id={emailId}
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="you@example.com"
                    aria-invalid={errors.email ? "true" : undefined}
                    aria-describedby={
                      errors.email ? `${emailId}-error` : undefined
                    }
                  />
                  {errors.email && (
                    <p
                      id={`${emailId}-error`}
                      className="mt-1 text-xs text-destructive"
                    >
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor={phoneId}
                    className="mb-2 block text-xs font-bold tracking-widest text-foreground uppercase"
                  >
                    Phone Number
                  </label>
                  <Input
                    id={phoneId}
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="(555) 000-0000"
                    aria-invalid={errors.phone ? "true" : undefined}
                    aria-describedby={
                      errors.phone ? `${phoneId}-error` : undefined
                    }
                  />
                  {errors.phone && (
                    <p
                      id={`${phoneId}-error`}
                      className="mt-1 text-xs text-destructive"
                    >
                      {errors.phone}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor={messageId}
                    className="mb-2 block text-xs font-bold tracking-widest text-foreground uppercase"
                  >
                    What should we look at?
                  </label>
                  <Textarea
                    id={messageId}
                    name="message"
                    rows={3}
                    placeholder="My ads spend is around $1,500/month and the calls are weak."
                    aria-invalid={errors.message ? "true" : undefined}
                    aria-describedby={
                      errors.message ? `${messageId}-error` : undefined
                    }
                  />
                  {errors.message && (
                    <p
                      id={`${messageId}-error`}
                      className="mt-1 text-xs text-destructive"
                    >
                      {errors.message}
                    </p>
                  )}
                </div>

                <div className="absolute top-auto left-[-9999px] h-px w-px overflow-hidden">
                  <label htmlFor={`${id}-honeypot`}>
                    Leave this field empty
                  </label>
                  <input
                    id={`${id}-honeypot`}
                    name="honeypot"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>

                {isOpen && turnstileSiteKey && (
                  <div className="flex justify-center">
                    <div ref={turnstileContainerRef} data-turnstile-container />
                    <input
                      ref={turnstileInputRef}
                      type="hidden"
                      name="cf-turnstile-response"
                    />
                  </div>
                )}

                {errors.turnstile && (
                  <p className="text-center text-sm text-destructive">
                    {errors.turnstile}
                  </p>
                )}

                {errors.form && (
                  <p className="text-center text-sm text-destructive">
                    {errors.form}
                  </p>
                )}

                <Button
                  variant={"default"}
                  type="submit"
                  className="h-10 w-full gap-2 text-sm font-black tracking-wide uppercase"
                  disabled={status === "submitting"}
                >
                  <Send className="h-4 w-4" aria-hidden="true" />
                  {status === "submitting"
                    ? "Sending..."
                    : "Get A Free Audit Finding"}
                </Button>
              </form>

              <div className="border-t border-border pt-4">
                <p className="mb-3 text-xs font-bold tracking-widest text-foreground uppercase">
                  Prefer direct contact?
                </p>
                <ContactLinks />
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

const ContactLinks = () => (
  <div className="grid gap-2 sm:grid-cols-2">
    <Button
      variant="outline"
      nativeButton={false}
      render={<a href={`tel:${companyPhoneNumber}`} />}
      className="h-auto justify-start gap-2 px-3 py-3 text-sm"
    >
      <Phone className="h-4 w-4 text-primary" aria-hidden="true" />
      <span>{companyPhoneNumberDisplay}</span>
    </Button>
    <Button
      variant="outline"
      nativeButton={false}
      render={
        <a
          href={`mailto:${contactEmail}?subject=${encodeURIComponent(
            "Sample audit finding"
          )}`}
        />
      }
      className="h-auto justify-start gap-2 px-3 py-3 text-sm"
    >
      <Mail className="h-4 w-4 text-primary" aria-hidden="true" />
      <span>{contactEmail}</span>
    </Button>
  </div>
)
