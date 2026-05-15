import { queryOptions } from '@tanstack/react-query'

import {
  getAgentsData,
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

export const openHousesQueryOptions = (search: OpenHouseSearch) =>
  queryOptions({
    queryKey: ['open-houses', search],
    queryFn: () => getOpenHousesData({ data: search }),
  })
