import {
  createFileRoute,
  stripSearchParams,
  useNavigate,
} from '@tanstack/react-router'

import { AgentsPage } from '#/features/listings/components'
import { agentsQueryOptions } from '#/features/listings/queries'
import {
  compactAgentSearch,
  defaultAgentSearch,
  parseAgentSearch,
} from '#/features/listings/search'

import type { AgentSearch } from '#/features/listings/search'

export const Route = createFileRoute('/agents/')({
  validateSearch: parseAgentSearch,
  search: {
    middlewares: [stripSearchParams(defaultAgentSearch)],
  },
  loader: ({ context, search }) =>
    context.queryClient.ensureQueryData(agentsQueryOptions(search)),
  head: () => ({
    meta: [{ title: 'Agents | CREA Listings Browser' }],
  }),
  component: AgentsRoute,
})

function AgentsRoute() {
  const data = Route.useLoaderData()
  const navigate = useNavigate({ from: '/agents/' })

  const onSearchChange = (search: AgentSearch) => {
    void navigate({
      search: compactAgentSearch(parseAgentSearch(search)),
    })
  }

  return <AgentsPage data={data} onSearchChange={onSearchChange} />
}
