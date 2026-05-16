import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import {
  CheckCircle2,
  HelpCircle,
  Loader2,
  MessageSquare,
  Phone,
  Send,
  UserRound,
  Users,
} from 'lucide-react'
import { useAtom } from '@effect/atom-react'

import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Textarea } from '@workspace/ui/components/textarea'

import { getExpertDestinationsData } from '../data'
import { destinationExpertsAtom } from '../state'
import type {
  DestinationExpert,
  ExpertDestinationsData,
  ListingCard as ListingCardType,
  PersonCard,
} from '../data'
import { DetailsDialog } from './shared'
import { personName } from './utils'

export type ExpertHelpContext = {
  readonly source: string
  readonly audience?: 'buyer' | 'seller' | 'investor' | 'estate' | 'listing'
  readonly tool?: string
  readonly listingKey?: string
  readonly listingAddress?: string
  readonly openHouseKey?: string
  readonly openHouseListingKey?: string | null
  readonly details?: Record<string, string | number | boolean | null>
}

let expertDestinationsPromise: Promise<ExpertDestinationsData> | null = null

const loadExpertDestinationsOnce = () => {
  expertDestinationsPromise ??= getExpertDestinationsData().catch((error) => {
    expertDestinationsPromise = null
    throw error
  })
  return expertDestinationsPromise
}

const messageForContext = (context: ExpertHelpContext) => {
  if (context.listingAddress) {
    return `I need help with ${context.listingAddress}.`
  }

  if (context.openHouseKey) {
    return `I need help with this open house: ${context.openHouseKey}.`
  }

  if (context.audience === 'seller') {
    return 'I need help deciding what to do before selling.'
  }

  if (context.audience === 'investor') {
    return 'I need help checking whether this investment path makes sense.'
  }

  if (context.audience === 'estate') {
    return 'I need help organizing an estate property decision.'
  }

  return 'I need help with my real estate question.'
}

function useDestinationExperts() {
  const [expertsState, setExpertsState] = useAtom(destinationExpertsAtom)

  useEffect(() => {
    if (expertsState.status !== 'idle') return

    setExpertsState({
      status: 'loading',
      data: expertsState.data,
    })

    void loadExpertDestinationsOnce()
      .then((data) => {
        setExpertsState({
          status: 'ready',
          data,
        })
      })
      .catch((error: unknown) => {
        setExpertsState({
          status: 'error',
          data: expertsState.data,
          errorMessage:
            error instanceof Error
              ? error.message
              : 'Unable to load expert data.',
        })
      })
  }, [expertsState.data, expertsState.status, setExpertsState])

  return expertsState
}

function ExpertAvatar({
  expert,
}: {
  readonly expert: DestinationExpert | null
}) {
  return (
    <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-background text-foreground">
      {expert?.imageUrl ? (
        <img
          src={expert.imageUrl}
          alt={expert.name}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      ) : (
        <UserRound className="size-7" />
      )}
    </div>
  )
}

function ExpertProfile({
  expert,
  loading,
}: {
  readonly expert: DestinationExpert | null
  readonly loading: boolean
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start gap-3">
        <ExpertAvatar expert={expert} />
        <div className="min-w-0">
          <p className="font-extrabold text-foreground">
            {expert?.name ?? 'Local real estate expert'}
          </p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-foreground">
            {expert?.title ?? 'Real estate advisor'}
          </p>
          {expert?.officeName ? (
            <p className="mt-1 text-sm text-foreground">{expert.officeName}</p>
          ) : null}
        </div>
      </div>
      <p className="mt-3 text-sm leading-6 text-foreground">
        {expert?.experience ??
          'Send the question and the page context with it. We will route it to the right person.'}
      </p>
      {loading ? (
        <p className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-foreground">
          <Loader2 className="size-3 animate-spin" />
          Loading expert profile
        </p>
      ) : null}
    </div>
  )
}

