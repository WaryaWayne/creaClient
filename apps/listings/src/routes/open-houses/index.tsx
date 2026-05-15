import { useEffect } from 'react'
import { useSuspenseInfiniteQuery } from '@tanstack/react-query'
import {
  createFileRoute,
  stripSearchParams,
  useNavigate,
} from '@tanstack/react-router'

import { OpenHousesPage } from '#/features/listings/components'
import { openHousesInfiniteQueryOptions } from '#/features/listings/queries'
import {
  compactOpenHouseSearch,
  defaultOpenHouseSearch,
  parseOpenHouseSearch,
} from '#/features/listings/search'

import type { OpenHouseSearch } from '#/features/listings/search'

export const Route = createFileRoute('/open-houses/')({
  validateSearch: parseOpenHouseSearch,
  search: {
    middlewares: [stripSearchParams(defaultOpenHouseSearch)],
  },
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) =>
    context.queryClient.ensureInfiniteQueryData({
      ...openHousesInfiniteQueryOptions(deps),
      pages: deps.page,
    }),
  head: () => ({
    meta: [{ title: 'Open Houses | CREA Listings Browser' }],
  }),
  component: OpenHousesRoute,
})

function OpenHousesRoute() {
  const search = Route.useSearch()
  const query = useSuspenseInfiniteQuery(openHousesInfiniteQueryOptions(search))
  const navigate = useNavigate({ from: '/open-houses/' })
  const loadedPageCount = query.data.pages.length
  const pageIndex = search.page - 1
  const loadedPage = query.data.pages.at(pageIndex)
  const lastLoadedPage = query.data.pages.at(-1)

  if (lastLoadedPage === undefined) {
    throw new Error('Open houses query returned no pages')
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

  const onSearchChange = (next: OpenHouseSearch) => {
    const parsed = parseOpenHouseSearch(next)
    const nextSearch =
      parsed.listingKey === search.listingKey ? parsed : { ...parsed, page: 1 }
    const go = () =>
      void navigate({
        search: parseOpenHouseSearch(compactOpenHouseSearch(nextSearch)),
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
    <OpenHousesPage
      data={
        loadedPage ?? {
          ...lastLoadedPage,
          items: [],
          search,
          hasNextPage: query.hasNextPage,
        }
      }
      isPaging={query.isFetchingNextPage}
      onSearchChange={onSearchChange}
    />
  )
}
