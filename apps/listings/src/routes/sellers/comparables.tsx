import { useEffect } from 'react'
import { useSuspenseInfiniteQuery } from '@tanstack/react-query'
import {
  createFileRoute,
  stripSearchParams,
  useNavigate,
} from '@tanstack/react-router'

import {
  ListingsPage,
  SellerComparableIntro,
} from '#/features/listings/components'
import { listingsInfiniteQueryOptions } from '#/features/listings/queries'
import { infiniteDataPage, listingsSeoHead } from '#/features/listings/seo'
import {
  compactListingSearch,
  defaultListingSearch,
  parseListingSearch,
} from '#/features/listings/search'

import type { ListingSearch } from '#/features/listings/search'

export const Route = createFileRoute('/sellers/comparables')({
  validateSearch: parseListingSearch,
  search: {
    middlewares: [stripSearchParams(defaultListingSearch)],
  },
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) =>
    context.queryClient.ensureInfiniteQueryData({
      ...listingsInfiniteQueryOptions(deps),
      pages: deps.page,
    }),
  head: ({ loaderData, match }) =>
    listingsSeoHead(infiniteDataPage(loaderData, match.search.page)),
  component: SellerComparablesRoute,
})

function SellerComparablesRoute() {
  const search = Route.useSearch()
  const query = useSuspenseInfiniteQuery(listingsInfiniteQueryOptions(search))
  const navigate = useNavigate({ from: '/sellers/comparables' })
  const loadedPageCount = query.data.pages.length
  const pageIndex = search.page - 1
  const loadedPage = query.data.pages.at(pageIndex)
  const lastLoadedPage = query.data.pages.at(-1)

  if (lastLoadedPage === undefined) {
    throw new Error('Seller comparable query returned no pages')
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
        <SellerComparableIntro />
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
          eyebrow: 'Seller comps',
          title: 'Comparable listings',
          description:
            'Review active listings that match the seller profile. Tighten bedrooms, bathrooms, parking, garage, amenities, price, city, and type from the filter button.',
          emptyTitle: 'No comparable listings match those filters.',
          emptyDescription:
            'Remove one detailed filter or broaden beds, baths, parking, amenities, or city to get a wider comp set.',
        }}
      />
    </div>
  )
}
