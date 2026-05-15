import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { ArrowRight, Search } from 'lucide-react'

import { Button } from '@workspace/ui/components/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'
import { Input } from '@workspace/ui/components/input'
import { cn } from '#/lib/utils'

import type {
  ListingCard as ListingCardType,
  SearchGroupData,
  SearchIndexData,
} from '../data'
import { defaultListingSearch, defaultOpenHouseSearch } from '../search'
import type { ListingSearch } from '../search'
import { ListingsGrid } from './listing-card'
import { OpenHouseRow } from './directory-pages'
import { ListingGroupDirectory, RelatedListingPages } from './search-links'
import { groupOrderRank } from './search-order'
import { DirectoryPanel, EmptyState, SectionHeader } from './shared'
import { countLabel, displaySearchGroupValue } from './utils'

type SearchDestination =
  | {
      readonly type: 'listings'
      readonly search: ListingSearch
    }
  | {
      readonly type: 'rentals'
      readonly search: ListingSearch
    }
  | {
      readonly type: 'open-houses'
    }
  | {
      readonly type: 'group'
      readonly groupSlug: string
    }
  | {
      readonly type: 'group-value'
      readonly groupSlug: string
      readonly valueSlug: string
    }

type SearchIndexAction = {
  readonly id: string
  readonly eyebrow: string
  readonly label: string
  readonly description: string
  readonly count?: number
  readonly keywords: ReadonlyArray<string>
  readonly destination: SearchDestination
}

const normalizeSearchText = (value: string) =>
  value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

const searchActionHaystack = (action: SearchIndexAction) =>
  normalizeSearchText(
    [action.eyebrow, action.label, action.description, ...action.keywords].join(
      ' ',
    ),
  )

const scoreSearchAction = (
  action: SearchIndexAction,
  normalizedQuery: string,
  terms: ReadonlyArray<string>,
) => {
  const label = normalizeSearchText(action.label)
  const haystack = searchActionHaystack(action)

  if (label === normalizedQuery) return 0
  if (label.startsWith(normalizedQuery)) return 1
  if (haystack.includes(normalizedQuery)) return 2
  if (terms.length > 0 && terms.every((term) => haystack.includes(term))) {
    return 3
  }

  return null
}

const rankedSearchActions = (
  actions: ReadonlyArray<SearchIndexAction>,
  query: string,
) => {
  const normalizedQuery = normalizeSearchText(query)
  if (normalizedQuery.length === 0) return actions.slice(0, 12)

  const terms = normalizedQuery.split(' ').filter(Boolean)

  return actions
    .flatMap((action) => {
      const score = scoreSearchAction(action, normalizedQuery, terms)
      return score === null ? [] : [{ action, score }]
    })
    .sort(
      (left, right) =>
        left.score - right.score ||
        (right.action.count ?? 0) - (left.action.count ?? 0) ||
        left.action.label.localeCompare(right.action.label),
    )
    .map((item) => item.action)
    .slice(0, 12)
}

const groupValueAction = (
  value: SearchIndexData['topValues'][number],
): SearchIndexAction => {
  const displayLabel = displaySearchGroupValue(value.groupSlug, value.value)

  return {
    id: `value-${value.groupSlug}-${value.valueSlug}`,
    eyebrow: value.groupLabel,
    label: displayLabel,
    description: `View listings that match this ${value.groupLabel.toLowerCase()}.`,
    count: value.count,
    keywords: [
      value.value,
      displayLabel,
      value.valueSlug,
      value.groupSlug,
      value.groupLabel,
      value.pluralLabel,
      `${value.value} listings`,
      `${displayLabel} listings`,
    ],
    destination: {
      type: 'group-value',
      groupSlug: value.groupSlug,
      valueSlug: value.valueSlug,
    },
  }
}

