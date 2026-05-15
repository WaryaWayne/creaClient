import {
  createFileRoute,
  stripSearchParams,
  useNavigate,
} from '@tanstack/react-router'

import { OfficesPage } from '#/features/listings/components'
import { officesQueryOptions } from '#/features/listings/queries'
import { officesSeoHead } from '#/features/listings/seo'
import {
  defaultDirectorySearch,
  parseDirectorySearch,
} from '#/features/listings/search'

import type { DirectorySearch } from '#/features/listings/search'

export const Route = createFileRoute('/offices/')({
  validateSearch: parseDirectorySearch,
  search: {
    middlewares: [stripSearchParams(defaultDirectorySearch)],
  },
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(officesQueryOptions(deps)),
  head: ({ loaderData }) => officesSeoHead(loaderData),
  component: OfficesRoute,
})

function OfficesRoute() {
  const data = Route.useLoaderData()
  const navigate = useNavigate({ from: '/offices/' })

  const onSearchChange = (search: DirectorySearch) => {
    void navigate({
      search: parseDirectorySearch(search),
    })
  }

  return <OfficesPage data={data} onSearchChange={onSearchChange} />
}
