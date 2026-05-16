import { useEffect } from 'react'
import { useSuspenseInfiniteQuery } from '@tanstack/react-query'
import {
  createFileRoute,
  stripSearchParams,
  useNavigate,
} from '@tanstack/react-router'

import {
  EstatePropertiesIntro,
  ListingsPage,
} from '#/features/listings/components'
import { listingsInfiniteQueryOptions } from '#/features/listings/queries'
import { infiniteDataPage, listingsSeoHead } from '#/features/listings/seo'
import {
  compactListingSearch,
  defaultListingSearch,
  parseListingSearch,
} from '#/features/listings/search'

import type { ListingSearch } from '#/features/listings/search'

const defaultEstatePropertiesSearch = parseListingSearch({
  ...defaultListingSearch,
  status: 'Active',
  minBeds: 4,
  minBaths: 3,
  minParking: 2,
  sort: 'price-desc',
})

const hasRouteSearch = (input: unknown) =>
  input !== null &&
  typeof input === 'object' &&
  Object.keys(input as Record<string, unknown>).length > 0

const parseEstatePropertiesSearch = (input: unknown): ListingSearch =>
  hasRouteSearch(input)
    ? parseListingSearch(input)
    : defaultEstatePropertiesSearch

export const Route = createFileRoute('/estates/properties')({
  validateSearch: parseEstatePropertiesSearch,
  search: {
    middlewares: [stripSearchParams(defaultEstatePropertiesSearch)],
  },
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) =>
    context.queryClient.ensureInfiniteQueryData({
      ...listingsInfiniteQueryOptions(deps),
      pages: deps.page,
    }),
  head: ({ loaderData, match }) =>
    listingsSeoHead(infiniteDataPage(loaderData, match.search.page)),
  component: EstatePropertiesRoute,
})

function EstatePropertiesRoute() {
  const search = Route.useSearch()
  const query = useSuspenseInfiniteQuery(listingsInfiniteQueryOptions(search))
  const navigate = useNavigate({ from: '/estates/properties' })
  const loadedPageCount = query.data.pages.length
  const pageIndex = search.page - 1
  const loadedPage = query.data.pages.at(pageIndex)
  const lastLoadedPage = query.data.pages.at(-1)

  if (lastLoadedPage === undefined) {
    throw new Error('Estate property query returned no pages')
  }

  useEffect(() => {
    if (
      search.page <= loadedPageCount ||
      !query.hasNextPage ||
      query.isFetchingNextPage
    ) {
      return
    }

    void query.fetchNextPage()
  }, [
    search.page,
    loadedPageCount,
    query.hasNextPage,
    query.isFetchingNextPage,
    query.fetchNextPage,
  ])

  const onSearchChange = (next: ListingSearch) => {
    const nextSearch = parseListingSearch(
      compactListingSearch(parseListingSearch(next)),
    )
    const go = () =>
      void navigate({
        search: nextSearch,
      })

    if (
      nextSearch.page === loadedPageCount + 1 &&
      query.hasNextPage &&
      !query.isFetchingNextPage
    ) {
      void query.fetchNextPage().then(go)
      return
    }

    go()
  }

  return (
    <div className="grid gap-5">
      <div className="page-wrap pt-8">
        <EstatePropertiesIntro />
      </div>
      <ListingsPage
        data={
          loadedPage ?? {
            ...lastLoadedPage,
            listings: [],
            search,
            hasNextPage: query.hasNextPage,
          }
        }
        isPaging={query.isFetchingNextPage}
        onSearchChange={onSearchChange}
        copy={{
          eyebrow: 'Estate properties',
          title: 'Larger homes and estate-scale matches',
          description:
            'Start with larger active homes, then refine by city, neighborhood, lot feature, price, beds, baths, parking, property type, utilities, garage, finished space, and waterfront signals.',
          emptyTitle: 'No estate-scale properties match those filters.',
          emptyDescription:
            'Broaden the city, price range, beds, baths, parking, lot feature, or advanced amenities to reopen the result set.',
        }}
      />
    </div>
  )
}
