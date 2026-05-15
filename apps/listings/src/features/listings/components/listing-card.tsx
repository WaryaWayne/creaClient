import type {
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
} from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import {
  Bath,
  BedDouble,
  Building2,
  CalendarDays,
  Home,
  MapPin,
  Phone,
  Users,
} from 'lucide-react'

import { Button } from '@workspace/ui/components/button'

import type {
  ListingCard as ListingCardType,
  OfficeCard,
  OpenHouseCard,
} from '../data'
import { AgentsDialogButton } from './contact'
import { ListingActions } from './listing-actions'
import { MetricPill } from './shared'
import { formatDate, formatListingPrice, personName } from './utils'

export function OpenHouseImageBadge({
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
      className="inline-flex items-center gap-1.5 rounded-full bg-background ring-2 ring-amber-300 px-3 py-1 text-xs font-extrabold text-foreground no-underline shadow-sm"
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

export function ListingCredits({
  listing,
}: {
  readonly listing: ListingCardType
}) {
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