export function AskExpertButton({
  context,
  label = 'Ask an expert',
  defaultMessage,
  variant = 'outline',
  className,
}: {
  readonly context: ExpertHelpContext
  readonly label?: string
  readonly defaultMessage?: string
  readonly variant?: 'default' | 'outline' | 'secondary' | 'ghost'
  readonly className?: string
}) {
  const [open, setOpen] = useState(false)
  const [submitted, setSubmitted] = useState<{
    readonly contact: string
    readonly submittedAt: string
  } | null>(null)
  const expertsState = useDestinationExperts()
  const expert = expertsState.data?.experts[0] ?? null
  const message = useMemo(
    () => defaultMessage ?? messageForContext(context),
    [context, defaultMessage],
  )

  const submitHelpRequest = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const contact = String(form.get('contact') ?? '')
    const submittedAt = new Date().toISOString()
    console.log('expert-help-lead', {
      context,
      destinationExpert:
        expert === null
          ? null
          : {
              destinationId: expert.destinationId,
              destinationName: expert.destinationName,
              memberKey: expert.memberKey,
              name: expert.name,
              title: expert.title,
            },
      contact,
      message: form.get('message'),
      page:
        typeof window === 'undefined'
          ? null
          : {
              href: window.location.href,
              pathname: window.location.pathname,
              hash: window.location.hash,
            },
      submittedAt,
    })
    event.currentTarget.reset()
    setSubmitted({ contact, submittedAt })
  }

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (!nextOpen) setSubmitted(null)
  }

  return (
    <>
      <Button
        type="button"
        variant={variant}
        className={className}
        onClick={() => setOpen(true)}
      >
        <HelpCircle />
        {label}
      </Button>
      <DetailsDialog
        title="Reach out for help"
        open={open}
        onOpenChange={handleOpenChange}
        className="max-w-3xl"
      >
        <div className="grid gap-4">
          <p className="text-sm leading-6 text-foreground">
            Tell us what you are trying to solve. The request keeps the page,
            tool, listing, or open-house context that opened this dialog.
          </p>
          <ExpertProfile
            expert={expert}
            loading={expertsState.status === 'loading'}
          />
          {submitted ? (
            <div className="grid gap-3 rounded-lg border border-border bg-card p-4 text-foreground">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
                <div>
                  <p className="font-extrabold">Your message was sent.</p>
                  <p className="mt-1 text-sm leading-6">
                    We saved the page context and will reply to{' '}
                    {submitted.contact}. You can close this dialog or send
                    another question.
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                className="justify-self-start"
                onClick={() => setSubmitted(null)}
              >
                <MessageSquare />
                Send another question
              </Button>
            </div>
          ) : (
            <form className="grid gap-3" onSubmit={submitHelpRequest}>
              <label className="grid gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground">
                  Email or phone
                </span>
                <Input
                  name="contact"
                  required
                  className="bg-background"
                  placeholder="Where should we reply?"
                />
              </label>
              <label className="grid gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground">
                  Message
                </span>
                <Textarea
                  name="message"
                  required
                  className="min-h-32 bg-background"
                  defaultValue={message}
                />
              </label>
              <Button type="submit" className="justify-self-start">
                <Send />
                Send message
              </Button>
            </form>
          )}
        </div>
      </DetailsDialog>
    </>
  )
}

export function ExpertHelpCallout({
  context,
  title = 'Ask us before you guess.',
  description = 'Send the question with this page context and we will help turn it into a practical next step.',
  buttonLabel = 'Ask an expert',
  defaultMessage,
  framed = true,
}: {
  readonly context: ExpertHelpContext
  readonly title?: string
  readonly description?: string
  readonly buttonLabel?: string
  readonly defaultMessage?: string
  readonly framed?: boolean
}) {
  return (
    <div
      className={
        framed
          ? 'grid gap-3 rounded-lg border border-border bg-card p-4 text-foreground'
          : 'grid gap-3 border-t border-border pt-4 text-foreground'
      }
    >
      <div>
        <p className="font-extrabold">{title}</p>
        <p className="mt-1 text-sm leading-6">{description}</p>
      </div>
      <AskExpertButton
        context={context}
        label={buttonLabel}
        defaultMessage={defaultMessage}
        className="justify-self-start"
      />
    </div>
  )
}

function AgentCreditBox({ agent }: { readonly agent: PersonCard }) {
  return (
    <div className="flex items-start gap-3 rounded-md border border-border bg-card p-3">
      <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-background text-foreground">
        {agent.imageUrl ? (
          <img
            src={agent.imageUrl}
            alt={personName(agent)}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <UserRound className="size-5" />
        )}
      </div>
      <div className="min-w-0">
        <p className="font-extrabold text-foreground">{personName(agent)}</p>
        {agent.jobTitle ? (
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-foreground">
            {agent.jobTitle}
          </p>
        ) : null}
        <p className="mt-1 text-sm text-foreground">
          {agent.office?.officeName ??
            ([agent.city, agent.province].filter(Boolean).join(', ') ||
              agent.memberKey)}
        </p>
        {agent.phone ? (
          <p className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-foreground">
            <Phone className="size-3" />
            {agent.phone}
          </p>
        ) : null}
      </div>
    </div>
  )
}

