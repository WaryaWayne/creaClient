import { createFileRoute, redirect } from '@tanstack/react-router'

import { defaultListingSearch } from '#/features/listings/search'

export const Route = createFileRoute('/agents/$agentKey')({
  beforeLoad: () => {
    throw redirect({
      to: '/listings',
      search: defaultListingSearch,
      replace: true,
    })
  },
})
