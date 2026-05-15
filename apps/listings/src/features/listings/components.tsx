import { useEffect, useState } from 'react'
import type {
  FormEvent,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import {
  ArrowRight,
  Bath,
  BedDouble,
  Building2,
  CalendarDays,
  Clock,
  ExternalLink,
  FileImage,
  FileText,
  Heart,
  Home,
  MapPin,
  MessageSquare,
  NotebookPen,
  Phone,
  PlayCircle,
  Search,
  Send,
  SlidersHorizontal,
  Trash2,
  UserRound,
  Users,
  X,
} from 'lucide-react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useAtom } from '@effect/atom-react'

import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import { Textarea } from '@workspace/ui/components/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@workspace/ui/components/sheet'
import { cn } from '#/lib/utils'

import { listingFiltersAtom, openHouseFiltersAtom } from './state'
import {
  compactListingSearch,
  compactOpenHouseSearch,
  defaultListingSearch,
  defaultOpenHouseSearch,
  listingSortOptions,
} from './search'
import { EXIT_EXCEL_OFFICE_NAME } from './data'

import type {
  AgentDetail,
  DirectoryData,
  DetailGroup,
  GroupedListingsData,
  HomeData,
  ListingCard as ListingCardType,
  ListingDetail,
  ListingFacets,
  ListingGroupSearchKey,
  ListingsData,
  MediaCard,
  OfficeCard,
  OfficeDetail,
  OpenHouseDetail,
  OpenHouseCard,
  PersonCard,
  SocialMediaCard,
} from './data'
import type {
  AgentSearch,
  DirectorySearch,
  ListingSearch,
  OpenHouseSearch,
} from './search'

const allValue = '__all'

const money = new Intl.NumberFormat('en-CA', {
  style: 'currency',
  currency: 'CAD',
  maximumFractionDigits: 0,
})

const number = new Intl.NumberFormat('en-CA')

const formatMoney = (value: number | null) =>
  value === null ? 'Price on request' : money.format(value)

const formatListingPrice = (listing: ListingCardType) => {
  if (listing.price !== null) return formatMoney(listing.price)
  if (listing.leaseAmount !== null) {
    return `${formatMoney(listing.leaseAmount)}${listing.leaseFrequency ? ` / ${listing.leaseFrequency}` : ''}`
  }
  return 'Price on request'
}

const formatDate = (value: string | null) => {
  if (!value) return 'Date available'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('en-CA', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

const personName = (person: PersonCard) =>
  [person.firstName, person.lastName].filter(Boolean).join(' ') || 'Agent'

const cleanSearchObject = (search: ListingSearch) =>
  compactListingSearch(search) as ListingSearch

const activeListingFilterCount = (
  filters: ListingSearch,
  hiddenFields: ReadonlySet<ListingGroupSearchKey>,
) =>
  [
    !hiddenFields.has('city') && filters.city,
    !hiddenFields.has('province') && filters.province,
    !hiddenFields.has('status') && filters.status,
    !hiddenFields.has('type') && filters.type,
    filters.minPrice,
    filters.maxPrice,
    filters.minBeds,
    filters.minBaths,
    filters.sort !== defaultListingSearch.sort && filters.sort,
  ].filter(Boolean).length

const openHouseTimeLabel = (openHouse: OpenHouseCard) =>
  [openHouse.startTime, openHouse.endTime].filter(Boolean).join(' - ') ||
  'Time available'

function SelectFilter({
  label,
  value,
  placeholder,
  options,
  onChange,
}: {
  readonly label: string
  readonly value: string
  readonly placeholder: string
  readonly options: ReadonlyArray<string>
  readonly onChange: (value: string) => void
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--sea-ink-soft)]">
        {label}
      </span>
      <Select
        value={value || allValue}
        onValueChange={(next) =>
          onChange(next === allValue || next === null ? '' : next)
        }
      >
        <SelectTrigger className="w-full bg-white/70">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={allValue}>{placeholder}</SelectItem>
          {options.map((option) => (
            <SelectItem value={option} key={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  )
}

function DetailsDialog({
  title,
  open,
  onOpenChange,
  children,
  className,
}: {
  readonly title: string
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly children: ReactNode
  readonly className?: string
}) {
  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onOpenChange(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onOpenChange, open])

  if (!open) return null

  if (typeof document === 'undefined') return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-[rgba(23,58,64,0.28)] p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onOpenChange(false)
      }}
    >
      <section
        aria-modal="true"
        role="dialog"
        aria-labelledby={`${title.replace(/\W+/g, '-').toLowerCase()}-dialog-title`}
        className={cn(
          'relative grid max-h-[min(88vh,760px)] w-full max-w-3xl gap-5 overflow-y-auto rounded-lg border border-[var(--line)] bg-white p-5 text-[var(--sea-ink)] shadow-[0_30px_90px_rgba(23,58,64,0.28)]',
          className,
        )}
      >
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Close dialog"
          className="absolute right-3 top-3"
          onClick={() => onOpenChange(false)}
        >
          <X />
        </Button>
        <h2
          id={`${title.replace(/\W+/g, '-').toLowerCase()}-dialog-title`}
          className="display-title pr-10 text-3xl font-bold text-[var(--sea-ink)]"
        >
          {title}
        </h2>
        {children}
      </section>
    </div>,
    document.body,
  )
}

function MetricPill({
  icon: Icon,
  children,
}: {
  readonly icon: typeof BedDouble
  readonly children: ReactNode
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-[var(--line)] bg-white/70 px-2.5 py-1 text-xs font-semibold text-[var(--sea-ink)]">
      <Icon className="size-3.5 text-[var(--lagoon-deep)]" />
      {children}
    </span>
  )
}

export function ListingActions({
  listingKey,
  compact = false,
}: {
  readonly listingKey: string
  readonly compact?: boolean
}) {
  const action = (name: 'favorite' | 'trash' | 'note') => {
    // TODO(auth): verify the Better Auth session before persisting user actions.
    console.log('done', { action: name, listingKey })
  }

  return (
    <div className={cn('flex items-center gap-1', compact && 'gap-0.5')}>
      <Button
        aria-label="Favorite listing"
        title="Favorite listing"
        type="button"
        variant="ghost"
        size={compact ? 'icon-sm' : 'icon'}
        onClick={() => action('favorite')}
      >
        <Heart />
      </Button>
      <Button
        aria-label="Add note"
        title="Add note"
        type="button"
        variant="ghost"
        size={compact ? 'icon-sm' : 'icon'}
        onClick={() => action('note')}
      >
        <NotebookPen />
      </Button>
      <Button
        aria-label="Trash listing"
        title="Trash listing"
        type="button"
        variant="ghost"
        size={compact ? 'icon-sm' : 'icon'}
        onClick={() => action('trash')}
      >
        <Trash2 />
      </Button>
    </div>
  )
}

function OpenHouseImageBadge({
  openHouses,
}: {
  readonly openHouses: ReadonlyArray<OpenHouseCard>
}) {
  if (openHouses.length === 0) return null
  const nextOpenHouse = openHouses[0]

  return (
    <Link
      to="/open-houses/$openHouseKey"
      params={{ openHouseKey: nextOpenHouse.openHouseKey }}
      className="inline-flex items-center gap-1.5 rounded-full bg-[var(--sea-ink)] px-3 py-1 text-xs font-extrabold text-white no-underline shadow-sm hover:text-white"
    >
      <CalendarDays className="size-3.5" />
      {`${formatDate(nextOpenHouse.date)}${openHouses.length > 1 ? ` +${openHouses.length - 1}` : ''}`}
    </Link>
  )
}

function OfficeCreditBlock({ office }: { readonly office: OfficeCard }) {
  return (
    <div className="grid gap-3 rounded-md border border-[var(--line)] bg-white/78 p-3">
      <div className="flex items-start gap-3">
        <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-[var(--sand)] text-[var(--palm)]">
          {office.imageUrl ? (
            <img
              src={office.imageUrl}
              alt={office.officeName ?? 'Office logo'}
              className="h-full w-full object-contain"
              loading="lazy"
            />
          ) : (
            <Building2 className="size-5" />
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-[var(--kicker)]">
            Office
          </p>
          <p className="mt-1 font-extrabold text-[var(--sea-ink)]">
            <Link
              to="/offices"
              search={{ city: '', province: '', page: 1 }}
              className="text-[var(--sea-ink)] no-underline hover:text-[var(--lagoon-deep)]"
            >
              {office.officeName ?? 'Office'}
            </Link>
          </p>
          <p className="mt-1 text-sm text-[var(--sea-ink-soft)]">
            {[office.address, office.city, office.province, office.postalCode]
              .filter(Boolean)
              .join(', ') || office.officeKey}
          </p>
          {office.phone ? (
            <p className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[var(--sea-ink-soft)]">
              <Phone className="size-3" />
              {office.phone}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function AgentCreditBox({ agent }: { readonly agent: PersonCard }) {
  return (
    <div className="flex items-start gap-3 rounded-md border border-[var(--line)] bg-white/78 p-3">
      <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-[var(--sand)] text-[var(--palm)]">
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
        <Link
          to="/agents/$agentKey"
          params={{ agentKey: agent.memberKey }}
          className="font-extrabold text-[var(--sea-ink)] no-underline hover:text-[var(--lagoon-deep)]"
        >
          {personName(agent)}
        </Link>
        {agent.jobTitle ? (
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--kicker)]">
            {agent.jobTitle}
          </p>
        ) : null}
        <p className="mt-1 text-sm text-[var(--sea-ink-soft)]">
          {agent.office?.officeName ??
            ([agent.city, agent.province].filter(Boolean).join(', ') ||
              agent.memberKey)}
        </p>
        {agent.phone ? (
          <p className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[var(--sea-ink-soft)]">
            <Phone className="size-3" />
            {agent.phone}
          </p>
        ) : null}
      </div>
    </div>
  )
}

function AgentsDialogButton({
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
            <p className="text-sm leading-6 text-[var(--sea-ink-soft)]">
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
    <div className="grid content-start gap-3 rounded-lg border border-[var(--line)] bg-[var(--foam)] p-4">
      <div>
        <p className="inline-flex items-center gap-2 text-sm font-extrabold text-[var(--sea-ink)]">
          <MessageSquare className="size-4" />
          Send message
        </p>
        <p className="mt-1 text-xs leading-5 text-[var(--sea-ink-soft)]">
          This logs the request in the browser console for now.
        </p>
      </div>
      <form className="grid gap-3" onSubmit={submitMessage}>
        <label className="grid gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--sea-ink-soft)]">
            Email
          </span>
          <Input name="email" type="email" required className="bg-white/80" />
        </label>
        <label className="grid gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--sea-ink-soft)]">
            Phone number
          </span>
          <Input name="phone" type="tel" required className="bg-white/80" />
        </label>
        <label className="grid gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--sea-ink-soft)]">
            Message
          </span>
          <Textarea name="message" required className="min-h-28 bg-white/80" />
        </label>
        <Button type="submit" className="justify-self-start">
          <Send />
          Submit
        </Button>
      </form>
    </div>
  )
}

function ContactAgentButton({
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
      <div className="rounded-md border border-[var(--line)] bg-[var(--foam)] p-3">
        <p className="font-extrabold text-[var(--sea-ink)]">
          {personName(agent)}
        </p>
        <p className="mt-1 text-sm text-[var(--sea-ink-soft)]">
          {[agent.jobTitle, agent.office?.officeName]
            .filter(Boolean)
            .join(' · ')}
        </p>
      </div>
      <form className="grid gap-3" onSubmit={submitLead}>
        <label className="grid gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--sea-ink-soft)]">
            Email
          </span>
          <Input name="email" type="email" required className="bg-white/80" />
        </label>
        <label className="grid gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--sea-ink-soft)]">
            Phone number
          </span>
          <Input name="phone" type="tel" required className="bg-white/80" />
        </label>
        <label className="grid gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--sea-ink-soft)]">
            Message
          </span>
          <Textarea
            name="message"
            required
            className="min-h-28 bg-white/80"
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

function ListingCredits({ listing }: { readonly listing: ListingCardType }) {
  if (listing.offices.length === 0 && listing.agents.length === 0) return null
  return (
    <div className="grid gap-3 border-t border-[var(--line)] pt-3">
      {listing.offices.map((office) => (
        <OfficeCreditBlock office={office} key={office.officeKey} />
      ))}
      {listing.agents.length > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-[var(--line)] bg-white/78 p-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-[var(--sand)] text-[var(--palm)]">
              <Users className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="font-extrabold text-[var(--sea-ink)]">
                {listing.agents.length}{' '}
                {listing.agents.length === 1 ? 'agent' : 'agents'}
              </p>
              <p className="truncate text-sm text-[var(--sea-ink-soft)]">
                {listing.agents.map(personName).join(', ')}
              </p>
            </div>
          </div>
          <AgentsDialogButton listing={listing} />
        </div>
      ) : null}
    </div>
  )
}

const mediaSortValue = (media: MediaCard) =>
  media.sortOrder === null ? Number.MAX_SAFE_INTEGER : media.sortOrder

const displayMedia = (media: ReadonlyArray<MediaCard>) => {
  const seen = new Set<string>()
  return [...media]
    .filter((item) => item.mediaUrl !== null)
    .sort((left, right) => {
      if (left.preferredPhoto === true && right.preferredPhoto !== true)
        return -1
      if (right.preferredPhoto === true && left.preferredPhoto !== true)
        return 1
      return mediaSortValue(left) - mediaSortValue(right)
    })
    .filter((item) => {
      if (item.mediaUrl === null) return false
      if (seen.has(item.mediaUrl)) return false
      seen.add(item.mediaUrl)
      return true
    })
}

const mediaCategory = (media: MediaCard) =>
  (media.mediaCategory ?? media.longDescription ?? '').toLowerCase()

const mediaUrlPath = (media: MediaCard) => {
  if (media.mediaUrl === null) return ''
  try {
    return new URL(media.mediaUrl).pathname.toLowerCase()
  } catch {
    return media.mediaUrl.toLowerCase()
  }
}

const hasImageExtension = (media: MediaCard) =>
  /\.(avif|gif|jpe?g|png|webp)$/i.test(mediaUrlPath(media))

const hasVideoExtension = (media: MediaCard) =>
  /\.(m4v|mov|mp4|webm)$/i.test(mediaUrlPath(media))

const isImageMedia = (media: MediaCard) => {
  const category = mediaCategory(media)
  if (category.includes('website') && !hasImageExtension(media)) return false
  if (
    category.includes('video') ||
    category.includes('tour') ||
    category.includes('document')
  ) {
    return false
  }
  if (
    category.includes('photo') ||
    category.includes('picture') ||
    category.includes('logo')
  ) {
    return true
  }
  return hasImageExtension(media)
}

const isVideoMedia = (media: MediaCard) => {
  const category = mediaCategory(media)
  return (
    category.includes('video') ||
    category.includes('tour') ||
    hasVideoExtension(media)
  )
}

const isBlueprintMedia = (media: MediaCard) => {
  const category = mediaCategory(media)
  return (
    category.includes('blueprint') ||
    category.includes('floor plan') ||
    category.includes('floorplan') ||
    category.includes('site plan')
  )
}

const isDocumentMedia = (media: MediaCard) => {
  const category = mediaCategory(media)
  return (
    category.includes('document') ||
    category.includes('brochure') ||
    category.includes('certificate') ||
    category.includes('financial') ||
    /\.pdf$/i.test(mediaUrlPath(media))
  )
}

const mediaTitle = (media: MediaCard, fallback: string) =>
  media.longDescription ?? media.mediaCategory ?? fallback

const mediaKey = (media: MediaCard) => media.mediaKey ?? media.mediaUrl ?? ''

const mediaGroups = (media: ReadonlyArray<MediaCard>) => {
  const all = displayMedia(media)
  const photos = all.filter(isImageMedia)
  const plans = all.filter(
    (item) => isBlueprintMedia(item) && !isVideoMedia(item),
  )
  const documents = all.filter(
    (item) =>
      !isVideoMedia(item) && !isBlueprintMedia(item) && isDocumentMedia(item),
  )
  const videos = all.filter(isVideoMedia)
  const other = all.filter(
    (item) =>
      !photos.includes(item) &&
      !plans.includes(item) &&
      !documents.includes(item) &&
      !videos.includes(item),
  )

  return { all, photos, plans, documents, videos, other }
}

export function ListingCard({
  listing,
}: {
  readonly listing: ListingCardType
}) {
  const navigate = useNavigate()
  const openListing = () => {
    void navigate({
      to: '/listings/$listingKey',
      params: { listingKey: listing.listingKey },
    })
  }
  const isInteractiveTarget = (target: EventTarget | null) =>
    target instanceof HTMLElement &&
    target.closest('a,button,input,select,textarea,[role="button"]') !== null
  const onCardClick = (event: ReactMouseEvent<HTMLElement>) => {
    if (event.defaultPrevented || isInteractiveTarget(event.target)) return
    openListing()
  }
  const onCardKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.defaultPrevented || isInteractiveTarget(event.target)) return
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openListing()
    }
  }

  return (
    <article
      className="group cursor-pointer overflow-hidden rounded-lg border border-[var(--line)] bg-white/82 shadow-[0_12px_30px_rgba(23,58,64,0.08)] hover:border-[var(--lagoon-deep)] hover:shadow-[0_18px_38px_rgba(23,58,64,0.12)]"
      tabIndex={0}
      aria-label={`View listing details for ${listing.address}`}
      onClick={onCardClick}
      onKeyDown={onCardKeyDown}
    >
      <div className="relative aspect-[4/3] bg-[var(--sand)]">
        {listing.imageUrl ? (
          <img
            src={listing.imageUrl}
            alt={listing.address}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[var(--sea-ink-soft)]">
            <Home className="size-12" />
          </div>
        )}
        <div className="absolute left-3 top-3 flex max-w-[calc(100%-5rem)] flex-wrap gap-2">
          <div className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-[var(--sea-ink)] shadow-sm">
            {listing.status ?? 'Listing'}
          </div>
          <OpenHouseImageBadge openHouses={listing.openHouses} />
        </div>
        <div className="absolute right-2 top-2 rounded-full bg-white/86 shadow-sm">
          <ListingActions listingKey={listing.listingKey} compact />
        </div>
      </div>
      <div className="grid gap-4 p-4">
        <div className="grid gap-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xl font-extrabold tracking-normal text-[var(--sea-ink)]">
                {formatListingPrice(listing)}
              </p>
              <p className="mt-1 line-clamp-2 text-sm font-semibold text-[var(--sea-ink)] group-hover:text-[var(--lagoon-deep)]">
                {listing.address}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-[var(--sea-ink-soft)]">
            <MapPin className="size-4" />
            {[listing.city, listing.province].filter(Boolean).join(', ')}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <MetricPill icon={BedDouble}>
            {listing.bedrooms ?? '-'} beds
          </MetricPill>
          <MetricPill icon={Bath}>{listing.bathrooms ?? '-'} baths</MetricPill>
          <MetricPill icon={Building2}>
            {listing.propertySubType ?? 'Property'}
          </MetricPill>
        </div>
        {listing.remarks ? (
          <p className="line-clamp-3 text-sm leading-6 text-[var(--sea-ink-soft)]">
            {listing.remarks}
          </p>
        ) : null}
        <ListingCredits listing={listing} />
        <div className="flex items-center justify-between border-t border-[var(--line)] pt-3 text-xs text-[var(--sea-ink-soft)]">
          <span>{listing.listingId ?? 'CREA DDF listing'}</span>
          <Button
            nativeButton={false}
            render={
              <Link
                to="/listings/$listingKey"
                params={{ listingKey: listing.listingKey }}
              />
            }
            size="sm"
            variant="outline"
          >
            View
          </Button>
        </div>
      </div>
    </article>
  )
}

export function ListingsGrid({
  listings,
}: {
  readonly listings: ReadonlyArray<ListingCardType>
}) {
  if (listings.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-[var(--line)] bg-white/70 p-10 text-center">
        <p className="text-lg font-bold text-[var(--sea-ink)]">
          No listings match those filters.
        </p>
        <p className="mt-2 text-sm text-[var(--sea-ink-soft)]">
          Clear one or two filters and the page URL will update with the next
          search.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-5 md:grid-cols-2">
      {listings.map((listing) => (
        <ListingCard listing={listing} key={listing.listingKey} />
      ))}
    </div>
  )
}

export function ListingFilters({
  search,
  facets,
  hiddenFields = [],
  onChange,
}: {
  readonly search: ListingSearch
  readonly facets: ListingFacets
  readonly hiddenFields?: ReadonlyArray<ListingGroupSearchKey>
  readonly onChange: (search: ListingSearch) => void
}) {
  const [filters, setFilters] = useAtom(listingFiltersAtom)
  const searchKey = JSON.stringify(search)
  const hiddenFieldSet = new Set(hiddenFields)
  const activeFilters = activeListingFilterCount(filters, hiddenFieldSet)

  useEffect(() => {
    setFilters(search)
  }, [searchKey, search, setFilters])

  const commit = (patch: Partial<ListingSearch>) => {
    const next = { ...filters, ...patch, page: patch.page ?? 1 }
    setFilters(next)
    onChange(cleanSearchObject(next))
  }

  return (
    <Sheet>
      <div className="pointer-events-none sticky top-20 z-30 -mb-2 flex justify-end">
        <SheetTrigger
          render={
            <Button
              type="button"
              variant="outline"
              className="island-shell pointer-events-auto h-11 rounded-full bg-white/90 px-4 font-extrabold text-[var(--sea-ink)] shadow-[0_12px_30px_rgba(23,58,64,0.12)] hover:bg-white"
            />
          }
        >
          <SlidersHorizontal />
          Filters
          {activeFilters > 0 ? (
            <span className="ml-1 inline-flex size-5 items-center justify-center rounded-full bg-[var(--sea-ink)] text-xs font-extrabold text-white">
              {activeFilters}
            </span>
          ) : null}
        </SheetTrigger>
      </div>
      <SheetContent
        side="right"
        className="h-dvh overflow-y-auto border-l-0 bg-[var(--foam)] p-0 data-[side=right]:w-full sm:border-l sm:data-[side=right]:max-w-md"
      >
        <div className="grid min-h-dvh content-start gap-5 p-5 sm:p-6">
          <SheetHeader className="pr-8">
            <SheetTitle className="display-title text-3xl font-bold text-[var(--sea-ink)]">
              Filter listings
            </SheetTitle>
            <SheetDescription className="text-sm leading-6 text-[var(--sea-ink-soft)]">
              Every change is reflected in the URL.
            </SheetDescription>
          </SheetHeader>
          <div className="grid gap-4">
            {hiddenFieldSet.has('city') ? null : (
              <SelectFilter
                label="City"
                value={filters.city}
                placeholder="All cities"
                options={facets.cities}
                onChange={(city) => commit({ city })}
              />
            )}
            {hiddenFieldSet.has('province') ? null : (
              <SelectFilter
                label="Province"
                value={filters.province}
                placeholder="All provinces"
                options={facets.provinces}
                onChange={(province) => commit({ province })}
              />
            )}
            {hiddenFieldSet.has('status') ? null : (
              <SelectFilter
                label="Status"
                value={filters.status}
                placeholder="All statuses"
                options={facets.statuses}
                onChange={(status) => commit({ status })}
              />
            )}
            {hiddenFieldSet.has('type') ? null : (
              <SelectFilter
                label="Type"
                value={filters.type}
                placeholder="All property types"
                options={facets.types}
                onChange={(type) => commit({ type })}
              />
            )}
            <div className="grid grid-cols-2 gap-3">
              <label className="grid min-w-0 gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--sea-ink-soft)]">
                  Min price
                </span>
                <Input
                  value={filters.minPrice}
                  inputMode="numeric"
                  placeholder="0"
                  onChange={(event) => commit({ minPrice: event.target.value })}
                />
              </label>
              <label className="grid min-w-0 gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--sea-ink-soft)]">
                  Max price
                </span>
                <Input
                  value={filters.maxPrice}
                  inputMode="numeric"
                  placeholder="Any"
                  onChange={(event) => commit({ maxPrice: event.target.value })}
                />
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="grid min-w-0 gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--sea-ink-soft)]">
                  Beds
                </span>
                <Input
                  value={filters.minBeds}
                  inputMode="numeric"
                  placeholder="Any"
                  onChange={(event) => commit({ minBeds: event.target.value })}
                />
              </label>
              <label className="grid min-w-0 gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--sea-ink-soft)]">
                  Baths
                </span>
                <Input
                  value={filters.minBaths}
                  inputMode="numeric"
                  placeholder="Any"
                  onChange={(event) => commit({ minBaths: event.target.value })}
                />
              </label>
            </div>
            <label className="grid gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--sea-ink-soft)]">
                Sort
              </span>
              <Select
                value={filters.sort}
                onValueChange={(sort) => {
                  if (sort !== null) {
                    commit({ sort: sort as ListingSearch['sort'] })
                  }
                }}
              >
                <SelectTrigger className="w-full bg-white/70">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  {listingSortOptions.map((option) => (
                    <SelectItem value={option.value} key={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
            <Button
              type="button"
              variant="outline"
              onClick={() => commit(defaultListingSearch)}
            >
              Clear filters
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export function ListingsPage({
  data,
  onSearchChange,
}: {
  readonly data: ListingsData
  readonly onSearchChange: (search: ListingSearch) => void
}) {
  return (
    <main className="page-wrap grid gap-5 py-8">
      <ListingFilters
        search={data.search}
        facets={data.facets}
        onChange={onSearchChange}
      />
      <section className="grid gap-5">
        <div className="flex flex-col justify-between gap-4 rounded-lg border border-[var(--line)] bg-white/72 p-5 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--kicker)]">
              Browse
            </p>
            <h1 className="display-title mt-2 text-4xl font-bold text-[var(--sea-ink)]">
              Listings
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--sea-ink-soft)]">
              Search local CREA DDF data with route-backed filters. Share this
              URL and the same filtered view opens.
            </p>
          </div>
          <div className="text-sm font-semibold text-[var(--sea-ink-soft)]">
            Page {data.search.page} · Showing {data.listings.length}
          </div>
        </div>
        <ListingsGrid listings={data.listings} />
        <Pagination
          page={data.search.page}
          hasNextPage={data.hasNextPage}
          onPage={(page) => onSearchChange({ ...data.search, page })}
        />
      </section>
    </main>
  )
}

export function GroupedListingsPage({
  data,
  onSearchChange,
}: {
  readonly data: GroupedListingsData
  readonly onSearchChange: (search: ListingSearch) => void
}) {
  if (data.group === null || data.matchedValue === null) {
    return <ListingGroupFallback data={data} />
  }

  return (
    <main className="page-wrap grid gap-5 py-8">
      <ListingFilters
        search={data.search}
        facets={data.facets}
        hiddenFields={data.group.suppressedSearchKeys}
        onChange={onSearchChange}
      />
      <section className="grid gap-5">
        <div className="rounded-lg border border-[var(--line)] bg-white/72 p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--kicker)]">
            {data.group.label}
          </p>
          <h1 className="display-title mt-2 text-4xl font-bold text-[var(--sea-ink)]">
            {data.matchedValue.value}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--sea-ink-soft)]">
            {data.group.description} Keep filtering this grouped page by city,
            province, status, price, beds, baths, or sort order.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-sm font-semibold text-[var(--sea-ink-soft)]">
            <span className="rounded-full border border-[var(--line)] bg-white/72 px-3 py-1">
              {number.format(data.matchedValue.count)} active listings in this
              group
            </span>
            <span className="rounded-full border border-[var(--line)] bg-white/72 px-3 py-1">
              Page {data.search.page} · Showing {data.listings.length}
            </span>
          </div>
        </div>
        <ListingsGrid listings={data.listings} />
        <Pagination
          page={data.search.page}
          hasNextPage={data.hasNextPage}
          onPage={(page) => onSearchChange({ ...data.search, page })}
        />
        <RelatedListingPages
          title={`More ${data.group.pluralLabel.toLowerCase()}`}
          values={data.relatedValues}
        />
      </section>
    </main>
  )
}

function ListingGroupFallback({
  data,
}: {
  readonly data: GroupedListingsData
}) {
  const title =
    data.group === null
      ? 'Listing group not found'
      : `${data.group.label} not found`

  return (
    <main className="page-wrap grid gap-6 py-8">
      <section className="rounded-lg border border-[var(--line)] bg-white/72 p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--kicker)]">
          Grouped search
        </p>
        <h1 className="display-title mt-2 text-4xl font-bold text-[var(--sea-ink)]">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--sea-ink-soft)]">
          The route did not match a current active listing value. Pick one of
          the related grouped pages below.
        </p>
        <Button
          nativeButton={false}
          render={<Link to="/listings" search={defaultListingSearch} />}
          className="mt-5"
        >
          View all listings
        </Button>
      </section>
      <RelatedListingPages
        title={
          data.group === null
            ? 'Available grouped listing pages'
            : `Available ${data.group.pluralLabel.toLowerCase()}`
        }
        values={data.relatedValues}
      />
      <ListingGroupDirectory groups={data.relatedGroups} />
    </main>
  )
}

function RelatedListingPages({
  title,
  values,
}: {
  readonly title: string
  readonly values: GroupedListingsData['relatedValues']
}) {
  if (values.length === 0) return null

  return (
    <section className="grid gap-3">
      <h2 className="display-title text-2xl font-bold text-[var(--sea-ink)]">
        {title}
      </h2>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {values.map((value) => (
          <Link
            to="/search/$group/$value"
            params={{ group: value.groupSlug, value: value.valueSlug }}
            search={defaultListingSearch}
            className="group rounded-lg border border-[var(--line)] bg-white/72 p-4 text-[var(--sea-ink)] no-underline transition hover:border-[var(--lagoon-deep)]"
            key={`${value.groupSlug}-${value.valueSlug}`}
          >
            <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--kicker)]">
              {value.groupLabel}
            </span>
            <span className="mt-1 block text-lg font-extrabold group-hover:text-[var(--lagoon-deep)]">
              {value.value}
            </span>
            <span className="mt-2 block text-sm font-semibold text-[var(--sea-ink-soft)]">
              {number.format(value.count)} listings
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}

function ListingGroupDirectory({
  groups,
}: {
  readonly groups: GroupedListingsData['relatedGroups']
}) {
  if (groups.length === 0) return null

  return (
    <section className="grid gap-3">
      <h2 className="display-title text-2xl font-bold text-[var(--sea-ink)]">
        Group fields
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {groups.map((group) => (
          <div
            className="rounded-lg border border-[var(--line)] bg-white/66 p-4"
            key={group.groupSlug}
          >
            <p className="text-sm font-extrabold text-[var(--sea-ink)]">
              {group.pluralLabel}
            </p>
            <p className="mt-1 text-sm text-[var(--sea-ink-soft)]">
              {number.format(group.valueCount)} values ·{' '}
              {number.format(group.listingCount)} listings
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

export function HomePage({ data }: { readonly data: HomeData }) {
  const heroListing = data.featuredListings.at(0) ?? null
  return (
    <main>
      <section className="page-wrap grid gap-8 py-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="grid gap-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--kicker)]">
              CREA DDF browser
            </p>
            <h1 className="display-title mt-3 max-w-3xl text-5xl font-bold leading-[1.02] text-[var(--sea-ink)] md:text-6xl">
              Find the right listing from the local data already synced here.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--sea-ink-soft)]">
              Browse listings and open houses from the local database. Office
              and agent credits stay attached to the listings they represent.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              nativeButton={false}
              render={<Link to="/listings" search={defaultListingSearch} />}
              size="lg"
            >
              <Search />
              Browse listings
            </Button>
            <Button
              nativeButton={false}
              render={
                <Link to="/open-houses" search={defaultOpenHouseSearch} />
              }
              size="lg"
              variant="outline"
            >
              <CalendarDays />
              Open houses
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <SummaryStat
              label="Listings shown"
              value={data.featuredListings.length}
            />
            <SummaryStat
              label="Cities sampled"
              value={data.facets.cities.length}
            />
            <SummaryStat label="Open houses" value={data.openHouses.length} />
          </div>
        </div>
        {heroListing ? (
          <div className="lg:pl-4">
            <ListingCard listing={heroListing} />
          </div>
        ) : null}
      </section>
      <section className="page-wrap grid gap-8 pb-12">
        <SectionHeader
          title="Latest listings"
          action={
            <Button
              nativeButton={false}
              render={<Link to="/listings" search={defaultListingSearch} />}
              variant="outline"
            >
              View all
            </Button>
          }
        />
        <ListingsGrid listings={data.featuredListings.slice(0, 6)} />
        {data.openHouses.length > 0 ? (
          <DirectoryPanel title="Open houses">
            {data.openHouses.slice(0, 4).map((openHouse) => (
              <OpenHouseRow
                openHouse={openHouse}
                key={openHouse.openHouseKey}
              />
            ))}
          </DirectoryPanel>
        ) : null}
      </section>
    </main>
  )
}

function SummaryStat({
  label,
  value,
}: {
  readonly label: string
  readonly value: number
}) {
  return (
    <div className="rounded-lg border border-[var(--line)] bg-white/72 p-4">
      <p className="text-2xl font-extrabold text-[var(--sea-ink)]">
        {number.format(value)}
      </p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--sea-ink-soft)]">
        {label}
      </p>
    </div>
  )
}

function SectionHeader({
  title,
  action,
}: {
  readonly title: string
  readonly action?: ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <h2 className="display-title text-3xl font-bold text-[var(--sea-ink)]">
        {title}
      </h2>
      {action}
    </div>
  )
}

function DirectoryPanel({
  title,
  children,
}: {
  readonly title: string
  readonly children: ReactNode
}) {
  return (
    <section className="rounded-lg border border-[var(--line)] bg-white/72 p-5">
      <h3 className="text-lg font-extrabold text-[var(--sea-ink)]">{title}</h3>
      <div className="mt-4 grid gap-3 lg:grid-cols-2">{children}</div>
    </section>
  )
}

function ListingOpenHousesPanel({
  listing,
}: {
  readonly listing: ListingDetail
}) {
  const firstOpenHouse = listing.openHouses.at(0) ?? null
  const hasMultipleOpenHouses = listing.openHouses.length > 1

  return (
    <section className="grid gap-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-[var(--sea-ink)]">
            Open houses
          </h2>
          {listing.openHouses.length > 0 ? (
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--sea-ink-soft)]">
              {listing.openHouses.length} scheduled
            </p>
          ) : null}
        </div>
        {hasMultipleOpenHouses ? (
          <Button
            nativeButton={false}
            render={
              <Link
                to="/open-houses"
                search={{
                  ...defaultOpenHouseSearch,
                  listingKey: listing.listingKey,
                }}
              />
            }
            size="sm"
            variant="outline"
          >
            See all
          </Button>
        ) : null}
      </div>
      {firstOpenHouse ? (
        <OpenHouseRow openHouse={firstOpenHouse} />
      ) : (
        <p className="rounded-md border border-dashed border-[var(--line)] bg-white/60 p-3 text-sm text-[var(--sea-ink-soft)]">
          No open houses are attached to this listing.
        </p>
      )}
    </section>
  )
}

export function OpenHouseDetailPage({
  openHouse,
}: {
  readonly openHouse: OpenHouseDetail | null
}) {
  if (!openHouse) {
    return (
      <main className="page-wrap py-14">
        <div className="rounded-lg border border-[var(--line)] bg-white/80 p-8">
          <h1 className="text-2xl font-extrabold">Open house not found</h1>
          <Button
            nativeButton={false}
            render={<Link to="/open-houses" search={defaultOpenHouseSearch} />}
            className="mt-5"
          >
            Back to open houses
          </Button>
        </div>
      </main>
    )
  }

  const property = openHouse.property

  return (
    <main className="page-wrap grid gap-6 py-8">
      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-lg border border-[var(--line)] bg-white/78 p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--kicker)]">
            Open house
          </p>
          <h1 className="display-title mt-2 text-4xl font-bold text-[var(--sea-ink)]">
            {formatDate(openHouse.date)}
          </h1>
          <div className="mt-4 flex flex-wrap gap-2">
            <MetricPill icon={Clock}>
              {openHouseTimeLabel(openHouse)}
            </MetricPill>
            {openHouse.status ? (
              <span className="rounded-full border border-[var(--line)] bg-white/80 px-2.5 py-1 text-xs font-semibold text-[var(--sea-ink)]">
                {openHouse.status}
              </span>
            ) : null}
            {openHouse.type ? (
              <span className="rounded-full border border-[var(--line)] bg-white/80 px-2.5 py-1 text-xs font-semibold text-[var(--sea-ink)]">
                {openHouse.type}
              </span>
            ) : null}
          </div>
        </div>
        {property ? (
          <div className="island-shell grid content-start gap-3 rounded-lg p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--kicker)]">
              Property subtype
            </p>
            <p className="text-xl font-extrabold text-[var(--sea-ink)]">
              {property.propertySubType ?? 'Property'}
            </p>
            <Button
              nativeButton={false}
              render={
                <Link
                  to="/listings/$listingKey"
                  params={{ listingKey: property.listingKey }}
                />
              }
            >
              <Home />
              Property details
            </Button>
          </div>
        ) : null}
      </section>
      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <InfoSection title="Open house details">
          <p className="leading-7 text-[var(--sea-ink-soft)]">
            {openHouse.remarks ??
              'No additional remarks were attached to this open house.'}
          </p>
        </InfoSection>
        {property ? (
          <InfoSection title="Property">
            <Link
              to="/listings/$listingKey"
              params={{ listingKey: property.listingKey }}
              className="group grid gap-4 no-underline md:grid-cols-[220px_1fr]"
            >
              <div className="overflow-hidden rounded-md bg-[var(--sand)]">
                {property.imageUrl ? (
                  <img
                    src={property.imageUrl}
                    alt={property.address}
                    className="aspect-[4/3] h-full w-full object-cover transition group-hover:scale-[1.02]"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex aspect-[4/3] items-center justify-center text-[var(--sea-ink-soft)]">
                    <Home className="size-10" />
                  </div>
                )}
              </div>
              <div className="grid content-start gap-3">
                <div>
                  <p className="text-2xl font-extrabold text-[var(--sea-ink)] group-hover:text-[var(--lagoon-deep)]">
                    {formatListingPrice(property)}
                  </p>
                  <p className="mt-1 text-lg font-extrabold text-[var(--sea-ink)]">
                    {property.address}
                  </p>
                </div>
                <p className="flex items-center gap-1.5 text-sm text-[var(--sea-ink-soft)]">
                  <MapPin className="size-4" />
                  {[property.city, property.province]
                    .filter(Boolean)
                    .join(', ')}
                </p>
                <div className="flex flex-wrap gap-2">
                  <MetricPill icon={BedDouble}>
                    {property.bedrooms ?? '-'} beds
                  </MetricPill>
                  <MetricPill icon={Bath}>
                    {property.bathrooms ?? '-'} baths
                  </MetricPill>
                  <MetricPill icon={Building2}>
                    {property.propertySubType ?? 'Property'}
                  </MetricPill>
                </div>
                <span className="inline-flex items-center gap-1 text-sm font-bold text-[var(--lagoon-deep)]">
                  See property details
                  <ArrowRight className="size-4" />
                </span>
              </div>
            </Link>
          </InfoSection>
        ) : null}
      </section>
      <section className="grid gap-4 rounded-lg border border-[var(--line)] bg-white/72 p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--kicker)]">
              {property?.propertySubType ?? 'Related'}
            </p>
            <h2 className="mt-1 text-2xl font-extrabold text-[var(--sea-ink)]">
              Similar open houses
            </h2>
          </div>
          <Button
            nativeButton={false}
            render={<Link to="/open-houses" search={defaultOpenHouseSearch} />}
            variant="outline"
          >
            All open houses
          </Button>
        </div>
        {openHouse.relatedOpenHouses.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {openHouse.relatedOpenHouses.map((relatedOpenHouse) => (
              <OpenHouseRow
                openHouse={relatedOpenHouse}
                prominent
                key={relatedOpenHouse.openHouseKey}
              />
            ))}
          </div>
        ) : (
          <p className="rounded-md border border-dashed border-[var(--line)] bg-white/60 p-3 text-sm text-[var(--sea-ink-soft)]">
            No other open houses for this property subtype are in the current
            sample.
          </p>
        )}
      </section>
    </main>
  )
}

