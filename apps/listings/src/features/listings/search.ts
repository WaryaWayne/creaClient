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

export const listingAdvancedFilterKeys = [
  'appliances',
  'basement',
  'waterSource',
  'sewer',
  'waterfrontFeatures',
  'heating',
  'cooling',
  'parkingFeatures',
] as const

export type ListingAdvancedFilterKey =
  (typeof listingAdvancedFilterKeys)[number]

export type ListingSearch = {
  readonly city: string
  readonly province: string
  readonly neighborhood: string
  readonly status: string
  readonly type: string
  readonly lotFeature: string
  readonly minPrice: NumericSearchValue
  readonly maxPrice: NumericSearchValue
  readonly minBeds: NumericSearchValue
  readonly maxBeds: NumericSearchValue
  readonly minBaths: NumericSearchValue
  readonly maxBaths: NumericSearchValue
  readonly minParking: NumericSearchValue
  readonly appliances: ReadonlyArray<string>
  readonly basement: ReadonlyArray<string>
  readonly waterSource: ReadonlyArray<string>
  readonly sewer: ReadonlyArray<string>
  readonly waterfrontFeatures: ReadonlyArray<string>
  readonly heating: ReadonlyArray<string>
  readonly cooling: ReadonlyArray<string>
  readonly parkingFeatures: ReadonlyArray<string>
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
  readonly q: string
  readonly page: number
}

export const defaultListingSearch: ListingSearch = {
  city: '',
  province: '',
  neighborhood: '',
  status: '',
  type: '',
  lotFeature: '',
  minPrice: '',
  maxPrice: '',
  minBeds: '',
  maxBeds: '',
  minBaths: '',
  maxBaths: '',
  minParking: '',
  appliances: [],
  basement: [],
  waterSource: [],
  sewer: [],
  waterfrontFeatures: [],
  heating: [],
  cooling: [],
  parkingFeatures: [],
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
  q: '',
  page: 1,
}

const firstValue = (value: unknown): unknown =>
  Array.isArray(value) ? value[0] : value

const readString = (value: unknown) => {
  const first = firstValue(value)
  if (typeof first === 'number' && Number.isFinite(first)) return String(first)
  const parsed = typeof first === 'string' ? first.trim() : ''
  return parsed === '__all' ? '' : parsed
}

const readPage = (value: unknown) => {
  const parsed = Number.parseInt(readString(value), 10)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1
}

const readNumeric = (value: unknown): NumericSearchValue => {
  const rawValue = readString(value).replace(/^"(.+)"$/, '$1')
  if (!/^\d+$/.test(rawValue)) return ''
  const parsed = Number.parseInt(rawValue, 10)
  return Number.isSafeInteger(parsed) ? parsed : ''
}

const readStringList = (value: unknown): ReadonlyArray<string> => {
  const values = Array.isArray(value) ? value : [value]
  const seen = new Set<string>()
  for (const item of values) {
    const parsed = readString(item)
    if (parsed.length === 0 || parsed.length > 120) continue
    if (seen.size >= 20) break
    seen.add(parsed)
  }
  return Array.from(seen)
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
    neighborhood: readString(value.neighborhood),
    status: readString(value.status),
    type: readString(value.type),
    lotFeature: readString(value.lotFeature),
    minPrice: readNumeric(value.minPrice),
    maxPrice: readNumeric(value.maxPrice),
    minBeds: readNumeric(value.minBeds),
    maxBeds: readNumeric(value.maxBeds),
    minBaths: readNumeric(value.minBaths),
    maxBaths: readNumeric(value.maxBaths),
    minParking: readNumeric(value.minParking),
    appliances: readStringList(value.appliances),
    basement: readStringList(value.basement),
    waterSource: readStringList(value.waterSource),
    sewer: readStringList(value.sewer),
    waterfrontFeatures: readStringList(value.waterfrontFeatures),
    heating: readStringList(value.heating),
    cooling: readStringList(value.cooling),
    parkingFeatures: readStringList(value.parkingFeatures),
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
    q: readString(value.q) || readString(value.listingKey),
    page: readPage(value.page),
  }
}

const addIfPresent = (
  output: Record<string, string | number | ReadonlyArray<string>>,
  key: string,
  value: string,
) => {
  if (value.length > 0) output[key] = value
}

const addNumberIfPresent = (
  output: Record<string, string | number | ReadonlyArray<string>>,
  key: string,
  value: NumericSearchValue,
) => {
  const rawValue = String(value).trim()
  if (!/^\d+$/.test(rawValue)) return
  const parsed = Number.parseInt(rawValue, 10)
  if (Number.isSafeInteger(parsed)) output[key] = parsed
}

const addStringListIfPresent = (
  output: Record<string, string | number | ReadonlyArray<string>>,
  key: string,
  value: ReadonlyArray<string>,
) => {
  if (value.length > 0) output[key] = value
}

export const compactListingSearch = (search: ListingSearch) => {
  const output: Record<string, string | number | ReadonlyArray<string>> = {}
  addIfPresent(output, 'city', search.city)
  addIfPresent(output, 'province', search.province)
  addIfPresent(output, 'neighborhood', search.neighborhood)
  addIfPresent(output, 'status', search.status)
  addIfPresent(output, 'type', search.type)
  addIfPresent(output, 'lotFeature', search.lotFeature)
  addNumberIfPresent(output, 'minPrice', search.minPrice)
  addNumberIfPresent(output, 'maxPrice', search.maxPrice)
  addNumberIfPresent(output, 'minBeds', search.minBeds)
  addNumberIfPresent(output, 'maxBeds', search.maxBeds)
  addNumberIfPresent(output, 'minBaths', search.minBaths)
  addNumberIfPresent(output, 'maxBaths', search.maxBaths)
  addNumberIfPresent(output, 'minParking', search.minParking)
  addStringListIfPresent(output, 'appliances', search.appliances)
  addStringListIfPresent(output, 'basement', search.basement)
  addStringListIfPresent(output, 'waterSource', search.waterSource)
  addStringListIfPresent(output, 'sewer', search.sewer)
  addStringListIfPresent(output, 'waterfrontFeatures', search.waterfrontFeatures)
  addStringListIfPresent(output, 'heating', search.heating)
  addStringListIfPresent(output, 'cooling', search.cooling)
  addStringListIfPresent(output, 'parkingFeatures', search.parkingFeatures)
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
  addIfPresent(output, 'q', search.q)
  if (search.page > 1) output.page = search.page
  return output
}

export const numericFilter = (value: NumericSearchValue) => {
  const rawValue = String(value).trim()
  if (rawValue.length === 0) return undefined
  if (!/^\d+$/.test(rawValue)) return undefined
  const parsed = Number.parseInt(rawValue, 10)
  return Number.isSafeInteger(parsed) ? parsed : undefined
}
