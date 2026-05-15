import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query'

import {
  getAgentDetail,
  getAgentsData,
  getGroupedListingsData,
  getHomeData,
  getListingDetail,
  getListingsData,
  getOfficesData,
  getOpenHouseDetail,
  getOpenHousesData,
} from './data'

import type {
  AgentSearch,
  DirectorySearch,
  ListingSearch,
  OpenHouseSearch,
} from './search'

export const homeQueryOptions = () =>
  queryOptions({
    queryKey: ['home-data'],
    queryFn: () => getHomeData(),
  })

export const listingsQueryOptions = (search: ListingSearch) =>
  queryOptions({
    queryKey: ['listings', search],
    queryFn: () => getListingsData({ data: search }),
  })

export const groupedListingsQueryOptions = ({
  groupSlug,
  valueSlug,
  search,
}: {
  readonly groupSlug: string
  readonly valueSlug: string
  readonly search: ListingSearch
}) =>
  queryOptions({
    queryKey: ['grouped-listings', groupSlug, valueSlug, search],
    queryFn: () =>
      getGroupedListingsData({
        data: {
          groupSlug,
          valueSlug,
          search,
        },
      }),
  })

export const listingDetailQueryOptions = (listingKey: string) =>
  queryOptions({
    queryKey: ['listing-detail', listingKey],
    queryFn: () => getListingDetail({ data: { listingKey } }),
  })

export const openHouseDetailQueryOptions = (openHouseKey: string) =>
  queryOptions({
    queryKey: ['open-house-detail', openHouseKey],
    queryFn: () => getOpenHouseDetail({ data: { openHouseKey } }),
  })

export const officesQueryOptions = (search: DirectorySearch) =>
  queryOptions({
    queryKey: ['offices', search],
    queryFn: () => getOfficesData({ data: search }),
  })

export const agentsQueryOptions = (search: AgentSearch) =>
  queryOptions({
    queryKey: ['agents', search],
    queryFn: () => getAgentsData({ data: search }),
  })

export const agentDetailQueryOptions = (agentKey: string) =>
  queryOptions({
    queryKey: ['agent-detail', agentKey],
    queryFn: () => getAgentDetail({ data: { agentKey } }),
  })

export type OpenHousePageParam = {
  readonly cursor: number
  readonly page: number
}

const firstOpenHousePage = {
  cursor: 0,
  page: 1,
} satisfies OpenHousePageParam

export const openHousesQueryOptions = (search: OpenHouseSearch) =>
  queryOptions({
    queryKey: ['open-houses', search],
    queryFn: () => getOpenHousesData({ data: search }),
  })

export const openHousesInfiniteQueryOptions = (search: OpenHouseSearch) =>
  infiniteQueryOptions({
    queryKey: ['open-houses', 'infinite', { listingKey: search.listingKey }],
    initialPageParam: firstOpenHousePage,
    queryFn: ({ pageParam }) =>
      getOpenHousesData({
        data: {
          listingKey: search.listingKey,
          page: pageParam.page,
          cursor: pageParam.cursor,
        },
      }),
    getNextPageParam: (lastPage) =>
      lastPage.nextCursor === null || lastPage.nextCursor === undefined
        ? undefined
        : {
            cursor: lastPage.nextCursor,
            page: lastPage.search.page + 1,
          },
    getPreviousPageParam: (firstPage) =>
      firstPage.previousCursor === null ||
      firstPage.previousCursor === undefined
        ? undefined
        : {
            cursor: firstPage.previousCursor,
            page: Math.max(1, firstPage.search.page - 1),
          },
  })