export function ListingDetailPage({
  listing,
}: {
  readonly listing: ListingDetail | null
}) {
  if (!listing) {
    return (
      <main className="page-wrap py-14">
        <div className="rounded-lg border border-[var(--line)] bg-white/80 p-8">
          <h1 className="text-2xl font-extrabold">Listing not found</h1>
          <Button
            nativeButton={false}
            render={<Link to="/listings" search={defaultListingSearch} />}
            className="mt-5"
          >
            Back to listings
          </Button>
        </div>
      </main>
    )
  }

  const groupedMedia = mediaGroups(listing.media)
  const heroImageUrl =
    listing.imageUrl ?? groupedMedia.photos[0]?.mediaUrl ?? null

  return (
    <main className="page-wrap grid gap-6 py-8 lg:grid-cols-[1fr_360px] lg:items-start">
      <div className="grid gap-6">
        <div className="overflow-hidden rounded-lg border border-[var(--line)] bg-white/80">
          <div className="relative aspect-[16/10] bg-[var(--sand)]">
            {heroImageUrl ? (
              <img
                src={heroImageUrl}
                alt={listing.address}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Home className="size-14 text-[var(--sea-ink-soft)]" />
              </div>
            )}
            <div className="absolute left-4 top-4">
              <OpenHouseImageBadge openHouses={listing.openHouses} />
            </div>
          </div>
          {groupedMedia.photos.length > 1 ? (
            <div className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-4">
              {groupedMedia.photos.map((media) => (
                <img
                  src={media.mediaUrl ?? ''}
                  alt={media.longDescription ?? listing.address}
                  className="aspect-[4/3] rounded-md object-cover"
                  key={mediaKey(media)}
                />
              ))}
            </div>
          ) : null}
        </div>
        <InfoSection title="Remarks">
          <p className="leading-7 text-[var(--sea-ink-soft)]">
            {listing.remarks ?? 'No remarks were included for this listing.'}
          </p>
        </InfoSection>
        <InfoSection title="Property details">
          <div className="grid gap-3 sm:grid-cols-2">
            <DetailItem label="Living area" value={areaLabel(listing)} />
            <DetailItem
              label="Lot"
              value={
                listing.lotSize
                  ? `${number.format(listing.lotSize)} ${listing.lotSizeUnits ?? ''}`
                  : null
              }
            />
            <DetailItem label="Year built" value={listing.yearBuilt} />
            <DetailItem label="Photos" value={listing.photosCount} />
          </div>
        </InfoSection>
        {listing.detailGroups.map((group) => (
          <DetailGroupSection group={group} key={group.title} />
        ))}
        {listing.rooms.length > 0 ? (
          <InfoSection title="Rooms">
            <div className="grid gap-2">
              {listing.rooms.map((room) => (
                <div
                  className="grid gap-2 rounded-md border border-[var(--line)] bg-white/70 p-3 sm:grid-cols-[1fr_auto]"
                  key={room.roomKey ?? `${room.roomType}-${room.roomLevel}`}
                >
                  <div>
                    <p className="font-semibold text-[var(--sea-ink)]">
                      {room.roomType ?? 'Room'}
                    </p>
                    {room.roomDescription ? (
                      <p className="mt-1 text-sm leading-5 text-[var(--sea-ink-soft)]">
                        {room.roomDescription}
                      </p>
                    ) : null}
                  </div>
                  <p className="text-sm text-[var(--sea-ink-soft)]">
                    {[room.roomLevel, roomLabel(room)]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                </div>
              ))}
            </div>
          </InfoSection>
        ) : null}
        {groupedMedia.all.length > 0 ? (
          <InfoSection title="Media">
            <MediaGroupsView
              listingAddress={listing.address}
              media={groupedMedia}
            />
          </InfoSection>
        ) : null}
      </div>
      <aside className="island-shell grid content-start gap-5 rounded-lg p-5 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
        <ListingOpenHousesPanel listing={listing} />
        <div className="border-t border-[var(--line)] pt-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-3xl font-extrabold text-[var(--sea-ink)]">
                {formatListingPrice(listing)}
              </p>
              <p className="mt-2 text-sm font-semibold text-[var(--sea-ink-soft)]">
                {listing.status ?? 'Listing'} ·{' '}
                {listing.propertySubType ?? 'Property'}
              </p>
            </div>
            <ListingActions listingKey={listing.listingKey} />
          </div>
          <div className="mt-5">
            <h1 className="display-title text-3xl font-bold text-[var(--sea-ink)]">
              {listing.address}
            </h1>
            <p className="mt-2 flex items-center gap-1.5 text-sm text-[var(--sea-ink-soft)]">
              <MapPin className="size-4" />
              {[listing.city, listing.province].filter(Boolean).join(', ')}
            </p>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <MetricPill icon={BedDouble}>
              {listing.bedrooms ?? '-'} beds
            </MetricPill>
            <MetricPill icon={Bath}>
              {listing.bathrooms ?? '-'} baths
            </MetricPill>
            <MetricPill icon={Building2}>
              {listing.parking ?? '-'} parking
            </MetricPill>
          </div>
        </div>
        <CreditsBlock listing={listing} />
      </aside>
    </main>
  )
}

function MediaGroupsView({
  listingAddress,
  media,
}: {
  readonly listingAddress: string
  readonly media: ReturnType<typeof mediaGroups>
}) {
  return (
    <div className="grid gap-6">
      {media.photos.length > 0 ? (
        <MediaGrid title="Photos">
          {media.photos.map((item) => (
            <ImageMediaTile
              media={item}
              altFallback={listingAddress}
              key={mediaKey(item)}
            />
          ))}
        </MediaGrid>
      ) : null}
      {media.plans.length > 0 ? (
        <MediaGrid title="Floor plans and blueprints">
          {media.plans.map((item) => (
            <LinkedMediaTile
              icon={FileImage}
              media={item}
              altFallback={listingAddress}
              key={mediaKey(item)}
            />
          ))}
        </MediaGrid>
      ) : null}
      {media.documents.length > 0 ? (
        <MediaGrid title="Documents">
          {media.documents.map((item) => (
            <LinkedMediaTile
              icon={FileText}
              media={item}
              altFallback={listingAddress}
              key={mediaKey(item)}
            />
          ))}
        </MediaGrid>
      ) : null}
      {media.other.length > 0 ? (
        <MediaGrid title="Other media">
          {media.other.map((item) => (
            <LinkedMediaTile
              icon={FileText}
              media={item}
              altFallback={listingAddress}
              key={mediaKey(item)}
            />
          ))}
        </MediaGrid>
      ) : null}
      {media.videos.length > 0 ? (
        <MediaGrid title="Videos and tours">
          {media.videos.map((item) => (
            <VideoMediaTile media={item} key={mediaKey(item)} />
          ))}
        </MediaGrid>
      ) : null}
    </div>
  )
}

function MediaGrid({
  title,
  children,
}: {
  readonly title: string
  readonly children: ReactNode
}) {
  return (
    <div className="grid gap-3">
      <h3 className="text-base font-extrabold text-[var(--sea-ink)]">
        {title}
      </h3>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{children}</div>
    </div>
  )
}

function ImageMediaTile({
  media,
  altFallback,
}: {
  readonly media: MediaCard
  readonly altFallback: string
}) {
  return (
    <figure className="overflow-hidden rounded-md border border-[var(--line)] bg-white/70">
      <img
        src={media.mediaUrl ?? ''}
        alt={media.longDescription ?? altFallback}
        className="aspect-[4/3] w-full object-cover"
        loading="lazy"
      />
      {(media.longDescription ?? media.mediaCategory) ? (
        <figcaption className="p-3 text-sm text-[var(--sea-ink-soft)]">
          {media.longDescription ?? media.mediaCategory}
        </figcaption>
      ) : null}
    </figure>
  )
}

function LinkedMediaTile({
  media,
  altFallback,
  icon: Icon,
}: {
  readonly media: MediaCard
  readonly altFallback: string
  readonly icon: typeof FileImage
}) {
  const isImage = hasImageExtension(media)
  return (
    <div className="overflow-hidden rounded-md border border-[var(--line)] bg-white/70">
      {isImage ? (
        <img
          src={media.mediaUrl ?? ''}
          alt={media.longDescription ?? altFallback}
          className="aspect-[4/3] w-full object-contain bg-[var(--sand)]"
          loading="lazy"
        />
      ) : (
        <div className="flex aspect-[4/3] items-center justify-center bg-[var(--sand)] text-[var(--palm)]">
          <Icon className="size-10" />
        </div>
      )}
      <MediaLink media={media} label={mediaTitle(media, 'Open media')} />
    </div>
  )
}

function VideoMediaTile({ media }: { readonly media: MediaCard }) {
  const directVideo = hasVideoExtension(media)
  return (
    <div className="overflow-hidden rounded-md border border-[var(--line)] bg-white/70">
      {directVideo ? (
        <video
          src={media.mediaUrl ?? ''}
          className="aspect-video w-full bg-black"
          controls
          preload="metadata"
        />
      ) : (
        <div className="flex aspect-video items-center justify-center bg-[var(--sand)] text-[var(--palm)]">
          <PlayCircle className="size-12" />
        </div>
      )}
      <MediaLink
        media={media}
        label={mediaTitle(media, 'Open video or tour')}
      />
    </div>
  )
}

function MediaLink({
  media,
  label,
}: {
  readonly media: MediaCard
  readonly label: string
}) {
  return (
    <a
      className="flex items-start justify-between gap-3 p-3 text-sm font-semibold text-[var(--sea-ink)] no-underline hover:text-[var(--lagoon-deep)]"
      href={media.mediaUrl ?? '#'}
      target="_blank"
      rel="noreferrer"
    >
      <span>
        {label}
        {media.mediaCategory ? (
          <span className="mt-1 block text-xs font-semibold text-[var(--sea-ink-soft)]">
            {media.mediaCategory}
          </span>
        ) : null}
      </span>
      <ExternalLink className="mt-0.5 size-4 shrink-0" />
    </a>
  )
}

function roomLabel(room: ListingDetail['rooms'][number]) {
  if (room.roomDimensions !== null) return room.roomDimensions
  if (room.roomLength === null || room.roomWidth === null) return null
  return `${number.format(room.roomLength)} x ${number.format(room.roomWidth)} ${room.roomLengthWidthUnits ?? ''}`.trim()
}

function areaLabel(listing: ListingDetail) {
  if (!listing.livingArea) return null
  return `${number.format(listing.livingArea)} ${listing.livingAreaUnits ?? ''}`
}

function CreditsBlock({ listing }: { readonly listing: ListingDetail }) {
  if (listing.offices.length === 0 && listing.agents.length === 0) return null
  return (
    <div className="grid gap-3 rounded-lg border border-[var(--line)] bg-white/70 p-4">
      <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-[var(--kicker)]">
        Listing credits
      </p>
      <ListingCredits listing={listing} />
    </div>
  )
}

function InfoSection({
  title,
  children,
}: {
  readonly title: string
  readonly children: ReactNode
}) {
  return (
    <section className="rounded-lg border border-[var(--line)] bg-white/78 p-5">
      <h2 className="text-xl font-extrabold text-[var(--sea-ink)]">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  )
}

function DetailGroupSection({ group }: { readonly group: DetailGroup }) {
  return (
    <InfoSection title={group.title}>
      <div className="grid gap-3 sm:grid-cols-2">
        {group.facts.map((item) => (
          <DetailItem
            label={item.label}
            value={item.value}
            key={`${group.title}-${item.label}`}
          />
        ))}
      </div>
    </InfoSection>
  )
}

function DetailItem({
  label,
  value,
}: {
  readonly label: string
  readonly value: string | number | null
}) {
  return (
    <div className="rounded-md border border-[var(--line)] bg-white/70 p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--sea-ink-soft)]">
        {label}
      </p>
      <p className="mt-1 text-base font-extrabold text-[var(--sea-ink)]">
        {value ?? '-'}
      </p>
    </div>
  )
}

export function OfficesPage({
  data,
}: {
  readonly data: DirectoryData<OfficeDetail>
  readonly onSearchChange?: (search: DirectorySearch) => void
}) {
  const office = data.items.at(0) ?? null

  if (office === null) {
    return (
      <main className="page-wrap py-14">
        <div className="rounded-lg border border-[var(--line)] bg-white/80 p-8">
          <h1 className="text-2xl font-extrabold">Office not found</h1>
          <p className="mt-2 text-sm text-[var(--sea-ink-soft)]">
            EXIT EXCEL REALTY was not found in the local office table.
          </p>
          <Button
            nativeButton={false}
            render={<Link to="/listings" search={defaultListingSearch} />}
            className="mt-5"
          >
            Back to listings
          </Button>
        </div>
      </main>
    )
  }

  return <OfficeDetailView office={office} />
}

function OfficeMetric({
  icon: Icon,
  label,
  value,
}: {
  readonly icon: typeof Building2
  readonly label: string
  readonly value: string
}) {
  return (
    <div className="rounded-md border border-[var(--line)] bg-white/72 p-3">
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--sea-ink-soft)]">
        <Icon className="size-3.5" />
        {label}
      </p>
      <p className="mt-1 text-2xl font-extrabold text-[var(--sea-ink)]">
        {value}
      </p>
    </div>
  )
}

