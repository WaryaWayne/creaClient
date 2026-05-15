import { createServerFn } from '@tanstack/react-start'
import { Effect, Layer, Option } from 'effect'
import { DdfDatabase, DdfDbClient } from '@warya/crea-ddf/db'
import type { PropertyField } from '@warya/crea-ddf/db'
import type {
  MediaSchema,
  MemberSchema,
  OfficeSchema,
  OpenHouseSchema,
  PropertyListingSchema,
  RoomsSchema,
} from '@warya/crea-ddf'

import {
  DIRECTORY_PAGE_SIZE,
  LISTINGS_PAGE_SIZE,
  numericFilter,
  parseAgentSearch,
  parseDirectorySearch,
  parseListingSearch,
  parseOpenHouseSearch,
} from './search'

import type {
  AgentSearch,
  DirectorySearch,
  ListingAdvancedFilterKey,
  ListingSearch,
  ListingSort,
  OpenHouseSearch,
} from './search'

type DbValue = string | number | boolean | Date | unknown[] | object | null
type DbRow = Record<string, DbValue | undefined>
type DdfProperty = typeof PropertyListingSchema.Type
type DdfMember = typeof MemberSchema.Type
type DdfOffice = typeof OfficeSchema.Type
type DdfOpenHouse = typeof OpenHouseSchema.Type
type DdfMediaRecord = (typeof MediaSchema.Type)[number]
type DdfRoomRecord = (typeof RoomsSchema.Type)[number]
type DdfPropertyRaw = Partial<DdfProperty>
type DdfMemberRaw = Partial<DdfMember>
type DdfOfficeRaw = Partial<DdfOffice>
type SchemaKey<T extends object> = Extract<keyof T, string>

export const EXIT_EXCEL_OFFICE_KEY = '280726'
export const EXIT_EXCEL_OFFICE_NAME = 'EXIT EXCEL REALTY'

export type ListingCard = {
  readonly listingKey: string
  readonly listingId: string | null
  readonly address: string
  readonly city: string
  readonly province: string
  readonly status: string | null
  readonly propertySubType: string | null
  readonly price: number | null
  readonly leaseAmount: number | null
  readonly leaseFrequency: string | null
  readonly bedrooms: number | null
  readonly bathrooms: number | null
  readonly parking: number | null
  readonly imageUrl: string | null
  readonly remarks: string | null
  readonly modifiedAt: string | null
  readonly agent: PersonCard | null
  readonly office: OfficeCard | null
  readonly agents: ReadonlyArray<PersonCard>
  readonly offices: ReadonlyArray<OfficeCard>
  readonly openHouses: ReadonlyArray<OpenHouseCard>
}

export type ListingDetail = ListingCard & {
  readonly latitude: number | null
  readonly longitude: number | null
  readonly photosCount: number | null
  readonly lotSize: number | null
  readonly lotSizeUnits: string | null
  readonly livingArea: number | null
  readonly livingAreaUnits: string | null
  readonly yearBuilt: number | null
  readonly rooms: ReadonlyArray<RoomCard>
  readonly media: ReadonlyArray<MediaCard>
  readonly detailGroups: ReadonlyArray<DetailGroup>
}

export type PersonCard = {
  readonly memberKey: string
  readonly memberMlsId: string | null
  readonly nationalAssociationId: string | null
  readonly officeNationalAssociationId: string | null
  readonly firstName: string | null
  readonly lastName: string | null
  readonly middleName: string | null
  readonly nickname: string | null
  readonly jobTitle: string | null
  readonly phone: string | null
  readonly phoneExt: string | null
  readonly tollFreePhone: string | null
  readonly fax: string | null
  readonly address: string | null
  readonly city: string | null
  readonly province: string | null
  readonly postalCode: string | null
  readonly country: string | null
  readonly status: string | null
  readonly type: string | null
  readonly memberAor: string | null
  readonly memberAorKey: string | null
  readonly officeKey: string | null
  readonly office: OfficeCard | null
  readonly imageUrl: string | null
  readonly media: ReadonlyArray<MediaCard>
  readonly languages: ReadonlyArray<string>
  readonly designations: ReadonlyArray<string>
  readonly socialMedia: ReadonlyArray<SocialMediaCard>
}

export type OfficeCard = {
  readonly officeKey: string
  readonly officeMlsId: string | null
  readonly officeAorKey: string | null
  readonly officeAor: string | null
  readonly officeNationalAssociationId: string | null
  readonly franchiseNationalAssociationId: string | null
  readonly officeBrokerNationalAssociationId: string | null
  readonly officeName: string | null
  readonly phone: string | null
  readonly phoneExt: string | null
  readonly fax: string | null
  readonly city: string | null
  readonly province: string | null
  readonly country: string | null
  readonly address: string | null
  readonly postalCode: string | null
  readonly officeType: string | null
  readonly officeStatus: string | null
  readonly imageUrl: string | null
  readonly media: ReadonlyArray<MediaCard>
  readonly socialMedia: ReadonlyArray<SocialMediaCard>
}

export type OfficeDetail = OfficeCard & {
  readonly agents: ReadonlyArray<PersonCard>
  readonly listings: ReadonlyArray<ListingCard>
}

export type AgentDetail = PersonCard & {
  readonly listings: ReadonlyArray<ListingCard>
  readonly openHouses: ReadonlyArray<OpenHouseCard>
}

export type OpenHouseCard = {
  readonly openHouseKey: string
  readonly listingKey: string | null
  readonly listingId: string | null
  readonly date: string | null
  readonly startTime: string | null
  readonly endTime: string | null
  readonly type: string | null
  readonly status: string | null
  readonly remarks: string | null
  readonly property: ListingCard | null
}

export type OpenHouseDetail = OpenHouseCard & {
  readonly relatedOpenHouses: ReadonlyArray<OpenHouseCard>
}

export type MediaCard = {
  readonly mediaKey: string | null
  readonly mediaUrl: string | null
  readonly mediaCategory: string | null
  readonly longDescription: string | null
  readonly preferredPhoto: boolean | null
  readonly sortOrder: number | null
}

export type SocialMediaCard = {
  readonly socialMediaKey: string | null
  readonly socialMediaType: string | null
  readonly socialMediaUrlOrId: string | null
}

export type RoomCard = {
  readonly roomKey: string | null
  readonly roomType: string | null
  readonly roomLevel: string | null
  readonly roomDimensions: string | null
  readonly roomDescription: string | null
  readonly roomLength: number | null
  readonly roomWidth: number | null
  readonly roomLengthWidthUnits: string | null
}

export type DetailFact = {
  readonly label: string
  readonly value: string
}

export type DetailGroup = {
  readonly title: string
  readonly facts: ReadonlyArray<DetailFact>
}

export type ListingFacets = {
  readonly cities: ReadonlyArray<string>
  readonly provinces: ReadonlyArray<string>
  readonly statuses: ReadonlyArray<string>
  readonly types: ReadonlyArray<string>
  readonly prices: ReadonlyArray<number>
  readonly bedrooms: ReadonlyArray<number>
  readonly bathrooms: ReadonlyArray<number>
  readonly parking: ReadonlyArray<number>
  readonly advancedGroups: ReadonlyArray<ListingAdvancedFacetGroup>
}

export type ListingFacetOption = {
  readonly value: string
  readonly count: number
}

export type ListingAdvancedFacetGroup = {
  readonly key: ListingAdvancedFilterKey
  readonly label: string
  readonly options: ReadonlyArray<ListingFacetOption>
}

export type ListingsData = {
  readonly listings: ReadonlyArray<ListingCard>
  readonly facets: ListingFacets
  readonly search: ListingSearch
  readonly pageSize: number
  readonly hasNextPage: boolean
}

export type ListingGroupSearchKey = 'city' | 'province' | 'status' | 'type'

export type ListingGroupSummary = {
  readonly groupSlug: string
  readonly label: string
  readonly pluralLabel: string
  readonly valueCount: number
  readonly listingCount: number
}

export type ListingGroupBucket = {
  readonly group: ListingGroupRouteInfo
  readonly summary: ListingGroupSummary
  readonly values: ReadonlyArray<ListingGroupValueLink>
}

export type ListingGroupValueLink = {
  readonly groupSlug: string
  readonly groupLabel: string
  readonly pluralLabel: string
  readonly value: string
  readonly valueSlug: string
  readonly count: number
}

export type ListingGroupRouteInfo = {
  readonly slug: string
  readonly label: string
  readonly pluralLabel: string
  readonly description: string
  readonly suppressedSearchKeys: ReadonlyArray<ListingGroupSearchKey>
}

export type GroupedListingsData = {
  readonly requested: {
    readonly groupSlug: string
    readonly valueSlug: string
  }
  readonly group: ListingGroupRouteInfo | null
  readonly matchedValue: ListingGroupValueLink | null
  readonly listings: ReadonlyArray<ListingCard>
  readonly facets: ListingFacets
  readonly search: ListingSearch
  readonly pageSize: number
  readonly hasNextPage: boolean
  readonly relatedGroups: ReadonlyArray<ListingGroupSummary>
  readonly relatedValues: ReadonlyArray<ListingGroupValueLink>
}

export type SearchIndexData = {
  readonly facets: ListingFacets
  readonly groups: ReadonlyArray<ListingGroupBucket>
  readonly topValues: ReadonlyArray<ListingGroupValueLink>
  readonly featuredListings: ReadonlyArray<ListingCard>
  readonly openHouses: ReadonlyArray<OpenHouseCard>
}

export type SearchGroupData = {
  readonly requestedGroupSlug: string
  readonly group: ListingGroupRouteInfo | null
  readonly summary: ListingGroupSummary | null
  readonly values: ReadonlyArray<ListingGroupValueLink>
  readonly relatedGroups: ReadonlyArray<ListingGroupSummary>
  readonly topValues: ReadonlyArray<ListingGroupValueLink>
}

export type DirectoryData<T> = {
  readonly items: ReadonlyArray<T>
  readonly search: DirectorySearch | AgentSearch | OpenHouseSearch
  readonly pageSize: number
  readonly hasNextPage: boolean
  readonly nextCursor?: number | null
  readonly previousCursor?: number | null
}

export type HomeData = {
  readonly featuredListings: ReadonlyArray<ListingCard>
  readonly openHouses: ReadonlyArray<OpenHouseCard>
  readonly facets: ListingFacets
}

const asRecord = (value: unknown): DbRow =>
  value !== null && typeof value === 'object' ? (value as DbRow) : {}

const asRows = (value: unknown): ReadonlyArray<DbRow> =>
  Array.isArray(value) ? value.map(asRecord) : []

const stringValue = (row: DbRow, key: string): string | null => {
  const value = row[key]
  return typeof value === 'string' && value.length > 0 ? value : null
}

const arrayValue = (row: DbRow, key: string): ReadonlyArray<DbRow> =>
  asRows(row[key])

const rawValue = <T extends object>(row: DbRow): Partial<T> =>
  asRecord(row.raw) as Partial<T>

const lowerFirst = (value: string) =>
  value.length === 0 ? value : `${value[0].toLowerCase()}${value.slice(1)}`

const schemaValue = <T extends object>(
  row: DbRow,
  key: SchemaKey<T>,
  dbKey = lowerFirst(key),
): unknown => {
  const raw = rawValue<T>(row)
  const rawField = raw[key]
  return rawField === undefined ? (row[dbKey] ?? row[key]) : rawField
}

