import { Link } from '@tanstack/react-router'
import { ArrowRight, Search } from 'lucide-react'

import { Button } from '@workspace/ui/components/button'
import {
  Card,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'
import { cn } from '#/lib/utils'

import type { GroupedListingsData } from '../data'
import { defaultListingSearch } from '../search'
import { groupOrderRank } from './search-order'
import { EmptyState } from './shared'
import { countLabel, displaySearchGroupValue } from './utils'

type ListingGroupValueCard = GroupedListingsData['relatedValues'][number]
type ListingGroupSummaryCard = GroupedListingsData['relatedGroups'][number]
export type ListingGroupRouteRoot = 'search' | 'rentals'

function SearchEmptyTile({
  title,
  description,
}: {
  readonly title: string
  readonly description: string
}) {
  return (
    <EmptyState
      title={title}
      description={description}
      icon={Search}
      align="start"
      className="min-h-36 justify-center bg-background p-5 sm:col-span-2"
    />
  )
}

const valueMosaicClass = (value: ListingGroupValueCard, index: number) => {
  const displayValue = displaySearchGroupValue(value.groupSlug, value.value)

  return cn(
    'group h-full min-h-40 rounded-lg border border-border bg-background py-0 text-foreground ring-0 shadow-none transition hover:border-border',
    displayValue.length > 18 ? 'sm:col-span-2' : null,
    index === 0 && displayValue.length > 10 ? 'lg:col-span-2' : null,
  )
}

function RelatedListingPageCard({
  value,
  index,
  routeRoot,
}: {
  readonly value: ListingGroupValueCard
  readonly index: number
  readonly routeRoot: ListingGroupRouteRoot
}) {
  const displayValue = displaySearchGroupValue(value.groupSlug, value.value)
  const action =
    routeRoot === 'rentals' ? (
      <Button
        nativeButton={false}
        render={
          <Link
            to="/rentals/$group/$value"
            params={{ group: value.groupSlug, value: value.valueSlug }}
            search={defaultListingSearch}
          />
        }
        className="w-full justify-between"
        variant="outline"
      >
        View listings
        <ArrowRight />
      </Button>
    ) : (
      <Button
        nativeButton={false}
        render={
          <Link
            to="/search/$group/$value"
            params={{ group: value.groupSlug, value: value.valueSlug }}
            search={defaultListingSearch}
          />
        }
        className="w-full justify-between"
        variant="outline"
      >
        View listings
        <ArrowRight />
      </Button>
    )

  return (
    <Card
      size="sm"
      className={valueMosaicClass(value, index)}
      key={`${value.groupSlug}-${value.valueSlug}`}
    >
      <CardHeader className="min-w-0 gap-1 px-4 pt-4">
        <div className="min-w-0">
          <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold uppercase tracking-[0.16em] text-foreground">
            <span className="line-clamp-1">{value.groupLabel}</span>
            <span className="rounded-full border border-border bg-background px-2.5 py-1 text-xs font-bold normal-case tracking-normal text-foreground">
              {countLabel(value.count, 'listing', 'listings')}
            </span>
          </span>
          <CardTitle className="mt-1 line-clamp-2 break-words text-lg font-extrabold leading-tight text-foreground group-hover:text-foreground">
            {displayValue}
          </CardTitle>
        </div>
      </CardHeader>
      <CardFooter className="mt-auto px-4 pb-4 pt-4">{action}</CardFooter>
    </Card>
  )
}

export function RelatedListingPages({
  title,
  values,
  routeRoot = 'search',
  emptyTitle = 'No search options yet',
  emptyDescription = 'This category has no synced values to link.',
}: {
  readonly title: string
  readonly values: ReadonlyArray<ListingGroupValueCard>
  readonly routeRoot?: ListingGroupRouteRoot
  readonly emptyTitle?: string
  readonly emptyDescription?: string
}) {
  const visibleValues = values.slice(0, 36)

  return (
    <section className="grid gap-3">
      <h2 className="display-title text-2xl font-bold text-foreground">
        {title}
      </h2>
      <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(min(100%,13rem),1fr))]">
        {visibleValues.length === 0 ? (
          <SearchEmptyTile title={emptyTitle} description={emptyDescription} />
        ) : null}
        {visibleValues.map((value, index) => (
          <RelatedListingPageCard
            value={value}
            index={index}
            routeRoot={routeRoot}
            key={`${value.groupSlug}-${value.valueSlug}`}
          />
        ))}
      </div>
    </section>
  )
}

const groupMosaicClass = (group: ListingGroupSummaryCard, index: number) =>
  cn(
    'group h-full min-h-36 rounded-lg border border-border bg-background py-0 text-foreground ring-0 shadow-none transition hover:border-border',
    group.pluralLabel.length > 16 ? 'sm:col-span-2' : null,
    index === 0 ? 'lg:col-span-2' : null,
  )

function ListingGroupDirectoryCard({
  group,
  index,
  routeRoot,
}: {
  readonly group: ListingGroupSummaryCard
  readonly index: number
  readonly routeRoot: ListingGroupRouteRoot
}) {
  const action =
    routeRoot === 'rentals' ? (
      <Button
        nativeButton={false}
        render={
          <Link to="/rentals/$group" params={{ group: group.groupSlug }} />
        }
        className="w-full justify-between"
        variant="outline"
      >
        Explore options
        <ArrowRight />
      </Button>
    ) : (
      <Button
        nativeButton={false}
        render={
          <Link to="/search/$group" params={{ group: group.groupSlug }} />
        }
        className="w-full justify-between"
        variant="outline"
      >
        Explore options
        <ArrowRight />
      </Button>
    )

  return (
    <Card
      size="sm"
      className={groupMosaicClass(group, index)}
      key={group.groupSlug}
    >
      <CardHeader className="min-w-0 gap-1 px-4 pt-4">
        <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold uppercase tracking-[0.16em] text-foreground">
          <span>Browse</span>
          <span className="rounded-full border border-border bg-background px-2.5 py-1 text-xs font-bold normal-case tracking-normal text-foreground">
            {countLabel(group.valueCount, 'option', 'options')}
          </span>
        </span>
        <CardTitle className="line-clamp-2 break-words text-lg font-extrabold leading-tight text-foreground group-hover:text-foreground">
          {group.pluralLabel}
        </CardTitle>
      </CardHeader>
      <CardFooter className="mt-auto px-4 pb-4 pt-4">{action}</CardFooter>
    </Card>
  )
}

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
  routeRoot = 'search',
  emptyTitle = 'No related categories',
  emptyDescription = 'There are no other search categories available from the synced listing data.',
}: {
  readonly groups: ReadonlyArray<ListingGroupSummaryCard>
  readonly routeRoot?: ListingGroupRouteRoot
  readonly emptyTitle?: string
  readonly emptyDescription?: string
}) {
  const visibleGroups = prioritizedGroupSummaries(groups).slice(0, 16)

  return (
    <section className="grid gap-3">
      <h2 className="display-title text-2xl font-bold text-foreground">
        Browse by category
      </h2>
      <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(min(100%,12rem),1fr))]">
        {visibleGroups.length === 0 ? (
          <SearchEmptyTile title={emptyTitle} description={emptyDescription} />
        ) : null}
        {visibleGroups.map((group, index) => (
          <ListingGroupDirectoryCard
            group={group}
            index={index}
            routeRoot={routeRoot}
            key={group.groupSlug}
          />
        ))}
      </div>
    </section>
  )
}
