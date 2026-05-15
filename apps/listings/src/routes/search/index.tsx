import { createFileRoute } from '@tanstack/react-router'

import { SearchIndexPage } from '#/features/listings/components'
import { searchIndexQueryOptions } from '#/features/listings/queries'

export const Route = createFileRoute('/search/')({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(searchIndexQueryOptions()),
  head: () => ({
    meta: [
      {
        title: 'Listing Search | CREA Listings Browser',
      },
    ],
  }),
  component: SearchIndexRoute,
})

function SearchIndexRoute() {
  const data = Route.useLoaderData()
  return <SearchIndexPage data={data} />
}
