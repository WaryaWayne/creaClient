import type {
  ListingCard as ListingCardType,
  ListingGroupSearchKey,
  OpenHouseCard,
  PersonCard,
} from '../data'
import {
  compactListingSearch,
  defaultListingSearch,
  listingAdvancedFilterKeys,
} from '../search'
import type { ListingSearch } from '../search'

export const allValue = '__all'

export const money = new Intl.NumberFormat('en-CA', {
  style: 'currency',
  currency: 'CAD',
  maximumFractionDigits: 0,
})

export const number = new Intl.NumberFormat('en-CA')

export const formatMoney = (value: number | null) =>
  value === null ? 'Price on request' : money.format(value)

export const formatListingPrice = (listing: ListingCardType) => {
  if (listing.price !== null) return formatMoney(listing.price)
  if (listing.leaseAmount !== null) {
    return `${formatMoney(listing.leaseAmount)}${listing.leaseFrequency ? ` / ${listing.leaseFrequency}` : ''}`
  }
  return 'Price on request'
}

export const formatDate = (value: string | null) => {
  if (!value) return 'Date available'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('en-CA', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

export const personName = (person: PersonCard) =>
  [person.firstName, person.lastName].filter(Boolean).join(' ') || 'Agent'

export const cleanSearchObject = (search: ListingSearch) =>
  compactListingSearch(search) as ListingSearch

export const activeListingFilterCount = (
  filters: ListingSearch,
  hiddenFields: ReadonlySet<ListingGroupSearchKey>,
) =>
  [
    !hiddenFields.has('city') && filters.city,
    !hiddenFields.has('province') && filters.province,
    !hiddenFields.has('status') && filters.status,
    !hiddenFields.has('type') && filters.type,
    filters.minPrice,
    filters.maxPrice,
    filters.minBeds,
    filters.maxBeds,
    filters.minBaths,
    filters.maxBaths,
    filters.minParking,
    ...listingAdvancedFilterKeys.map((key) => filters[key].length > 0),
    filters.sort !== defaultListingSearch.sort && filters.sort,
  ].filter(Boolean).length

export const openHouseTimeLabel = (openHouse: OpenHouseCard) =>
  [openHouse.startTime, openHouse.endTime].filter(Boolean).join(' - ') ||
  'Time available'

const numericSearchValue = (value: ListingSearch['minPrice']) => {
  if (typeof value === 'number' && Number.isSafeInteger(value)) return value
  const text = String(value).trim()
  if (!/^\d+$/.test(text)) return null
  const parsed = Number.parseInt(text, 10)
  return Number.isSafeInteger(parsed) ? parsed : null
}

export const selectValue = (value: ListingSearch['minPrice']) =>
  numericSearchValue(value)?.toString() ?? ''

export const optionsWithSelectedValue = (
  values: ReadonlyArray<number>,
  value: ListingSearch['minPrice'],
) => {
  const selected = numericSearchValue(value)
  if (selected === null || values.includes(selected)) return values
  return [...values, selected].sort((left, right) => left - right)
}

export const countLabel = (value: number, singular: string, plural: string) =>
  value === 1 ? `1 ${singular}` : `${number.format(value)} ${plural}`

export const minCountLabel = (
  value: number,
  singular: string,
  plural: string,
) => (value === 0 ? `0+ ${plural}` : `${countLabel(value, singular, plural)}+`)

export const maxCountLabel = (
  value: number,
  singular: string,
  plural: string,
) =>
  value === 0
    ? `Up to 0 ${plural}`
    : `Up to ${countLabel(value, singular, plural)}`
