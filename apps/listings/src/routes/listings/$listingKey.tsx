import { createFileRoute } from '@tanstack/react-router'

import { ListingDetailPage } from '#/features/listings/components'
import { listingDetailQueryOptions } from '#/features/listings/queries'
import { listingDetailSeoHead } from '#/features/listings/seo'

export const Route = createFileRoute('/listings/$listingKey')({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      listingDetailQueryOptions(params.listingKey),
    ),
  head: ({ loaderData, params }) =>
    listingDetailSeoHead(loaderData, params.listingKey),
  component: ListingRoute,
})

function ListingRoute() {
  const listing = Route.useLoaderData()
  return <ListingDetailPage listing={listing} />
}
