import { createServerFn } from '@tanstack/react-start'
import { Effect, Layer } from 'effect'
import { DdfDatabase, DdfDbClient } from '@warya/crea-ddf/db'

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
}

export type PersonCard = {
  readonly memberKey: string
  readonly firstName: string | null
  readonly lastName: string | null
  readonly phone: string | null
  readonly city: string | null
  readonly province: string | null
  readonly officeKey: string | null
  readonly office: OfficeCard | null
}

export type OfficeCard = {
  readonly officeKey: string
  readonly officeName: string | null
  readonly phone: string | null
  readonly city: string | null
  readonly province: string | null
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
  readonly longDescription: string | null
  readonly sortOrder: number | null
}

export type RoomCard = {
  readonly roomKey: string | null
  readonly roomType: string | null
  readonly roomLevel: string | null
  readonly roomDimensions: string | null
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
  readonly offices: ReadonlyArray<OfficeCard>
  readonly agents: ReadonlyArray<PersonCard>
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

const numberValue = (row: DbRow, key: string): number | null => {
  const value = row[key]
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

const dateValue = (row: DbRow, key: string): string | null => {
  const value = row[key]
  if (value instanceof Date) return value.toISOString()
  return typeof value === 'string' && value.length > 0 ? value : null
}

const arrayValue = (row: DbRow, key: string): ReadonlyArray<DbRow> =>
  asRows(row[key])

const displayAddress = (row: DbRow) => {
  const place = [stringValue(row, 'city'), stringValue(row, 'province')]
    .filter(Boolean)
    .join(', ')
  return (
    stringValue(row, 'unparsedAddress') ||
    (place.length > 0 ? place : 'Address available by request')
  )
}

const uniqueSorted = (values: ReadonlyArray<string | null>) =>
  Array.from(new Set(values.filter((value): value is string => !!value))).sort(
    (left, right) => left.localeCompare(right),
  )

const imageFromRow = (row: DbRow) =>
  stringValue(row, 'primaryMediaUrl') ??
  arrayValue(row, 'media').find((media) => stringValue(media, 'mediaUrl'))?.[
    'mediaUrl'
  ]?.toString() ??
  null

const toMedia = (row: DbRow): MediaCard => ({
  mediaKey: stringValue(row, 'mediaKey'),
  mediaUrl: stringValue(row, 'mediaUrl'),
  longDescription: stringValue(row, 'longDescription'),
  sortOrder: numberValue(row, 'sortOrder'),
})

const toRoom = (row: DbRow): RoomCard => ({
  roomKey: stringValue(row, 'roomKey'),
  roomType: stringValue(row, 'roomType'),
  roomLevel: stringValue(row, 'roomLevel'),
  roomDimensions: stringValue(row, 'roomDimensions'),
})

const toOffice = (row: DbRow | null | undefined): OfficeCard | null => {
  if (!row) return null
  const officeKey = stringValue(row, 'officeKey')
  if (!officeKey) return null
  return {
    officeKey,
    officeName: stringValue(row, 'officeName'),
    phone: stringValue(row, 'phone'),
    city: stringValue(row, 'city'),
    province: stringValue(row, 'province'),
  }
}

const toPerson = (row: DbRow | null | undefined): PersonCard | null => {
  if (!row) return null
  const memberKey = stringValue(row, 'memberKey')
  if (!memberKey) return null
  return {
    memberKey,
    firstName: stringValue(row, 'firstName'),
    lastName: stringValue(row, 'lastName'),
    phone: stringValue(row, 'phone'),
    city: stringValue(row, 'city'),
    province: stringValue(row, 'province'),
    officeKey: stringValue(row, 'officeKey'),
    office: toOffice(asRecord(row.office)),
  }
}

const toOpenHouse = (row: DbRow | null | undefined): OpenHouseCard | null => {
  if (!row) return null
  const openHouseKey = stringValue(row, 'openHouseKey')
  if (!openHouseKey) return null
  return {
    openHouseKey,
    listingKey: stringValue(row, 'listingKey'),
    listingId: stringValue(row, 'listingId'),
    date: dateValue(row, 'openHouseDate'),
    startTime: stringValue(row, 'openHouseStartTime'),
    endTime: stringValue(row, 'openHouseEndTime'),
    type: stringValue(row, 'openHouseType'),
    status: stringValue(row, 'openHouseStatus'),
    remarks: stringValue(row, 'openHouseRemarks'),
    property:
      row.property === undefined ? null : toListingCard(asRecord(row.property)),
  }
}

const toListingCard = (row: DbRow): ListingCard => {
  const listingKey = stringValue(row, 'listingKey') ?? ''
  return {
    listingKey,
    listingId: stringValue(row, 'listingId'),
    address: displayAddress(row),
    city: stringValue(row, 'city') ?? '',
    province: stringValue(row, 'province') ?? '',
    status: stringValue(row, 'standardStatus'),
    propertySubType: stringValue(row, 'propertySubType'),
    price: numberValue(row, 'listPrice'),
    leaseAmount: numberValue(row, 'leaseAmount'),
    leaseFrequency: stringValue(row, 'leaseAmountFrequency'),
    bedrooms: numberValue(row, 'bedroomsTotal'),
    bathrooms: numberValue(row, 'bathroomsTotalInteger'),
    parking: numberValue(row, 'parkingTotal'),
    imageUrl: imageFromRow(row),
    remarks: stringValue(row, 'publicRemarks'),
    modifiedAt: dateValue(row, 'modificationTimestamp'),
    agent: toPerson(asRecord(row.listAgent)),
    office: toOffice(asRecord(row.listOffice)),
    openHouses: arrayValue(row, 'openHouses').flatMap((item) => {
      const openHouse = toOpenHouse(item)
      return openHouse === null ? [] : [openHouse]
    }),
  }
}

const toListingDetail = (row: DbRow | null | undefined): ListingDetail | null => {
  if (!row) return null
  const card = toListingCard(row)
  if (!card.listingKey) return null
  return {
    ...card,
    latitude: numberValue(row, 'latitude'),
    longitude: numberValue(row, 'longitude'),
    photosCount: numberValue(row, 'photosCount'),
    lotSize: numberValue(row, 'lotSizeArea'),
    lotSizeUnits: stringValue(row, 'lotSizeUnits'),
    livingArea: numberValue(row, 'livingArea'),
    livingAreaUnits: stringValue(row, 'livingAreaUnits'),
    yearBuilt: numberValue(row, 'yearBuilt'),
    rooms: arrayValue(row, 'rooms').map(toRoom),
    media: arrayValue(row, 'media').map(toMedia),
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
): ReadonlyArray<{ readonly field: string; readonly direction: 'asc' | 'desc' }> => {
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
  'photosCount',
  'lotSizeArea',
  'lotSizeUnits',
  'livingArea',
  'livingAreaUnits',
  'yearBuilt',
] as const

const propertyInclude = {
  media: {
    select: ['mediaKey', 'mediaUrl', 'longDescription', 'sortOrder'],
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
    select: ['memberKey', 'firstName', 'lastName', 'phone', 'officeKey'],
  },
  listOffice: {
    select: ['officeKey', 'officeName', 'phone', 'city', 'province'],
  },
} as const

const detailInclude = {
  ...propertyInclude,
  rooms: {
    select: ['roomKey', 'roomType', 'roomLevel', 'roomDimensions'],
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
    cities: uniqueSorted(rows.map((row) => stringValue(row, 'city'))).slice(0, 80),
    provinces: uniqueSorted(rows.map((row) => stringValue(row, 'province'))),
    statuses: uniqueSorted(rows.map((row) => stringValue(row, 'standardStatus'))),
    types: uniqueSorted(rows.map((row) => stringValue(row, 'propertySubType'))),
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
  const [featuredListings, openHouses, offices, agents, facets] = yield* Effect.all(
    [
      client.properties.list({
          select: listingSelect,
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
              include: propertyInclude,
            },
          },
          limit: 6,
          orderBy: [{ field: 'openHouseDate', direction: 'desc' }],
      }) as Effect.Effect<ReadonlyArray<DbRow>, unknown>,
      client.offices.list({
          select: ['officeKey', 'officeName', 'phone', 'city', 'province'],
          filters: { active: true },
          limit: 6,
          orderBy: [{ field: 'officeName', direction: 'asc' }],
      }) as Effect.Effect<ReadonlyArray<DbRow>, unknown>,
      client.members.list({
          select: [
            'memberKey',
            'firstName',
            'lastName',
            'phone',
            'city',
            'province',
            'officeKey',
          ],
          filters: { active: true },
          limit: 6,
          orderBy: [{ field: 'lastName', direction: 'asc' }],
      }) as Effect.Effect<ReadonlyArray<DbRow>, unknown>,
      buildFacets(),
    ],
    { concurrency: 5 },
  )

  return {
    featuredListings: featuredListings.map(toListingCard),
    openHouses: openHouses.flatMap((row) => {
      const openHouse = toOpenHouse(row)
      return openHouse === null ? [] : [openHouse]
    }),
    offices: offices.flatMap((row) => {
      const office = toOffice(row)
      return office === null ? [] : [office]
    }),
    agents: agents.flatMap((row) => {
      const agent = toPerson(row)
      return agent === null ? [] : [agent]
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
    include: detailInclude,
  })) as DbRow | null
  return toListingDetail(row)
})

const loadOffices = Effect.fn('Listings.loadOffices')(function* (
  search: DirectorySearch,
) {
  const client = yield* DdfDbClient
  const rows = (yield* client.offices.list({
    select: ['officeKey', 'officeName', 'phone', 'city', 'province'],
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
      'phone',
      'city',
      'province',
      'officeKey',
    ],
    include: {
      office: {
        select: ['officeKey', 'officeName', 'phone', 'city', 'province'],
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
        include: propertyInclude,
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
