import { Link } from '@tanstack/react-router'
import { ArrowRight, Search } from 'lucide-react'

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@workspace/ui/components/empty'
import { cn } from '#/lib/utils'

import type { GroupedListingsData } from '../data'
import { defaultListingSearch } from '../search'
import { groupOrderRank } from './search-order'
import { countLabel } from './utils'

type ListingGroupValueCard = GroupedListingsData['relatedValues'][number]
type ListingGroupSummaryCard = GroupedListingsData['relatedGroups'][number]

function SearchEmptyTile({
  title,
  description,
}: {
  readonly title: string
  readonly description: string
}) {
  return (
    <Empty className="min-h-36 items-start justify-center border border-dashed border-[var(--line)] bg-white/50 p-5 text-left sm:col-span-2">
      <EmptyHeader className="items-start text-left">
        <EmptyMedia
          variant="icon"
          className="bg-white/80 text-[var(--lagoon-deep)]"
        >
          <Search className="size-5" />
        </EmptyMedia>
        <EmptyTitle className="text-base font-extrabold text-[var(--sea-ink)]">
          {title}
        </EmptyTitle>
        <EmptyDescription className="text-left text-sm text-[var(--sea-ink-soft)]">
          {description}
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}

const valueMosaicClass = (value: ListingGroupValueCard, index: number) =>
  cn(
    'group grid min-h-36 content-between rounded-lg border border-[var(--line)] bg-white/72 p-4 text-[var(--sea-ink)] no-underline transition hover:border-[var(--lagoon-deep)]',
    value.value.length > 18 ? 'sm:col-span-2' : null,
    index === 0 && value.value.length > 10 ? 'lg:col-span-2' : null,
  )

export function RelatedListingPages({
  title,
  values,
  emptyTitle = 'No search options yet',
  emptyDescription = 'This category has no synced values to link.',
}: {
  readonly title: string
  readonly values: ReadonlyArray<ListingGroupValueCard>
  readonly emptyTitle?: string
  readonly emptyDescription?: string
}) {
  const visibleValues = values.slice(0, 36)

  return (
    <section className="grid gap-3">
      <h2 className="display-title text-2xl font-bold text-[var(--sea-ink)]">
        {title}
      </h2>
      <div className="grid items-start gap-3 [grid-template-columns:repeat(auto-fit,minmax(min(100%,13rem),1fr))]">
        {visibleValues.length === 0 ? (
          <SearchEmptyTile title={emptyTitle} description={emptyDescription} />
        ) : null}
        {visibleValues.map((value, index) => (
          <Link
            to="/search/$group/$value"
            params={{ group: value.groupSlug, value: value.valueSlug }}
            search={defaultListingSearch}
            className={valueMosaicClass(value, index)}
            key={`${value.groupSlug}-${value.valueSlug}`}
          >
            <span>
              <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--kicker)]">
                {value.groupLabel}
              </span>
              <span className="mt-1 block text-lg font-extrabold leading-tight group-hover:text-[var(--lagoon-deep)]">
                {value.value}
              </span>
              <span className="mt-3 inline-flex w-fit rounded-full border border-[var(--line)] bg-white/72 px-2.5 py-1 text-xs font-bold text-[var(--sea-ink-soft)]">
                {countLabel(value.count, 'listing', 'listings')}
              </span>
            </span>
            <span className="mt-4 inline-flex items-center gap-2 text-sm font-extrabold text-[var(--lagoon-deep)]">
              View listings
              <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}

const groupMosaicClass = (group: ListingGroupSummaryCard, index: number) =>
  cn(
    'group grid min-h-32 content-between rounded-lg border border-[var(--line)] bg-white/66 p-4 text-[var(--sea-ink)] no-underline transition hover:border-[var(--lagoon-deep)]',
    group.pluralLabel.length > 16 ? 'sm:col-span-2' : null,
    index === 0 ? 'lg:col-span-2' : null,
  )

const prioritizedGroupSummaries = (
  groups: ReadonlyArray<ListingGroupSummaryCard>,
) =>
  [...groups].sort(
    (left, right) =>
      groupOrderRank(left.groupSlug) - groupOrderRank(right.groupSlug) ||
      left.pluralLabel.localeCompare(right.pluralLabel),
  )

export function ListingGroupDirectory({
  groups,
  emptyTitle = 'No related categories',
  emptyDescription = 'There are no other search categories available from the synced listing data.',
}: {
  readonly groups: ReadonlyArray<ListingGroupSummaryCard>
  readonly emptyTitle?: string
  readonly emptyDescription?: string
}) {
  const visibleGroups = prioritizedGroupSummaries(groups).slice(0, 16)

  return (
    <section className="grid gap-3">
      <h2 className="display-title text-2xl font-bold text-[var(--sea-ink)]">
        Browse by category
      </h2>
      <div className="grid items-start gap-3 [grid-template-columns:repeat(auto-fit,minmax(min(100%,12rem),1fr))]">
        {visibleGroups.length === 0 ? (
          <SearchEmptyTile title={emptyTitle} description={emptyDescription} />
        ) : null}
        {visibleGroups.map((group, index) => (
          <Link
            to="/search/$group"
            params={{ group: group.groupSlug }}
            className={groupMosaicClass(group, index)}
            key={group.groupSlug}
          >
            <span>
              <span className="block text-lg font-extrabold leading-tight group-hover:text-[var(--lagoon-deep)]">
                {group.pluralLabel}
              </span>
              <span className="mt-3 inline-flex w-fit rounded-full border border-[var(--line)] bg-white/72 px-2.5 py-1 text-xs font-bold text-[var(--sea-ink-soft)]">
                {countLabel(group.valueCount, 'option', 'options')}
              </span>
            </span>
            <span className="mt-4 inline-flex items-center gap-2 text-sm font-extrabold text-[var(--lagoon-deep)]">
              Explore options
              <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
