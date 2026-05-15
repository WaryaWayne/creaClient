import {
  createFileRoute,
  stripSearchParams,
  useNavigate,
} from '@tanstack/react-router'

import { AgentsPage } from '#/features/listings/components'
import { agentsQueryOptions } from '#/features/listings/queries'
import { agentsSeoHead } from '#/features/listings/seo'
import {
  defaultAgentSearch,
  parseAgentSearch,
} from '#/features/listings/search'

import type { AgentSearch } from '#/features/listings/search'

export const Route = createFileRoute('/agents/')({
  validateSearch: parseAgentSearch,
  search: {
    middlewares: [stripSearchParams(defaultAgentSearch)],
  },
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(agentsQueryOptions(deps)),
  head: ({ loaderData }) => agentsSeoHead(loaderData),
  component: AgentsRoute,
})

function AgentsRoute() {
  const data = Route.useLoaderData()
  const navigate = useNavigate({ from: '/agents/' })

  const onSearchChange = (search: AgentSearch) => {
    void navigate({
      search: parseAgentSearch(search),
    })
  }

  return <AgentsPage data={data} onSearchChange={onSearchChange} />
}
