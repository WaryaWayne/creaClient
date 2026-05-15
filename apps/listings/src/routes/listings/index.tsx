import {
  createFileRoute,
  stripSearchParams,
  useNavigate,
} from '@tanstack/react-router'

import { ListingsPage } from '#/features/listings/components'
import { listingsQueryOptions } from '#/features/listings/queries'
import {
  compactListingSearch,
  defaultListingSearch,
  parseListingSearch,
} from '#/features/listings/search'

import type { ListingSearch } from '#/features/listings/search'

export const Route = createFileRoute('/listings/')({
  validateSearch: parseListingSearch,
  search: {
    middlewares: [stripSearchParams(defaultListingSearch)],
  },
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(listingsQueryOptions(deps)),
  head: () => ({
    meta: [{ title: 'Listings | CREA Listings Browser' }],
  }),
  component: ListingsRoute,
})

function ListingsRoute() {
  const data = Route.useLoaderData()
  const navigate = useNavigate({ from: '/listings/' })

  const onSearchChange = (search: ListingSearch) => {
    void navigate({
      search: parseListingSearch(
        compactListingSearch(parseListingSearch(search)),
      ),
    })
  }

  return <ListingsPage data={data} onSearchChange={onSearchChange} />
}
