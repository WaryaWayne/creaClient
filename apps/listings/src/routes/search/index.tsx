import { createFileRoute } from '@tanstack/react-router'

import { SearchIndexPage } from '#/features/listings/components'
import { searchIndexQueryOptions } from '#/features/listings/queries'
import { searchIndexSeoHead } from '#/features/listings/seo'

export const Route = createFileRoute('/search/')({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(searchIndexQueryOptions()),
  head: ({ loaderData }) => searchIndexSeoHead(loaderData),
  component: SearchIndexRoute,
})

function SearchIndexRoute() {
  const data = Route.useLoaderData()
  return <SearchIndexPage data={data} />
}
