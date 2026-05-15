import { createFileRoute } from '@tanstack/react-router'

import { AudienceShell } from '#/features/listings/components/audience-shell'

export const Route = createFileRoute('/estates/')({
  head: () => ({
    meta: [
      { title: 'Estates | CREA Listings Browser' },
      {
        name: 'description',
        content:
          'Estate starting point for comparing larger homes and organizing listing details.',
      },
    ],
  }),
  component: EstatesRoute,
})

function EstatesRoute() {
  return (
    <AudienceShell
      eyebrow="Estate path"
      title="Keep estate decisions organized."
      description="Use this estate shell to compare larger-property listings, keep details easy to share, and move into search pages when more context is needed."
      searchLabel="View estate-scale homes"
      search={{ minBeds: 4, minParking: 2, sort: 'price-desc' }}
      points={[
        {
          title: 'Compare',
          description:
            'Start with larger homes and work outward by city, price, parking, and property type.',
        },
        {
          title: 'Document',
          description:
            'Use detail pages to collect the visible facts, rooms, media, office, and agent context.',
        },
        {
          title: 'Coordinate',
          description:
            'Share filtered URLs so family, executors, and advisors can review the same results.',
        },
      ]}
    />
  )
}
