import { createFileRoute } from '@tanstack/react-router'

import { HomePage } from '#/features/listings/components'
import { homeQueryOptions } from '#/features/listings/queries'
import { homeSeoHead } from '#/features/listings/seo'

export const Route = createFileRoute('/index-older')({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(homeQueryOptions()),
  head: ({ loaderData }) => homeSeoHead(loaderData),
  component: Home,
})

function Home() {
  const data = Route.useLoaderData()
  return <HomePage data={data} />
}
