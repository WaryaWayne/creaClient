import { createFileRoute } from '@tanstack/react-router'

import { InvestmentLandingPage } from '#/features/listings/components'

export const Route = createFileRoute('/investments/')({
  head: () => ({
    meta: [
      { title: 'Investments | CREA Listings Browser' },
      {
        name: 'description',
        content:
          'Investor starting point for screening active listings, checking rough yield, and moving into deal math.',
      },
    ],
  }),
  component: InvestmentsRoute,
})

function InvestmentsRoute() {
  return <InvestmentLandingPage />
}
