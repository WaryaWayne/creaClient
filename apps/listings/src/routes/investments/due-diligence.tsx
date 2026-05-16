import { createFileRoute } from '@tanstack/react-router'

import { InvestmentDueDiligencePage } from '#/features/listings/components'

export const Route = createFileRoute('/investments/due-diligence')({
  head: () => ({
    meta: [
      { title: 'Investment Due Diligence Checklist | CREA Listings Browser' },
      {
        name: 'description',
        content:
          'Use an investor due diligence checklist before shortlisting or offering, including rent, vacancy, financing, taxes, insurance, repairs, rental rules, and offer limits.',
      },
    ],
  }),
  component: InvestmentDueDiligenceRoute,
})

function InvestmentDueDiligenceRoute() {
  return <InvestmentDueDiligencePage />
}
