import { createFileRoute } from '@tanstack/react-router'

import { BuyerLandingPage } from '#/features/listings/components'

export const Route = createFileRoute('/buyers/')({
  head: () => ({
    meta: [
      { title: 'Buyers | CREA Listings Browser' },
      {
        name: 'description',
        content:
          'Buyer starting point for browsing local listings, open houses, and shareable search filters.',
      },
    ],
  }),
  component: BuyersRoute,
})

function BuyersRoute() {
  return <BuyerLandingPage />
}
