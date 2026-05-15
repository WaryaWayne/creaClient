import { createFileRoute } from '@tanstack/react-router'

import { RentalSearchGroupPage } from '#/features/listings/components'
import { rentalSearchGroupQueryOptions } from '#/features/listings/queries'
import { rentalSearchGroupSeoHead } from '#/features/listings/seo'

export const Route = createFileRoute('/rentals/$group/')({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      rentalSearchGroupQueryOptions(params.group),
    ),
  head: ({ loaderData, params }) =>
    rentalSearchGroupSeoHead(loaderData, params.group),
  component: RentalSearchGroupRoute,
})

function RentalSearchGroupRoute() {
  const data = Route.useLoaderData()
  return <RentalSearchGroupPage data={data} />
}