const buildSearchIndexActions = (
  data: SearchIndexData,
): ReadonlyArray<SearchIndexAction> => [
  {
    id: 'browse-listings',
    eyebrow: 'Browse',
    label: 'Listings',
    description: 'All active property listings.',
    keywords: ['properties', 'homes', 'houses', 'search listings'],
    destination: { type: 'listings', search: defaultListingSearch },
  },
  {
    id: 'browse-rentals',
    eyebrow: 'Browse',
    label: 'Rentals',
    description: 'Active rental listings with lease pricing.',
    keywords: ['rentals', 'leases', 'for lease', 'rental listings'],
    destination: { type: 'rentals', search: defaultListingSearch },
  },
  {
    id: 'browse-open-houses',
    eyebrow: 'Schedule',
    label: 'Open houses',
    description: 'Scheduled open house records.',
    keywords: ['open house', 'showing', 'schedule'],
    destination: { type: 'open-houses' },
  },
  ...data.groups.map(({ group, summary }) => ({
    id: `group-${group.slug}`,
    eyebrow: 'Category',
    label: group.pluralLabel,
    description: `Browse listings by ${group.label.toLowerCase()}.`,
    count: summary.listingCount,
    keywords: [
      group.slug,
      group.label,
      group.pluralLabel,
      group.description,
      `${group.label} index`,
    ],
    destination: { type: 'group', groupSlug: group.slug } as const,
  })),
  ...data.groups.flatMap((group) => group.values.map(groupValueAction)),
  ...data.facets.cities.map((city) => ({
    id: `city-${city}`,
    eyebrow: 'City',
    label: city,
    description: `Listings in ${city}.`,
    keywords: [`${city} listings`, `city ${city}`],
    destination: {
      type: 'listings',
      search: { ...defaultListingSearch, city },
    } as const,
  })),
  ...data.facets.provinces.map((province) => ({
    id: `province-${province}`,
    eyebrow: 'Province',
    label: province,
    description: `Listings in ${province}.`,
    keywords: [`${province} listings`, `province ${province}`],
    destination: {
      type: 'listings',
      search: { ...defaultListingSearch, province },
    } as const,
  })),
  ...data.facets.statuses.map((status) => ({
    id: `status-${status}`,
    eyebrow: 'Status',
    label: status,
    description: `${status} listings.`,
    keywords: [`${status} properties`, `${status} homes`],
    destination: {
      type: 'listings',
      search: { ...defaultListingSearch, status },
    } as const,
  })),
  ...data.facets.types.map((type) => ({
    id: `type-${type}`,
    eyebrow: 'Property type',
    label: type,
    description: `${type} listings.`,
    keywords: [`${type} properties`, `${type} homes`],
    destination: {
      type: 'listings',
      search: { ...defaultListingSearch, type },
    } as const,
  })),
]

const runSearchDestination = (
  navigate: ReturnType<typeof useNavigate>,
  destination: SearchDestination,
) => {
  switch (destination.type) {
    case 'listings':
      void navigate({ to: '/listings', search: destination.search })
      return
    case 'rentals':
      void navigate({ to: '/rentals', search: destination.search })
      return
    case 'open-houses':
      void navigate({
        to: '/open-houses',
        search: defaultOpenHouseSearch,
      })
      return
    case 'group':
      void navigate({
        to: '/search/$group',
        params: { group: destination.groupSlug },
      })
      return
    case 'group-value':
      void navigate({
        to: '/search/$group/$value',
        params: {
          group: destination.groupSlug,
          value: destination.valueSlug,
        },
        search: defaultListingSearch,
      })
      return
  }
}

