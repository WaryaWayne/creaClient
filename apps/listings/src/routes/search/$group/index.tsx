import { createFileRoute } from '@tanstack/react-router'

import { SearchGroupPage } from '#/features/listings/components'
import { searchGroupQueryOptions } from '#/features/listings/queries'
import { searchGroupSeoHead } from '#/features/listings/seo'

export const Route = createFileRoute('/search/$group/')({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(searchGroupQueryOptions(params.group)),
  head: ({ loaderData, params }) =>
    searchGroupSeoHead(loaderData, params.group),
  component: SearchGroupRoute,
})

function SearchGroupRoute() {
  const data = Route.useLoaderData()
  return <SearchGroupPage data={data} />
}