export function AgentsPage({
  data,
  onSearchChange,
}: {
  readonly data: DirectoryData<PersonCard>
  readonly onSearchChange: (search: AgentSearch) => void
}) {
  const routeSearch = data.search as AgentSearch

  return (
    <DirectoryPageShell
      eyebrow="Members"
      title={`${EXIT_EXCEL_OFFICE_NAME} Agents`}
      description={`Showing only EXIT EXCEL REALTY members attached to active listings.`}
    >
      {data.items.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.items.map((agent) => (
            <DirectoryCard key={agent.memberKey}>
              <AgentRow agent={agent} prominent />
            </DirectoryCard>
          ))}
        </div>
      ) : (
        <DirectoryEmpty message="No EXIT EXCEL REALTY members have active listings in the local property table." />
      )}
      <Pagination
        page={routeSearch.page}
        hasNextPage={data.hasNextPage}
        onPage={(page) => onSearchChange({ ...routeSearch, page })}
      />
    </DirectoryPageShell>
  )
}

export function AgentDetailPage({
  agent,
}: {
  readonly agent: AgentDetail | null
}) {
  if (agent === null) {
    return (
      <main className="page-wrap py-14">
        <div className="rounded-lg border border-[var(--line)] bg-white/80 p-8">
          <h1 className="text-2xl font-extrabold">Agent not found</h1>
          <Button
            nativeButton={false}
            render={<Link to="/agents" search={{ officeKey: '', page: 1 }} />}
            className="mt-5"
          >
            Back to agents
          </Button>
        </div>
      </main>
    )
  }

  return (
    <main className="page-wrap grid gap-6 py-8">
      <section className="grid gap-6 rounded-lg border border-[var(--line)] bg-white/78 p-5 lg:grid-cols-[auto_1fr_auto] lg:items-start">
        <div className="flex size-28 items-center justify-center overflow-hidden rounded-lg bg-[var(--sand)] text-[var(--palm)]">
          {agent.imageUrl ? (
            <img
              src={agent.imageUrl}
              alt={personName(agent)}
              className="h-full w-full object-cover"
            />
          ) : (
            <UserRound className="size-12" />
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--kicker)]">
            Agent
          </p>
          <h1 className="display-title mt-2 text-4xl font-bold text-[var(--sea-ink)]">
            {personName(agent)}
          </h1>
          <p className="mt-2 text-sm leading-6 text-[var(--sea-ink-soft)]">
            {[agent.jobTitle, agent.type, agent.status]
              .filter(Boolean)
              .join(' · ')}
          </p>
          <p className="mt-1 text-sm leading-6 text-[var(--sea-ink-soft)]">
            {[agent.office?.officeName, agent.city, agent.province]
              .filter(Boolean)
              .join(' · ')}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 lg:justify-end">
          <ContactAgentButton agent={agent} />
          <Button
            nativeButton={false}
            render={
              <Link
                to="/offices"
                search={{ city: '', province: '', page: 1 }}
              />
            }
            variant="outline"
          >
            <Building2 />
            Office
          </Button>
        </div>
      </section>
      <section className="grid gap-6 lg:grid-cols-[1fr_340px] lg:items-start">
        <div className="grid gap-6">
          <InfoSection title="Agent details">
            <div className="grid gap-3 sm:grid-cols-2">
              <DetailItem label="Agent key" value={agent.memberKey} />
              <DetailItem label="MLS member ID" value={agent.memberMlsId} />
              <DetailItem
                label="National association ID"
                value={agent.nationalAssociationId}
              />
              <DetailItem
                label="Office national ID"
                value={agent.officeNationalAssociationId}
              />
              <DetailItem label="AOR" value={agent.memberAor} />
              <DetailItem label="AOR key" value={agent.memberAorKey} />
              <DetailItem label="Office key" value={agent.officeKey} />
              <DetailItem label="Nickname" value={agent.nickname} />
            </div>
          </InfoSection>
          <InfoSection title="Contact and location">
            <div className="grid gap-3 sm:grid-cols-2">
              <DetailItem label="Phone" value={agent.phone} />
              <DetailItem label="Phone extension" value={agent.phoneExt} />
              <DetailItem label="Toll-free phone" value={agent.tollFreePhone} />
              <DetailItem label="Fax" value={agent.fax} />
              <DetailItem label="Address" value={agent.address} />
              <DetailItem label="City" value={agent.city} />
              <DetailItem label="Province" value={agent.province} />
              <DetailItem label="Postal code" value={agent.postalCode} />
              <DetailItem label="Country" value={agent.country} />
            </div>
          </InfoSection>
          <AgentTagsSection
            title="Languages"
            values={agent.languages}
            emptyLabel="No languages are attached."
          />
          <AgentTagsSection
            title="Designations"
            values={agent.designations}
            emptyLabel="No designations are attached."
          />
          <InfoSection title="Listings">
            {agent.listings.length > 0 ? (
              <ListingsGrid listings={agent.listings} />
            ) : (
              <DirectoryEmpty message="No active listings are attached to this agent." />
            )}
          </InfoSection>
          <InfoSection title="Related open houses">
            {agent.openHouses.length > 0 ? (
              <div className="grid gap-4 lg:grid-cols-2">
                {agent.openHouses.map((openHouse) => (
                  <OpenHouseRow
                    openHouse={openHouse}
                    prominent
                    key={openHouse.openHouseKey}
                  />
                ))}
              </div>
            ) : (
              <DirectoryEmpty message="No open houses are attached to this agent's active listings." />
            )}
          </InfoSection>
        </div>
        <aside className="island-shell grid content-start gap-5 rounded-lg p-5 lg:sticky lg:top-24">
          <AgentRow agent={agent} prominent />
          {agent.office ? (
            <div className="grid gap-3 border-t border-[var(--line)] pt-5">
              <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-[var(--kicker)]">
                Office
              </p>
              <OfficeRow office={agent.office} prominent />
              <Button
                nativeButton={false}
                render={
                  <Link
                    to="/offices"
                    search={{ city: '', province: '', page: 1 }}
                  />
                }
                variant="outline"
              >
                Office details
              </Button>
            </div>
          ) : null}
          <SocialLinksList socialMedia={agent.socialMedia} />
        </aside>
      </section>
    </main>
  )
}

