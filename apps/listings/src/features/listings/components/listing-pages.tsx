import { Link } from '@tanstack/react-router'

import { Button } from '@workspace/ui/components/button'

import type { GroupedListingsData, ListingsData } from '../data'
import { defaultListingSearch } from '../search'
import type { ListingSearch } from '../search'
import { ListingFilters } from './listing-filters'
import { ListingsGrid } from './listing-card'
import { ListingGroupDirectory, RelatedListingPages } from './search-links'
import { Pagination } from './shared'
import { number } from './utils'

export function ListingsPage({
  data,
  isPaging = false,
  onSearchChange,
}: {
  readonly data: ListingsData
  readonly isPaging?: boolean
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
          isPending={isPaging}
          onPage={(page) => onSearchChange({ ...data.search, page })}
        />
      </section>
    </main>
  )
}

export function GroupedListingsPage({
  data,
  isPaging = false,
  onSearchChange,
}: {
  readonly data: GroupedListingsData
  readonly isPaging?: boolean
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
          isPending={isPaging}
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
          Listing search
        </p>
        <h1 className="display-title mt-2 text-4xl font-bold text-[var(--sea-ink)]">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--sea-ink-soft)]">
          Pick another category below or browse all current listings.
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
