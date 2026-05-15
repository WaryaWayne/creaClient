import { createFileRoute } from '@tanstack/react-router'

import { ListingDetailPage } from '#/features/listings/components'
import { listingDetailQueryOptions } from '#/features/listings/queries'

export const Route = createFileRoute('/listings/$listingKey')({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      listingDetailQueryOptions(params.listingKey),
    ),
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData
          ? `${loaderData.address} | CREA Listings Browser`
          : 'Listing | CREA Listings Browser',
      },
    ],
  }),
  component: ListingRoute,
})

function ListingRoute() {
  const listing = Route.useLoaderData()
  return <ListingDetailPage listing={listing} />
}