function AgentTagsSection({
  title,
  values,
  emptyLabel,
}: {
  readonly title: string
  readonly values: ReadonlyArray<string>
  readonly emptyLabel: string
}) {
  return (
    <InfoSection title={title}>
      {values.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {values.map((value) => (
            <span
              className="rounded-full border border-[var(--line)] bg-white/80 px-3 py-1 text-sm font-semibold text-[var(--sea-ink)]"
              key={value}
            >
              {value}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm text-[var(--sea-ink-soft)]">{emptyLabel}</p>
      )}
    </InfoSection>
  )
}

export function OpenHousesPage({
  data,
  isPaging = false,
  onSearchChange,
}: {
  readonly data: DirectoryData<OpenHouseCard>
  readonly isPaging?: boolean
  readonly onSearchChange: (search: OpenHouseSearch) => void
}) {
  const [filters, setFilters] = useAtom(openHouseFiltersAtom)
  const routeSearch = data.search as OpenHouseSearch
  const searchKey = JSON.stringify(routeSearch)

  useEffect(() => {
    setFilters(routeSearch)
  }, [routeSearch, searchKey, setFilters])

  const commit = (patch: Partial<OpenHouseSearch>) => {
    const next = { ...filters, ...patch, page: patch.page ?? 1 }
    setFilters(next)
    onSearchChange(compactOpenHouseSearch(next) as OpenHouseSearch)
  }

  return (
    <DirectoryPageShell
      eyebrow="Schedule"
      title="Open houses"
      description="Open house records joined back to their property listing."
      filters={
        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <LabeledInput
            label="Listing key"
            value={filters.listingKey}
            onChange={(listingKey) => commit({ listingKey })}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => commit({ listingKey: '' })}
          >
            Clear
          </Button>
        </div>
      }
    >
      <div className="grid gap-4 lg:grid-cols-2">
        {data.items.map((openHouse) => (
          <OpenHouseRow
            openHouse={openHouse}
            prominent
            key={openHouse.openHouseKey}
          />
        ))}
      </div>
      <Pagination
        page={routeSearch.page}
        hasNextPage={data.hasNextPage}
        isPending={isPaging}
        onPage={(page) => commit({ page })}
      />
    </DirectoryPageShell>
  )
}

function DirectoryPageShell({
  eyebrow,
  title,
  description,
  filters,
  children,
}: {
  readonly eyebrow: string
  readonly title: string
  readonly description: string
  readonly filters?: ReactNode
  readonly children: ReactNode
}) {
  return (
    <main className="page-wrap grid gap-6 py-8">
      <section className="rounded-lg border border-[var(--line)] bg-white/72 p-5">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--kicker)]">
          {eyebrow}
        </p>
        <h1 className="display-title mt-2 text-4xl font-bold text-[var(--sea-ink)]">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--sea-ink-soft)]">
          {description}
        </p>
        {filters ? <div className="mt-5">{filters}</div> : null}
      </section>
      {children}
    </main>
  )
}

