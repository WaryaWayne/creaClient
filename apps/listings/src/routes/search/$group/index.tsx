import { createFileRoute } from '@tanstack/react-router'

import { SearchGroupPage } from '#/features/listings/components'
import { searchGroupQueryOptions } from '#/features/listings/queries'

export const Route = createFileRoute('/search/$group/')({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(searchGroupQueryOptions(params.group)),
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData.group
          ? `${loaderData.group.pluralLabel} | CREA Listings Browser`
          : 'Search group | CREA Listings Browser',
      },
    ],
  }),
  component: SearchGroupRoute,
})

function SearchGroupRoute() {
  const data = Route.useLoaderData()
  return <SearchGroupPage data={data} />
}
