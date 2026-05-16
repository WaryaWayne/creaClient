import { createFileRoute } from '@tanstack/react-router'

import { SellerLandingPage } from '#/features/listings/components'

export const Route = createFileRoute('/sellers/')({
  head: () => ({
    meta: [
      { title: 'Sellers | CREA Listings Browser' },
      {
        name: 'description',
        content:
          'Seller starting point for comparing active local listings and preparing a listing path.',
      },
    ],
  }),
  component: SellersRoute,
})

function SellersRoute() {
  return <SellerLandingPage />
}