function DirectoryEmpty({ message }: { readonly message: string }) {
  return (
    <div className="rounded-lg border border-dashed border-[var(--line)] bg-white/70 p-8 text-center">
      <p className="text-lg font-bold text-[var(--sea-ink)]">{message}</p>
    </div>
  )
}

function OfficeAgentLinkCard({ agent }: { readonly agent: PersonCard }) {
  return (
    <Link
      to="/agents/$agentKey"
      params={{ agentKey: agent.memberKey }}
      className="group flex items-center gap-3 rounded-md border border-[var(--line)] bg-white/74 p-3 text-[var(--sea-ink)] no-underline hover:border-[var(--lagoon-deep)] hover:text-[var(--lagoon-deep)]"
    >
      <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-[var(--sand)] text-[var(--palm)]">
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
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-extrabold">
          {personName(agent)}
        </span>
        <span className="mt-0.5 block truncate text-xs font-semibold text-[var(--sea-ink-soft)]">
          {agent.jobTitle ?? agent.memberKey}
        </span>
      </span>
      <ArrowRight className="size-4 shrink-0 transition group-hover:translate-x-0.5" />
    </Link>
  )
}

function OfficeDetailView({ office }: { readonly office: OfficeDetail }) {
  const groupedMedia = mediaGroups(office.media)
  const heroImageUrl =
    office.imageUrl ?? groupedMedia.photos.at(0)?.mediaUrl ?? null

  return (
    <main className="page-wrap grid gap-6 py-8">
      <section className="grid gap-6 lg:grid-cols-[1fr_340px] lg:items-start">
        <div className="overflow-hidden rounded-lg border border-[var(--line)] bg-white/78">
          <div className="grid gap-0 md:grid-cols-[minmax(0,1fr)_280px]">
            <div className="grid content-between gap-6 p-6">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--kicker)]">
                  Office
                </p>
                <h1 className="display-title mt-2 text-4xl font-bold text-[var(--sea-ink)]">
                  {office.officeName ?? EXIT_EXCEL_OFFICE_NAME}
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--sea-ink-soft)]">
                  {[
                    office.address,
                    office.city,
                    office.province,
                    office.postalCode,
                  ]
                    .filter(Boolean)
                    .join(', ') || `Office key ${office.officeKey}`}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  nativeButton={false}
                  render={
                    <Link to="/agents" search={{ officeKey: '', page: 1 }} />
                  }
                >
                  <Users />
                  Agents
                </Button>
                {office.phone ? (
                  <Button
                    nativeButton={false}
                    render={<a href={`tel:${office.phone}`} />}
                    variant="outline"
                  >
                    <Phone />
                    Call office
                  </Button>
                ) : null}
              </div>
            </div>
            <div className="min-h-64 bg-[var(--sand)] text-[var(--palm)] md:min-h-full">
              {heroImageUrl ? (
                <img
                  src={heroImageUrl}
                  alt={office.officeName ?? 'Office logo'}
                  className="h-full w-full object-contain p-8"
                />
              ) : (
                <div className="flex h-full min-h-64 items-center justify-center">
                  <Building2 className="size-16" />
                </div>
              )}
            </div>
          </div>
          {groupedMedia.photos.length > 1 ? (
            <div className="grid grid-cols-2 gap-2 border-t border-[var(--line)] p-3 sm:grid-cols-4">
              {groupedMedia.photos.slice(0, 4).map((media) => (
                <img
                  src={media.mediaUrl ?? ''}
                  alt={media.longDescription ?? office.officeName ?? 'Office'}
                  className="aspect-[4/3] rounded-md bg-[var(--sand)] object-cover"
                  loading="lazy"
                  key={mediaKey(media)}
                />
              ))}
            </div>
          ) : null}
        </div>
        <aside className="island-shell grid content-start gap-5 rounded-lg p-5 lg:sticky lg:top-24">
          <OfficeRow office={office} prominent />
          <div className="grid grid-cols-2 gap-3">
            <OfficeMetric
              icon={Users}
              label="Agents"
              value={number.format(office.agents.length)}
            />
            <OfficeMetric
              icon={Home}
              label="Listings"
              value={number.format(office.listings.length)}
            />
          </div>
          <SocialLinksList socialMedia={office.socialMedia} />
        </aside>
      </section>
      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <InfoSection title="Office details">
          <div className="grid gap-3 sm:grid-cols-2">
            <DetailItem label="Office key" value={office.officeKey} />
            <DetailItem label="MLS office ID" value={office.officeMlsId} />
            <DetailItem
              label="National association ID"
              value={office.officeNationalAssociationId}
            />
            <DetailItem
              label="Franchise ID"
              value={office.franchiseNationalAssociationId}
            />
            <DetailItem
              label="Broker national ID"
              value={office.officeBrokerNationalAssociationId}
            />
            <DetailItem label="AOR" value={office.officeAor} />
            <DetailItem label="AOR key" value={office.officeAorKey} />
            <DetailItem label="Type" value={office.officeType} />
            <DetailItem label="Status" value={office.officeStatus} />
          </div>
        </InfoSection>
        <InfoSection title="Address and contact">
          <div className="grid gap-3 sm:grid-cols-2">
            <DetailItem label="Address" value={office.address} />
            <DetailItem label="City" value={office.city} />
            <DetailItem label="Province" value={office.province} />
            <DetailItem label="Postal code" value={office.postalCode} />
            <DetailItem label="Country" value={office.country} />
            <DetailItem label="Phone" value={office.phone} />
            <DetailItem label="Phone extension" value={office.phoneExt} />
            <DetailItem label="Fax" value={office.fax} />
          </div>
        </InfoSection>
      </section>
      <InfoSection title="Agents">
        {office.agents.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {office.agents.map((agent) => (
              <OfficeAgentLinkCard agent={agent} key={agent.memberKey} />
            ))}
          </div>
        ) : (
          <DirectoryEmpty message="No active agents are attached to this office's listings." />
        )}
      </InfoSection>
      <InfoSection title="Office listings">
        {office.listings.length > 0 ? (
          <ListingsGrid listings={office.listings} />
        ) : (
          <DirectoryEmpty message="No active listings are attached to this office." />
        )}
      </InfoSection>
      {groupedMedia.all.length > 0 ? (
        <InfoSection title="Media">
          <MediaGroupsView
            listingAddress={office.officeName ?? EXIT_EXCEL_OFFICE_NAME}
            media={groupedMedia}
          />
        </InfoSection>
      ) : null}
    </main>
  )
}

