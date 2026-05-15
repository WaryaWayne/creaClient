import type {
  ListingCard as ListingCardType,
  ListingGroupSearchKey,
  OpenHouseCard,
  PersonCard,
} from '../data'
import { usableTotalActualRent } from '../data'
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
  const rentAmount =
    listing.leaseAmount ?? usableTotalActualRent(listing.totalActualRent)
  if (rentAmount !== null) {
    return `${formatMoney(rentAmount)}${listing.leaseFrequency ? ` / ${listing.leaseFrequency}` : ''}`
  }
  return 'Price on request'
}

export const formatDate = (value: string | null) => {
  if (!value) return 'Date available'
  const localDate = /^(\d{4})-(\d{2})-(\d{2})/.exec(value)
  if (localDate) {
    return new Intl.DateTimeFormat('en-CA', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(
      new Date(
        Number(localDate[1]),
        Number(localDate[2]) - 1,
        Number(localDate[3]),
      ),
    )
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('en-CA', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

export const formatLocalTime = (value: string | null) => {
  if (!value) return null
  const match = /^(\d{1,2}):(\d{2})(?::\d{2})?/.exec(value)
  if (!match) return value

  const hour = Number(match[1])
  const minute = Number(match[2])
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return value

  const period = hour >= 12 ? 'PM' : 'AM'
  const hour12 = hour % 12 || 12
  return `${hour12}:${match[2]} ${period}`
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
  [formatLocalTime(openHouse.startTime), formatLocalTime(openHouse.endTime)]
    .filter(Boolean)
    .join(' - ') || 'Time available'

export const looseSearchTokens = (value: string) =>
  value
    .trim()
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean)

export const normalizeLooseSearchText = (value: string) =>
  value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')

const looseSearchTokenVariants = (value: string) => {
  const normalized = normalizeLooseSearchText(value)
  const variants = new Set<string>()
  if (normalized.length > 0) variants.add(normalized)

  const compactTime = /^(\d{1,2})(am|pm)$/.exec(normalized)
  if (compactTime !== null) {
    const hour = Number(compactTime[1])
    if (hour >= 1 && hour <= 12) variants.add(`${hour}00${compactTime[2]}`)
  }

  return Array.from(variants)
}

export const looseValueMatches = (value: string, query: string) => {
  const tokens = looseSearchTokens(query)
  if (tokens.length === 0) return false

  const lowerValue = value.toLowerCase()
  const normalizedValue = normalizeLooseSearchText(value)
  return tokens.some((token) => {
    const lowerToken = token.toLowerCase()
    const normalizedTokens = looseSearchTokenVariants(token)
    return (
      lowerValue.includes(lowerToken) ||
      normalizedTokens.some((normalizedToken) =>
        normalizedValue.includes(normalizedToken),
      )
    )
  })
}

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

export const displaySearchGroupValue = (groupSlug: string, value: string) => {
  if (groupSlug !== 'neighborhood') return value

  const separatorIndex = value.indexOf('-')
  if (separatorIndex === -1) return value

  const label = value.slice(separatorIndex + 1).trim()
  return label || value
}

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
