import { useEffect } from 'react'
import { useSuspenseInfiniteQuery } from '@tanstack/react-query'
import {
  createFileRoute,
  stripSearchParams,
  useNavigate,
} from '@tanstack/react-router'

import { ListingsPage } from '#/features/listings/components'
import { rentalListingsInfiniteQueryOptions } from '#/features/listings/queries'
import {
  infiniteDataPage,
  rentalListingsSeoHead,
} from '#/features/listings/seo'
import {
  compactListingSearch,
  defaultListingSearch,
  parseListingSearch,
} from '#/features/listings/search'

import type { ListingSearch } from '#/features/listings/search'

export const Route = createFileRoute('/rentals/')({
  validateSearch: parseListingSearch,
  search: {
    middlewares: [stripSearchParams(defaultListingSearch)],
  },
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) =>
    context.queryClient.ensureInfiniteQueryData({
      ...rentalListingsInfiniteQueryOptions(deps),
      pages: deps.page,
    }),
  head: ({ loaderData, match }) =>
    rentalListingsSeoHead(infiniteDataPage(loaderData, match.search.page)),
  component: RentalsRoute,
})

function RentalsRoute() {
  const search = Route.useSearch()
  const query = useSuspenseInfiniteQuery(
    rentalListingsInfiniteQueryOptions(search),
  )
  const navigate = useNavigate({ from: '/rentals/' })
  const loadedPageCount = query.data.pages.length
  const pageIndex = search.page - 1
  const loadedPage = query.data.pages.at(pageIndex)
  const lastLoadedPage = query.data.pages.at(-1)

  if (lastLoadedPage === undefined) {
    throw new Error('Rental listings query returned no pages')
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
        eyebrow: 'Rentals',
        title: 'Rental listings',
        description:
          'Browse active rental listings with the same route-backed filters. Share this URL and the same rental view opens.',
        emptyTitle: 'No rental listings match those filters.',
        emptyDescription:
          'Clear one or two filters and the rental page URL will update with the next search.',
      }}
    />
  )
}
