import { createFileRoute } from '@tanstack/react-router'

import { EstateLandingPage } from '#/features/listings/components'

export const Route = createFileRoute('/estates/')({
  head: () => ({
    meta: [
      { title: 'Estates | CREA Listings Browser' },
      {
        name: 'description',
        content:
          'Estate planning workspace for larger-property searches, carrying-cost planning, sale-prep budgeting, document organization, and family or executor decisions.',
      },
    ],
  }),
  component: EstatesRoute,
})

function EstatesRoute() {
  return <EstateLandingPage />
}
