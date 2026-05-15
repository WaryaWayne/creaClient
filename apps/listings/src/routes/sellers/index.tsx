import { createFileRoute } from '@tanstack/react-router'

import { AudienceShell } from '#/features/listings/components/audience-shell'

export const Route = createFileRoute('/sellers/')({
  head: () => ({
    meta: [
      { title: 'Sellers | CREA Listings Browser' },
      {
        name: 'description',
        content:
          'Seller starting point for comparing active local listings and preparing a listing path.',
      },
    ],
  }),
  component: SellersRoute,
})

function SellersRoute() {
  return (
    <AudienceShell
      eyebrow="Seller path"
      title="Sell with the current market in view."
      description="Use this seller shell to compare local active inventory, keep listing details shareable, and move into the full search tools when you are ready."
      searchLabel="See active listings"
      search={{ status: 'Active', sort: 'newest' }}
      points={[
        {
          title: 'Position',
          description:
            'Review nearby active listings and understand how similar homes are presented.',
        },
        {
          title: 'Prepare',
          description:
            'Use listing detail pages as a checklist for photos, facts, remarks, and representation.',
        },
        {
          title: 'Share',
          description:
            'Send filtered search URLs to keep everyone looking at the same market slice.',
        },
      ]}
    />
  )
}
