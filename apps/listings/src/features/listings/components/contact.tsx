import { useState } from 'react'
import type { FormEvent } from 'react'
import { MessageSquare, Phone, Send, UserRound, Users } from 'lucide-react'

import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Textarea } from '@workspace/ui/components/textarea'

import type { ListingCard as ListingCardType, PersonCard } from '../data'
import { DetailsDialog } from './shared'
import { personName } from './utils'

function AgentCreditBox({ agent }: { readonly agent: PersonCard }) {
  return (
    <div className="flex items-start gap-3 rounded-md border border-border bg-background p-3">
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
        <p className="font-extrabold text-foreground">
          {personName(agent)}
        </p>
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
    <div className="grid content-start gap-3 rounded-lg border border-border bg-background p-4">
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
          <Textarea name="message" required className="min-h-28 bg-background" />
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
      <div className="rounded-md border border-border bg-background p-3">
        <p className="font-extrabold text-foreground">
          {personName(agent)}
        </p>
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