function SearchActionList({
  actions,
  emptyLabel,
  onSelect,
}: {
  readonly actions: ReadonlyArray<SearchIndexAction>
  readonly emptyLabel: string
  readonly onSelect: (action: SearchIndexAction) => void
}) {
  if (actions.length === 0) {
    return (
      <EmptyState
        title={emptyLabel}
        icon={Search}
        align="start"
        size="compact"
        className="bg-background p-6"
      />
    )
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {actions.map((action) => (
        <Card
          size="sm"
          className="group h-full min-h-40 rounded-lg border border-border bg-background py-0 text-foreground ring-0 shadow-none transition hover:border-border"
          key={action.id}
        >
          <CardHeader className="min-w-0 gap-1 px-4 pt-4">
            <div className="min-w-0">
              <CardDescription className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold uppercase tracking-[0.16em] text-foreground">
                <span className="line-clamp-1">{action.eyebrow}</span>
                {typeof action.count === 'number' ? (
                  <span className="rounded-full border border-border bg-background px-2.5 py-1 text-xs font-bold normal-case tracking-normal text-foreground">
                    {countLabel(action.count, 'listing', 'listings')}
                  </span>
                ) : null}
              </CardDescription>
              <CardTitle className="mt-1 line-clamp-2 break-words text-lg font-extrabold leading-tight text-foreground group-hover:text-foreground">
                {action.label}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="px-4">
            <p className="line-clamp-2 text-sm leading-5 text-foreground">
              {action.description}
            </p>
          </CardContent>
          <CardFooter className="mt-auto px-4 pb-4 pt-4">
            <Button
              type="button"
              className="w-full justify-between"
              variant="outline"
              onClick={() => onSelect(action)}
            >
              View
              <ArrowRight />
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

const rotatingSearchPrompts = [
  'Single family homes',
  'Multi family properties',
  'Vacant land',
  'Waterfront listings',
  'Private well',
  'Finished basement',
  'Commercial kitchens',
] as const

const prioritizedSearchGroups = (
  groups: SearchIndexData['groups'],
): SearchIndexData['groups'] =>
  [...groups].sort(
    (left, right) =>
      groupOrderRank(left.group.slug) - groupOrderRank(right.group.slug) ||
      left.group.pluralLabel.localeCompare(right.group.pluralLabel),
  )

const quickSearchValues = (
  data: SearchIndexData | SearchGroupData,
  limit = 24,
) =>
  'groups' in data
    ? prioritizedSearchGroups(data.groups)
        .flatMap((bucket) => bucket.values)
        .sort(
          (left, right) =>
            groupOrderRank(left.groupSlug) - groupOrderRank(right.groupSlug) ||
            right.count - left.count ||
            left.value.localeCompare(right.value),
        )
        .slice(0, limit)
    : data.values

const useRotatingSearchPrompt = () => {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % rotatingSearchPrompts.length)
    }, 2600)

    return () => window.clearInterval(timer)
  }, [])

  return rotatingSearchPrompts[index] ?? rotatingSearchPrompts[0]
}

const groupMosaicClass = (label: string, index: number) =>
  cn(
    'group h-full min-h-44 rounded-lg border border-border bg-background py-0 text-foreground ring-0 shadow-none transition hover:border-border',
    label.length > 18 ? 'sm:col-span-2' : null,
    index === 0 ? 'md:col-span-2' : null,
  )

function SearchGroupMosaicCard({
  group,
  listingCount,
  index,
}: {
  readonly group: SearchIndexData['groups'][number]['group']
  readonly listingCount: number
  readonly index: number
}) {
  return (
    <Card size="sm" className={groupMosaicClass(group.pluralLabel, index)}>
      <CardHeader className="min-w-0 gap-1 px-4 pt-4">
        <div className="min-w-0">
          <CardDescription className="line-clamp-1 text-xs font-semibold uppercase tracking-[0.16em] text-foreground">
            <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
              <span>Browse</span>
              <span className="rounded-full border border-border bg-background px-2.5 py-1 text-xs font-bold normal-case tracking-normal text-foreground">
                {countLabel(listingCount, 'listing', 'listings')}
              </span>
            </span>
          </CardDescription>
          <CardTitle className="mt-2 line-clamp-2 break-words text-2xl font-extrabold leading-tight text-foreground group-hover:text-foreground">
            {group.pluralLabel}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="px-4">
        <p className="line-clamp-2 text-sm leading-6 text-foreground">
          {group.description}
        </p>
      </CardContent>
      <CardFooter className="mt-auto px-4 pb-4 pt-4">
        <Button
          nativeButton={false}
          render={<Link to="/search/$group" params={{ group: group.slug }} />}
          className="w-full justify-between"
          variant="outline"
        >
          See options
          <ArrowRight />
        </Button>
      </CardFooter>
    </Card>
  )
}

