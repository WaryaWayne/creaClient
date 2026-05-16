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
  getRentalGroupedListingsData,
  getRentalListingsData,
  getRentalSearchGroupData,
  getSearchGroupData,
  getSearchIndexData,
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

export const searchIndexQueryOptions = () =>
  queryOptions({
    queryKey: ['search-index'],
    queryFn: () => getSearchIndexData(),
  })

export const searchGroupQueryOptions = (groupSlug: string) =>
  queryOptions({
    queryKey: ['search-group', groupSlug],
    queryFn: () => getSearchGroupData({ data: { groupSlug } }),
  })

export const rentalSearchGroupQueryOptions = (groupSlug: string) =>
  queryOptions({
    queryKey: ['rentals', 'search-group', groupSlug],
    queryFn: () => getRentalSearchGroupData({ data: { groupSlug } }),
  })

export type ListingPageParam = {
  readonly page: number
}

const firstListingPage = {
  page: 1,
} satisfies ListingPageParam

const listingInfiniteQueryKey = (search: ListingSearch) => ({
  city: search.city,
  province: search.province,
  neighborhood: search.neighborhood,
  type: search.type,
  lotFeature: search.lotFeature,
  minPrice: search.minPrice,
  maxPrice: search.maxPrice,
  minBeds: search.minBeds,
  maxBeds: search.maxBeds,
  minBaths: search.minBaths,
  maxBaths: search.maxBaths,
  minParking: search.minParking,
  appliances: search.appliances,
  basement: search.basement,
  waterSource: search.waterSource,
  sewer: search.sewer,
  waterfrontFeatures: search.waterfrontFeatures,
  heating: search.heating,
  cooling: search.cooling,
  parkingFeatures: search.parkingFeatures,
  sort: search.sort,
})

export const listingsInfiniteQueryOptions = (search: ListingSearch) =>
  infiniteQueryOptions({
    queryKey: ['listings', 'infinite', listingInfiniteQueryKey(search)],
    initialPageParam: firstListingPage,
    queryFn: ({ pageParam }) =>
      getListingsData({
        data: {
          ...search,
          page: pageParam.page,
        },
      }),
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage
        ? {
            page: lastPage.search.page + 1,
          }
        : undefined,
    getPreviousPageParam: (firstPage) =>
      firstPage.search.page <= 1
        ? undefined
        : {
            page: Math.max(1, firstPage.search.page - 1),
          },
  })

export const rentalListingsInfiniteQueryOptions = (search: ListingSearch) =>
  infiniteQueryOptions({
    queryKey: ['rentals', 'infinite', listingInfiniteQueryKey(search)],
    initialPageParam: firstListingPage,
    queryFn: ({ pageParam }) =>
      getRentalListingsData({
        data: {
          ...search,
          page: pageParam.page,
        },
      }),
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage
        ? {
            page: lastPage.search.page + 1,
          }
        : undefined,
    getPreviousPageParam: (firstPage) =>
      firstPage.search.page <= 1
        ? undefined
        : {
            page: Math.max(1, firstPage.search.page - 1),
          },
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

export const groupedListingsInfiniteQueryOptions = ({
  groupSlug,
  valueSlug,
  search,
}: {
  readonly groupSlug: string
  readonly valueSlug: string
  readonly search: ListingSearch
}) =>
  infiniteQueryOptions({
    queryKey: [
      'grouped-listings',
      'infinite',
      groupSlug,
      valueSlug,
      listingInfiniteQueryKey(search),
    ],
    initialPageParam: firstListingPage,
    queryFn: ({ pageParam }) =>
      getGroupedListingsData({
        data: {
          groupSlug,
          valueSlug,
          search: {
            ...search,
            page: pageParam.page,
          },
        },
      }),
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage
        ? {
            page: lastPage.search.page + 1,
          }
        : undefined,
    getPreviousPageParam: (firstPage) =>
      firstPage.search.page <= 1
        ? undefined
        : {
            page: Math.max(1, firstPage.search.page - 1),
          },
  })

export const rentalGroupedListingsInfiniteQueryOptions = ({
  groupSlug,
  valueSlug,
  search,
}: {
  readonly groupSlug: string
  readonly valueSlug: string
  readonly search: ListingSearch
}) =>
  infiniteQueryOptions({
    queryKey: [
      'rentals',
      'grouped-listings',
      'infinite',
      groupSlug,
      valueSlug,
      listingInfiniteQueryKey(search),
    ],
    initialPageParam: firstListingPage,
    queryFn: ({ pageParam }) =>
      getRentalGroupedListingsData({
        data: {
          groupSlug,
          valueSlug,
          search: {
            ...search,
            page: pageParam.page,
          },
        },
      }),
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage
        ? {
            page: lastPage.search.page + 1,
          }
        : undefined,
    getPreviousPageParam: (firstPage) =>
      firstPage.search.page <= 1
        ? undefined
        : {
            page: Math.max(1, firstPage.search.page - 1),
          },
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
    queryKey: ['open-houses', 'infinite', { q: search.q }],
    initialPageParam: firstOpenHousePage,
    queryFn: ({ pageParam }) =>
      getOpenHousesData({
        data: {
          q: search.q,
          page: pageParam.page,
          cursor: pageParam.cursor,
        },
      }),
    getNextPageParam: (lastPage) =>
      lastPage.nextCursor === null
        ? undefined
        : {
            cursor: lastPage.nextCursor,
            page: lastPage.search.page + 1,
          },
    getPreviousPageParam: (firstPage) =>
      firstPage.previousCursor === null
        ? undefined
        : {
            cursor: firstPage.previousCursor,
            page: Math.max(1, firstPage.search.page - 1),
          },
  })
