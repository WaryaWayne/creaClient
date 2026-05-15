import { createFileRoute } from '@tanstack/react-router'

import { OpenHouseDetailPage } from '#/features/listings/components'
import { openHouseDetailQueryOptions } from '#/features/listings/queries'
import { openHouseDetailSeoHead } from '#/features/listings/seo'

export const Route = createFileRoute('/open-houses/$openHouseKey')({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      openHouseDetailQueryOptions(params.openHouseKey),
    ),
  head: ({ loaderData, params }) =>
    openHouseDetailSeoHead(loaderData, params.openHouseKey),
  component: OpenHouseRoute,
})

function OpenHouseRoute() {
  const openHouse = Route.useLoaderData()
  return <OpenHouseDetailPage openHouse={openHouse} />
}
