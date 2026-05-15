import { createFileRoute } from '@tanstack/react-router'

import { AudienceShell } from '#/features/listings/components/audience-shell'

export const Route = createFileRoute('/buyers/')({
  head: () => ({
    meta: [
      { title: 'Buyers | CREA Listings Browser' },
      {
        name: 'description',
        content:
          'Buyer starting point for browsing local listings, open houses, and shareable search filters.',
      },
    ],
  }),
  component: BuyersRoute,
})

function BuyersRoute() {
  return (
    <AudienceShell
      eyebrow="Buyer path"
      title="Find the listings worth a closer look."
      description="Use this buyer shell to start from fresh local listings, then narrow by budget, beds, baths, city, property type, and open house availability."
      searchLabel="Browse buyer matches"
      search={{ minBeds: 2, sort: 'newest' }}
      points={[
        {
          title: 'Discover',
          description:
            'Start broad, then use filters to focus the list without losing the URL state.',
        },
        {
          title: 'Compare',
          description:
            'Open listing detail pages to compare price, rooms, media, location, and representatives.',
        },
        {
          title: 'Tour',
          description:
            'Use open houses when a listing is ready for an in-person next step.',
        },
      ]}
    />
  )
}
