import { createFileRoute } from '@tanstack/react-router'

import { EstateOrganizerPage } from '#/features/listings/components'

export const Route = createFileRoute('/estates/organizer')({
  head: () => ({
    meta: [
      { title: 'Estate Property Organizer | CREA Listings Browser' },
      {
        name: 'description',
        content:
          'Use an estate property checklist for decision makers, authority documents, property facts, advisor tasks, showings, and sale-readiness.',
      },
    ],
  }),
  component: EstateOrganizerRoute,
})

function EstateOrganizerRoute() {
  return <EstateOrganizerPage />
}
