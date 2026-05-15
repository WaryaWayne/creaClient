import {
  createFileRoute,
  stripSearchParams,
  useNavigate,
} from '@tanstack/react-router'

import { GroupedListingsPage } from '#/features/listings/components'
import { groupedListingsQueryOptions } from '#/features/listings/queries'
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
    context.queryClient.ensureQueryData(
      groupedListingsQueryOptions({
        groupSlug: params.group,
        valueSlug: params.value,
        search: deps,
      }),
    ),
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
  const data = Route.useLoaderData()
  const navigate = useNavigate({ from: '/search/$group/$value' })

  const onSearchChange = (search: ListingSearch) => {
    void navigate({
      search: parseListingSearch(
        compactListingSearch(parseListingSearch(search)),
      ),
    })
  }

  return <GroupedListingsPage data={data} onSearchChange={onSearchChange} />
}
