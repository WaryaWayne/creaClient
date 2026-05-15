import { Link } from '@tanstack/react-router'
import {
  ArrowRight,
  Bath,
  BedDouble,
  Building2,
  Clock,
  Home,
  MapPin,
} from 'lucide-react'

import { Button } from '@workspace/ui/components/button'

import type { ListingDetail, OpenHouseDetail } from '../data'
import { defaultListingSearch, defaultOpenHouseSearch } from '../search'
import { OpenHouseRow } from './directory-pages'
import { ListingActions } from './listing-actions'
import {
  ListingCredits,
  ListingsGrid,
  OpenHouseImageBadge,
} from './listing-card'
import { MediaGroupsView, mediaGroups, mediaKey } from './media'
import {
  DetailGroupSection,
  DetailItem,
  InfoSection,
  MetricPill,
} from './shared'
import {
  formatDate,
  formatListingPrice,
  number,
  openHouseTimeLabel,
} from './utils'

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
            No nearby or similar open houses are in the current sample.
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
                className="h-full w-full object-fill"
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
        {listing.relatedListings.length > 0 ? (
          <InfoSection title="Similar listings">
            <ListingsGrid listings={listing.relatedListings} />
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
