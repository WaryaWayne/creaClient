import {
  createFileRoute,
  stripSearchParams,
  useNavigate,
} from '@tanstack/react-router'

import { OpenHousesPage } from '#/features/listings/components'
import { openHousesQueryOptions } from '#/features/listings/queries'
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
  loader: ({ context, search }) =>
    context.queryClient.ensureQueryData(openHousesQueryOptions(search)),
  head: () => ({
    meta: [{ title: 'Open Houses | CREA Listings Browser' }],
  }),
  component: OpenHousesRoute,
})

function OpenHousesRoute() {
  const data = Route.useLoaderData()
  const navigate = useNavigate({ from: '/open-houses/' })

  const onSearchChange = (search: OpenHouseSearch) => {
    void navigate({
      search: compactOpenHouseSearch(parseOpenHouseSearch(search)),
    })
  }

  return <OpenHousesPage data={data} onSearchChange={onSearchChange} />
}
