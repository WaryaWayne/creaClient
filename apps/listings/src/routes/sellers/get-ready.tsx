import { createFileRoute } from '@tanstack/react-router'

import { SellerGetReadyPage } from '#/features/listings/components'

export const Route = createFileRoute('/sellers/get-ready')({
  head: () => ({
    meta: [
      { title: 'Seller Get Ready Checklist | CREA Listings Browser' },
      {
        name: 'description',
        content:
          'Use a seller preparedness checklist before listing a property, from payoff numbers and repairs to photos, showings, and offer planning.',
      },
    ],
  }),
  component: SellerGetReadyRoute,
})

function SellerGetReadyRoute() {
  return <SellerGetReadyPage />
}