function SocialLinksList({
  socialMedia,
}: {
  readonly socialMedia: ReadonlyArray<SocialMediaCard>
}) {
  if (socialMedia.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-[var(--line)] bg-white/60 p-3 text-sm text-[var(--sea-ink-soft)]">
        No social media links are attached.
      </div>
    )
  }

  return (
    <div className="grid gap-3">
      <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-[var(--kicker)]">
        Social
      </p>
      {socialMedia.map((item) => (
        <a
          className="flex items-center justify-between gap-3 rounded-md border border-[var(--line)] bg-white/70 p-3 text-sm font-semibold text-[var(--sea-ink)] no-underline hover:text-[var(--lagoon-deep)]"
          href={item.socialMediaUrlOrId ?? '#'}
          target="_blank"
          rel="noreferrer"
          key={item.socialMediaKey ?? item.socialMediaUrlOrId}
        >
          <span>{item.socialMediaType ?? 'Social link'}</span>
          <ExternalLink className="size-4" />
        </a>
      ))}
    </div>
  )
}

function LabeledInput({
  label,
  value,
  onChange,
}: {
  readonly label: string
  readonly value: string
  readonly onChange: (value: string) => void
}) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--sea-ink-soft)]">
        {label}
      </Label>
      <Input value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  )
}

function DirectoryCard({ children }: { readonly children: ReactNode }) {
  return (
    <article className="rounded-lg border border-[var(--line)] bg-white/82 p-4 shadow-[0_10px_24px_rgba(23,58,64,0.07)]">
      {children}
    </article>
  )
}

