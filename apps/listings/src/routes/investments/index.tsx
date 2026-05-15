import { createFileRoute } from '@tanstack/react-router'

import { AudienceShell } from '#/features/listings/components/audience-shell'

export const Route = createFileRoute('/investments/')({
  head: () => ({
    meta: [
      { title: 'Investments | CREA Listings Browser' },
      {
        name: 'description',
        content:
          'Investment starting point for scanning listings and moving into focused search filters.',
      },
    ],
  }),
  component: InvestmentsRoute,
})

function InvestmentsRoute() {
  return (
    <AudienceShell
      eyebrow="Investment path"
      title="Scan listings with an investor lens."
      description="Use this investment shell to begin from lower-price results, then move into property categories, lease signals, and listing details as the workflow expands."
      searchLabel="Scan investment starts"
      search={{ minParking: 1, sort: 'price-asc' }}
      points={[
        {
          title: 'Screen',
          description:
            'Sort by price and use filters to remove listings that do not fit the target profile.',
        },
        {
          title: 'Investigate',
          description:
            'Use category search for property types, lease fields, building counts, and unit counts.',
        },
        {
          title: 'Shortlist',
          description:
            'Keep candidate URLs shareable while the full investment workflow is built out.',
        },
      ]}
    />
  )
}
