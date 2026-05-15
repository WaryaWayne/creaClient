import { createFileRoute } from '@tanstack/react-router'

import { AgentDetailPage } from '#/features/listings/components'
import { agentDetailQueryOptions } from '#/features/listings/queries'

export const Route = createFileRoute('/agents/$agentKey')({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      agentDetailQueryOptions(params.agentKey),
    ),
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData
          ? `${[loaderData.firstName, loaderData.lastName].filter(Boolean).join(' ') || 'Agent'} | CREA Listings Browser`
          : 'Agent | CREA Listings Browser',
      },
    ],
  }),
  component: AgentRoute,
})

function AgentRoute() {
  const agent = Route.useLoaderData()
  return <AgentDetailPage agent={agent} />
}