const schemaString = <T extends object>(
  row: DbRow,
  key: SchemaKey<T>,
  dbKey?: string,
): string | null => {
  const value = schemaValue<T>(row, key, dbKey)
  return typeof value === 'string' && value.length > 0 ? value : null
}

const schemaNumber = <T extends object>(
  row: DbRow,
  key: SchemaKey<T>,
  dbKey?: string,
): number | null => {
  const value = schemaValue<T>(row, key, dbKey)
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

const readCursor = (value: unknown): number | undefined => {
  const first = Array.isArray(value) ? value[0] : value
  const parsed =
    typeof first === 'number'
      ? first
      : typeof first === 'string'
        ? Number.parseInt(first, 10)
        : Number.NaN
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : undefined
}

const parseOpenHousePageRequest = (
  input: unknown,
): OpenHouseSearch & { readonly cursor?: number } => {
  const value =
    input !== null && typeof input === 'object'
      ? (input as Record<string, unknown>)
      : {}
  const search = parseOpenHouseSearch(value)
  const cursor = readCursor(value.cursor)
  return cursor === undefined ? search : { ...search, cursor }
}

type ListingGroupRequest = {
  readonly groupSlug: string
  readonly valueSlug: string
  readonly search: ListingSearch
}

const readRequestString = (value: unknown) => {
  const first = Array.isArray(value) ? value[0] : value
  if (typeof first === 'number' && Number.isFinite(first)) return String(first)
  return typeof first === 'string' ? first.trim() : ''
}

const parseListingGroupRequest = (input: unknown): ListingGroupRequest => {
  const value =
    input !== null && typeof input === 'object'
      ? (input as Record<string, unknown>)
      : {}

  return {
    groupSlug: readRequestString(value.groupSlug),
    valueSlug: readRequestString(value.valueSlug),
    search: parseListingSearch(value.search),
  }
}

const parseSearchGroupRequest = (input: unknown) => {
  const value =
    input !== null && typeof input === 'object'
      ? (input as Record<string, unknown>)
      : {}

  return {
    groupSlug: readRequestString(value.groupSlug),
  }
}

const schemaBoolean = <T extends object>(
  row: DbRow,
  key: SchemaKey<T>,
  dbKey?: string,
): boolean | null => {
  const value = schemaValue<T>(row, key, dbKey)
  return typeof value === 'boolean' ? value : null
}

const schemaDate = <T extends object>(
  row: DbRow,
  key: SchemaKey<T>,
  dbKey?: string,
): string | null => {
  const value = schemaValue<T>(row, key, dbKey)
  if (value instanceof Date) return value.toISOString()
  return typeof value === 'string' && value.length > 0 ? value : null
}

const displayAddress = (row: DbRow) => {
  const place = [
    schemaString<DdfProperty>(row, 'City', 'city'),
    schemaString<DdfProperty>(row, 'StateOrProvince', 'province'),
  ]
    .filter(Boolean)
    .join(', ')
  return (
    schemaString<DdfProperty>(row, 'UnparsedAddress', 'unparsedAddress') ||
    (place.length > 0 ? place : 'Address available by request')
  )
}

const uniqueSorted = (values: ReadonlyArray<string | null>) =>
  Array.from(new Set(values.filter((value): value is string => !!value))).sort(
    (left, right) => left.localeCompare(right),
  )

const groupValueNumber = new Intl.NumberFormat('en-CA', {
  maximumFractionDigits: 2,
})

const slugifyGroupValue = (value: string | number) => {
  const slug = String(value)
    .trim()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
  return slug || 'value'
}

const displayGroupValue = (value: string | number) =>
  typeof value === 'number' ? groupValueNumber.format(value) : value

const mediaRowsFrom = (row: DbRow): ReadonlyArray<DbRow> => {
  const raw = rawValue<DdfPropertyRaw & DdfMemberRaw & DdfOfficeRaw>(row)
  return asRows(raw.Media ?? row.media)
}

const mediaUrlFromRow = (row: DbRow) =>
  schemaString<DdfMediaRecord>(row, 'MediaURL', 'mediaUrl')

const mediaTextFromRow = (row: DbRow) =>
  [
    schemaString<DdfMediaRecord>(row, 'MediaCategory', 'mediaCategory'),
    schemaString<DdfMediaRecord>(row, 'LongDescription', 'longDescription'),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

const mediaUrlPathFromRow = (row: DbRow) => {
  const url = mediaUrlFromRow(row)
  if (url === null) return ''
  try {
    return new URL(url).pathname.toLowerCase()
  } catch {
    return url.toLowerCase()
  }
}

const mediaHasImageExtension = (row: DbRow) =>
  /\.(avif|gif|jpe?g|png|webp)$/i.test(mediaUrlPathFromRow(row))

const mediaLooksLikeListingImage = (row: DbRow) => {
  const text = mediaTextFromRow(row)
  if (mediaUrlFromRow(row) === null) return false
  if (text.includes('website') && !mediaHasImageExtension(row)) return false
  if (
    text.includes('video') ||
    text.includes('tour') ||
    text.includes('document') ||
    text.includes('brochure') ||
    text.includes('blueprint') ||
    text.includes('floor plan') ||
    text.includes('floorplan') ||
    text.includes('site plan')
  ) {
    return false
  }
  if (
    text.includes('photo') ||
    text.includes('picture') ||
    text.includes('logo')
  ) {
    return true
  }
  return mediaHasImageExtension(row)
}

const preferredMediaRow = (rows: ReadonlyArray<DbRow>) =>
  rows.find(
    (media) =>
      schemaBoolean<DdfMediaRecord>(
        media,
        'PreferredPhotoYN',
        'preferredPhoto',
      ) === true && mediaLooksLikeListingImage(media),
  ) ??
  rows.find((media) => {
    const text = mediaTextFromRow(media)
    return mediaLooksLikeListingImage(media) && text.includes('photo')
  }) ??
  rows.find(mediaLooksLikeListingImage)

const imageFromRow = (row: DbRow) => {
  const mediaUrl = mediaUrlFromRow(preferredMediaRow(mediaRowsFrom(row)) ?? {})
  return mediaUrl ?? stringValue(row, 'primaryMediaUrl')
}

const uniqueBy = <T>(
  items: ReadonlyArray<T>,
  keyOf: (item: T) => string | null,
): ReadonlyArray<T> => {
  const seen = new Set<string>()
  return items.filter((item) => {
    const key = keyOf(item)
    if (!key) return false
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

const toMedia = (row: DbRow): MediaCard => ({
  mediaKey: schemaString<DdfMediaRecord>(row, 'MediaKey', 'mediaKey'),
  mediaUrl: mediaUrlFromRow(row),
  mediaCategory: schemaString<DdfMediaRecord>(
    row,
    'MediaCategory',
    'mediaCategory',
  ),
  longDescription: schemaString<DdfMediaRecord>(
    row,
    'LongDescription',
    'longDescription',
  ),
  preferredPhoto: schemaBoolean<DdfMediaRecord>(
    row,
    'PreferredPhotoYN',
    'preferredPhoto',
  ),
  sortOrder: schemaNumber<DdfMediaRecord>(row, 'Order', 'sortOrder'),
})

const toSocialMedia = (row: DbRow): SocialMediaCard => ({
  socialMediaKey: stringValue(row, 'socialMediaKey'),
  socialMediaType: stringValue(row, 'socialMediaType'),
  socialMediaUrlOrId: stringValue(row, 'socialMediaUrlOrId'),
})

const stringItems = (row: DbRow, collectionKey: string, valueKey: string) =>
  arrayValue(row, collectionKey).flatMap((item) => {
    const value = stringValue(item, valueKey)
    return value === null ? [] : [value]
  })

const schemaStringItems = <T extends object>(
  row: DbRow,
  key: SchemaKey<T>,
  dbKey?: string,
) => {
  const value = schemaValue<T>(row, key, dbKey)
  return Array.isArray(value)
    ? value.flatMap((item) =>
        typeof item === 'string' && item.length > 0 ? [item] : [],
      )
    : []
}

const memberLanguages = (row: DbRow) =>
  uniqueSorted([
    ...stringItems(row, 'languages', 'language'),
    ...schemaStringItems<DdfMember>(row, 'MemberLanguages', 'memberLanguages'),
  ])

const memberDesignations = (row: DbRow) =>
  uniqueSorted([
    ...stringItems(row, 'designations', 'designation'),
    ...schemaStringItems<DdfMember>(
      row,
      'MemberDesignation',
      'memberDesignation',
    ),
  ])

const toRoom = (row: DbRow): RoomCard => ({
  roomKey: schemaString<DdfRoomRecord>(row, 'RoomKey', 'roomKey'),
  roomType: schemaString<DdfRoomRecord>(row, 'RoomType', 'roomType'),
  roomLevel: schemaString<DdfRoomRecord>(row, 'RoomLevel', 'roomLevel'),
  roomDimensions: schemaString<DdfRoomRecord>(
    row,
    'RoomDimensions',
    'roomDimensions',
  ),
  roomDescription: schemaString<DdfRoomRecord>(
    row,
    'RoomDescription',
    'roomDescription',
  ),
  roomLength: schemaNumber<DdfRoomRecord>(row, 'RoomLength', 'roomLength'),
  roomWidth: schemaNumber<DdfRoomRecord>(row, 'RoomWidth', 'roomWidth'),
  roomLengthWidthUnits: schemaString<DdfRoomRecord>(
    row,
    'RoomLengthWidthUnits',
    'roomLengthWidthUnits',
  ),
})

const toOffice = (row: DbRow | null | undefined): OfficeCard | null => {
  if (!row) return null
  const officeKey = schemaString<DdfOffice>(row, 'OfficeKey', 'officeKey')
  if (!officeKey) return null
  return {
    officeKey,
    officeMlsId: schemaString<DdfOffice>(row, 'OfficeMlsId', 'officeMlsId'),
    officeAorKey: schemaString<DdfOffice>(row, 'OfficeAORKey', 'officeAorKey'),
    officeAor: schemaString<DdfOffice>(row, 'OfficeAOR', 'officeAor'),
    officeNationalAssociationId: schemaString<DdfOffice>(
      row,
      'OfficeNationalAssociationId',
      'officeNationalAssociationId',
    ),
    franchiseNationalAssociationId: schemaString<DdfOffice>(
      row,
      'FranchiseNationalAssociationId',
      'franchiseNationalAssociationId',
    ),
    officeBrokerNationalAssociationId: schemaString<DdfOffice>(
      row,
      'OfficeBrokerNationalAssociationId',
      'officeBrokerNationalAssociationId',
    ),
    officeName: schemaString<DdfOffice>(row, 'OfficeName', 'officeName'),
    phone: schemaString<DdfOffice>(row, 'OfficePhone', 'phone'),
    phoneExt: schemaString<DdfOffice>(row, 'OfficePhoneExt', 'phoneExt'),
    fax: schemaString<DdfOffice>(row, 'OfficeFax', 'fax'),
    city: schemaString<DdfOffice>(row, 'OfficeCity', 'city'),
    province: schemaString<DdfOffice>(row, 'OfficeStateOrProvince', 'province'),
    country: schemaString<DdfOffice>(row, 'OfficeCountry', 'country'),
    address:
      [
        schemaString<DdfOffice>(row, 'OfficeAddress1', 'address1'),
        schemaString<DdfOffice>(row, 'OfficeAddress2', 'address2'),
      ]
        .filter(Boolean)
        .join(', ') || null,
    postalCode: schemaString<DdfOffice>(row, 'OfficePostalCode', 'postalCode'),
    officeType: schemaString<DdfOffice>(row, 'OfficeType', 'officeType'),
    officeStatus: schemaString<DdfOffice>(row, 'OfficeStatus', 'officeStatus'),
    imageUrl: imageFromRow(row),
    media: mediaRowsFrom(row).map(toMedia),
    socialMedia: arrayValue(row, 'socialMedia').map(toSocialMedia),
  }
}

const toPerson = (row: DbRow | null | undefined): PersonCard | null => {
  if (!row) return null
  const memberKey = schemaString<DdfMember>(row, 'MemberKey', 'memberKey')
  if (!memberKey) return null
  return {
    memberKey,
    memberMlsId: schemaString<DdfMember>(row, 'MemberMlsId', 'memberMlsId'),
    nationalAssociationId: schemaString<DdfMember>(
      row,
      'MemberNationalAssociationId',
      'nationalAssociationId',
    ),
    officeNationalAssociationId: schemaString<DdfMember>(
      row,
      'OfficeNationalAssociationId',
      'officeNationalAssociationId',
    ),
    firstName: schemaString<DdfMember>(row, 'MemberFirstName', 'firstName'),
    lastName: schemaString<DdfMember>(row, 'MemberLastName', 'lastName'),
    middleName: schemaString<DdfMember>(row, 'MemberMiddleName', 'middleName'),
    nickname: schemaString<DdfMember>(row, 'MemberNickname', 'nickname'),
    jobTitle: schemaString<DdfMember>(row, 'JobTitle', 'jobTitle'),
    phone: schemaString<DdfMember>(row, 'MemberOfficePhone', 'phone'),
    phoneExt: schemaString<DdfMember>(
      row,
      'MemberOfficePhoneExt',
      'officePhoneExt',
    ),
    tollFreePhone: schemaString<DdfMember>(
      row,
      'MemberTollFreePhone',
      'tollFreePhone',
    ),
    fax: schemaString<DdfMember>(row, 'MemberFax', 'fax'),
    address:
      [
        schemaString<DdfMember>(row, 'MemberAddress1', 'address1'),
        schemaString<DdfMember>(row, 'MemberAddress2', 'address2'),
      ]
        .filter(Boolean)
        .join(', ') || null,
    city: schemaString<DdfMember>(row, 'MemberCity', 'city'),
    province: schemaString<DdfMember>(row, 'MemberStateOrProvince', 'province'),
    postalCode: schemaString<DdfMember>(row, 'MemberPostalCode', 'postalCode'),
    country: schemaString<DdfMember>(row, 'MemberCountry', 'country'),
    status: schemaString<DdfMember>(row, 'MemberStatus', 'status'),
    type: schemaString<DdfMember>(row, 'MemberType', 'type'),
    memberAor: schemaString<DdfMember>(row, 'MemberAOR', 'memberAor'),
    memberAorKey: schemaString<DdfMember>(row, 'MemberAORKey', 'memberAorKey'),
    officeKey: schemaString<DdfMember>(row, 'OfficeKey', 'officeKey'),
    office: toOffice(asRecord(row.office)),
    imageUrl: imageFromRow(row),
    media: mediaRowsFrom(row).map(toMedia),
    languages: memberLanguages(row),
    designations: memberDesignations(row),
    socialMedia: arrayValue(row, 'socialMedia').map(toSocialMedia),
  }
}

const toOpenHouse = (row: DbRow | null | undefined): OpenHouseCard | null => {
  if (!row) return null
  const openHouseKey = schemaString<DdfOpenHouse>(
    row,
    'OpenHouseKey',
    'openHouseKey',
  )
  if (!openHouseKey) return null
  return {
    openHouseKey,
    listingKey: schemaString<DdfOpenHouse>(row, 'ListingKey', 'listingKey'),
    listingId: schemaString<DdfOpenHouse>(row, 'ListingId', 'listingId'),
    date: schemaDate<DdfOpenHouse>(row, 'OpenHouseDate', 'openHouseDate'),
    startTime: schemaString<DdfOpenHouse>(
      row,
      'OpenHouseStartTime',
      'openHouseStartTime',
    ),
    endTime: schemaString<DdfOpenHouse>(
      row,
      'OpenHouseEndTime',
      'openHouseEndTime',
    ),
    type: schemaString<DdfOpenHouse>(row, 'OpenHouseType', 'openHouseType'),
    status: schemaString<DdfOpenHouse>(
      row,
      'OpenHouseStatus',
      'openHouseStatus',
    ),
    remarks: schemaString<DdfOpenHouse>(
      row,
      'OpenHouseRemarks',
      'openHouseRemarks',
    ),
    property:
      row.property === undefined ? null : toListingCard(asRecord(row.property)),
  }
}

const toListingCard = (row: DbRow): ListingCard => {
  const listingKey =
    schemaString<DdfProperty>(row, 'ListingKey', 'listingKey') ?? ''
  const listAgent = toPerson(asRecord(row.listAgent))
  const agents = uniqueBy(
    [
      ...(listAgent ? [listAgent] : []),
      ...arrayValue(row, 'coListAgents').flatMap((item) => {
        const agent = toPerson(item)
        return agent === null ? [] : [agent]
      }),
    ],
    (agent) => agent.memberKey,
  )
  const listOffice = toOffice(asRecord(row.listOffice))
  const offices = uniqueBy(
    [
      ...(listOffice ? [listOffice] : []),
      ...arrayValue(row, 'coListOffices').flatMap((item) => {
        const office = toOffice(item)
        return office === null ? [] : [office]
      }),
    ],
    (office) => office.officeKey,
  )

  return {
    listingKey,
    listingId: schemaString<DdfProperty>(row, 'ListingId', 'listingId'),
    address: displayAddress(row),
    city: schemaString<DdfProperty>(row, 'City', 'city') ?? '',
    province:
      schemaString<DdfProperty>(row, 'StateOrProvince', 'province') ?? '',
    status: schemaString<DdfProperty>(row, 'StandardStatus', 'standardStatus'),
    propertySubType: schemaString<DdfProperty>(
      row,
      'PropertySubType',
      'propertySubType',
    ),
    price: schemaNumber<DdfProperty>(row, 'ListPrice', 'listPrice'),
    leaseAmount: schemaNumber<DdfProperty>(row, 'LeaseAmount', 'leaseAmount'),
    leaseFrequency: schemaString<DdfProperty>(
      row,
      'LeaseAmountFrequency',
      'leaseAmountFrequency',
    ),
    bedrooms: schemaNumber<DdfProperty>(row, 'BedroomsTotal', 'bedroomsTotal'),
    bathrooms: schemaNumber<DdfProperty>(
      row,
      'BathroomsTotalInteger',
      'bathroomsTotalInteger',
    ),
    parking: schemaNumber<DdfProperty>(row, 'ParkingTotal', 'parkingTotal'),
    imageUrl: imageFromRow(row),
    remarks: schemaString<DdfProperty>(row, 'PublicRemarks', 'publicRemarks'),
    modifiedAt: schemaDate<DdfProperty>(
      row,
      'ModificationTimestamp',
      'modificationTimestamp',
    ),
    agent: listAgent ?? agents.at(0) ?? null,
    office: listOffice ?? offices.at(0) ?? null,
    agents,
    offices,
    openHouses: arrayValue(row, 'openHouses').flatMap((item) => {
      const openHouse = toOpenHouse(item)
      return openHouse === null ? [] : [openHouse]
    }),
  }
}

const formatDetailValue = (value: DbValue | undefined): string | null => {
  if (value === undefined || value === null) return null
  if (value instanceof Date) return value.toISOString()
  if (typeof value === 'string') return value.trim().length > 0 ? value : null
  if (typeof value === 'number')
    return Number.isFinite(value) ? String(value) : null
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (Array.isArray(value)) {
    const items = value
      .map((item) => formatDetailValue(item as DbValue))
      .filter((item): item is string => item !== null)
    return items.length > 0 ? items.join(', ') : null
  }
  return null
}

const fact = (row: DbRow, label: string, key: string): DetailFact | null => {
  const value = formatDetailValue(row[key])
  return value === null ? null : { label, value }
}

const factValue = (
  label: string,
  value: string | number | null,
): DetailFact | null =>
  value === null || value === '' ? null : { label, value: String(value) }

const valueWithUnits = (
  row: DbRow,
  valueKey: string,
  unitsKey: string,
): string | null => {
  const value = formatDetailValue(row[valueKey])
  if (value === null) return null
  const units = formatDetailValue(row[unitsKey])
  return [value, units].filter(Boolean).join(' ')
}

const detailGroup = (
  title: string,
  facts: ReadonlyArray<DetailFact | null>,
): DetailGroup | null => {
  const present = facts.filter((item): item is DetailFact => item !== null)
  return present.length === 0 ? null : { title, facts: present }
}

const detailGroupsFromRow = (row: DbRow): ReadonlyArray<DetailGroup> =>
  [
    detailGroup('Listing', [
      fact(row, 'Listing ID', 'listingId'),
      fact(row, 'Status', 'standardStatus'),
      fact(row, 'Property type', 'propertySubType'),
      fact(row, 'Business type', 'businessType'),
      fact(row, 'List AOR', 'listAor'),
      fact(row, 'Originating system', 'originatingSystemName'),
      fact(row, 'Modified', 'modificationTimestamp'),
      fact(row, 'Original entry', 'originalEntryTimestamp'),
      fact(row, 'Availability', 'availabilityDate'),
      fact(row, 'Status changed', 'statusChangeTimestamp'),
      fact(row, 'Photos changed', 'photosChangeTimestamp'),
    ]),
    detailGroup('Price and Terms', [
      fact(row, 'List price', 'listPrice'),
      fact(row, 'Lease amount', 'leaseAmount'),
      fact(row, 'Lease frequency', 'leaseAmountFrequency'),
      fact(row, 'Lease per unit', 'leasePerUnit'),
      fact(row, 'Price per unit', 'pricePerUnit'),
      fact(row, 'Association fee', 'associationFee'),
      fact(row, 'Association fee frequency', 'associationFeeFrequency'),
      fact(row, 'Association fee includes', 'associationFeeIncludes'),
      fact(row, 'Total actual rent', 'totalActualRent'),
      fact(row, 'Existing lease type', 'existingLeaseType'),
    ]),
    detailGroup('Location', [
      fact(row, 'Address', 'unparsedAddress'),
      fact(row, 'City', 'city'),
      fact(row, 'City region', 'cityRegion'),
      fact(row, 'Province', 'province'),
      fact(row, 'Postal code', 'postalCode'),
      fact(row, 'Country', 'country'),
      fact(row, 'Subdivision', 'subdivisionName'),
      fact(row, 'Directions', 'directions'),
      fact(row, 'Latitude', 'latitude'),
      fact(row, 'Longitude', 'longitude'),
      fact(row, 'Map verified', 'mapCoordinateVerified'),
    ]),
    detailGroup('Building', [
      fact(row, 'Bedrooms total', 'bedroomsTotal'),
      fact(row, 'Bedrooms above grade', 'bedroomsAboveGrade'),
      fact(row, 'Bedrooms below grade', 'bedroomsBelowGrade'),
      fact(row, 'Bathrooms total', 'bathroomsTotalInteger'),
      fact(row, 'Partial bathrooms', 'bathroomsPartial'),
      fact(row, 'Parking total', 'parkingTotal'),
      fact(row, 'Year built', 'yearBuilt'),
      factValue(
        'Building area',
        valueWithUnits(row, 'buildingAreaTotal', 'buildingAreaUnits'),
      ),
      factValue(
        'Living area',
        valueWithUnits(row, 'livingArea', 'livingAreaUnits'),
      ),
      factValue(
        'Above grade finished area',
        valueWithUnits(
          row,
          'aboveGradeFinishedArea',
          'aboveGradeFinishedAreaUnits',
        ),
      ),
      factValue(
        'Below grade finished area',
        valueWithUnits(
          row,
          'belowGradeFinishedArea',
          'belowGradeFinishedAreaUnits',
        ),
      ),
      fact(row, 'Stories', 'stories'),
      fact(row, 'Fireplace', 'fireplace'),
      fact(row, 'Fireplaces total', 'firePlacesTotal'),
      fact(row, 'Architectural style', 'architecturalStyle'),
      fact(row, 'Building features', 'buildingFeatures'),
      fact(row, 'Heating', 'heating'),
      fact(row, 'Cooling', 'cooling'),
      fact(row, 'Basement', 'basement'),
      fact(row, 'Flooring', 'flooring'),
      fact(row, 'Exterior features', 'exteriorFeatures'),
      fact(row, 'Construction materials', 'constructionMaterials'),
      fact(row, 'Roof', 'roof'),
    ]),
    detailGroup('Lot and Exterior', [
      factValue('Lot size', valueWithUnits(row, 'lotSizeArea', 'lotSizeUnits')),
      fact(row, 'Lot dimensions', 'lotSizeDimensions'),
      fact(row, 'Lot features', 'lotFeatures'),
      fact(row, 'Water body', 'waterBodyName'),
      fact(row, 'Waterfront features', 'waterfrontFeatures'),
      fact(row, 'View', 'view'),
      factValue(
        'Frontage length',
        valueWithUnits(
          row,
          'frontageLengthNumeric',
          'frontageLengthNumericUnits',
        ),
      ),
      fact(row, 'Fencing', 'fencing'),
      fact(row, 'Pool features', 'poolFeatures'),
    ]),
    detailGroup('Systems and Included Items', [
      fact(row, 'Utilities', 'utilities'),
      fact(row, 'Water source', 'waterSource'),
      fact(row, 'Sewer', 'sewer'),
      fact(row, 'Electric', 'electric'),
      fact(row, 'Irrigation source', 'irrigationSource'),
      fact(row, 'Appliances', 'appliances'),
      fact(row, 'Other equipment', 'otherEquipment'),
      fact(row, 'Security features', 'securityFeatures'),
      fact(row, 'Inclusions', 'inclusions'),
    ]),
    detailGroup('Tax and Zoning', [
      fact(row, 'Annual tax', 'taxAnnualAmount'),
      fact(row, 'Tax year', 'taxYear'),
      fact(row, 'Zoning', 'zoning'),
      fact(row, 'Zoning description', 'zoningDescription'),
      fact(row, 'Parcel number', 'parcelNumber'),
    ]),
  ].filter((group): group is DetailGroup => group !== null)

const toListingDetail = (
  row: DbRow | null | undefined,
): ListingDetail | null => {
  if (!row) return null
  const card = toListingCard(row)
  if (!card.listingKey) return null
  return {
    ...card,
    latitude: schemaNumber<DdfProperty>(row, 'Latitude', 'latitude'),
    longitude: schemaNumber<DdfProperty>(row, 'Longitude', 'longitude'),
    photosCount: schemaNumber<DdfProperty>(row, 'PhotosCount', 'photosCount'),
    lotSize: schemaNumber<DdfProperty>(row, 'LotSizeArea', 'lotSizeArea'),
    lotSizeUnits: schemaString<DdfProperty>(
      row,
      'LotSizeUnits',
      'lotSizeUnits',
    ),
    livingArea: schemaNumber<DdfProperty>(row, 'LivingArea', 'livingArea'),
    livingAreaUnits: schemaString<DdfProperty>(
      row,
      'LivingAreaUnits',
      'livingAreaUnits',
    ),
    yearBuilt: schemaNumber<DdfProperty>(row, 'YearBuilt', 'yearBuilt'),
    rooms: arrayValue(row, 'rooms').map((room) =>
      toRoom(room as DbRow & DdfRoomRecord),
    ),
    media: mediaRowsFrom(row).map(toMedia),
    detailGroups: detailGroupsFromRow(row),
  }
}

const listingFilters = (search: ListingSearch) => ({
  active: true,
  standardStatus: search.status || undefined,
  propertySubType: search.type || undefined,
  city: search.city || undefined,
  province: search.province || undefined,
  minPrice: numericFilter(search.minPrice),
  maxPrice: numericFilter(search.maxPrice),
  minBedrooms: numericFilter(search.minBeds),
  maxBedrooms: numericFilter(search.maxBeds),
  minBathrooms: numericFilter(search.minBaths),
  maxBathrooms: numericFilter(search.maxBaths),
  minParking: numericFilter(search.minParking),
  appliances: search.appliances,
  basement: search.basement,
  waterSource: search.waterSource,
  sewer: search.sewer,
  waterfrontFeatures: search.waterfrontFeatures,
  heating: search.heating,
  cooling: search.cooling,
  parkingFeatures: search.parkingFeatures,
})

const groupedListingFilters = (
  search: ListingSearch,
  group: ListingGroupDefinition,
) => {
  const filters = { ...listingFilters(search) }
  const suppressed = new Set(group.suppressedSearchKeys ?? [])
  if (suppressed.has('city')) filters.city = undefined
  if (suppressed.has('province')) filters.province = undefined
  if (suppressed.has('status')) filters.standardStatus = undefined
  if (suppressed.has('type')) filters.propertySubType = undefined
  return filters
}

const groupValueParts = (value: unknown): ReadonlyArray<string | number> => {
  if (Array.isArray(value)) return value.flatMap(groupValueParts)
  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed.length > 0 ? [trimmed] : []
  }
  if (typeof value === 'number' && Number.isFinite(value)) return [value]
  return []
}

const groupValuesFromRow = (
  row: DbRow,
  group: ListingGroupDefinition,
): ReadonlyArray<string | number> => {
  const seen = new Set<string>()
  return groupValueParts(
    schemaValue<DdfProperty>(row, group.schemaKey, group.field),
  )
    .map((value) => ({
      value,
      slug: slugifyGroupValue(value),
    }))
    .filter(({ slug }) => {
      if (seen.has(slug)) return false
      seen.add(slug)
      return true
    })
    .map(({ value }) => value)
}

const rowHasGroupValueSlug = (
  row: DbRow,
  group: ListingGroupDefinition,
  valueSlug: string,
) =>
  groupValuesFromRow(row, group).some(
    (value) => slugifyGroupValue(value) === valueSlug,
  )

const listingKeyFromRow = (row: DbRow) =>
  schemaString<DdfProperty>(row, 'ListingKey', 'listingKey')

type ListingGroupIndex = {
  readonly summaries: ReadonlyArray<ListingGroupSummary>
  readonly topValues: ReadonlyArray<ListingGroupValueLink>
  readonly valuesByGroup: ReadonlyMap<
    string,
    ReadonlyArray<ListingGroupValueLink>
  >
}

type ListingGroupValueAccumulator = {
  readonly value: string
  count: number
}

const GROUPED_RELATED_VALUE_LIMIT = 36

const sortGroupValueLinks = (values: ReadonlyArray<ListingGroupValueLink>) =>
  [...values].sort(
    (left, right) =>
      right.count - left.count || left.value.localeCompare(right.value),
  )

const makeGroupValueLink = (
  group: ListingGroupDefinition,
  valueSlug: string,
  value: string,
  count: number,
): ListingGroupValueLink => ({
  groupSlug: group.slug,
  groupLabel: group.label,
  pluralLabel: group.pluralLabel,
  value,
  valueSlug,
  count,
})

const listingGroupBuckets = (
  index: ListingGroupIndex,
): ReadonlyArray<ListingGroupBucket> =>
  index.summaries.flatMap((summary) => {
    const groupOption = listingGroupDefinitionOption(summary.groupSlug)
    if (Option.isNone(groupOption)) return []

    return [
      {
        group: listingGroupPublicInfo(groupOption.value),
        summary,
        values: index.valuesByGroup.get(summary.groupSlug) ?? [],
      } satisfies ListingGroupBucket,
    ]
  })

const listingAgentKeys = (row: DbRow) =>
  [
    schemaString<DdfProperty>(row, 'ListAgentKey', 'listAgentKey'),
    schemaString<DdfProperty>(row, 'CoListAgentKey', 'coListAgentKey'),
    schemaString<DdfProperty>(row, 'CoListAgentKey2', 'coListAgentKey2'),
    schemaString<DdfProperty>(row, 'CoListAgentKey3', 'coListAgentKey3'),
  ].filter((key): key is string => key !== null)

const listingOfficeKeys = (row: DbRow) =>
  [
    schemaString<DdfProperty>(row, 'ListOfficeKey', 'listOfficeKey'),
    schemaString<DdfProperty>(row, 'CoListOfficeKey', 'coListOfficeKey'),
    schemaString<DdfProperty>(row, 'CoListOfficeKey2', 'coListOfficeKey2'),
    schemaString<DdfProperty>(row, 'CoListOfficeKey3', 'coListOfficeKey3'),
  ].filter((key): key is string => key !== null)

const listingHasAgent = (row: DbRow, agentKey: string) =>
  listingAgentKeys(row).includes(agentKey)

const listingHasOffice = (row: DbRow, officeKey: string) =>
  listingOfficeKeys(row).includes(officeKey)

const listingOrder = (
  sort: ListingSort,
): ReadonlyArray<{
  readonly field: PropertyField
  readonly direction: 'asc' | 'desc'
}> => {
  switch (sort) {
    case 'price-asc':
      return [{ field: 'listPrice', direction: 'asc' }]
    case 'price-desc':
      return [{ field: 'listPrice', direction: 'desc' }]
    case 'beds-desc':
      return [{ field: 'bedroomsTotal', direction: 'desc' }]
    case 'newest':
    default:
      return [{ field: 'modificationTimestamp', direction: 'desc' }]
  }
}

const listingSelect = [
  'listingKey',
  'listingId',
  'unparsedAddress',
  'listPrice',
  'leaseAmount',
  'leaseAmountFrequency',
  'city',
  'province',
  'standardStatus',
  'propertySubType',
  'bedroomsTotal',
  'bathroomsTotalInteger',
  'parkingTotal',
  'primaryMediaUrl',
  'publicRemarks',
  'modificationTimestamp',
  'listAgentKey',
  'coListAgentKey',
  'coListAgentKey2',
  'coListAgentKey3',
  'listOfficeKey',
  'coListOfficeKey',
  'coListOfficeKey2',
  'coListOfficeKey3',
] as const

const activePropertyKeySelect = [
  'listAgentKey',
  'coListAgentKey',
  'coListAgentKey2',
  'coListAgentKey3',
  'listOfficeKey',
  'coListOfficeKey',
  'coListOfficeKey2',
  'coListOfficeKey3',
] as const

const detailSelect = [
  ...listingSelect,
  'latitude',
  'longitude',
  'originalEntryTimestamp',
  'availabilityDate',
  'statusChangeTimestamp',
  'photosChangeTimestamp',
  'photosCount',
  'businessType',
  'leasePerUnit',
  'pricePerUnit',
  'associationFee',
  'associationFeeFrequency',
  'associationFeeIncludes',
  'totalActualRent',
  'existingLeaseType',
  'originatingSystemName',
  'listAor',
  'listingUrl',
  'postalCode',
  'country',
  'subdivisionName',
  'directions',
  'cityRegion',
  'mapCoordinateVerified',
  'bathroomsPartial',
  'bedroomsAboveGrade',
  'bedroomsBelowGrade',
  'buildingAreaTotal',
  'buildingAreaUnits',
  'buildingFeatures',
  'aboveGradeFinishedArea',
  'aboveGradeFinishedAreaUnits',
  'belowGradeFinishedArea',
  'belowGradeFinishedAreaUnits',
  'lotSizeArea',
  'lotSizeDimensions',
  'lotSizeUnits',
  'livingArea',
  'livingAreaUnits',
  'firePlacesTotal',
  'fireplace',
  'architecturalStyle',
  'heating',
  'basement',
  'exteriorFeatures',
  'flooring',
  'cooling',
  'constructionMaterials',
  'roof',
  'stories',
  'zoning',
  'zoningDescription',
  'taxAnnualAmount',
  'taxYear',
  'parcelNumber',
  'utilities',
  'irrigationSource',
  'waterSource',
  'sewer',
  'electric',
  'waterBodyName',
  'view',
  'lotFeatures',
  'poolFeatures',
  'waterfrontFeatures',
  'frontageLengthNumeric',
  'frontageLengthNumericUnits',
  'fencing',
  'appliances',
  'otherEquipment',
  'securityFeatures',
  'inclusions',
  'yearBuilt',
] as const

type ListingGroupValueKind = 'scalar' | 'array'

type ListingGroupDefinition = {
  readonly slug: string
  readonly field: PropertyField
  readonly schemaKey: SchemaKey<DdfProperty>
  readonly label: string
  readonly pluralLabel: string
  readonly description: string
  readonly valueKind: ListingGroupValueKind
  readonly suppressedSearchKeys?: ReadonlyArray<ListingGroupSearchKey>
}

const listingGroupDefinitions = [
  {
    slug: 'property-sub-type',
    field: 'propertySubType',
    schemaKey: 'PropertySubType',
    label: 'Property type',
    pluralLabel: 'Property types',
    description: 'Listings grouped by CREA property subtype.',
    valueKind: 'scalar',
    suppressedSearchKeys: ['type'],
  },
  {
    slug: 'business-type',
    field: 'businessType',
    schemaKey: 'BusinessType',
    label: 'Business type',
    pluralLabel: 'Business types',
    description: 'Commercial listings grouped by business category.',
    valueKind: 'array',
  },
  {
    slug: 'lease-amount-frequency',
    field: 'leaseAmountFrequency',
    schemaKey: 'LeaseAmountFrequency',
    label: 'Lease frequency',
    pluralLabel: 'Lease frequencies',
    description: 'Listings grouped by lease payment frequency.',
    valueKind: 'scalar',
  },
  {
    slug: 'lease-per-unit',
    field: 'leasePerUnit',
    schemaKey: 'LeasePerUnit',
    label: 'Lease per unit',
    pluralLabel: 'Lease per unit values',
    description: 'Listings grouped by lease area unit.',
    valueKind: 'scalar',
  },
  {
    slug: 'price-per-unit',
    field: 'pricePerUnit',
    schemaKey: 'PricePerUnit',
    label: 'Price per unit',
    pluralLabel: 'Price per unit values',
    description: 'Listings grouped by sale price area unit.',
    valueKind: 'scalar',
  },
  {
    slug: 'water-body-name',
    field: 'waterBodyName',
    schemaKey: 'WaterBodyName',
    label: 'Water body',
    pluralLabel: 'Water bodies',
    description: 'Listings grouped by attached lake, river, ocean, or canal.',
    valueKind: 'scalar',
  },
  {
    slug: 'view',
    field: 'view',
    schemaKey: 'View',
    label: 'View',
    pluralLabel: 'Views',
    description: 'Listings grouped by view features.',
    valueKind: 'array',
  },
  {
    slug: 'number-of-buildings',
    field: 'numberOfBuildings',
    schemaKey: 'NumberOfBuildings',
    label: 'Number of buildings',
    pluralLabel: 'Building counts',
    description: 'Listings grouped by total building count.',
    valueKind: 'scalar',
  },
  {
    slug: 'number-of-units-total',
    field: 'numberOfUnitsTotal',
    schemaKey: 'NumberOfUnitsTotal',
    label: 'Number of units',
    pluralLabel: 'Unit counts',
    description: 'Listings grouped by total unit count.',
    valueKind: 'scalar',
  },
  {
    slug: 'lot-features',
    field: 'lotFeatures',
    schemaKey: 'LotFeatures',
    label: 'Lot feature',
    pluralLabel: 'Lot features',
    description: 'Listings grouped by lot features.',
    valueKind: 'array',
  },
  {
    slug: 'lot-size-area',
    field: 'lotSizeArea',
    schemaKey: 'LotSizeArea',
    label: 'Lot size area',
    pluralLabel: 'Lot size areas',
    description: 'Listings grouped by exact lot size area.',
    valueKind: 'scalar',
  },
  {
    slug: 'neighborhood',
    field: 'cityRegion',
    schemaKey: 'CityRegion',
    label: 'Neighborhood',
    pluralLabel: 'Neighborhoods',
    description: 'Listings grouped by city region or neighborhood.',
    valueKind: 'scalar',
  },
  {
    slug: 'subdivision-name',
    field: 'subdivisionName',
    schemaKey: 'SubdivisionName',
    label: 'Subdivision',
    pluralLabel: 'Subdivisions',
    description: 'Listings grouped by subdivision name.',
    valueKind: 'scalar',
  },
  {
    slug: 'community-features',
    field: 'communityFeatures',
    schemaKey: 'CommunityFeatures',
    label: 'Community feature',
    pluralLabel: 'Community features',
    description: 'Listings grouped by community feature.',
    valueKind: 'array',
  },
  {
    slug: 'parking-features',
    field: 'parkingFeatures',
    schemaKey: 'ParkingFeatures',
    label: 'Parking feature',
    pluralLabel: 'Parking features',
    description: 'Listings grouped by parking feature.',
    valueKind: 'array',
  },
  {
    slug: 'architectural-style',
    field: 'architecturalStyle',
    schemaKey: 'ArchitecturalStyle',
    label: 'Architectural style',
    pluralLabel: 'Architectural styles',
    description: 'Listings grouped by architectural style.',
    valueKind: 'array',
  },
  {
    slug: 'building-features',
    field: 'buildingFeatures',
    schemaKey: 'BuildingFeatures',
    label: 'Building feature',
    pluralLabel: 'Building features',
    description: 'Listings grouped by building feature.',
    valueKind: 'array',
  },
  {
    slug: 'heating',
    field: 'heating',
    schemaKey: 'Heating',
    label: 'Heating',
    pluralLabel: 'Heating values',
    description: 'Listings grouped by heating system.',
    valueKind: 'array',
  },
  {
    slug: 'cooling',
    field: 'cooling',
    schemaKey: 'Cooling',
    label: 'Cooling',
    pluralLabel: 'Cooling values',
    description: 'Listings grouped by cooling system.',
    valueKind: 'array',
  },
  {
    slug: 'basement',
    field: 'basement',
    schemaKey: 'Basement',
    label: 'Basement',
    pluralLabel: 'Basement values',
    description: 'Listings grouped by basement type.',
    valueKind: 'array',
  },
  {
    slug: 'exterior-features',
    field: 'exteriorFeatures',
    schemaKey: 'ExteriorFeatures',
    label: 'Exterior feature',
    pluralLabel: 'Exterior features',
    description: 'Listings grouped by exterior feature.',
    valueKind: 'array',
  },
  {
    slug: 'flooring',
    field: 'flooring',
    schemaKey: 'Flooring',
    label: 'Flooring',
    pluralLabel: 'Flooring values',
    description: 'Listings grouped by flooring.',
    valueKind: 'array',
  },
  {
    slug: 'construction-materials',
    field: 'constructionMaterials',
    schemaKey: 'ConstructionMaterials',
    label: 'Construction material',
    pluralLabel: 'Construction materials',
    description: 'Listings grouped by construction material.',
    valueKind: 'array',
  },
  {
    slug: 'roof',
    field: 'roof',
    schemaKey: 'Roof',
    label: 'Roof',
    pluralLabel: 'Roof values',
    description: 'Listings grouped by roof type.',
    valueKind: 'array',
  },
  {
    slug: 'utilities',
    field: 'utilities',
    schemaKey: 'Utilities',
    label: 'Utility',
    pluralLabel: 'Utilities',
    description: 'Listings grouped by available utility.',
    valueKind: 'array',
  },
  {
    slug: 'water-source',
    field: 'waterSource',
    schemaKey: 'WaterSource',
    label: 'Water source',
    pluralLabel: 'Water sources',
    description: 'Listings grouped by water source.',
    valueKind: 'array',
  },
  {
    slug: 'sewer',
    field: 'sewer',
    schemaKey: 'Sewer',
    label: 'Sewer',
    pluralLabel: 'Sewer values',
    description: 'Listings grouped by sewer service.',
    valueKind: 'array',
  },
  {
    slug: 'electric',
    field: 'electric',
    schemaKey: 'Electric',
    label: 'Electric',
    pluralLabel: 'Electric values',
    description: 'Listings grouped by electric service.',
    valueKind: 'array',
  },
  {
    slug: 'waterfront-features',
    field: 'waterfrontFeatures',
    schemaKey: 'WaterfrontFeatures',
    label: 'Waterfront feature',
    pluralLabel: 'Waterfront features',
    description: 'Listings grouped by waterfront feature.',
    valueKind: 'array',
  },
  {
    slug: 'pool-features',
    field: 'poolFeatures',
    schemaKey: 'PoolFeatures',
    label: 'Pool feature',
    pluralLabel: 'Pool features',
    description: 'Listings grouped by pool feature.',
    valueKind: 'array',
  },
  {
    slug: 'appliances',
    field: 'appliances',
    schemaKey: 'Appliances',
    label: 'Appliance',
    pluralLabel: 'Appliances',
    description: 'Listings grouped by included appliance.',
    valueKind: 'array',
  },
  {
    slug: 'security-features',
    field: 'securityFeatures',
    schemaKey: 'SecurityFeatures',
    label: 'Security feature',
    pluralLabel: 'Security features',
    description: 'Listings grouped by security feature.',
    valueKind: 'array',
  },
  {
    slug: 'current-use',
    field: 'currentUse',
    schemaKey: 'CurrentUse',
    label: 'Current use',
    pluralLabel: 'Current uses',
    description: 'Listings grouped by current use.',
    valueKind: 'array',
  },
  {
    slug: 'possible-use',
    field: 'possibleUse',
    schemaKey: 'PossibleUse',
    label: 'Possible use',
    pluralLabel: 'Possible uses',
    description: 'Listings grouped by possible use.',
    valueKind: 'array',
  },
  {
    slug: 'zoning',
    field: 'zoning',
    schemaKey: 'Zoning',
    label: 'Zoning',
    pluralLabel: 'Zoning values',
    description: 'Listings grouped by zoning value.',
    valueKind: 'scalar',
  },
] as const satisfies ReadonlyArray<ListingGroupDefinition>

const listingGroupPublicInfo = (
  group: ListingGroupDefinition,
): ListingGroupRouteInfo => ({
  slug: group.slug,
  label: group.label,
  pluralLabel: group.pluralLabel,
  description: group.description,
  suppressedSearchKeys: group.suppressedSearchKeys ?? [],
})

const listingGroupDefinitionOption = (slug: string) =>
  Option.fromNullishOr(
    listingGroupDefinitions.find((group) => group.slug === slug),
  )

const uniquePropertyFields = (fields: ReadonlyArray<PropertyField>) =>
  Array.from(new Set(fields))

const listingGroupFields = uniquePropertyFields(
  listingGroupDefinitions.map((group) => group.field),
)

type ListingAdvancedFacetDefinition = {
  readonly key: ListingAdvancedFilterKey
  readonly field: PropertyField
  readonly schemaKey: SchemaKey<DdfProperty>
  readonly label: string
}

const listingAdvancedFacetDefinitions = [
  {
    key: 'appliances',
    field: 'appliances',
    schemaKey: 'Appliances',
    label: 'Appliances',
  },
  {
    key: 'basement',
    field: 'basement',
    schemaKey: 'Basement',
    label: 'Basement',
  },
  {
    key: 'waterSource',
    field: 'waterSource',
    schemaKey: 'WaterSource',
    label: 'Water source',
  },
  {
    key: 'sewer',
    field: 'sewer',
    schemaKey: 'Sewer',
    label: 'Sewer',
  },
  {
    key: 'waterfrontFeatures',
    field: 'waterfrontFeatures',
    schemaKey: 'WaterfrontFeatures',
    label: 'Waterfront',
  },
  {
    key: 'heating',
    field: 'heating',
    schemaKey: 'Heating',
    label: 'Heating',
  },
  {
    key: 'cooling',
    field: 'cooling',
    schemaKey: 'Cooling',
    label: 'Cooling',
  },
  {
    key: 'parkingFeatures',
    field: 'parkingFeatures',
    schemaKey: 'ParkingFeatures',
    label: 'Parking features',
  },
] as const satisfies ReadonlyArray<ListingAdvancedFacetDefinition>

const listingFacetSelect = uniquePropertyFields([
  'city',
  'province',
  'propertySubType',
  'standardStatus',
  'listPrice',
  'leaseAmount',
  'bedroomsTotal',
  'bathroomsTotalInteger',
  'parkingTotal',
  ...listingAdvancedFacetDefinitions.map((group) => group.field),
])

const groupedListingSelect = uniquePropertyFields([
  ...listingSelect,
  ...listingGroupFields,
])

const listingGroupIndexSelect = uniquePropertyFields([
  'listingKey',
  ...listingGroupFields,
])

const mediaSelect = [
  'mediaKey',
  'mediaUrl',
  'mediaCategory',
  'longDescription',
  'preferredPhoto',
  'sortOrder',
] as const

const socialMediaSelect = [
  'socialMediaKey',
  'socialMediaType',
  'socialMediaUrlOrId',
] as const
const languageSelect = ['language'] as const
const designationSelect = ['designation'] as const

const officeSelect = [
  'officeKey',
  'officeMlsId',
  'officeAorKey',
  'officeAor',
  'officeNationalAssociationId',
  'franchiseNationalAssociationId',
  'officeBrokerNationalAssociationId',
  'officeName',
  'phone',
  'phoneExt',
  'fax',
  'city',
  'province',
  'country',
  'address1',
  'address2',
  'postalCode',
  'officeType',
  'officeStatus',
  'media',
] as const

const memberSelect = [
  'memberKey',
  'memberMlsId',
  'nationalAssociationId',
  'officeNationalAssociationId',
  'firstName',
  'lastName',
  'middleName',
  'nickname',
  'jobTitle',
  'phone',
  'officePhoneExt',
  'tollFreePhone',
  'fax',
  'address1',
  'address2',
  'city',
  'province',
  'postalCode',
  'country',
  'status',
  'type',
  'memberAor',
  'memberAorKey',
  'officeKey',
  'media',
] as const

const officeInclude = {
  media: { select: mediaSelect },
  socialMedia: { select: socialMediaSelect },
} as const

const memberInclude = {
  media: { select: mediaSelect },
  socialMedia: { select: socialMediaSelect },
  languages: { select: languageSelect },
  designations: { select: designationSelect },
  office: {
    select: officeSelect,
  },
} as const

const propertyInclude = {
  media: {
    select: mediaSelect,
  },
  openHouses: {
    select: [
      'openHouseKey',
      'listingKey',
      'listingId',
      'openHouseDate',
      'openHouseStartTime',
      'openHouseEndTime',
      'openHouseType',
      'openHouseStatus',
    ],
  },
  listAgent: {
    select: memberSelect,
  },
  coListAgents: {
    select: memberSelect,
  },
  listOffice: {
    select: officeSelect,
  },
  coListOffices: {
    select: officeSelect,
  },
} as const

const detailInclude = {
  ...propertyInclude,
  rooms: {
    select: [
      'roomKey',
      'roomType',
      'roomLevel',
      'roomDimensions',
      'roomDescription',
      'roomLength',
      'roomWidth',
      'roomLengthWidthUnits',
    ],
  },
} as const

const numericOptions = (values: ReadonlyArray<number | null>) =>
  Array.from(
    new Set(
      values
        .filter((value): value is number => value !== null)
        .map((value) => Math.max(0, Math.round(value))),
    ),
  ).sort((left, right) => left - right)

const effectivePrice = (row: DbRow) =>
  schemaNumber<DdfProperty>(row, 'ListPrice', 'listPrice') ??
  schemaNumber<DdfProperty>(row, 'LeaseAmount', 'leaseAmount')

const nextPriceOption = (value: number) => {
  if (value < 5_000) return Math.ceil((value + 1) / 500) * 500
  if (value < 10_000) return Math.ceil((value + 1) / 1_000) * 1_000
  if (value < 100_000) return Math.ceil((value + 1) / 10_000) * 10_000
  if (value < 1_000_000) return Math.ceil((value + 1) / 50_000) * 50_000
  if (value < 5_000_000) return Math.ceil((value + 1) / 100_000) * 100_000
  return Math.ceil((value + 1) / 250_000) * 250_000
}

const priceOptions = (values: ReadonlyArray<number | null>) => {
  const prices = numericOptions(values).filter((value) => value > 0)
  const min = prices.at(0)
  const max = prices.at(-1)
  if (min === undefined || max === undefined) return []

  const options = new Set<number>([min])
  let next = nextPriceOption(min)
  while (next < max && options.size < 160) {
    options.add(next)
    next = nextPriceOption(next)
  }
  options.add(max)
  return Array.from(options).sort((left, right) => left - right)
}

const addAdvancedFacetValues = (
  valuesByKey: Map<ListingAdvancedFilterKey, Map<string, number>>,
  row: DbRow,
  definition: ListingAdvancedFacetDefinition,
) => {
  const values = valuesByKey.get(definition.key)
  if (values === undefined) return
  const seen = new Set<string>()
  for (const value of groupValueParts(
    schemaValue<DdfProperty>(row, definition.schemaKey, definition.field),
  )) {
    if (typeof value !== 'string') continue
    const trimmed = value.trim()
    if (trimmed.length === 0 || seen.has(trimmed)) continue
    seen.add(trimmed)
    values.set(trimmed, (values.get(trimmed) ?? 0) + 1)
  }
}

const facetOptions = (
  values: Map<string, number> | undefined,
): ReadonlyArray<ListingFacetOption> =>
  Array.from(values ?? [])
    .map(([value, count]) => ({ value, count }))
    .sort(
      (left, right) =>
        right.count - left.count || left.value.localeCompare(right.value),
    )
    .slice(0, 80)

const ddfClientLayer = DdfDbClient.layer.pipe(
  Layer.provide(DdfDatabase.layerConfig),
)

const runServerEffect = <TValue, TError>(
  effect: Effect.Effect<TValue, TError, DdfDbClient>,
): Promise<TValue> =>
  Effect.runPromise(effect.pipe(Effect.provide(ddfClientLayer)))

const buildFacets = Effect.fn('Listings.buildFacets')(function* () {
  const client = yield* DdfDbClient
  const rows: DbRow[] = []
  const advancedValuesByKey = new Map<
    ListingAdvancedFilterKey,
    Map<string, number>
  >(
    listingAdvancedFacetDefinitions.map((definition) => [
      definition.key,
      new Map<string, number>(),
    ]),
  )
  let offset = 0
  let hasMoreListings = true

  while (hasMoreListings) {
    const page = (yield* client.properties.list({
      select: listingFacetSelect,
      filters: { active: true },
      limit: 500,
      offset,
      orderBy: [{ field: 'modificationTimestamp', direction: 'desc' }],
    })) as ReadonlyArray<DbRow>

    rows.push(...page)
    for (const row of page) {
      for (const definition of listingAdvancedFacetDefinitions) {
        addAdvancedFacetValues(advancedValuesByKey, row, definition)
      }
    }

    hasMoreListings = page.length === 500
    offset += page.length
  }

  return {
    cities: uniqueSorted(
      rows.map((row) => schemaString<DdfProperty>(row, 'City', 'city')),
    ).slice(0, 80),
    provinces: uniqueSorted(
      rows.map((row) =>
        schemaString<DdfProperty>(row, 'StateOrProvince', 'province'),
      ),
    ),
    statuses: uniqueSorted(
      rows.map((row) =>
        schemaString<DdfProperty>(row, 'StandardStatus', 'standardStatus'),
      ),
    ),
    types: uniqueSorted(
      rows.map((row) =>
        schemaString<DdfProperty>(row, 'PropertySubType', 'propertySubType'),
      ),
    ),
    prices: priceOptions(rows.map(effectivePrice)),
    bedrooms: numericOptions(
      rows.map((row) =>
        schemaNumber<DdfProperty>(row, 'BedroomsTotal', 'bedroomsTotal'),
      ),
    ),
    bathrooms: numericOptions(
      rows.map((row) =>
        schemaNumber<DdfProperty>(
          row,
          'BathroomsTotalInteger',
          'bathroomsTotalInteger',
        ),
      ),
    ),
    parking: numericOptions(
      rows.map((row) =>
        schemaNumber<DdfProperty>(row, 'ParkingTotal', 'parkingTotal'),
      ),
    ),
    advancedGroups: listingAdvancedFacetDefinitions.map((definition) => ({
      key: definition.key,
      label: definition.label,
      options: facetOptions(advancedValuesByKey.get(definition.key)),
    })),
  } satisfies ListingFacets
})

const buildListingGroupIndex = Effect.fn('Listings.buildListingGroupIndex')(
  function* () {
    const client = yield* DdfDbClient
    const valuesByGroup = new Map<
      string,
      Map<string, ListingGroupValueAccumulator>
    >()
    const listingKeysByGroup = new Map<string, Set<string>>()

    for (const group of listingGroupDefinitions) {
      valuesByGroup.set(group.slug, new Map())
      listingKeysByGroup.set(group.slug, new Set())
    }

    let offset = 0
    let hasMoreListings = true

    while (hasMoreListings) {
      const rows = (yield* client.properties.list({
        select: listingGroupIndexSelect,
        filters: { active: true },
        limit: 500,
        offset,
        orderBy: [{ field: 'modificationTimestamp', direction: 'desc' }],
      })) as ReadonlyArray<DbRow>

      for (const row of rows) {
        const listingKey = listingKeyFromRow(row)
        for (const group of listingGroupDefinitions) {
          const values = groupValuesFromRow(row, group)
          if (values.length > 0 && listingKey !== null) {
            listingKeysByGroup.get(group.slug)?.add(listingKey)
          }

          const groupValues = valuesByGroup.get(group.slug)
          if (groupValues === undefined) continue

          for (const value of values) {
            const valueSlug = slugifyGroupValue(value)
            const current = groupValues.get(valueSlug)
            if (current === undefined) {
              groupValues.set(valueSlug, {
                value: displayGroupValue(value),
                count: 1,
              })
            } else {
              current.count += 1
            }
          }
        }
      }

      hasMoreListings = rows.length === 500
      offset += rows.length
    }

    const valueLinksByGroup = new Map<
      string,
      ReadonlyArray<ListingGroupValueLink>
    >()

    for (const group of listingGroupDefinitions) {
      const groupValues = valuesByGroup.get(group.slug) ?? new Map()
      const links = sortGroupValueLinks(
        Array.from(groupValues.entries()).map(([valueSlug, value]) =>
          makeGroupValueLink(group, valueSlug, value.value, value.count),
        ),
      )
      valueLinksByGroup.set(group.slug, links)
    }

    const summaries = listingGroupDefinitions
      .map((group) => {
        const values = valueLinksByGroup.get(group.slug) ?? []
        return {
          groupSlug: group.slug,
          label: group.label,
          pluralLabel: group.pluralLabel,
          valueCount: values.length,
          listingCount: listingKeysByGroup.get(group.slug)?.size ?? 0,
        } satisfies ListingGroupSummary
      })
      .filter((summary) => summary.valueCount > 0 && summary.listingCount > 0)
      .sort(
        (left, right) =>
          right.listingCount - left.listingCount ||
          left.pluralLabel.localeCompare(right.pluralLabel),
      )

    return {
      summaries,
      valuesByGroup: valueLinksByGroup,
      topValues: sortGroupValueLinks(
        Array.from(valueLinksByGroup.values()).flat(),
      ),
    } satisfies ListingGroupIndex
  },
)

const loadListings = Effect.fn('Listings.loadListings')(function* (
  search: ListingSearch,
) {
  const client = yield* DdfDbClient
  const [rows, facets] = yield* Effect.all(
    [
      client.properties.list({
        select: listingSelect,
        includeRaw: true,
        include: propertyInclude,
        filters: listingFilters(search),
        limit: LISTINGS_PAGE_SIZE + 1,
        offset: (search.page - 1) * LISTINGS_PAGE_SIZE,
        orderBy: listingOrder(search.sort),
      }) as Effect.Effect<ReadonlyArray<DbRow>, unknown>,
      buildFacets(),
    ],
    { concurrency: 2 },
  )

  return {
    listings: rows.slice(0, LISTINGS_PAGE_SIZE).map(toListingCard),
    facets,
    search,
    pageSize: LISTINGS_PAGE_SIZE,
    hasNextPage: rows.length > LISTINGS_PAGE_SIZE,
  } satisfies ListingsData
})

const loadSearchIndex = Effect.fn('Listings.loadSearchIndex')(function* () {
  const [index, home] = yield* Effect.all(
    [buildListingGroupIndex(), loadHome()],
    { concurrency: 2 },
  )

  return {
    facets: home.facets,
    groups: listingGroupBuckets(index),
    topValues: index.topValues.slice(0, GROUPED_RELATED_VALUE_LIMIT),
    featuredListings: home.featuredListings,
    openHouses: home.openHouses,
  } satisfies SearchIndexData
})

const loadSearchGroup = Effect.fn('Listings.loadSearchGroup')(function* (
  requestedGroupSlug: string,
) {
  const groupSlug = slugifyGroupValue(requestedGroupSlug)
  const index = yield* buildListingGroupIndex()
  const groupOption = listingGroupDefinitionOption(groupSlug)
  const bucket = listingGroupBuckets(index).find(
    (item) => item.group.slug === groupSlug,
  )

  return {
    requestedGroupSlug: groupSlug,
    group:
      bucket?.group ??
      (Option.isSome(groupOption)
        ? listingGroupPublicInfo(groupOption.value)
        : null),
    summary: bucket?.summary ?? null,
    values: bucket?.values ?? [],
    relatedGroups: index.summaries
      .filter((summary) => summary.groupSlug !== groupSlug)
      .slice(0, 12),
    topValues: index.topValues
      .filter((value) => value.groupSlug !== groupSlug)
      .slice(0, GROUPED_RELATED_VALUE_LIMIT),
  } satisfies SearchGroupData
})

const loadGroupedListingCards = Effect.fn('Listings.loadGroupedListingCards')(
  function* (
    group: ListingGroupDefinition,
    valueSlug: string,
    search: ListingSearch,
  ) {
    const client = yield* DdfDbClient
    const matchedRows: DbRow[] = []
    let offset = 0
    let hasMoreListings = true

    while (hasMoreListings) {
      const rows = (yield* client.properties.list({
        select: groupedListingSelect,
        filters: groupedListingFilters(search, group),
        limit: 500,
        offset,
        orderBy: listingOrder(search.sort),
      })) as ReadonlyArray<DbRow>

      matchedRows.push(
        ...rows.filter((row) => rowHasGroupValueSlug(row, group, valueSlug)),
      )

      hasMoreListings = rows.length === 500
      offset += rows.length
    }

    const pageOffset = (search.page - 1) * LISTINGS_PAGE_SIZE
    const pageRows = matchedRows.slice(
      pageOffset,
      pageOffset + LISTINGS_PAGE_SIZE,
    )
    const detailRows = (yield* Effect.all(
      pageRows.flatMap((row) => {
        const listingKey = listingKeyFromRow(row)
        return listingKey === null
          ? []
          : [
              client.properties.get(listingKey, {
                select: groupedListingSelect,
                includeRaw: true,
                include: propertyInclude,
              }),
            ]
      }),
      { concurrency: 6 },
    )) as ReadonlyArray<DbRow | null>

    return {
      listings: detailRows.flatMap((row) =>
        row === null ? [] : [toListingCard(row)],
      ),
      hasNextPage: matchedRows.length > pageOffset + LISTINGS_PAGE_SIZE,
    }
  },
)

const groupedFallbackData = ({
  request,
  search,
  facets,
  index,
  groupOption,
}: {
  readonly request: {
    readonly groupSlug: string
    readonly valueSlug: string
  }
  readonly search: ListingSearch
  readonly facets: ListingFacets
  readonly index: ListingGroupIndex
  readonly groupOption: Option.Option<ListingGroupDefinition>
}): GroupedListingsData => {
  const group = Option.isSome(groupOption) ? groupOption.value : null
  const groupValues =
    group === null ? [] : (index.valuesByGroup.get(group.slug) ?? [])

  return {
    requested: request,
    group: group === null ? null : listingGroupPublicInfo(group),
    matchedValue: null,
    listings: [],
    facets,
    search,
    pageSize: LISTINGS_PAGE_SIZE,
    hasNextPage: false,
    relatedGroups: index.summaries,
    relatedValues: (groupValues.length > 0
      ? groupValues
      : index.topValues
    ).slice(0, GROUPED_RELATED_VALUE_LIMIT),
  }
}

const loadGroupedListings = Effect.fn('Listings.loadGroupedListings')(
  function* (request: ListingGroupRequest) {
    const search = request.search
    const groupSlug = slugifyGroupValue(request.groupSlug)
    const valueSlug = slugifyGroupValue(request.valueSlug)
    const [index, facets] = yield* Effect.all(
      [buildListingGroupIndex(), buildFacets()],
      { concurrency: 2 },
    )
    const groupOption = listingGroupDefinitionOption(groupSlug)
    const normalizedRequest = { groupSlug, valueSlug }

    if (Option.isNone(groupOption)) {
      return groupedFallbackData({
        request: normalizedRequest,
        search,
        facets,
        index,
        groupOption,
      })
    }

    const group = groupOption.value
    const groupValues = index.valuesByGroup.get(group.slug) ?? []
    const matchedValueOption = Option.fromNullishOr(
      groupValues.find((value) => value.valueSlug === valueSlug),
    )

    if (Option.isNone(matchedValueOption)) {
      return groupedFallbackData({
        request: normalizedRequest,
        search,
        facets,
        index,
        groupOption,
      })
    }

    const matchedValue = matchedValueOption.value
    const groupedListings = yield* loadGroupedListingCards(
      group,
      matchedValue.valueSlug,
      search,
    )

    return {
      requested: normalizedRequest,
      group: listingGroupPublicInfo(group),
      matchedValue,
      listings: groupedListings.listings,
      facets,
      search,
      pageSize: LISTINGS_PAGE_SIZE,
      hasNextPage: groupedListings.hasNextPage,
      relatedGroups: index.summaries,
      relatedValues: groupValues
        .filter((value) => value.valueSlug !== matchedValue.valueSlug)
        .slice(0, GROUPED_RELATED_VALUE_LIMIT),
    } satisfies GroupedListingsData
  },
)

const loadHome = Effect.fn('Listings.loadHome')(function* () {
  const client = yield* DdfDbClient
  const [featuredListings, openHouses, facets] = yield* Effect.all(
    [
      client.properties.list({
        select: listingSelect,
        includeRaw: true,
        include: propertyInclude,
        filters: { active: true },
        limit: 6,
        orderBy: [{ field: 'modificationTimestamp', direction: 'desc' }],
      }) as Effect.Effect<ReadonlyArray<DbRow>, unknown>,
      client.openHouses.list({
        select: [
          'openHouseKey',
          'listingKey',
          'listingId',
          'openHouseDate',
          'openHouseStartTime',
          'openHouseEndTime',
          'openHouseType',
          'openHouseStatus',
        ],
        include: {
          property: {
            select: listingSelect,
            includeRaw: true,
          },
        },
        limit: 6,
        orderBy: [{ field: 'openHouseDate', direction: 'desc' }],
      }) as Effect.Effect<ReadonlyArray<DbRow>, unknown>,
      buildFacets(),
    ],
    { concurrency: 3 },
  )

  return {
    featuredListings: featuredListings.map(toListingCard),
    openHouses: openHouses.flatMap((row) => {
      const openHouse = toOpenHouse(row)
      return openHouse === null ? [] : [openHouse]
    }),
    facets,
  } satisfies HomeData
})

const loadListingDetail = Effect.fn('Listings.loadListingDetail')(function* (
  listingKey: string,
) {
  const client = yield* DdfDbClient
  const row = (yield* client.properties.get(listingKey, {
    select: detailSelect,
    includeRaw: true,
    include: detailInclude,
  })) as DbRow | null
  return toListingDetail(row)
})

const loadOpenHouseDetail = Effect.fn('Listings.loadOpenHouseDetail')(
  function* (openHouseKey: string) {
    const client = yield* DdfDbClient
    const openHouse = toOpenHouse(
      (yield* client.openHouses.get(openHouseKey, {
        select: [
          'openHouseKey',
          'listingKey',
          'listingId',
          'openHouseDate',
          'openHouseStartTime',
          'openHouseEndTime',
          'openHouseType',
          'openHouseStatus',
          'openHouseRemarks',
        ],
        include: {
          property: {
            select: listingSelect,
            includeRaw: true,
          },
        },
      })) as DbRow | null,
    )
    if (openHouse === null) return null

    const propertySubType = openHouse.property?.propertySubType ?? null
    const relatedRows = (yield* client.openHouses.list({
      select: [
        'openHouseKey',
        'listingKey',
        'listingId',
        'openHouseDate',
        'openHouseStartTime',
        'openHouseEndTime',
        'openHouseType',
        'openHouseStatus',
        'openHouseRemarks',
      ],
      include: {
        property: {
          select: listingSelect,
          includeRaw: true,
        },
      },
      limit: 200,
      orderBy: [{ field: 'openHouseDate', direction: 'desc' }],
    })) as ReadonlyArray<DbRow>

    const relatedOpenHouses = relatedRows
      .flatMap((row) => {
        const relatedOpenHouse = toOpenHouse(row)
        return relatedOpenHouse === null ? [] : [relatedOpenHouse]
      })
      .filter(
        (relatedOpenHouse) =>
          relatedOpenHouse.openHouseKey !== openHouse.openHouseKey &&
          propertySubType !== null &&
          relatedOpenHouse.property?.propertySubType === propertySubType,
      )
      .slice(0, 6)

    return {
      ...openHouse,
      relatedOpenHouses,
    } satisfies OpenHouseDetail
  },
)

const loadOffices = Effect.fn('Listings.loadOffices')(function* (
  search: DirectorySearch,
) {
  const client = yield* DdfDbClient
  const row = (yield* client.offices.get(EXIT_EXCEL_OFFICE_KEY, {
    select: officeSelect,
    include: officeInclude,
  })) as DbRow | null
  const office = toOffice(row)
  if (office === null) {
    return {
      items: [],
      search: { ...search, page: 1 },
      pageSize: DIRECTORY_PAGE_SIZE,
      hasNextPage: false,
    } satisfies DirectoryData<OfficeDetail>
  }

  const listingRows: DbRow[] = []
  let offset = 0
  let hasMoreListings = true

  while (hasMoreListings) {
    const page = (yield* client.properties.list({
      select: listingSelect,
      includeRaw: true,
      include: propertyInclude,
      filters: {
        active: true,
      },
      limit: 500,
      offset,
      orderBy: [{ field: 'modificationTimestamp', direction: 'desc' }],
    })) as ReadonlyArray<DbRow>

    listingRows.push(
      ...page.filter((item) => listingHasOffice(item, office.officeKey)),
    )
    hasMoreListings = page.length === 500
    offset += page.length
  }

  const listings = listingRows.map(toListingCard)
  const agents = sortAgents(
    uniqueBy(
      listings.flatMap((listing) => listing.agents),
      (agent) => agent.memberKey,
    ),
  )

  return {
    items: [{ ...office, agents, listings }],
    search: { ...search, page: 1 },
    pageSize: DIRECTORY_PAGE_SIZE,
    hasNextPage: false,
  } satisfies DirectoryData<OfficeDetail>
})

const loadActiveOfficeAgentKeys = Effect.fn(
  'Listings.loadActiveOfficeAgentKeys',
)(function* () {
  const client = yield* DdfDbClient
  const keys = new Set<string>()
  let offset = 0
  let hasMoreListings = true

  while (hasMoreListings) {
    const rows = (yield* client.properties.list({
      select: activePropertyKeySelect,
      filters: {
        active: true,
      },
      limit: 500,
      offset,
      orderBy: [{ field: 'modificationTimestamp', direction: 'desc' }],
    })) as ReadonlyArray<DbRow>

    for (const row of rows) {
      if (!listingHasOffice(row, EXIT_EXCEL_OFFICE_KEY)) continue
      for (const key of listingAgentKeys(row)) {
        keys.add(key)
      }
    }

    hasMoreListings = rows.length === 500
    offset += rows.length
  }

  return Array.from(keys)
})

const sortAgents = (agents: ReadonlyArray<PersonCard>) =>
  [...agents].sort((left, right) => {
    const leftName = [left.lastName, left.firstName, left.memberKey]
      .filter((value): value is string => value !== null)
      .join(' ')
    const rightName = [right.lastName, right.firstName, right.memberKey]
      .filter((value): value is string => value !== null)
      .join(' ')
    return leftName.localeCompare(rightName)
  })

const loadAgents = Effect.fn('Listings.loadAgents')(function* (
  search: AgentSearch,
) {
  const client = yield* DdfDbClient
  const activeAgentKeys = yield* loadActiveOfficeAgentKeys()
  const activeAgentKeySet = new Set(activeAgentKeys)

  if (activeAgentKeys.length === 0) {
    return {
      items: [],
      search: { ...search, officeKey: EXIT_EXCEL_OFFICE_KEY },
      pageSize: DIRECTORY_PAGE_SIZE,
      hasNextPage: false,
    } satisfies DirectoryData<PersonCard>
  }

  const agents: PersonCard[] = []
  let offset = 0
  let hasMoreMembers = true

  while (hasMoreMembers) {
    const rows = (yield* client.members.list({
      select: memberSelect,
      includeRaw: true,
      include: memberInclude,
      filters: {
        active: true,
        officeKey: EXIT_EXCEL_OFFICE_KEY,
      },
      limit: 500,
      offset,
      orderBy: [{ field: 'lastName', direction: 'asc' }],
    })) as ReadonlyArray<DbRow>

    for (const row of rows) {
      const agent = toPerson(row)
      if (agent !== null && activeAgentKeySet.has(agent.memberKey)) {
        agents.push(agent)
      }
    }

    hasMoreMembers = rows.length === 500
    offset += rows.length
  }

  const sortedAgents = sortAgents(agents)
  const pageOffset = (search.page - 1) * DIRECTORY_PAGE_SIZE
  const pageItems = sortedAgents.slice(
    pageOffset,
    pageOffset + DIRECTORY_PAGE_SIZE,
  )

  return {
    items: pageItems,
    search: { ...search, officeKey: EXIT_EXCEL_OFFICE_KEY },
    pageSize: DIRECTORY_PAGE_SIZE,
    hasNextPage: sortedAgents.length > pageOffset + DIRECTORY_PAGE_SIZE,
  } satisfies DirectoryData<PersonCard>
})

const loadAgentDetail = Effect.fn('Listings.loadAgentDetail')(function* (
  agentKey: string,
) {
  const client = yield* DdfDbClient
  const agent = toPerson(
    (yield* client.members.get(agentKey, {
      select: memberSelect,
      includeRaw: true,
      include: memberInclude,
    })) as DbRow | null,
  )
  if (agent === null || agent.officeKey !== EXIT_EXCEL_OFFICE_KEY) return null

  const rows: DbRow[] = []
  let offset = 0
  let hasMoreListings = true

  while (hasMoreListings) {
    const page = (yield* client.properties.list({
      select: listingSelect,
      includeRaw: true,
      include: propertyInclude,
      filters: {
        active: true,
      },
      limit: 500,
      offset,
      orderBy: [{ field: 'modificationTimestamp', direction: 'desc' }],
    })) as ReadonlyArray<DbRow>

    rows.push(...page.filter((row) => listingHasAgent(row, agentKey)))
    hasMoreListings = page.length === 500
    offset += page.length
  }

  const listings = rows.map(toListingCard)
  const openHouses = uniqueBy(
    listings.flatMap((listing) => listing.openHouses),
    (openHouse) => openHouse.openHouseKey,
  )

  return {
    ...agent,
    listings,
    openHouses,
  } satisfies AgentDetail
})

const loadOpenHouses = Effect.fn('Listings.loadOpenHouses')(function* (
  search: OpenHouseSearch & { readonly cursor?: number },
) {
  const client = yield* DdfDbClient
  const offset = search.cursor ?? (search.page - 1) * DIRECTORY_PAGE_SIZE
  const page = Math.floor(offset / DIRECTORY_PAGE_SIZE) + 1
  const rows = (yield* client.openHouses.list({
    select: [
      'openHouseKey',
      'listingKey',
      'listingId',
      'openHouseDate',
      'openHouseStartTime',
      'openHouseEndTime',
      'openHouseType',
      'openHouseStatus',
      'openHouseRemarks',
    ],
    include: {
      property: {
        select: listingSelect,
        includeRaw: true,
      },
    },
    filters: {
      listingKey: search.listingKey || undefined,
    },
    limit: DIRECTORY_PAGE_SIZE + 1,
    offset,
    orderBy: [
      { field: 'openHouseDate', direction: 'desc' },
      { field: 'openHouseKey', direction: 'desc' },
    ],
  })) as ReadonlyArray<DbRow>
  const hasNextPage = rows.length > DIRECTORY_PAGE_SIZE

  return {
    items: rows.slice(0, DIRECTORY_PAGE_SIZE).flatMap((row) => {
      const openHouse = toOpenHouse(row)
      return openHouse === null ? [] : [openHouse]
    }),
    search: { listingKey: search.listingKey, page },
    pageSize: DIRECTORY_PAGE_SIZE,
    hasNextPage,
    nextCursor: hasNextPage ? offset + DIRECTORY_PAGE_SIZE : null,
    previousCursor:
      offset > 0 ? Math.max(0, offset - DIRECTORY_PAGE_SIZE) : null,
  } satisfies DirectoryData<OpenHouseCard>
})

export const getHomeData = createServerFn({ method: 'GET' }).handler(() =>
  runServerEffect(loadHome()),
)

export const getListingsData = createServerFn({ method: 'GET' })
  .inputValidator(parseListingSearch)
  .handler(({ data }) => runServerEffect(loadListings(data)))

export const getSearchIndexData = createServerFn({ method: 'GET' }).handler(
  () => runServerEffect(loadSearchIndex()),
)

export const getSearchGroupData = createServerFn({ method: 'GET' })
  .inputValidator(parseSearchGroupRequest)
  .handler(({ data }) => runServerEffect(loadSearchGroup(data.groupSlug)))

export const getGroupedListingsData = createServerFn({ method: 'GET' })
  .inputValidator(parseListingGroupRequest)
  .handler(({ data }) => runServerEffect(loadGroupedListings(data)))

export const getListingDetail = createServerFn({ method: 'GET' })
  .inputValidator((input: unknown) => {
    const value =
      input !== null && typeof input === 'object'
        ? (input as Record<string, unknown>)
        : {}
    const listingKey =
      typeof value.listingKey === 'string' ? value.listingKey.trim() : ''
    if (!listingKey) throw new Error('listingKey is required')
    return { listingKey }
  })
  .handler(({ data }) => runServerEffect(loadListingDetail(data.listingKey)))

export const getOpenHouseDetail = createServerFn({ method: 'GET' })
  .inputValidator((input: unknown) => {
    const value =
      input !== null && typeof input === 'object'
        ? (input as Record<string, unknown>)
        : {}
    const openHouseKey =
      typeof value.openHouseKey === 'string' ? value.openHouseKey.trim() : ''
    if (!openHouseKey) throw new Error('openHouseKey is required')
    return { openHouseKey }
  })
  .handler(({ data }) =>
    runServerEffect(loadOpenHouseDetail(data.openHouseKey)),
  )

export const getOfficesData = createServerFn({ method: 'GET' })
  .inputValidator(parseDirectorySearch)
  .handler(({ data }) => runServerEffect(loadOffices(data)))

export const getAgentsData = createServerFn({ method: 'GET' })
  .inputValidator(parseAgentSearch)
  .handler(({ data }) => runServerEffect(loadAgents(data)))

export const getAgentDetail = createServerFn({ method: 'GET' })
  .inputValidator((input: unknown) => {
    const value =
      input !== null && typeof input === 'object'
        ? (input as Record<string, unknown>)
        : {}
    const agentKey =
      typeof value.agentKey === 'string' ? value.agentKey.trim() : ''
    if (!agentKey) throw new Error('agentKey is required')
    return { agentKey }
  })
  .handler(({ data }) => runServerEffect(loadAgentDetail(data.agentKey)))

export const getOpenHousesData = createServerFn({ method: 'GET' })
  .inputValidator(parseOpenHousePageRequest)
  .handler(({ data }) => runServerEffect(loadOpenHouses(data)))
