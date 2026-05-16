import { createFileRoute } from '@tanstack/react-router'

import { InvestmentCalculatorPage } from '#/features/listings/components'

export const Route = createFileRoute('/investments/calculator')({
  head: () => ({
    meta: [
      { title: 'Investment Deal Calculator | CREA Listings Browser' },
      {
        name: 'description',
        content:
          'Estimate investment property cash flow, down payment, financing, vacancy, operating costs, cap rate, cash-on-cash return, and break-even rent.',
      },
    ],
  }),
  component: InvestmentCalculatorRoute,
})

function InvestmentCalculatorRoute() {
  return <InvestmentCalculatorPage />
}
