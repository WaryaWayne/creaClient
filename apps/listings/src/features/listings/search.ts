export const LISTINGS_PAGE_SIZE = 18
export const DIRECTORY_PAGE_SIZE = 24

export const listingSortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-desc', label: 'Price high to low' },
  { value: 'price-asc', label: 'Price low to high' },
  { value: 'beds-desc', label: 'Most bedrooms' },
] as const

export type ListingSort = (typeof listingSortOptions)[number]['value']
export type NumericSearchValue = number | string

export type ListingSearch = {
  readonly city: string
  readonly province: string
  readonly status: string
  readonly type: string
  readonly minPrice: NumericSearchValue
  readonly maxPrice: NumericSearchValue
  readonly minBeds: NumericSearchValue
  readonly minBaths: NumericSearchValue
  readonly sort: ListingSort
  readonly page: number
}

export type DirectorySearch = {
  readonly city: string
  readonly province: string
  readonly page: number
}

export type AgentSearch = {
  readonly officeKey: string
  readonly page: number
}

export type OpenHouseSearch = {
  readonly listingKey: string
  readonly page: number
}

export const defaultListingSearch: ListingSearch = {
  city: '',
  province: '',
  status: '',
  type: '',
  minPrice: '',
  maxPrice: '',
  minBeds: '',
  minBaths: '',
  sort: 'newest',
  page: 1,
}

export const defaultDirectorySearch: DirectorySearch = {
  city: '',
  province: '',
  page: 1,
}

export const defaultAgentSearch: AgentSearch = {
  officeKey: '',
  page: 1,
}

export const defaultOpenHouseSearch: OpenHouseSearch = {
  listingKey: '',
  page: 1,
}

const firstValue = (value: unknown): unknown =>
  Array.isArray(value) ? value[0] : value

const readString = (value: unknown) => {
  const first = firstValue(value)
  if (typeof first === 'number' && Number.isFinite(first)) return String(first)
  return typeof first === 'string' ? first.trim() : ''
}

const readPage = (value: unknown) => {
  const parsed = Number.parseInt(readString(value), 10)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1
}

const readNumeric = (value: unknown): NumericSearchValue => {
  const parsed = Number.parseInt(readString(value).replace(/^"(.+)"$/, '$1'), 10)
  return Number.isFinite(parsed) ? parsed : ''
}

const readSort = (value: unknown): ListingSort => {
  const parsed = readString(value)
  return listingSortOptions.some((option) => option.value === parsed)
    ? (parsed as ListingSort)
    : 'newest'
}

export const parseListingSearch = (input: unknown): ListingSearch => {
  const value =
    input !== null && typeof input === 'object'
      ? (input as Record<string, unknown>)
      : {}

  return {
    city: readString(value.city),
    province: readString(value.province),
    status: readString(value.status),
    type: readString(value.type),
    minPrice: readNumeric(value.minPrice),
    maxPrice: readNumeric(value.maxPrice),
    minBeds: readNumeric(value.minBeds),
    minBaths: readNumeric(value.minBaths),
    sort: readSort(value.sort),
    page: readPage(value.page),
  }
}

export const parseDirectorySearch = (input: unknown): DirectorySearch => {
  const value =
    input !== null && typeof input === 'object'
      ? (input as Record<string, unknown>)
      : {}

  return {
    city: readString(value.city),
    province: readString(value.province),
    page: readPage(value.page),
  }
}

export const parseAgentSearch = (input: unknown): AgentSearch => {
  const value =
    input !== null && typeof input === 'object'
      ? (input as Record<string, unknown>)
      : {}

  return {
    officeKey: readString(value.officeKey),
    page: readPage(value.page),
  }
}

export const parseOpenHouseSearch = (input: unknown): OpenHouseSearch => {
  const value =
    input !== null && typeof input === 'object'
      ? (input as Record<string, unknown>)
      : {}

  return {
    listingKey: readString(value.listingKey),
    page: readPage(value.page),
  }
}

const addIfPresent = (
  output: Record<string, string | number>,
  key: string,
  value: string,
) => {
  if (value.length > 0) output[key] = value
}

const addNumberIfPresent = (
  output: Record<string, string | number>,
  key: string,
  value: NumericSearchValue,
) => {
  const parsed = Number.parseInt(String(value), 10)
  if (Number.isFinite(parsed)) output[key] = parsed
}

export const compactListingSearch = (search: ListingSearch) => {
  const output: Record<string, string | number> = {}
  addIfPresent(output, 'city', search.city)
  addIfPresent(output, 'province', search.province)
  addIfPresent(output, 'status', search.status)
  addIfPresent(output, 'type', search.type)
  addNumberIfPresent(output, 'minPrice', search.minPrice)
  addNumberIfPresent(output, 'maxPrice', search.maxPrice)
  addNumberIfPresent(output, 'minBeds', search.minBeds)
  addNumberIfPresent(output, 'minBaths', search.minBaths)
  if (search.sort !== defaultListingSearch.sort) output.sort = search.sort
  if (search.page > 1) output.page = search.page
  return output
}

export const compactDirectorySearch = (search: DirectorySearch) => {
  const output: Record<string, string | number> = {}
  addIfPresent(output, 'city', search.city)
  addIfPresent(output, 'province', search.province)
  if (search.page > 1) output.page = search.page
  return output
}

export const compactAgentSearch = (search: AgentSearch) => {
  const output: Record<string, string | number> = {}
  addIfPresent(output, 'officeKey', search.officeKey)
  if (search.page > 1) output.page = search.page
  return output
}

export const compactOpenHouseSearch = (search: OpenHouseSearch) => {
  const output: Record<string, string | number> = {}
  addIfPresent(output, 'listingKey', search.listingKey)
  if (search.page > 1) output.page = search.page
  return output
}

export const numericFilter = (value: NumericSearchValue) => {
  const rawValue = String(value).trim()
  if (rawValue.length === 0) return undefined
  const parsed = Number.parseInt(rawValue, 10)
  return Number.isFinite(parsed) ? parsed : undefined
}