function SearchGroupMosaic({
  groups,
}: {
  readonly groups: SearchIndexData['groups']
}) {
  if (groups.length === 0) return null

  return (
    <section className="grid gap-3">
      <SectionHeader title="Browse by category" />
      <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(min(100%,14rem),1fr))]">
        {groups.map(({ group, summary }, index) => (
          <SearchGroupMosaicCard
            group={group}
            listingCount={summary.listingCount}
            index={index}
            key={group.slug}
          />
        ))}
      </div>
    </section>
  )
}

function SearchPreviewSections({
  featuredListings,
  openHouses,
}: {
  readonly featuredListings: ReadonlyArray<ListingCardType>
  readonly openHouses: SearchIndexData['openHouses']
}) {
  return (
    <section className="grid gap-6">
      {featuredListings.length > 0 ? (
        <div className="grid gap-4">
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
          <ListingsGrid listings={featuredListings.slice(0, 6)} />
        </div>
      ) : null}
      {openHouses.length > 0 ? (
        <DirectoryPanel title="Upcoming open houses">
          {openHouses.slice(0, 4).map((openHouse) => (
            <OpenHouseRow openHouse={openHouse} key={openHouse.openHouseKey} />
          ))}
        </DirectoryPanel>
      ) : null}
    </section>
  )
}

export function SearchIndexPage({ data }: { readonly data: SearchIndexData }) {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const prompt = useRotatingSearchPrompt()
  const groups = useMemo(() => prioritizedSearchGroups(data.groups), [data])
  const quickValues = useMemo(() => quickSearchValues(data), [data])
  const actions = useMemo(() => buildSearchIndexActions(data), [data])
  const matches = useMemo(
    () => rankedSearchActions(actions, query),
    [actions, query],
  )
  const selectAction = (action: SearchIndexAction) =>
    runSearchDestination(navigate, action.destination)

  return (
    <main className="search-page-wrap grid gap-6 py-8">
      <section className="grid gap-6 rounded-lg border border-border bg-background p-6 lg:grid-cols-[1fr_340px] lg:items-start">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-foreground">
            Listing search
          </p>
          <h1 className="display-title mt-2 text-4xl font-bold text-foreground">
            Search by property type, location, water, land, and features.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-foreground">
            Start with a category like property type or water source, then pick
            the option that matches what you want.
          </p>
          <form
            className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]"
            onSubmit={(event) => {
              event.preventDefault()
              const firstMatch = matches.at(0)
              if (firstMatch !== undefined) selectAction(firstMatch)
            }}
          >
            <Input
              aria-label="Search listings index"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={prompt}
              className="min-h-12 bg-background text-base"
            />
            <Button type="submit" size="lg">
              <Search />
              Search
            </Button>
          </form>
        </div>
        <div className="grid gap-3 rounded-lg border border-border bg-background p-4">
          <p className="text-sm font-extrabold text-foreground">Quick starts</p>
          <div className="flex flex-wrap gap-2">
            {quickValues.slice(0, 6).map((value) => {
              const label = displaySearchGroupValue(
                value.groupSlug,
                value.value,
              )

              return (
                <Button
                  nativeButton={false}
                  render={
                    <Link
                      to="/search/$group/$value"
                      params={{
                        group: value.groupSlug,
                        value: value.valueSlug,
                      }}
                      search={defaultListingSearch}
                    />
                  }
                  className="max-w-full justify-start"
                  variant="outline"
                  key={`${value.groupSlug}-${value.valueSlug}`}
                >
                  <span className="min-w-0 truncate">{label}</span>
                </Button>
              )
            })}
          </div>
        </div>
      </section>
      {query.trim().length > 0 ? (
        <SearchActionList
          actions={matches}
          emptyLabel="No matching listing shortcut."
          onSelect={selectAction}
        />
      ) : null}
      <SearchGroupMosaic groups={groups} />
      <section className="grid gap-6">
        <RelatedListingPages title="Quick searches" values={quickValues} />
      </section>
      <SearchPreviewSections
        featuredListings={data.featuredListings}
        openHouses={data.openHouses}
      />
    </main>
  )
}

