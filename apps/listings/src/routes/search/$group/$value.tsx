import { useEffect } from 'react'
import { useSuspenseInfiniteQuery } from '@tanstack/react-query'
import {
  createFileRoute,
  stripSearchParams,
  useNavigate,
} from '@tanstack/react-router'

import { GroupedListingsPage } from '#/features/listings/components'
import { groupedListingsInfiniteQueryOptions } from '#/features/listings/queries'
import {
  compactListingSearch,
  defaultListingSearch,
  parseListingSearch,
} from '#/features/listings/search'

import type { ListingSearch } from '#/features/listings/search'

export const Route = createFileRoute('/search/$group/$value')({
  validateSearch: parseListingSearch,
  search: {
    middlewares: [stripSearchParams(defaultListingSearch)],
  },
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps, params }) =>
    context.queryClient.ensureInfiniteQueryData({
      ...groupedListingsInfiniteQueryOptions({
        groupSlug: params.group,
        valueSlug: params.value,
        search: deps,
      }),
      pages: deps.page,
    }),
  head: () => ({
    meta: [
      {
        title: 'Grouped listings | CREA Listings Browser',
      },
    ],
  }),
  component: GroupedListingsRoute,
})

function GroupedListingsRoute() {
  const search = Route.useSearch()
  const params = Route.useParams()
  const query = useSuspenseInfiniteQuery(
    groupedListingsInfiniteQueryOptions({
      groupSlug: params.group,
      valueSlug: params.value,
      search,
    }),
  )
  const navigate = useNavigate({ from: '/search/$group/$value' })
  const loadedPageCount = query.data.pages.length
  const pageIndex = search.page - 1
  const loadedPage = query.data.pages.at(pageIndex)
  const lastLoadedPage = query.data.pages.at(-1)

  if (lastLoadedPage === undefined) {
    throw new Error('Grouped listings query returned no pages')
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
    />
  )
}