export function OfficeRow({
  office,
  prominent = false,
}: {
  readonly office: OfficeCard
  readonly prominent?: boolean
}) {
  const identifiers = [
    `Office key ${office.officeKey}`,
    office.officeMlsId ? `MLS ${office.officeMlsId}` : null,
    office.officeNationalAssociationId
      ? `National ${office.officeNationalAssociationId}`
      : null,
  ].filter(Boolean)

  return (
    <div className="flex items-start gap-3">
      <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-[var(--sand)] text-[var(--palm)]">
        {office.imageUrl ? (
          <img
            src={office.imageUrl}
            alt={office.officeName ?? 'Office logo'}
            className="h-full w-full object-contain"
            loading="lazy"
          />
        ) : (
          <Building2 className="size-5" />
        )}
      </div>
      <div className="min-w-0">
        <p
          className={cn(
            'font-extrabold text-[var(--sea-ink)]',
            prominent ? 'text-lg' : 'text-sm',
          )}
        >
          {office.officeName ?? 'Office'}
        </p>
        <p className="mt-1 text-sm text-[var(--sea-ink-soft)]">
          {[office.city, office.province].filter(Boolean).join(', ') ||
            office.officeKey}
        </p>
        <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--sea-ink-soft)]">
          {identifiers.join(' · ')}
        </p>
        {office.phone ? (
          <p className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-[var(--sea-ink-soft)]">
            <Phone className="size-3" />
            {office.phone}
          </p>
        ) : null}
      </div>
    </div>
  )
}

