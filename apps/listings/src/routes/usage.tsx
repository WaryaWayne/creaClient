import { createFileRoute } from '@tanstack/react-router'

import { UsageMetricsDashboard } from '#/features/usage-metrics/dashboard'

export const Route = createFileRoute('/usage')({
  head: () => ({
    meta: [
      { title: 'Usage Metrics | CREA listings browser' },
      {
        name: 'robots',
        content: 'noindex,nofollow',
      },
    ],
  }),
  component: UsageMetricsDashboard,
})
