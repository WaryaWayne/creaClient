import { createFileRoute } from '@tanstack/react-router'

import { AgentDetailPage } from '#/features/listings/components'
import { agentDetailQueryOptions } from '#/features/listings/queries'
import { agentDetailSeoHead } from '#/features/listings/seo'

export const Route = createFileRoute('/agents/$agentKey')({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      agentDetailQueryOptions(params.agentKey),
    ),
  head: ({ loaderData, params }) =>
    agentDetailSeoHead(loaderData, params.agentKey),
  component: AgentRoute,
})

function AgentRoute() {
  const agent = Route.useLoaderData()
  return <AgentDetailPage agent={agent} />
}
