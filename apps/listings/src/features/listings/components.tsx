import { useEffect, useState } from 'react'
import type {
  FormEvent,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  ReactNode,
} from 'react'
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
  Trash2,
  UserRound,
  Users,
  X,
} from 'lucide-react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useAtom } from '@effect/atom-react'

import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Textarea } from '#/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { cn } from '#/lib/utils'

import {
  agentFiltersAtom,
  listingFiltersAtom,
  officeFiltersAtom,
  openHouseFiltersAtom,
} from './state'
import {
  compactAgentSearch,
  compactDirectorySearch,
  compactListingSearch,
  compactOpenHouseSearch,
  defaultListingSearch,
  defaultOpenHouseSearch,
  listingSortOptions,
} from './search'

import type {
  DirectoryData,
  DetailGroup,
  HomeData,
  ListingCard as ListingCardType,
  ListingDetail,
  ListingFacets,
  ListingsData,
  MediaCard,
  OfficeCard,
  OpenHouseDetail,
  OpenHouseCard,
  PersonCard,
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
        onValueChange={(next) => onChange(next === allValue ? '' : next)}
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

  return (
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
    </div>
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
  if (!nextOpenHouse) return null

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
            {office.officeName ?? 'Office'}
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
        <p className="font-extrabold text-[var(--sea-ink)]">
          {personName(agent)}
        </p>
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
          <Button asChild size="sm" variant="outline">
            <Link
              to="/listings/$listingKey"
              params={{ listingKey: listing.listingKey }}
            >
              View
            </Link>
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
  onChange,
}: {
  readonly search: ListingSearch
  readonly facets: ListingFacets
  readonly onChange: (search: ListingSearch) => void
}) {
  const [filters, setFilters] = useAtom(listingFiltersAtom)
  const searchKey = JSON.stringify(search)

  useEffect(() => {
    setFilters(search)
  }, [searchKey, search, setFilters])

  const commit = (patch: Partial<ListingSearch>) => {
    const next = { ...filters, ...patch, page: patch.page ?? 1 }
    setFilters(next)
    onChange(cleanSearchObject(next))
  }

  return (
    <aside className="island-shell sticky top-24 grid gap-4 rounded-lg p-4">
      <div>
        <p className="text-sm font-extrabold text-[var(--sea-ink)]">
          Filter listings
        </p>
        <p className="mt-1 text-xs leading-5 text-[var(--sea-ink-soft)]">
          Every change is reflected in the URL.
        </p>
      </div>
      <SelectFilter
        label="City"
        value={filters.city}
        placeholder="All cities"
        options={facets.cities}
        onChange={(city) => commit({ city })}
      />
      <SelectFilter
        label="Province"
        value={filters.province}
        placeholder="All provinces"
        options={facets.provinces}
        onChange={(province) => commit({ province })}
      />
      <SelectFilter
        label="Status"
        value={filters.status}
        placeholder="All statuses"
        options={facets.statuses}
        onChange={(status) => commit({ status })}
      />
      <SelectFilter
        label="Type"
        value={filters.type}
        placeholder="All property types"
        options={facets.types}
        onChange={(type) => commit({ type })}
      />
      <div className="grid grid-cols-2 gap-3">
        <label className="grid gap-1.5">
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
        <label className="grid gap-1.5">
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
        <label className="grid gap-1.5">
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
        <label className="grid gap-1.5">
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
          onValueChange={(sort) =>
            commit({ sort: sort as ListingSearch['sort'] })
          }
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
    </aside>
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
    <main className="page-wrap grid gap-8 py-8 lg:grid-cols-[290px_1fr]">
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

export function HomePage({ data }: { readonly data: HomeData }) {
  const heroListing = data.featuredListings[0]
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
            <Button asChild size="lg">
              <Link to="/listings" search={defaultListingSearch}>
                <Search />
                Browse listings
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/open-houses" search={defaultOpenHouseSearch}>
                <CalendarDays />
                Open houses
              </Link>
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
            <Button asChild variant="outline">
              <Link to="/listings" search={defaultListingSearch}>
                View all
              </Link>
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
  const firstOpenHouse = listing.openHouses[0]
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
          <Button asChild size="sm" variant="outline">
            <Link
              to="/open-houses"
              search={{
                ...defaultOpenHouseSearch,
                listingKey: listing.listingKey,
              }}
            >
              See all
            </Link>
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
          <Button asChild className="mt-5">
            <Link to="/open-houses" search={defaultOpenHouseSearch}>
              Back to open houses
            </Link>
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
            <Button asChild>
              <Link
                to="/listings/$listingKey"
                params={{ listingKey: property.listingKey }}
              >
                <Home />
                Property details
              </Link>
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
          <Button asChild variant="outline">
            <Link to="/open-houses" search={defaultOpenHouseSearch}>
              All open houses
            </Link>
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
          <Button asChild className="mt-5">
            <Link to="/listings" search={defaultListingSearch}>
              Back to listings
            </Link>
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
  onSearchChange,
}: {
  readonly data: DirectoryData<OfficeCard>
  readonly onSearchChange: (search: DirectorySearch) => void
}) {
  const [filters, setFilters] = useAtom(officeFiltersAtom)
  const routeSearch = data.search as DirectorySearch
  const searchKey = JSON.stringify(routeSearch)

  useEffect(() => {
    setFilters(routeSearch)
  }, [routeSearch, searchKey, setFilters])

  const commit = (patch: Partial<DirectorySearch>) => {
    const next = { ...filters, ...patch, page: patch.page ?? 1 }
    setFilters(next)
    onSearchChange(compactDirectorySearch(next) as DirectorySearch)
  }

  return (
    <DirectoryPageShell
      eyebrow="Directory"
      title="Offices"
      description="Browse offices from the local CREA DDF database."
      filters={
        <div className="grid gap-3 md:grid-cols-3">
          <LabeledInput
            label="City"
            value={filters.city}
            onChange={(city) => commit({ city })}
          />
          <LabeledInput
            label="Province"
            value={filters.province}
            onChange={(province) => commit({ province })}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => commit({ city: '', province: '' })}
          >
            Clear
          </Button>
        </div>
      }
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data.items.map((office) => (
          <DirectoryCard key={office.officeKey}>
            <OfficeRow office={office} prominent />
          </DirectoryCard>
        ))}
      </div>
      <Pagination
        page={routeSearch.page}
        hasNextPage={data.hasNextPage}
        onPage={(page) => commit({ page })}
      />
    </DirectoryPageShell>
  )
}

