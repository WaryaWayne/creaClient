import { createFileRoute } from '@tanstack/react-router'

import { OpenHouseDetailPage } from '#/features/listings/components'
import { openHouseDetailQueryOptions } from '#/features/listings/queries'

export const Route = createFileRoute('/open-houses/$openHouseKey')({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      openHouseDetailQueryOptions(params.openHouseKey),
    ),
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData
          ? `${loaderData.property?.address ?? 'Open house'} | CREA Listings Browser`
          : 'Open house | CREA Listings Browser',
      },
    ],
  }),
  component: OpenHouseRoute,
})

function OpenHouseRoute() {
  const openHouse = Route.useLoaderData()
  return <OpenHouseDetailPage openHouse={openHouse} />
}
