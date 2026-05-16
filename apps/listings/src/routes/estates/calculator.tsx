import { createFileRoute } from '@tanstack/react-router'

import { EstateCalculatorPage } from '#/features/listings/components'

export const Route = createFileRoute('/estates/calculator')({
  head: () => ({
    meta: [
      { title: 'Estate Net Planning Calculator | CREA Listings Browser' },
      {
        name: 'description',
        content:
          'Estimate an estate property sale range after carrying costs, sale-prep budget, debt payoffs, broker costs, legal costs, and advisor expenses.',
      },
    ],
  }),
  component: EstateCalculatorRoute,
})

function EstateCalculatorRoute() {
  return <EstateCalculatorPage />
}