export function AgentsPage({
  data,
  onSearchChange,
}: {
  readonly data: DirectoryData<PersonCard>
  readonly onSearchChange: (search: AgentSearch) => void
}) {
  const [filters, setFilters] = useAtom(agentFiltersAtom)
  const routeSearch = data.search as AgentSearch
  const searchKey = JSON.stringify(routeSearch)

  useEffect(() => {
    setFilters(routeSearch)
  }, [routeSearch, searchKey, setFilters])

  const commit = (patch: Partial<AgentSearch>) => {
    const next = { ...filters, ...patch, page: patch.page ?? 1 }
    setFilters(next)
    onSearchChange(compactAgentSearch(next) as AgentSearch)
  }

  return (
    <DirectoryPageShell
      eyebrow="Directory"
      title="Agents"
      description="Browse member records and narrow the list by office key."
      filters={
        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <LabeledInput
            label="Office key"
            value={filters.officeKey}
            onChange={(officeKey) => commit({ officeKey })}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => commit({ officeKey: '' })}
          >
            Clear
          </Button>
        </div>
      }
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data.items.map((agent) => (
          <DirectoryCard key={agent.memberKey}>
            <AgentRow agent={agent} prominent />
          </DirectoryCard>
        ))}
      </div>
      <Pagination
        page={routeSearch.page}
        hasNextPage={data.hasNextPage}
        onPage={(page) => commit({ page })}
      />
    </DirectoryPageShell>
  )
}

export function OpenHousesPage({
  data,
  onSearchChange,
}: {
  readonly data: DirectoryData<OpenHouseCard>
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
  readonly filters: ReactNode
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
        <div className="mt-5">{filters}</div>
      </section>
      {children}
    </main>
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
  return (
    <div className="flex items-start gap-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-[var(--sand)] text-[var(--palm)]">
        <Building2 className="size-5" />
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
    <div className="flex items-start gap-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-[var(--sand)] text-[var(--palm)]">
        <UserRound className="size-5" />
      </div>
      <div className="min-w-0">
        <p
          className={cn(
            'font-extrabold text-[var(--sea-ink)]',
            prominent ? 'text-lg' : 'text-sm',
          )}
        >
          {personName(agent)}
        </p>
        <p className="mt-1 text-sm text-[var(--sea-ink-soft)]">
          {agent.office?.officeName ??
            [agent.city, agent.province].filter(Boolean).join(', ') ??
            agent.memberKey}
        </p>
        {agent.phone ? (
          <p className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-[var(--sea-ink-soft)]">
            <Phone className="size-3" />
            {agent.phone}
          </p>
        ) : null}
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
            <Button asChild size="sm">
              <Link
                to="/open-houses/$openHouseKey"
                params={{ openHouseKey: openHouse.openHouseKey }}
              >
                <CalendarDays />
                Details
              </Link>
            </Button>
            {openHouse.property ? (
              <Button asChild size="sm" variant="outline">
                <Link
                  to="/listings/$listingKey"
                  params={{ listingKey: openHouse.property.listingKey }}
                >
                  Property
                </Link>
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
  onPage,
}: {
  readonly page: number
  readonly hasNextPage: boolean
  readonly onPage: (page: number) => void
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-[var(--line)] bg-white/70 p-3">
      <Button
        type="button"
        variant="outline"
        disabled={page <= 1}
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
        disabled={!hasNextPage}
        onClick={() => onPage(page + 1)}
      >
        Next
      </Button>
    </div>
  )
}
