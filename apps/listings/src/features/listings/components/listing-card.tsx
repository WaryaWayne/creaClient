import type {
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
} from 'react'
import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import {
  Bath,
  BedDouble,
  Building2,
  CalendarDays,
  Home,
  MapPin,
  Phone,
  RotateCcw,
  Users,
} from 'lucide-react'

import { Button } from '@workspace/ui/components/button'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@workspace/ui/components/item'

import type {
  ListingCard as ListingCardType,
  OfficeCard,
  OpenHouseCard,
} from '../data'
import { AgentsDialogButton } from './contact'
import { ListingActions } from './listing-actions'
import { DetailsDialog, EmptyState, MetricPill } from './shared'
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
      className="inline-flex items-center gap-1.5 rounded-full bg-background ring-2 ring-border px-3 py-1 text-xs font-extrabold text-foreground no-underline shadow-sm"
    >
      <CalendarDays className="size-3.5" />
      {`${formatDate(nextOpenHouse.date)}${openHouses.length > 1 ? ` +${openHouses.length - 1}` : ''}`}
    </Link>
  )
}

function OfficeCreditBlock({ office }: { readonly office: OfficeCard }) {
  return (
    <div className="grid gap-3 rounded-md border border-border bg-card p-3">
      <div className="flex items-start gap-3">
        <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-background text-foreground">
          {office.imageUrl !== null && office.imageUrl.length > 0 ? (
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
          <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-foreground">
            Office
          </p>
          <p className="mt-1 font-extrabold text-foreground">
            {office.officeName ?? 'Office'}
          </p>
          <p className="mt-1 text-sm text-foreground">
            {[office.address, office.city, office.province, office.postalCode]
              .filter(Boolean)
              .join(', ') || office.officeKey}
          </p>
          {office.phone !== null && office.phone.length > 0 ? (
            <p className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-foreground">
              <Phone className="size-3" />
              {office.phone}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )
}

const officeName = (office: OfficeCard) => office.officeName ?? 'Office'

function OfficesDialogButton({
  listing,
}: {
  readonly listing: Pick<ListingCardType, 'address' | 'offices'>
}) {
  const [open, setOpen] = useState(false)
  if (listing.offices.length === 0) return null

  return (
    <>
      <Button type="button" variant="outline" onClick={() => setOpen(true)}>
        <Building2 />
        See offices
      </Button>
      <DetailsDialog
        title="Listing offices"
        open={open}
        onOpenChange={setOpen}
        className="max-w-4xl"
      >
        <div className="grid content-start gap-4">
          <p className="text-sm leading-6 text-foreground">{listing.address}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {listing.offices.map((office) => (
              <OfficeCreditBlock office={office} key={office.officeKey} />
            ))}
          </div>
        </div>
      </DetailsDialog>
    </>
  )
}

function OfficeCreditsSummary({
  listing,
}: {
  readonly listing: Pick<ListingCardType, 'address' | 'offices'>
}) {
  return (
    <Item
      variant="outline"
      size="sm"
      className="gap-3 rounded-md border-border bg-card p-3"
    >
      <ItemMedia
        variant="icon"
        className="size-10 rounded-md bg-background text-foreground"
      >
        <Building2 className="size-5" />
      </ItemMedia>
      <ItemContent className="min-w-0">
        <ItemTitle className="font-extrabold text-foreground">
          {listing.offices.length}{' '}
          {listing.offices.length === 1 ? 'office' : 'offices'}
        </ItemTitle>
        <ItemDescription className="line-clamp-1 text-foreground">
          {listing.offices.map(officeName).join(', ')}
        </ItemDescription>
      </ItemContent>
      <ItemActions className="shrink-0">
        <OfficesDialogButton listing={listing} />
      </ItemActions>
    </Item>
  )
}

export function ListingCredits({
  listing,
}: {
  readonly listing: ListingCardType
}) {
  if (listing.offices.length === 0 && listing.agents.length === 0) return null
  return (
    <div className="grid gap-3 border-t border-border pt-3">
      {listing.offices.length === 1 ? (
        <OfficeCreditBlock office={listing.offices[0]} />
      ) : null}
      {listing.offices.length > 1 ? (
        <OfficeCreditsSummary listing={listing} />
      ) : null}
      {listing.agents.length > 0 ? (
        <Item
          variant="outline"
          size="sm"
          className="gap-3 rounded-md border-border bg-card p-3"
        >
          <ItemMedia
            variant="icon"
            className="size-10 rounded-md bg-background text-foreground"
          >
            <Users className="size-5" />
          </ItemMedia>
          <ItemContent className="min-w-0">
            <ItemTitle className="font-extrabold text-foreground">
              {listing.agents.length}{' '}
              {listing.agents.length === 1 ? 'agent' : 'agents'}
            </ItemTitle>
            <ItemDescription className="line-clamp-1 text-foreground">
              {listing.agents.map(personName).join(', ')}
            </ItemDescription>
          </ItemContent>
          <ItemActions className="shrink-0">
            <AgentsDialogButton listing={listing} />
          </ItemActions>
        </Item>
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
      className="group cursor-pointer overflow-hidden rounded-lg border border-border bg-card shadow-[0_12px_30px_rgba(23,58,64,0.08)] hover:border-border hover:shadow-[0_18px_38px_rgba(23,58,64,0.12)]"
      tabIndex={0}
      aria-label={`View listing details for ${listing.address}`}
      onClick={onCardClick}
      onKeyDown={onCardKeyDown}
    >
      <div className="relative aspect-[4/3] bg-background">
        {listing.imageUrl !== null && listing.imageUrl.length > 0 ? (
          <img
            src={listing.imageUrl}
            alt={listing.address}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-foreground">
            <Home className="size-12" />
          </div>
        )}
        <div className="absolute left-3 top-3 flex max-w-[calc(100%-5rem)] flex-wrap gap-2">
          <div className="rounded-full bg-background px-3 py-1 text-xs font-bold text-foreground shadow-sm">
            {listing.status ?? 'Listing'}
          </div>
          <OpenHouseImageBadge openHouses={listing.openHouses} />
        </div>
        <div className="absolute right-2 top-2 rounded-full bg-background shadow-sm">
          <ListingActions listingKey={listing.listingKey} compact />
        </div>
      </div>
      <div className="grid gap-4 p-4">
        <div className="grid gap-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xl font-extrabold tracking-normal text-foreground">
                {formatListingPrice(listing)}
              </p>
              <p className="mt-1 line-clamp-2 text-sm font-semibold text-foreground group-hover:text-foreground">
                {listing.address}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-foreground">
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
        {listing.remarks !== null && listing.remarks.length > 0 ? (
          <p className="line-clamp-3 text-sm leading-6 text-foreground">
            {listing.remarks}
          </p>
        ) : null}
        <ListingCredits listing={listing} />
        <div className="flex items-center justify-between border-t border-border pt-3 text-xs text-foreground">
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
  emptyTitle = 'No listings match those filters.',
  emptyDescription = 'Clear one or two filters and the page URL will update with the next search.',
  onClearFilters,
}: {
  readonly listings: ReadonlyArray<ListingCardType>
  readonly emptyTitle?: string
  readonly emptyDescription?: string
  readonly onClearFilters?: () => void
}) {
  if (listings.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        icon={Home}
        className="p-10"
      >
        {onClearFilters !== undefined ? (
          <Button
            type="button"
            variant="outline"
            className="font-extrabold"
            onClick={onClearFilters}
          >
            <RotateCcw className="size-4" />
            Clear filters
          </Button>
        ) : null}
      </EmptyState>
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
