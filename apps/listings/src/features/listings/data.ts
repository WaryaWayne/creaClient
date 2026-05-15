import { createServerFn } from '@tanstack/react-start'
import { Effect, Layer } from 'effect'
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
  readonly firstName: string | null
  readonly lastName: string | null
  readonly jobTitle: string | null
  readonly phone: string | null
  readonly city: string | null
  readonly province: string | null
  readonly officeKey: string | null
  readonly office: OfficeCard | null
  readonly imageUrl: string | null
  readonly media: ReadonlyArray<MediaCard>
}

export type OfficeCard = {
  readonly officeKey: string
  readonly officeName: string | null
  readonly phone: string | null
  readonly city: string | null
  readonly province: string | null
  readonly address: string | null
  readonly postalCode: string | null
  readonly officeType: string | null
  readonly imageUrl: string | null
  readonly media: ReadonlyArray<MediaCard>
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

export type MediaCard = {
  readonly mediaKey: string | null
  readonly mediaUrl: string | null
  readonly mediaCategory: string | null
  readonly longDescription: string | null
  readonly preferredPhoto: boolean | null
  readonly sortOrder: number | null
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
}

export type ListingsData = {
  readonly listings: ReadonlyArray<ListingCard>
  readonly facets: ListingFacets
  readonly search: ListingSearch
  readonly pageSize: number
  readonly hasNextPage: boolean
}

export type DirectoryData<T> = {
  readonly items: ReadonlyArray<T>
  readonly search: DirectorySearch | AgentSearch | OpenHouseSearch
  readonly pageSize: number
  readonly hasNextPage: boolean
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
  value.length === 0 ? value : `${value[0]?.toLowerCase()}${value.slice(1)}`

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
    officeName: schemaString<DdfOffice>(row, 'OfficeName', 'officeName'),
    phone: schemaString<DdfOffice>(row, 'OfficePhone', 'phone'),
    city: schemaString<DdfOffice>(row, 'OfficeCity', 'city'),
    province: schemaString<DdfOffice>(row, 'OfficeStateOrProvince', 'province'),
    address:
      [
        schemaString<DdfOffice>(row, 'OfficeAddress1', 'address1'),
        schemaString<DdfOffice>(row, 'OfficeAddress2', 'address2'),
      ]
        .filter(Boolean)
        .join(', ') || null,
    postalCode: schemaString<DdfOffice>(row, 'OfficePostalCode', 'postalCode'),
    officeType: schemaString<DdfOffice>(row, 'OfficeType', 'officeType'),
    imageUrl: imageFromRow(row),
    media: mediaRowsFrom(row).map(toMedia),
  }
}

const toPerson = (row: DbRow | null | undefined): PersonCard | null => {
  if (!row) return null
  const memberKey = schemaString<DdfMember>(row, 'MemberKey', 'memberKey')
  if (!memberKey) return null
  return {
    memberKey,
    firstName: schemaString<DdfMember>(row, 'MemberFirstName', 'firstName'),
    lastName: schemaString<DdfMember>(row, 'MemberLastName', 'lastName'),
    jobTitle: schemaString<DdfMember>(row, 'JobTitle', 'jobTitle'),
    phone: schemaString<DdfMember>(row, 'MemberOfficePhone', 'phone'),
    city: schemaString<DdfMember>(row, 'MemberCity', 'city'),
    province: schemaString<DdfMember>(row, 'MemberStateOrProvince', 'province'),
    officeKey: schemaString<DdfMember>(row, 'OfficeKey', 'officeKey'),
    office: toOffice(asRecord(row.office)),
    imageUrl: imageFromRow(row),
    media: mediaRowsFrom(row).map(toMedia),
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
    agent: listAgent ?? agents[0] ?? null,
    office: listOffice ?? offices[0] ?? null,
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
  minBathrooms: numericFilter(search.minBaths),
})

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
  'listOfficeKey',
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

