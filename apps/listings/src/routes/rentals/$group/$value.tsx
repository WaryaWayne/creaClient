import { useEffect } from 'react'
import { useSuspenseInfiniteQuery } from '@tanstack/react-query'
import {
  createFileRoute,
  stripSearchParams,
  useNavigate,
} from '@tanstack/react-router'

import { GroupedListingsPage } from '#/features/listings/components'
import { rentalGroupedListingsInfiniteQueryOptions } from '#/features/listings/queries'
import {
  infiniteDataPage,
  rentalGroupedListingsSeoHead,
} from '#/features/listings/seo'
import {
  compactListingSearch,
  defaultListingSearch,
  parseListingSearch,
} from '#/features/listings/search'

import type { ListingSearch } from '#/features/listings/search'

export const Route = createFileRoute('/rentals/$group/$value')({
  validateSearch: parseListingSearch,
  search: {
    middlewares: [stripSearchParams(defaultListingSearch)],
  },
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps, params }) =>
    context.queryClient.ensureInfiniteQueryData({
      ...rentalGroupedListingsInfiniteQueryOptions({
        groupSlug: params.group,
        valueSlug: params.value,
        search: deps,
      }),
      pages: deps.page,
    }),
  head: ({ loaderData, match, params }) =>
    rentalGroupedListingsSeoHead(
      infiniteDataPage(loaderData, match.search.page),
      params.group,
      params.value,
    ),
  component: RentalGroupedListingsRoute,
})

function RentalGroupedListingsRoute() {
  const search = Route.useSearch()
  const params = Route.useParams()
  const query = useSuspenseInfiniteQuery(
    rentalGroupedListingsInfiniteQueryOptions({
      groupSlug: params.group,
      valueSlug: params.value,
      search,
    }),
  )
  const navigate = useNavigate({ from: '/rentals/$group/$value' })
  const loadedPageCount = query.data.pages.length
  const pageIndex = search.page - 1
  const loadedPage = query.data.pages.at(pageIndex)
  const lastLoadedPage = query.data.pages.at(-1)

  if (lastLoadedPage === undefined) {
    throw new Error('Rental grouped listings query returned no pages')
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
    <GroupedListingsPage
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
      routeRoot="rentals"
      copy={{
        fallbackEyebrow: 'Rental search',
        fallbackDescription:
          'Pick another rental category below or browse all rental listings.',
        fallbackButton: 'View rentals',
        groupedDescriptionSuffix:
          'Keep filtering this rental page by city, neighborhood, lot feature, price, beds, baths, or sort order.',
      }}
    />
  )
}
