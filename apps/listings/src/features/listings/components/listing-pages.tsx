import { Link } from '@tanstack/react-router'

import { Button } from '@workspace/ui/components/button'

import type {
  GroupedListingsData,
  ListingsData,
  SearchGroupData,
} from '../data'
import { defaultListingSearch } from '../search'
import type { ListingSearch } from '../search'
import { ListingFilters } from './listing-filters'
import { ListingsGrid } from './listing-card'
import { ListingGroupDirectory, RelatedListingPages } from './search-links'
import type { ListingGroupRouteRoot } from './search-links'
import { EmptyState, Pagination } from './shared'
import { displaySearchGroupValue, number } from './utils'

type ListingsPageCopy = {
  readonly eyebrow: string
  readonly title: string
  readonly description: string
  readonly emptyTitle: string
  readonly emptyDescription: string
}

type GroupedListingsPageCopy = {
  readonly fallbackEyebrow: string
  readonly fallbackDescription: string
  readonly fallbackButton: string
  readonly groupedDescriptionSuffix: string
}

const defaultGroupedListingsPageCopy: GroupedListingsPageCopy = {
  fallbackEyebrow: 'Listing search',
  fallbackDescription:
    'Pick another category below or browse all current listings.',
  fallbackButton: 'View all listings',
  groupedDescriptionSuffix:
    'Keep filtering this grouped page by city, province, status, price, beds, baths, or sort order.',
}

const defaultListingsPageCopy: ListingsPageCopy = {
  eyebrow: 'Browse',
  title: 'Listings',
  description:
    'Search local CREA DDF data with route-backed filters. Share this URL and the same filtered view opens.',
  emptyTitle: 'No listings match those filters.',
  emptyDescription:
    'Clear one or two filters and the page URL will update with the next search.',
}

export function ListingsPage({
  data,
  isPaging = false,
  onSearchChange,
  copy = defaultListingsPageCopy,
}: {
  readonly data: ListingsData
  readonly isPaging?: boolean
  readonly onSearchChange: (search: ListingSearch) => void
  readonly copy?: ListingsPageCopy
}) {
  const clearFilters = () => onSearchChange(defaultListingSearch)

  return (
    <main className="page-wrap grid gap-5 py-8">
      <ListingFilters
        search={data.search}
        facets={data.facets}
        onChange={onSearchChange}
      />
      <section className="grid gap-5">
        <div className="flex flex-col justify-between gap-4 rounded-lg border border-border bg-background p-5 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-foreground">
              {copy.eyebrow}
            </p>
            <h1 className="display-title mt-2 text-4xl font-bold text-foreground">
              {copy.title}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground">
              {copy.description}
            </p>
          </div>
          <div className="text-sm font-semibold text-foreground">
            Page {data.search.page} · Showing {data.listings.length}1
          </div>
        </div>
        <ListingsGrid
          listings={data.listings}
          emptyTitle={copy.emptyTitle}
          emptyDescription={copy.emptyDescription}
          onClearFilters={clearFilters}
        />
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
  routeRoot = 'search',
  copy = defaultGroupedListingsPageCopy,
}: {
  readonly data: GroupedListingsData
  readonly isPaging?: boolean
  readonly onSearchChange: (search: ListingSearch) => void
  readonly routeRoot?: ListingGroupRouteRoot
  readonly copy?: GroupedListingsPageCopy
}) {
  const clearFilters = () => onSearchChange(defaultListingSearch)
  const emptyTitle =
    routeRoot === 'rentals'
      ? 'No rental listings match those filters.'
      : 'No listings match those filters.'
  const emptyDescription =
    routeRoot === 'rentals'
      ? 'Clear the filters to return to all rentals in this grouped search.'
      : 'Clear the filters to return to every listing in this grouped search.'

  if (data.group === null || data.matchedValue === null) {
    return (
      <ListingGroupFallback data={data} routeRoot={routeRoot} copy={copy} />
    )
  }

  const matchedValueLabel = displaySearchGroupValue(
    data.matchedValue.groupSlug,
    data.matchedValue.value,
  )

  return (
    <main className="page-wrap grid gap-5 py-8">
      <ListingFilters
        search={data.search}
        facets={data.facets}
        hiddenFields={data.group.suppressedSearchKeys}
        onChange={onSearchChange}
      />
      <section className="grid gap-5">
        <div className="rounded-lg border border-border bg-background p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-foreground">
            {data.group.label}
          </p>
          <h1 className="display-title mt-2 text-4xl font-bold text-foreground">
            {matchedValueLabel}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground">
            {data.group.description} {copy.groupedDescriptionSuffix}
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-sm font-semibold text-foreground">
            <span className="rounded-full border border-border bg-background px-3 py-1">
              {number.format(data.matchedValue.count)}{' '}
              {routeRoot === 'rentals'
                ? 'rental listings in this group'
                : 'active listings in this group'}
            </span>
            <span className="rounded-full border border-border bg-background px-3 py-1">
              Page {data.search.page} · Showing {data.listings.length}2
            </span>
          </div>
        </div>
        <ListingsGrid
          listings={data.listings}
          emptyTitle={emptyTitle}
          emptyDescription={emptyDescription}
          onClearFilters={clearFilters}
        />
        <Pagination
          page={data.search.page}
          hasNextPage={data.hasNextPage}
          isPending={isPaging}
          onPage={(page) => onSearchChange({ ...data.search, page })}
        />
        <RelatedListingPages
          title={`More ${data.group.pluralLabel.toLowerCase()}`}
          values={data.relatedValues}
          routeRoot={routeRoot}
        />
      </section>
    </main>
  )
}

