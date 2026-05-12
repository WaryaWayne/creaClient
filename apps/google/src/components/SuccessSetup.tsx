import { useRef, useState } from "react"
import { CTAButton } from "@/components/CTAButton"
import { successSetupOffers, successSetupServiceLabels } from "@/data/offers"
import { Button } from "@workspace/ui/components/button"

// ─── Types & constants ───────────────────────────────────────────────────────

type Service = (typeof successSetupOffers)[number]["id"]

const SERVICES = successSetupOffers

const SERVICE_LABELS: Record<Service, string> = successSetupServiceLabels

type Step = { n: string; title: string; body: React.ReactNode }

function StepList({ steps, accent }: { steps: Step[]; accent: boolean }) {
  return (
    <div className="space-y-4 px-6 py-6">
      {steps.map(({ n, title, body }) => (
        <div key={n} className="flex items-start gap-4">
          <div
            className={`flex h-8 w-8 shrink-0 items-center justify-center text-xs font-black ${
              accent
                ? "border border-primary/40 bg-primary/10 text-foreground"
                : "border border-border bg-muted text-foreground"
            }`}
          >
            {n}
          </div>
          <div>
            <p className="text-sm font-black text-foreground">{title}</p>
            <div className="text-sm leading-relaxed text-foreground/80">
              {body}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatGoogleAdsId(raw: string): string {
  const cleaned = raw
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 10)
  if (cleaned.length <= 3) return cleaned
  if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`
  return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
}

async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text)
  }
  // return new Promise((resolve) => {
  //   const el = document.createElement("textarea")
  //   el.value = text
  //   Object.assign(el.style, { position: "fixed", left: "-9999px", top: "-9999px" })
  //   document.body.appendChild(el)
  //   el.select()
  //   try {
  //     document.do .execCommand("copy")
  //   } catch {}
  //   document.body.removeChild(el)
  //   resolve()
  // })
}

// ─── Component ───────────────────────────────────────────────────────────────

interface Props {
  contactEmail: string
  companyPhone?: string
  companyPhoneDisplay?: string
  defaultService?: Service
}

export function SuccessSetup({
  contactEmail,
  companyPhone,
  companyPhoneDisplay,
  defaultService = "audit",
}: Props) {
  const [service, setService] = useState<Service>(() => defaultService)
  const [accountId, setAccountId] = useState("")
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const option1Ref = useRef<HTMLDivElement>(null)
  const option2Ref = useRef<HTMLDivElement>(null)

  function scrollTo(ref: React.RefObject<HTMLDivElement | null>) {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  async function copy(text: string, key: string) {
    await copyToClipboard(text).catch((error) =>
      console.log("Copy to clipboard error", error)
    )
    setCopiedKey(key)
    setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 2000)
  }

  function buildEmailHref() {
    const label = SERVICE_LABELS[service]
    const isGmb = service === "gmb"
    const subject = `I just paid for ${label}, help me get set up.`
    const body = [
      "Hi 2to6x team,",
      "",
      `I just paid for ${label}, help me get set up.`,
      "",
      isGmb
        ? "Google Business Profile: [your business name or profile URL]"
        : `Google Ads Account ID: ${accountId.trim() || "[add your Google Ads account ID]"}`,
      "",
      "Anything else you'd like us to know:",
      "",
      "",
    ].join("\n")
    return `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  function handleSelectService(s: Service) {
    setService(s)
    scrollTo(option1Ref)
  }

  // ── Shared sub-pieces ──────────────────────────────────────────────────────

  const isGmb = service === "gmb"

  const contactLinks = (
    <div className="flex flex-col gap-2">
      {companyPhone && (
        <a
          href={`tel:${companyPhone}`}
          className="text-sm font-semibold text-primary underline underline-offset-2 hover:brightness-110"
        >
          Call {companyPhoneDisplay ?? companyPhone}
        </a>
      )}
      <a
        href={`mailto:${contactEmail}`}
        className="text-sm font-semibold text-primary underline underline-offset-2 hover:brightness-110"
      >
        Email {contactEmail}
      </a>
    </div>
  )

  // ── Step definitions ───────────────────────────────────────────────────────

  const gmbOption1Steps: Step[] = [
    {
      n: "1",
      title: "Go to business.google.com",
      body: (
        <>
          Open{" "}
          <a
            href="https://business.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-primary underline underline-offset-2"
          >
            business.google.com
          </a>{" "}
          and sign in.
        </>
      ),
    },
    {
      n: "2",
      title: "Open the settings menu",
      body: "Click the vertical ⋮ (3-dot) menu next to your business name.",
    },
    {
      n: "3",
      title: 'Open "Business Profile Settings"',
      body: 'Select "Business Profile Settings" from the dropdown.',
    },
    {
      n: "4",
      title: 'Click "People and access"',
      body: 'Tap "People and access" in the pop-up that opens.',
    },
    {
      n: "5",
      title: "Add our email",
      body: (
        <>
          Click <strong>Add person</strong>, then enter:{" "}
          <strong>{contactEmail}</strong>
          <button
            type="button"
            onClick={() => copy(contactEmail, "gmb-step-email")}
            className="mt-2 inline-flex cursor-pointer items-center border border-border bg-muted px-3 py-1.5 text-[11px] font-black tracking-wide text-foreground uppercase transition-colors hover:border-primary/40 hover:text-primary"
          >
            {copiedKey === "gmb-step-email" ? "Copied!" : "Copy Email"}
          </button>
        </>
      ),
    },
    {
      n: "6",
      title: "Set role to Manager and send",
      body: 'Choose "Manager" from the role dropdown, then click "Invite".',
    },
  ]

  const adsOption1Steps: Step[] = [
    {
      n: "1",
      title: "Find your Google Ads account ID",
      body: "In Google Ads, look at the top-right corner beside your email. It looks like 583-9X7-3XX4.",
    },
    {
      n: "2",
      title: "Paste it below",
      body: "Use the field below and click the email button. We'll have what we need to send the access request.",
    },
    {
      n: "3",
      title: "Send the prefilled email",
      body: "Subject and body are prefilled with your selected service and account ID. Add anything else and send.",
    },
  ]

  const adsOption2Steps: Step[] = [
    {
      n: "1",
      title: "Go to ads.google.com",
      body: (
        <>
          Open{" "}
          <a
            href="https://ads.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-primary underline underline-offset-2"
          >
            ads.google.com
          </a>{" "}
          and sign in.
        </>
      ),
    },
    {
      n: "2",
      title: "Click Admin settings (right sidebar)",
      body: "From the right-side panel, open Admin settings.",
    },
    {
      n: "3",
      title: "Choose Access and security",
      body: 'Open "Access and security", then go to the Users panel.',
    },
    {
      n: "4",
      title: "Click the blue + button and add us",
      body: (
        <>
          Add new user: <strong>{contactEmail}</strong>{" "}
          <Button
            type="button"
            variant="default"
            onClick={() => copy(contactEmail, "ads-add-user")}
          >
            {copiedKey === "ads-add-user" ? "Copied!" : "Copy Email"}
          </Button>
        </>
      ),
    },
    {
      n: "5",
      title: "Choose an expiry",
      body: "Set expiry to 2 weeks, 1 month, or never (your choice).",
    },
    {
      n: "6",
      title: "If a domain error appears, fix allowed domains",
      body: (
        <>
          If you see:{" "}
          <span className="font-semibold text-foreground">
            "This email address isn't in an allowed domain."
          </span>{" "}
          Go to Security → Allowed domains, add <strong>2to6x.com</strong>,
          click Save, then repeat the invite.
        </>
      ),
    },
    {
      n: "7",
      title: "Send invitation",
      body: "Once invite succeeds, send it and we're good to start.",
    },
  ]

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Service Selector */}
      <section className="px-4 pb-10">
        <div className="mx-auto max-w-5xl">
          <p className="mb-6 text-center text-sm font-bold tracking-widest text-foreground uppercase">
            Which service did you just purchase?
          </p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {SERVICES.map(({ id, title, price, description }) => {
              const active = service === id
              return (
                <button
                  key={id}
                  onClick={() => handleSelectService(id)}
                  className={`cursor-pointer border-2 p-5 text-left transition-all focus:outline-none ${
                    active
                      ? "border-primary bg-primary/5 backdrop-blur-sm"
                      : "border-border bg-background hover:border-primary/50"
                  }`}
                >
                  <div className="mb-3 flex items-start justify-between">
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary transition-opacity ${
                        active ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      <svg
                        className="h-3.5 w-3.5 text-foreground"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </span>
                  </div>
                  <p className="mb-1 text-lg font-black text-foreground">
                    {title}
                  </p>
                  <p className="mb-2 text-sm font-semibold text-primary">
                    {price}
                  </p>
                  <p className="text-sm leading-relaxed text-foreground/80">
                    {description}
                  </p>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* Setup Section */}
      <section className="px-4 pb-24">
        <div className="mx-auto max-w-5xl">
          {/* Header */}
          <div className="mb-7 border border-primary/20 bg-primary/5 p-5 backdrop-blur-xs">
            <p className="mb-1 text-xs font-bold tracking-widest text-primary uppercase">
              Setup for Your Selected Service
            </p>
            <p className="text-base font-black text-foreground md:text-lg">
              Next step for <span>{SERVICE_LABELS[service]}</span>
            </p>
            <p className="mt-1 text-sm text-foreground/80">
              {isGmb ? (
                <>
                  Follow the steps below to invite us to your Google Business
                  Profile. Need a walkthrough instead?{" "}
                  <button
                    onClick={() => scrollTo(option2Ref)}
                    className="cursor-pointer font-semibold text-primary underline underline-offset-2 hover:brightness-110"
                  >
                    Use option 2.
                  </button>
                </>
              ) : (
                <>
                  To get started, just share your Google Ads account ID. Prefer
                  to invite us instead?{" "}
                  <button
                    onClick={() => scrollTo(option2Ref)}
                    className="cursor-pointer font-semibold text-primary underline underline-offset-2 hover:brightness-110"
                  >
                    Use option 2.
                  </button>
                </>
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* ── Option 1 ──────────────────────────────────────────────────── */}
            <div
              ref={option1Ref}
              className="flex h-full scroll-mt-24 flex-col border border-primary/30 bg-background"
            >
              {isGmb ? (
                <>
                  <div className="border-b border-border px-6 pt-6 pb-5">
                    <p className="mb-2 inline-block rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-black tracking-wider text-primary uppercase">
                      Option 1 (Recommended)
                    </p>
                    <h2 className="text-2xl font-black text-foreground">
                      Invite Us to Your Google Business Profile
                    </h2>
                    <p className="mt-2 text-sm text-foreground/80">
                      It only takes a minute. Follow these steps to grant us
                      manager access.
                    </p>
                  </div>

                  <StepList steps={gmbOption1Steps} accent={true} />

                  <div className="space-y-3 px-6 pb-6">
                    <p className="text-xs font-bold tracking-widest text-foreground uppercase">
                      Use This Email for the Invite
                    </p>
                    <div className="flex items-center gap-3 border border-border bg-background p-4">
                      <span className="flex-1 text-base font-black text-primary select-all">
                        {contactEmail}
                      </span>
                      <Button
                        type="button"
                        variant="default"
                        onClick={() => copy(contactEmail, "gmb-invite-copy")}
                        // className="bg-primary px-4 py-2 text-xs font-black tracking-wide text-foreground uppercase transition hover:brightness-110"
                      >
                        {copiedKey === "gmb-invite-copy" ? "Copied!" : "Copy"}
                      </Button>
                    </div>
                    <p className="text-xs leading-relaxed text-foreground/75">
                      Once you've sent the invite, email us so we know to accept
                      it. Or if this feels confusing,{" "}
                      <button
                        onClick={() => scrollTo(option2Ref)}
                        className="cursor-pointer font-semibold text-primary underline underline-offset-2 hover:brightness-110"
                      >
                        use Option 2
                      </button>{" "}
                      and we'll do a live walkthrough.
                    </p>
                    <div className="w-full [&_a]:w-full">
                      <CTAButton
                        variant="default"
                        target="_self"
                        href={buildEmailHref()}
                      >
                        Email Us to Confirm
                      </CTAButton>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="border-b border-border px-6 pt-6 pb-5">
                    <p className="mb-2 inline-block rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-black tracking-wider text-primary uppercase">
                      Option 1 (Recommended)
                    </p>
                    <h2 className="text-2xl font-black text-foreground">
                      Send Us Your Account ID
                    </h2>
                    <p className="mt-2 text-sm text-foreground/80">
                      You email us your ID, then we request access ourselves.
                      Fastest path and fewer clicks for you.
                    </p>
                  </div>

                  <StepList steps={adsOption1Steps} accent={true} />

                  <div className="space-y-3 px-6 pb-6">
                    <label
                      htmlFor="google-ads-id"
                      className="block text-xs font-bold tracking-widest text-foreground uppercase"
                    >
                      Enter Your Google Ads Account ID
                    </label>
                    <input
                      id="google-ads-id"
                      type="text"
                      inputMode="numeric"
                      value={accountId}
                      onChange={(e) =>
                        setAccountId(formatGoogleAdsId(e.target.value))
                      }
                      placeholder="583-9X7-3XX4"
                      className="w-full border border-border bg-background px-4 py-3 text-base font-semibold tracking-wide text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    />
                    <p className="text-xs text-foreground/70">
                      Don't see it? In the Google Ads dashboard, check the
                      top-right beside your email.
                    </p>
                    <div className="w-full [&_a]:w-full">
                      <CTAButton
                        variant="default"
                        target="_self"
                        href={buildEmailHref()}
                      >
                        Open Email
                      </CTAButton>
                    </div>
                  </div>

                  <div className="flex-1 px-6 pb-6">
                    <div className="h-full border border-primary/30 bg-primary/10 p-6">
                      <p className="mb-1 text-xs font-bold tracking-widest text-primary uppercase">
                        Need Help?
                      </p>
                      <p className="mb-4 text-base font-black text-foreground">
                        We'll walk you through it live.
                      </p>
                      <div>{contactLinks}</div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* ── Option 2 ──────────────────────────────────────────────────── */}
            <div
              ref={option2Ref}
              className="scroll-mt-24 border border-border bg-background"
            >
              {isGmb ? (
                <>
                  <div className="border-b border-border px-6 pt-6 pb-5">
                    <p className="mb-2 inline-block rounded-full border border-border bg-muted px-3 py-1 text-[11px] font-black tracking-wider text-foreground uppercase">
                      Option 2
                    </p>
                    <h2 className="text-2xl font-black text-foreground">
                      We'll Walk You Through It
                    </h2>
                    <p className="mt-2 text-sm text-foreground/80">
                      Prefer a live walkthrough? Reach out and we'll guide you
                      through the invite in real time, usually under 5 minutes.
                    </p>
                  </div>

                  <div className="space-y-4 px-6 py-6">{contactLinks}</div>

                  <div className="space-y-4 border-t border-primary/20 px-6 pt-5 pb-2">
                    <p className="text-xs font-bold tracking-widest text-foreground uppercase">
                      Common Questions
                    </p>

                    <div>
                      <p className="mb-1 text-sm font-black text-foreground">
                        Why can't you just request access yourselves?
                      </p>
                      <p className="text-sm leading-relaxed text-foreground/80">
                        Google Business Profile doesn't let agencies send access
                        requests. Only the profile owner can initiate an
                        invite. That's the one step we genuinely can't do for
                        you. Call us and we'll handle everything else live.
                      </p>
                    </div>

                    <div>
                      <p className="mb-1 text-sm font-black text-foreground">
                        Is "Manager" access safe to give?
                      </p>
                      <p className="text-sm leading-relaxed text-foreground/80">
                        Yes. Manager access lets us update your profile, photos,
                        and posts, but it can't remove your ownership or
                        transfer the listing. You stay the owner the entire
                        time.
                      </p>
                    </div>

                    <div>
                      <p className="mb-1 text-sm font-black text-foreground">
                        What if the steps in Option 1 don't match what I see?
                      </p>
                      <p className="text-sm leading-relaxed text-foreground/80">
                        Google's interface can look different depending on your
                        device or account type. If anything looks off, just call
                        us. We'll screen-share and get through it together in a
                        few minutes.
                      </p>
                    </div>

                    <div>
                      <p className="mb-1 text-sm font-black text-foreground">
                        Can I remove access once you're done?
                      </p>
                      <p className="text-sm leading-relaxed text-foreground/80">
                        Absolutely. Go to Business Profile Settings → People and
                        access, find our email, and remove us any time, no
                        friction.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 px-6 pt-5 pb-6">
                    <p className="text-xs leading-relaxed text-foreground/75">
                      Ready to do it yourself?{" "}
                      <button
                        onClick={() => scrollTo(option1Ref)}
                        className="cursor-pointer font-semibold text-primary underline underline-offset-2 hover:brightness-110"
                      >
                        Follow Option 1.
                      </button>
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="border-b border-border px-6 pt-6 pb-5">
                    <p className="mb-2 inline-block rounded-full border border-border bg-muted px-3 py-1 text-[11px] font-black tracking-wider text-foreground uppercase">
                      Option 2
                    </p>
                    <h2 className="text-2xl font-black text-foreground">
                      Invite Us Manually in Google Ads
                    </h2>
                    <p className="mt-2 text-sm text-foreground/80">
                      If you prefer inviting us directly, follow this exact
                      flow.
                    </p>
                  </div>

                  <StepList steps={adsOption2Steps} accent={false} />

                  <div className="space-y-3 px-6 pb-6">
                    <p className="text-xs font-bold tracking-widest text-foreground uppercase">
                      Use This Email for the Invite
                    </p>
                    <div className="flex items-center gap-3 border border-border bg-background p-4">
                      <span className="flex-1 text-base font-black text-primary select-all">
                        {contactEmail}
                      </span>
                      <Button
                        type="button"
                        variant={"default"}
                        onClick={() => copy(contactEmail, "ads-invite-copy")}
                      >
                        {copiedKey === "ads-invite-copy" ? "Copied!" : "Copy"}
                      </Button>
                    </div>
                    <p className="text-xs leading-relaxed text-foreground/75">
                      If this feels too technical, skip it and use{" "}
                      <button
                        onClick={() => scrollTo(option1Ref)}
                        className="cursor-pointer font-semibold text-primary underline underline-offset-2 hover:brightness-110"
                      >
                        Option 1
                      </button>
                      . We can do the request ourselves once you send your
                      account ID.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