export function SearchGroupPage({ data }: { readonly data: SearchGroupData }) {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const quickValues = useMemo(() => quickSearchValues(data), [data])
  const actions = useMemo(
    () => data.values.map(groupValueAction),
    [data.values],
  )
  const matches = useMemo(
    () => rankedSearchActions(actions, query),
    [actions, query],
  )
  const selectAction = (action: SearchIndexAction) =>
    runSearchDestination(navigate, action.destination)
  const firstQuickValue = quickValues.at(0)
  const firstQuickValueLabel =
    firstQuickValue === undefined
      ? (data.group?.pluralLabel ?? 'Search options')
      : displaySearchGroupValue(
          firstQuickValue.groupSlug,
          firstQuickValue.value,
        )

  if (data.group === null || data.summary === null) {
    return (
      <main className="search-page-wrap grid gap-6 py-8">
        <EmptyState
          title="Category not found"
          description="Browse another category or use one of the quick searches below."
          icon={Search}
          align="start"
          className="bg-background p-6"
        >
          <Button nativeButton={false} render={<Link to="/search" />}>
            <Search />
            Search listings
          </Button>
        </EmptyState>
        <ListingGroupDirectory groups={data.relatedGroups} />
        <RelatedListingPages
          title="Quick searches"
          values={data.topValues}
          emptyTitle="No grouped searches"
          emptyDescription="No grouped search values are available from the synced listings."
        />
      </main>
    )
  }

  return (
    <main className="search-page-wrap grid gap-6 py-8">
      <section className="grid gap-6 rounded-lg border border-border bg-background p-6 lg:grid-cols-[1fr_340px] lg:items-start">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-foreground">
            {data.group.label}
          </p>
          <h1 className="display-title mt-2 text-4xl font-bold text-foreground">
            {data.group.pluralLabel}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground">
            Choose a {data.group.label.toLowerCase()} to see matching listings.
          </p>
          <form
            className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]"
            onSubmit={(event) => {
              event.preventDefault()
              const firstMatch = matches.at(0)
              if (firstMatch !== undefined) selectAction(firstMatch)
            }}
          >
            <Input
              aria-label={`Search ${data.group.pluralLabel}`}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={firstQuickValueLabel}
              className="min-h-12 bg-background text-base"
            />
            <Button type="submit" size="lg">
              <Search />
              Search
            </Button>
          </form>
        </div>
        <div className="grid gap-3 rounded-lg border border-border bg-background p-4">
          <p className="text-sm font-extrabold text-foreground">
            Popular options
          </p>
          <div className="flex flex-wrap gap-2">
            {quickValues.slice(0, 6).map((value) => {
              const label = displaySearchGroupValue(
                value.groupSlug,
                value.value,
              )

              return (
                <Button
                  nativeButton={false}
                  render={
                    <Link
                      to="/search/$group/$value"
                      params={{
                        group: value.groupSlug,
                        value: value.valueSlug,
                      }}
                      search={defaultListingSearch}
                    />
                  }
                  className="max-w-full justify-start"
                  variant="outline"
                  key={`${value.groupSlug}-${value.valueSlug}`}
                >
                  <span className="min-w-0 truncate">{label}</span>
                </Button>
              )
            })}
          </div>
          <Button
            nativeButton={false}
            render={<Link to="/search" />}
            variant="outline"
          >
            <Search />
            All search categories
          </Button>
        </div>
      </section>
      {query.trim().length > 0 ? (
        <SearchActionList
          actions={matches}
          emptyLabel="No matching option in this category."
          onSelect={selectAction}
        />
      ) : null}
      <section className="grid items-start gap-6">
        <RelatedListingPages
          title={`Choose ${data.group.label.toLowerCase()}`}
          values={quickValues}
          emptyTitle={`No ${data.group.label.toLowerCase()} values`}
          emptyDescription="This category exists, but the current listing data does not have values for it yet."
        />
        <RelatedListingPages
          title="Related search values"
          values={data.topValues}
          emptyTitle="No related values"
          emptyDescription="There are no related search values outside this category yet."
        />
        <ListingGroupDirectory groups={data.relatedGroups} />
      </section>
    </main>
  )
}
