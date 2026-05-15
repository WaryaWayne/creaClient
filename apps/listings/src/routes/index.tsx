import { createFileRoute } from '@tanstack/react-router'

import { HomePage } from '#/features/listings/components'
import { homeQueryOptions } from '#/features/listings/queries'

export const Route = createFileRoute('/')({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(homeQueryOptions()),
  head: () => ({
    meta: [
      {
        title: 'CREA Listings Browser | Local DDF Search',
      },
    ],
  }),
  component: Home,
})

function Home() {
  const data = Route.useLoaderData()
  return <HomePage data={data} />
}