export function AgentsDialogButton({
  listing,
}: {
  readonly listing: Pick<ListingCardType, 'listingKey' | 'address' | 'agents'>
}) {
  const [open, setOpen] = useState(false)
  if (listing.agents.length === 0) return null

  return (
    <>
      <Button type="button" variant="outline" onClick={() => setOpen(true)}>
        <Users />
        See agents
      </Button>
      <DetailsDialog
        title="Listing agents"
        open={open}
        onOpenChange={setOpen}
        className="max-w-5xl"
      >
        <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
          <div className="grid content-start gap-4">
            <p className="text-sm leading-6 text-foreground">
              {listing.address}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {listing.agents.map((agent) => (
                <AgentCreditBox agent={agent} key={agent.memberKey} />
              ))}
            </div>
          </div>
          <AgentMessageForm listing={listing} />
        </div>
      </DetailsDialog>
    </>
  )
}

function AgentMessageForm({
  listing,
}: {
  readonly listing: Pick<ListingCardType, 'listingKey' | 'address' | 'agents'>
}) {
  const submitMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    console.log('agent-message', {
      listingKey: listing.listingKey,
      listingAddress: listing.address,
      agentKeys: listing.agents.map((agent) => agent.memberKey),
      email: form.get('email'),
      phone: form.get('phone'),
      message: form.get('message'),
    })
    event.currentTarget.reset()
  }

  return (
    <div className="grid content-start gap-3 rounded-lg border border-border bg-card p-4">
      <div>
        <p className="inline-flex items-center gap-2 text-sm font-extrabold text-foreground">
          <MessageSquare className="size-4" />
          Send message
        </p>
        <p className="mt-1 text-xs leading-5 text-foreground">
          This logs the request in the browser console for now.
        </p>
      </div>
      <form className="grid gap-3" onSubmit={submitMessage}>
        <label className="grid gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground">
            Email
          </span>
          <Input name="email" type="email" required className="bg-background" />
        </label>
        <label className="grid gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground">
            Phone number
          </span>
          <Input name="phone" type="tel" required className="bg-background" />
        </label>
        <label className="grid gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground">
            Message
          </span>
          <Textarea
            name="message"
            required
            className="min-h-28 bg-background"
          />
        </label>
        <Button type="submit" className="justify-self-start">
          <Send />
          Submit
        </Button>
      </form>
    </div>
  )
}

export function ContactAgentButton({
  agent,
  buttonLabel = 'Contact agent',
}: {
  readonly agent: PersonCard
  readonly buttonLabel?: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button type="button" variant="outline" onClick={() => setOpen(true)}>
        <MessageSquare />
        {buttonLabel}
      </Button>
      <DetailsDialog
        title={`Contact ${personName(agent)}`}
        open={open}
        onOpenChange={setOpen}
      >
        <AgentLeadForm agent={agent} onSubmitted={() => setOpen(false)} />
      </DetailsDialog>
    </>
  )
}

function AgentLeadForm({
  agent,
  onSubmitted,
}: {
  readonly agent: PersonCard
  readonly onSubmitted: () => void
}) {
  const submitLead = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    console.log('agent-contact-lead', {
      agentKey: agent.memberKey,
      agentName: personName(agent),
      officeKey: agent.officeKey,
      officeName: agent.office?.officeName,
      email: form.get('email'),
      phone: form.get('phone'),
      message: form.get('message'),
    })
    event.currentTarget.reset()
    onSubmitted()
  }

  return (
    <div className="grid gap-4">
      <div className="rounded-md border border-border bg-card p-3">
        <p className="font-extrabold text-foreground">{personName(agent)}</p>
        <p className="mt-1 text-sm text-foreground">
          {[agent.jobTitle, agent.office?.officeName]
            .filter(Boolean)
            .join(' · ')}
        </p>
      </div>
      <form className="grid gap-3" onSubmit={submitLead}>
        <label className="grid gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground">
            Email
          </span>
          <Input name="email" type="email" required className="bg-background" />
        </label>
        <label className="grid gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground">
            Phone number
          </span>
          <Input name="phone" type="tel" required className="bg-background" />
        </label>
        <label className="grid gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground">
            Message
          </span>
          <Textarea
            name="message"
            required
            className="min-h-28 bg-background"
            defaultValue={`Hi ${personName(agent)}, I would like more information.`}
          />
        </label>
        <Button type="submit" className="justify-self-start">
          <Send />
          Submit
        </Button>
      </form>
    </div>
  )
}