const propertyInclude = {
  media: {
    select: [
      'mediaKey',
      'mediaUrl',
      'mediaCategory',
      'longDescription',
      'preferredPhoto',
      'sortOrder',
    ],
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
    select: [
      'memberKey',
      'firstName',
      'lastName',
      'jobTitle',
      'phone',
      'officeKey',
      'media',
    ],
  },
  coListAgents: {
    select: [
      'memberKey',
      'firstName',
      'lastName',
      'jobTitle',
      'phone',
      'officeKey',
      'media',
    ],
  },
  listOffice: {
    select: [
      'officeKey',
      'officeName',
      'phone',
      'city',
      'province',
      'address1',
      'address2',
      'postalCode',
      'officeType',
      'media',
    ],
  },
  coListOffices: {
    select: [
      'officeKey',
      'officeName',
      'phone',
      'city',
      'province',
      'address1',
      'address2',
      'postalCode',
      'officeType',
      'media',
    ],
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

const ddfClientLayer = DdfDbClient.layer.pipe(
  Layer.provide(DdfDatabase.layerConfig),
)

const runServerEffect = <A, E>(
  effect: Effect.Effect<A, E, DdfDbClient>,
): Promise<A> => Effect.runPromise(effect.pipe(Effect.provide(ddfClientLayer)))

const buildFacets = Effect.fn('Listings.buildFacets')(function* () {
  const client = yield* DdfDbClient
  const rows = (yield* client.properties.list({
    select: ['city', 'province', 'propertySubType', 'standardStatus'],
    filters: { active: true },
    limit: 500,
    orderBy: [{ field: 'modificationTimestamp', direction: 'desc' }],
  })) as ReadonlyArray<DbRow>

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
  } satisfies ListingFacets
})

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

const loadOffices = Effect.fn('Listings.loadOffices')(function* (
  search: DirectorySearch,
) {
  const client = yield* DdfDbClient
  const rows = (yield* client.offices.list({
    select: [
      'officeKey',
      'officeName',
      'phone',
      'city',
      'province',
      'address1',
      'address2',
      'postalCode',
      'officeType',
      'media',
    ],
    filters: {
      active: true,
      city: search.city || undefined,
      province: search.province || undefined,
    },
    limit: DIRECTORY_PAGE_SIZE + 1,
    offset: (search.page - 1) * DIRECTORY_PAGE_SIZE,
    orderBy: [{ field: 'officeName', direction: 'asc' }],
  })) as ReadonlyArray<DbRow>

  return {
    items: rows.slice(0, DIRECTORY_PAGE_SIZE).flatMap((row) => {
      const office = toOffice(row)
      return office === null ? [] : [office]
    }),
    search,
    pageSize: DIRECTORY_PAGE_SIZE,
    hasNextPage: rows.length > DIRECTORY_PAGE_SIZE,
  } satisfies DirectoryData<OfficeCard>
})

const loadAgents = Effect.fn('Listings.loadAgents')(function* (
  search: AgentSearch,
) {
  const client = yield* DdfDbClient
  const rows = (yield* client.members.list({
    select: [
      'memberKey',
      'firstName',
      'lastName',
      'jobTitle',
      'phone',
      'city',
      'province',
      'officeKey',
      'media',
    ],
    include: {
      office: {
        select: [
          'officeKey',
          'officeName',
          'phone',
          'city',
          'province',
          'address1',
          'address2',
          'postalCode',
          'officeType',
          'media',
        ],
      },
    },
    filters: {
      active: true,
      officeKey: search.officeKey || undefined,
    },
    limit: DIRECTORY_PAGE_SIZE + 1,
    offset: (search.page - 1) * DIRECTORY_PAGE_SIZE,
    orderBy: [{ field: 'lastName', direction: 'asc' }],
  })) as ReadonlyArray<DbRow>

  return {
    items: rows.slice(0, DIRECTORY_PAGE_SIZE).flatMap((row) => {
      const agent = toPerson(row)
      return agent === null ? [] : [agent]
    }),
    search,
    pageSize: DIRECTORY_PAGE_SIZE,
    hasNextPage: rows.length > DIRECTORY_PAGE_SIZE,
  } satisfies DirectoryData<PersonCard>
})

const loadOpenHouses = Effect.fn('Listings.loadOpenHouses')(function* (
  search: OpenHouseSearch,
) {
  const client = yield* DdfDbClient
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
    offset: (search.page - 1) * DIRECTORY_PAGE_SIZE,
    orderBy: [{ field: 'openHouseDate', direction: 'desc' }],
  })) as ReadonlyArray<DbRow>

  return {
    items: rows.slice(0, DIRECTORY_PAGE_SIZE).flatMap((row) => {
      const openHouse = toOpenHouse(row)
      return openHouse === null ? [] : [openHouse]
    }),
    search,
    pageSize: DIRECTORY_PAGE_SIZE,
    hasNextPage: rows.length > DIRECTORY_PAGE_SIZE,
  } satisfies DirectoryData<OpenHouseCard>
})

export const getHomeData = createServerFn({ method: 'GET' }).handler(() =>
  runServerEffect(loadHome()),
)

export const getListingsData = createServerFn({ method: 'GET' })
  .inputValidator(parseListingSearch)
  .handler(({ data }) => runServerEffect(loadListings(data)))

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

export const getOfficesData = createServerFn({ method: 'GET' })
  .inputValidator(parseDirectorySearch)
  .handler(({ data }) => runServerEffect(loadOffices(data)))

export const getAgentsData = createServerFn({ method: 'GET' })
  .inputValidator(parseAgentSearch)
  .handler(({ data }) => runServerEffect(loadAgents(data)))

export const getOpenHousesData = createServerFn({ method: 'GET' })
  .inputValidator(parseOpenHouseSearch)
  .handler(({ data }) => runServerEffect(loadOpenHouses(data)))
