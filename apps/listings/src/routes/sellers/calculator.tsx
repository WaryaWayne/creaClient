import { createFileRoute } from '@tanstack/react-router'

import { SellerCalculatorPage } from '#/features/listings/components'

export const Route = createFileRoute('/sellers/calculator')({
  head: () => ({
    meta: [
      { title: 'Seller Net Proceeds Calculator | CREA Listings Browser' },
      {
        name: 'description',
        content:
          'Estimate seller take-home proceeds after appreciation, mortgage debt, HELOC debt, broker fees, legal fees, and common selling costs.',
      },
    ],
  }),
  component: SellerCalculatorRoute,
})

function SellerCalculatorRoute() {
  return <SellerCalculatorPage />
}