export function AgentRow({
  agent,
  prominent = false,
}: {
  readonly agent: PersonCard
  readonly prominent?: boolean
}) {
  return (
    <div className="grid gap-4">
      <div className="flex items-start gap-3">
        <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-[var(--sand)] text-[var(--palm)]">
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
          <Link
            to="/agents/$agentKey"
            params={{ agentKey: agent.memberKey }}
            className={cn(
              'font-extrabold text-[var(--sea-ink)] no-underline hover:text-[var(--lagoon-deep)]',
              prominent ? 'text-lg' : 'text-sm',
            )}
          >
            {personName(agent)}
          </Link>
          {agent.jobTitle ? (
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--kicker)]">
              {agent.jobTitle}
            </p>
          ) : null}
          <p className="mt-1 text-sm text-[var(--sea-ink-soft)]">
            {agent.office?.officeName ||
              [agent.city, agent.province].filter(Boolean).join(', ') ||
              agent.memberKey}
          </p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--sea-ink-soft)]">
            Agent key {agent.memberKey}
            {agent.officeKey ? ` · Office key ${agent.officeKey}` : ''}
          </p>
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs font-semibold text-[var(--sea-ink-soft)]">
            {agent.phone ? (
              <span className="inline-flex items-center gap-1">
                <Phone className="size-3" />
                {agent.phone}
              </span>
            ) : null}
            {agent.type ? <span>{agent.type}</span> : null}
            {agent.status ? <span>{agent.status}</span> : null}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          nativeButton={false}
          render={
            <Link
              to="/agents/$agentKey"
              params={{ agentKey: agent.memberKey }}
            />
          }
          size="sm"
        >
          <UserRound />
          Details
        </Button>
        <ContactAgentButton agent={agent} buttonLabel="Contact" />
      </div>
    </div>
  )
}

export function OpenHouseRow({
  openHouse,
  prominent = false,
}: {
  readonly openHouse: OpenHouseCard
  readonly prominent?: boolean
}) {
  return (
    <div
      className={cn(
        'grid gap-3 rounded-lg border border-[var(--line)] bg-white/76 p-3 md:grid-cols-[auto_1fr]',
        prominent && 'p-4 shadow-[0_10px_24px_rgba(23,58,64,0.07)]',
      )}
    >
      <div className="flex size-12 items-center justify-center rounded-md bg-[var(--sand)] text-[var(--palm)]">
        <CalendarDays className="size-6" />
      </div>
      <div className="grid min-w-0 gap-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p
              className={cn(
                'font-extrabold text-[var(--sea-ink)]',
                prominent ? 'text-xl' : 'text-base',
              )}
            >
              {formatDate(openHouse.date)}
            </p>
            <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-[var(--sea-ink-soft)]">
              <span className="inline-flex items-center gap-1">
                <Clock className="size-3.5" />
                {openHouseTimeLabel(openHouse)}
              </span>
              {openHouse.status ? <span>{openHouse.status}</span> : null}
            </p>
            {openHouse.type ? (
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--kicker)]">
                {openHouse.type}
              </p>
            ) : null}
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button
              nativeButton={false}
              render={
                <Link
                  to="/open-houses/$openHouseKey"
                  params={{ openHouseKey: openHouse.openHouseKey }}
                />
              }
              size="sm"
            >
              <CalendarDays />
              Details
            </Button>
            {openHouse.property ? (
              <Button
                nativeButton={false}
                render={
                  <Link
                    to="/listings/$listingKey"
                    params={{ listingKey: openHouse.property.listingKey }}
                  />
                }
                size="sm"
                variant="outline"
              >
                Property
              </Button>
            ) : null}
          </div>
        </div>
        {openHouse.property ? (
          <Link
            to="/listings/$listingKey"
            params={{ listingKey: openHouse.property.listingKey }}
            className="group grid gap-1 rounded-md border border-[var(--line)] bg-[var(--foam)] p-3 no-underline hover:border-[var(--lagoon-deep)]"
          >
            <span className="text-sm font-extrabold text-[var(--sea-ink)] group-hover:text-[var(--lagoon-deep)]">
              {openHouse.property.address}
            </span>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-[var(--sea-ink-soft)]">
              <MapPin className="size-3.5" />
              {[openHouse.property.city, openHouse.property.province]
                .filter(Boolean)
                .join(', ')}
            </span>
          </Link>
        ) : null}
        {openHouse.remarks ? (
          <p className="line-clamp-2 text-sm leading-6 text-[var(--sea-ink-soft)]">
            {openHouse.remarks}
          </p>
        ) : null}
      </div>
    </div>
  )
}

function Pagination({
  page,
  hasNextPage,
  isPending = false,
  onPage,
}: {
  readonly page: number
  readonly hasNextPage: boolean
  readonly isPending?: boolean
  readonly onPage: (page: number) => void
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-[var(--line)] bg-white/70 p-3">
      <Button
        type="button"
        variant="outline"
        disabled={isPending || page <= 1}
        onClick={() => onPage(Math.max(1, page - 1))}
      >
        Previous
      </Button>
      <span className="text-sm font-semibold text-[var(--sea-ink-soft)]">
        Page {page}
      </span>
      <Button
        type="button"
        variant="outline"
        disabled={isPending || !hasNextPage}
        onClick={() => onPage(page + 1)}
      >
        Next
      </Button>
    </div>
  )
}
