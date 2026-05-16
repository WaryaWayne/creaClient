import { useEffect } from 'react'
import { useSuspenseInfiniteQuery } from '@tanstack/react-query'
import {
  createFileRoute,
  stripSearchParams,
  useNavigate,
} from '@tanstack/react-router'

import {
  InvestmentOpportunityIntro,
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

export const Route = createFileRoute('/investments/opportunities')({
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
  component: InvestmentOpportunitiesRoute,
})

function InvestmentOpportunitiesRoute() {
  const search = Route.useSearch()
  const query = useSuspenseInfiniteQuery(listingsInfiniteQueryOptions(search))
  const navigate = useNavigate({ from: '/investments/opportunities' })
  const loadedPageCount = query.data.pages.length
  const pageIndex = search.page - 1
  const loadedPage = query.data.pages.at(pageIndex)
  const lastLoadedPage = query.data.pages.at(-1)

  if (lastLoadedPage === undefined) {
    throw new Error('Investment opportunity query returned no pages')
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
        <InvestmentOpportunityIntro />
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
          eyebrow: 'Investor opportunities',
          title: 'Investment listing screen',
          description:
            'Review active listings through an investor lens. Tighten price, beds, baths, parking, property type, amenities, city, and sort order from the filter button.',
          emptyTitle: 'No investment candidates match those filters.',
          emptyDescription:
            'Remove one constraint or broaden price, beds, parking, property type, amenities, or city to get a wider deal screen.',
        }}
      />
    </div>
  )
}
