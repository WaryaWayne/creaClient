import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { ArrowRight, Search } from 'lucide-react'

import { Button } from '@workspace/ui/components/button'
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
import { DirectoryPanel, SectionHeader } from './shared'

type SearchDestination =
  | {
      readonly type: 'listings'
      readonly search: ListingSearch
    }
  | {
      readonly type: 'open-houses'
    }
  | {
      readonly type: 'offices'
    }
  | {
      readonly type: 'agents'
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
): SearchIndexAction => ({
  id: `value-${value.groupSlug}-${value.valueSlug}`,
  eyebrow: value.groupLabel,
  label: value.value,
  description: `View listings that match this ${value.groupLabel.toLowerCase()}.`,
  count: value.count,
  keywords: [
    value.valueSlug,
    value.groupSlug,
    value.groupLabel,
    value.pluralLabel,
    `${value.value} listings`,
  ],
  destination: {
    type: 'group-value',
    groupSlug: value.groupSlug,
    valueSlug: value.valueSlug,
  },
})

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
    id: 'browse-open-houses',
    eyebrow: 'Schedule',
    label: 'Open houses',
    description: 'Scheduled open house records.',
    keywords: ['open house', 'showing', 'schedule'],
    destination: { type: 'open-houses' },
  },
  {
    id: 'browse-office',
    eyebrow: 'Office',
    label: 'Office',
    description: 'EXIT EXCEL REALTY office page.',
    keywords: ['brokerage', 'exit excel realty', 'office listings'],
    destination: { type: 'offices' },
  },
  {
    id: 'browse-agents',
    eyebrow: 'Agents',
    label: 'Agents',
    description: 'Agents attached to active listings.',
    keywords: ['members', 'realtors', 'salespeople', 'broker'],
    destination: { type: 'agents' },
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
    case 'open-houses':
      void navigate({
        to: '/open-houses',
        search: defaultOpenHouseSearch,
      })
      return
    case 'offices':
      void navigate({
        to: '/offices',
        search: { city: '', province: '', page: 1 },
      })
      return
    case 'agents':
      void navigate({
        to: '/agents',
        search: { officeKey: '', page: 1 },
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
      <div className="rounded-lg border border-dashed border-[var(--line)] bg-white/70 p-6 text-sm font-semibold text-[var(--sea-ink-soft)]">
        {emptyLabel}
      </div>
    )
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {actions.map((action) => (
        <button
          className="group grid gap-2 rounded-lg border border-[var(--line)] bg-white/74 p-4 text-left text-[var(--sea-ink)] transition hover:border-[var(--lagoon-deep)]"
          type="button"
          onClick={() => onSelect(action)}
          key={action.id}
        >
          <span className="flex items-start justify-between gap-3">
            <span>
              <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--kicker)]">
                {action.eyebrow}
              </span>
              <span className="mt-1 block text-lg font-extrabold group-hover:text-[var(--lagoon-deep)]">
                {action.label}
              </span>
            </span>
            <ArrowRight className="mt-1 size-4 shrink-0 transition group-hover:translate-x-0.5" />
          </span>
          <span className="block text-sm leading-5 text-[var(--sea-ink-soft)]">
            {action.description}
          </span>
        </button>
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

function SearchGroupMosaic({
  groups,
}: {
  readonly groups: SearchIndexData['groups']
}) {
  if (groups.length === 0) return null

  return (
    <section className="grid gap-3">
      <SectionHeader title="Browse by category" />
      <div className="grid items-start gap-3 [grid-template-columns:repeat(auto-fit,minmax(min(100%,14rem),1fr))]">
        {groups.map(({ group }, index) => (
          <Link
            to="/search/$group"
            params={{ group: group.slug }}
            className={cn(
              'group grid min-h-36 content-between rounded-lg border border-[var(--line)] bg-white/74 p-5 text-[var(--sea-ink)] no-underline transition hover:border-[var(--lagoon-deep)]',
              index === 0 ? 'md:col-span-2' : null,
            )}
            key={group.slug}
          >
            <span>
              <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--kicker)]">
                Browse
              </span>
              <span className="mt-2 block text-2xl font-extrabold group-hover:text-[var(--lagoon-deep)]">
                {group.pluralLabel}
              </span>
              <span className="mt-2 block text-sm leading-6 text-[var(--sea-ink-soft)]">
                {group.description}
              </span>
            </span>
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold text-[var(--lagoon-deep)]">
              See options
              <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
            </span>
          </Link>
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
      <section className="grid gap-6 rounded-lg border border-[var(--line)] bg-white/76 p-6 lg:grid-cols-[1fr_340px] lg:items-start">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--kicker)]">
            Listing search
          </p>
          <h1 className="display-title mt-2 text-4xl font-bold text-[var(--sea-ink)]">
            Search by property type, location, water, land, and features.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--sea-ink-soft)]">
            Start with a category like property type or water source, then pick
            the option that matches what you want.
          </p>
          <form
            className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]"
            onSubmit={(event) => {
              event.preventDefault()
              const firstMatch = matches.at(0)
              if (firstMatch) selectAction(firstMatch)
            }}
          >
            <Input
              aria-label="Search listings index"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={prompt}
              className="min-h-12 bg-white/86 text-base"
            />
            <Button type="submit" size="lg">
              <Search />
              Search
            </Button>
          </form>
        </div>
        <div className="grid gap-3 rounded-lg border border-[var(--line)] bg-[var(--foam)] p-4">
          <p className="text-sm font-extrabold text-[var(--sea-ink)]">
            Quick starts
          </p>
          <div className="flex flex-wrap gap-2">
            {quickValues.slice(0, 6).map((value) => (
              <Button
                nativeButton={false}
                render={
                  <Link
                    to="/search/$group/$value"
                    params={{ group: value.groupSlug, value: value.valueSlug }}
                    search={defaultListingSearch}
                  />
                }
                variant="outline"
                key={`${value.groupSlug}-${value.valueSlug}`}
              >
                {value.value}
              </Button>
            ))}
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

  if (data.group === null || data.summary === null) {
    return (
      <main className="search-page-wrap grid gap-6 py-8">
        <section className="rounded-lg border border-[var(--line)] bg-white/76 p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--kicker)]">
            Listing search
          </p>
          <h1 className="display-title mt-2 text-4xl font-bold text-[var(--sea-ink)]">
            Category not found
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--sea-ink-soft)]">
            Browse another category or use one of the quick searches below.
          </p>
          <Button
            nativeButton={false}
            render={<Link to="/search" />}
            className="mt-5"
          >
            <Search />
            Search listings
          </Button>
        </section>
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
      <section className="grid gap-6 rounded-lg border border-[var(--line)] bg-white/76 p-6 lg:grid-cols-[1fr_340px] lg:items-start">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--kicker)]">
            {data.group.label}
          </p>
          <h1 className="display-title mt-2 text-4xl font-bold text-[var(--sea-ink)]">
            {data.group.pluralLabel}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--sea-ink-soft)]">
            Choose a {data.group.label.toLowerCase()} to see matching listings.
          </p>
          <form
            className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]"
            onSubmit={(event) => {
              event.preventDefault()
              const firstMatch = matches.at(0)
              if (firstMatch) selectAction(firstMatch)
            }}
          >
            <Input
              aria-label={`Search ${data.group.pluralLabel}`}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={quickValues.at(0)?.value ?? data.group.pluralLabel}
              className="min-h-12 bg-white/86 text-base"
            />
            <Button type="submit" size="lg">
              <Search />
              Search
            </Button>
          </form>
        </div>
        <div className="grid gap-3 rounded-lg border border-[var(--line)] bg-[var(--foam)] p-4">
          <p className="text-sm font-extrabold text-[var(--sea-ink)]">
            Popular options
          </p>
          <div className="flex flex-wrap gap-2">
            {quickValues.slice(0, 6).map((value) => (
              <Button
                nativeButton={false}
                render={
                  <Link
                    to="/search/$group/$value"
                    params={{ group: value.groupSlug, value: value.valueSlug }}
                    search={defaultListingSearch}
                  />
                }
                variant="outline"
                key={`${value.groupSlug}-${value.valueSlug}`}
              >
                {value.value}
              </Button>
            ))}
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
