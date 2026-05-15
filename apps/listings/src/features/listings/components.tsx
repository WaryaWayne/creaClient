import { useEffect } from 'react'
import type { ReactNode } from 'react'
import {
  Bath,
  BedDouble,
  Building2,
  CalendarDays,
  ExternalLink,
  FileImage,
  FileText,
  Heart,
  Home,
  MapPin,
  NotebookPen,
  Phone,
  PlayCircle,
  Search,
  Trash2,
  UserRound,
} from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { useAtom } from '@effect/atom-react'

import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
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
    <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--sea-ink)] px-3 py-1 text-xs font-extrabold text-white shadow-sm">
      <CalendarDays className="size-3.5" />
      {nextOpenHouse
        ? `${formatDate(nextOpenHouse.date)}${openHouses.length > 1 ? ` +${openHouses.length - 1}` : ''}`
        : 'Open house'}
    </div>
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

function ListingCredits({ listing }: { readonly listing: ListingCardType }) {
  if (listing.offices.length === 0 && listing.agents.length === 0) return null
  return (
    <div className="grid gap-3 border-t border-[var(--line)] pt-3">
      {listing.offices.map((office) => (
        <OfficeCreditBlock office={office} key={office.officeKey} />
      ))}
      {listing.agents.length > 0 ? (
        <div className="grid gap-2 sm:grid-cols-2">
          {listing.agents.map((agent) => (
            <AgentCreditBox agent={agent} key={agent.memberKey} />
          ))}
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
  return (
    <article className="overflow-hidden rounded-lg border border-[var(--line)] bg-white/82 shadow-[0_12px_30px_rgba(23,58,64,0.08)]">
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
              <Link
                to="/listings/$listingKey"
                params={{ listingKey: listing.listingKey }}
                className="mt-1 line-clamp-2 text-sm font-semibold text-[var(--sea-ink)] no-underline hover:text-[var(--lagoon-deep)]"
              >
                {listing.address}
              </Link>
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
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
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
      <div className="mt-4 grid gap-3">{children}</div>
    </section>
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
    <main className="page-wrap grid gap-8 py-8">
      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
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
        <aside className="island-shell grid content-start gap-5 rounded-lg p-5">
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
          <div>
            <h1 className="display-title text-3xl font-bold text-[var(--sea-ink)]">
              {listing.address}
            </h1>
            <p className="mt-2 flex items-center gap-1.5 text-sm text-[var(--sea-ink-soft)]">
              <MapPin className="size-4" />
              {[listing.city, listing.province].filter(Boolean).join(', ')}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
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
          <CreditsBlock listing={listing} />
        </aside>
      </section>
      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="grid gap-6">
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
        <div className="grid content-start gap-6">
          <InfoSection title="Open houses">
            {listing.openHouses.length > 0 ? (
              <div className="grid gap-3">
                {listing.openHouses.map((openHouse) => (
                  <OpenHouseRow
                    openHouse={openHouse}
                    key={openHouse.openHouseKey}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--sea-ink-soft)]">
                No open houses are attached to this listing.
              </p>
            )}
          </InfoSection>
        </div>
      </section>
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
      <div className="grid gap-4">
        {data.items.map((openHouse) => (
          <DirectoryCard key={openHouse.openHouseKey}>
            <OpenHouseRow openHouse={openHouse} prominent />
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
    <div className="grid gap-3 md:grid-cols-[auto_1fr]">
      <div className="flex size-10 items-center justify-center rounded-md bg-[var(--sand)] text-[var(--palm)]">
        <CalendarDays className="size-5" />
      </div>
      <div className="min-w-0">
        <p
          className={cn(
            'font-extrabold text-[var(--sea-ink)]',
            prominent ? 'text-lg' : 'text-sm',
          )}
        >
          {formatDate(openHouse.date)}
        </p>
        <p className="mt-1 text-sm text-[var(--sea-ink-soft)]">
          {[openHouse.startTime, openHouse.endTime].filter(Boolean).join(' - ')}
          {openHouse.status ? ` · ${openHouse.status}` : ''}
        </p>
        {openHouse.property ? (
          <Link
            to="/listings/$listingKey"
            params={{ listingKey: openHouse.property.listingKey }}
            className="mt-2 block text-sm font-semibold text-[var(--lagoon-deep)] no-underline"
          >
            {openHouse.property.address}
          </Link>
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