function ListingGroupFallback({
  data,
  routeRoot,
  copy,
}: {
  readonly data: GroupedListingsData
  readonly routeRoot: ListingGroupRouteRoot
  readonly copy: GroupedListingsPageCopy
}) {
  const title =
    data.group === null
      ? 'Listing group not found'
      : `${data.group.label} not found`

  return (
    <main className="page-wrap grid gap-6 py-8">
      <EmptyState
        title={title}
        description={copy.fallbackDescription}
        align="start"
        className="bg-background p-6"
      >
        {routeRoot === 'rentals' ? (
          <Button
            nativeButton={false}
            render={<Link to="/rentals" search={defaultListingSearch} />}
          >
            {copy.fallbackButton}
          </Button>
        ) : (
          <Button
            nativeButton={false}
            render={<Link to="/listings" search={defaultListingSearch} />}
          >
            {copy.fallbackButton}
          </Button>
        )}
      </EmptyState>
      <RelatedListingPages
        title={
          data.group === null
            ? 'Available grouped listing pages'
            : `Available ${data.group.pluralLabel.toLowerCase()}`
        }
        values={data.relatedValues}
        routeRoot={routeRoot}
      />
      <ListingGroupDirectory
        groups={data.relatedGroups}
        routeRoot={routeRoot}
      />
    </main>
  )
}

export function RentalSearchGroupPage({
  data,
}: {
  readonly data: SearchGroupData
}) {
  if (data.group === null || data.summary === null) {
    return (
      <main className="search-page-wrap grid gap-6 py-8">
        <EmptyState
          title="Rental category not found"
          description="Browse another rental category or return to all rentals."
          align="start"
          className="bg-background p-6"
        >
          <Button
            nativeButton={false}
            render={<Link to="/rentals" search={defaultListingSearch} />}
          >
            View rentals
          </Button>
        </EmptyState>
        <ListingGroupDirectory
          groups={data.relatedGroups}
          routeRoot="rentals"
        />
        <RelatedListingPages
          title="Rental quick searches"
          values={data.topValues}
          routeRoot="rentals"
          emptyTitle="No rental searches"
          emptyDescription="No rental search values are available from the synced listings."
        />
      </main>
    )
  }

  return (
    <main className="search-page-wrap grid gap-6 py-8">
      <section className="rounded-lg border border-border bg-background p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-foreground">
          Rental {data.group.label.toLowerCase()}
        </p>
        <h1 className="display-title mt-2 text-4xl font-bold text-foreground">
          {data.group.pluralLabel}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground">
          Choose a {data.group.label.toLowerCase()} to see matching rental
          listings.
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-sm font-semibold text-foreground">
          <span className="rounded-full border border-border bg-background px-3 py-1">
            {number.format(data.summary.valueCount)} rental options
          </span>
          <span className="rounded-full border border-border bg-background px-3 py-1">
            {number.format(data.summary.listingCount)} rental listings
          </span>
        </div>
      </section>
      <RelatedListingPages
        title={`Choose ${data.group.label.toLowerCase()}`}
        values={data.values}
        routeRoot="rentals"
        emptyTitle={`No ${data.group.label.toLowerCase()} rental values`}
        emptyDescription="This rental category exists, but the current rental data does not have values for it yet."
      />
      <RelatedListingPages
        title="Related rental searches"
        values={data.topValues}
        routeRoot="rentals"
        emptyTitle="No related rental values"
        emptyDescription="There are no related rental search values outside this category yet."
      />
      <ListingGroupDirectory groups={data.relatedGroups} routeRoot="rentals" />
    </main>
  )
}
