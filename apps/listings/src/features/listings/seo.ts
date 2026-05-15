import { defaultStringifySearch } from '@tanstack/react-router'

import { EXIT_EXCEL_OFFICE_NAME } from './data'
import {
  compactAgentSearch,
  compactDirectorySearch,
  compactListingSearch,
  compactOpenHouseSearch,
  defaultAgentSearch,
  defaultDirectorySearch,
  defaultListingSearch,
  defaultOpenHouseSearch,
  listingAdvancedFilterKeys,
  listingSortOptions,
} from './search'

import type {
  AgentDetail,
  DirectoryData,
  GroupedListingsData,
  HomeData,
  ListingCard,
  ListingDetail,
  ListingsData,
  OfficeDetail,
  OpenHouseCard,
  OpenHouseDetail,
  PersonCard,
  SearchGroupData,
  SearchIndexData,
} from './data'
import type {
  AgentSearch,
  DirectorySearch,
  ListingSearch,
  OpenHouseSearch,
} from './search'

const appName = 'CREA Listings Browser'
const defaultDescription =
  'Browse local CREA DDF listings and open houses with office and agent credits attached to each listing.'
const defaultImagePath = '/media/icons/logo-dark-1024w.png'

const money = new Intl.NumberFormat('en-CA', {
  style: 'currency',
  currency: 'CAD',
  maximumFractionDigits: 0,
})

const number = new Intl.NumberFormat('en-CA')

const configuredSiteUrl = () => {
  const processEnv = typeof process === 'undefined' ? undefined : process.env
  return (
    import.meta.env.VITE_SITE_URL ||
    import.meta.env.PUBLIC_SITE_URL ||
    processEnv?.SITE_URL ||
    processEnv?.PUBLIC_SITE_URL ||
    processEnv?.BETTER_AUTH_URL ||
    'http://localhost:3000'
  )
}

const siteBaseUrl = () => {
  try {
    const url = new URL(configuredSiteUrl())
    const pathname = url.pathname.replace(/\/+$/, '')
    return `${url.origin}${pathname === '/' ? '' : pathname}`
  } catch {
    return 'http://localhost:3000'
  }
}

const absoluteSiteUrl = (path: string) => {
  const base = `${siteBaseUrl().replace(/\/+$/, '')}/`
  const relativePath = path.startsWith('/') ? path.slice(1) : path
  return new URL(relativePath, base).toString()
}

const absoluteImageUrl = (imageUrl: string | null | undefined) => {
  const image = imageUrl?.trim() || defaultImagePath
  try {
    const url = new URL(image)
    if (url.protocol === 'http:' || url.protocol === 'https:') {
      return url.toString()
    }
  } catch {
    return absoluteSiteUrl(image)
  }
  return absoluteSiteUrl(defaultImagePath)
}

const cleanText = (value: string) => value.replace(/\s+/g, ' ').trim()

const truncateText = (value: string, maxLength = 155) => {
  const text = cleanText(value)
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength - 3).trimEnd()}...`
}

const compactSearchUrl = (path: string, search?: Record<string, unknown>) =>
  absoluteSiteUrl(`${path}${search ? defaultStringifySearch(search) : ''}`)

const pathSegment = (value: string) => encodeURIComponent(value)

const formatMoney = (value: number | null) =>
  value === null ? null : money.format(value)

const formatListingPrice = (listing: ListingCard) => {
  if (listing.price !== null) return formatMoney(listing.price)
  if (listing.leaseAmount !== null) {
    const amount = formatMoney(listing.leaseAmount)
    return `${amount}${listing.leaseFrequency ? ` / ${listing.leaseFrequency}` : ''}`
  }
  return null
}

const formatDate = (value: string | null) => {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('en-CA', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

const personName = (person: PersonCard | AgentDetail | null | undefined) =>
  [person?.firstName, person?.lastName].filter(Boolean).join(' ') || 'Agent'

const placeLabel = (value: {
  readonly city?: string | null
  readonly province?: string | null
}) => [value.city, value.province].filter(Boolean).join(', ')

const listingMetrics = (listing: ListingCard) =>
  [
    listing.bedrooms === null ? null : `${number.format(listing.bedrooms)} bed`,
    listing.bathrooms === null
      ? null
      : `${number.format(listing.bathrooms)} bath`,
    listing.parking === null
      ? null
      : `${number.format(listing.parking)} parking`,
  ].filter((item): item is string => item !== null)

const listingTitle = (listing: ListingCard) =>
  [formatListingPrice(listing), listing.propertySubType, listing.address]
    .filter(Boolean)
    .join(' | ')

const listingDescription = (listing: ListingCard) => {
  const details = [
    listing.status,
    ...listingMetrics(listing),
    placeLabel(listing),
    listing.agent ? `Listed by ${personName(listing.agent)}` : null,
    listing.office?.officeName ?? null,
  ].filter(Boolean)
  const summary =
    details.length > 0
      ? `${listing.address}: ${details.join(', ')}.`
      : `${listing.address} listing details.`
  return truncateText([summary, listing.remarks].filter(Boolean).join(' '))
}

const listingFilterParts = (search: ListingSearch) => {
  const parts = [
    search.city ? `in ${search.city}` : null,
    search.province ? `in ${search.province}` : null,
    search.status ? search.status : null,
    search.type ? search.type : null,
    search.minPrice || search.maxPrice
      ? `priced ${search.minPrice ? `from ${money.format(Number(search.minPrice))}` : ''}${
          search.minPrice && search.maxPrice ? ' ' : ''
        }${search.maxPrice ? `up to ${money.format(Number(search.maxPrice))}` : ''}`
      : null,
    search.minBeds ? `${search.minBeds}+ beds` : null,
    search.minBaths ? `${search.minBaths}+ baths` : null,
    search.minParking ? `${search.minParking}+ parking` : null,
  ].filter((item): item is string => item !== null && item.trim().length > 0)

  for (const key of listingAdvancedFilterKeys) {
    if (search[key].length === 0) continue
    parts.push(`${search[key].slice(0, 2).join(', ')}`)
  }

  return parts
}

const listingSearchTitle = (search: ListingSearch) => {
  const primary = [search.type, search.city || search.province]
    .filter(Boolean)
    .join(' in ')
  if (primary) return `${primary} Listings | ${appName}`
  if (search.status) return `${search.status} Listings | ${appName}`
  return `Listings | ${appName}`
}

const listingSearchDescription = (
  search: ListingSearch,
  listings: ReadonlyArray<ListingCard>,
) => {
  const filters = listingFilterParts(search)
  const sortLabel =
    listingSortOptions.find((option) => option.value === search.sort)?.label ??
    'Newest'
  const visibleCount = listings.length
  const base =
    filters.length > 0
      ? `Browse CREA DDF listings ${filters.join(', ')}.`
      : 'Browse active CREA DDF property listings.'
  return truncateText(
    `${base} Showing ${number.format(visibleCount)} results on page ${number.format(search.page)}, sorted by ${sortLabel.toLowerCase()}.`,
  )
}

const pageImage = (
  listings: ReadonlyArray<ListingCard>,
  fallback?: string | null,
) => listings.find((listing) => listing.imageUrl)?.imageUrl ?? fallback ?? null

const createSeoHead = ({
  title,
  description,
  path,
  image,
  imageAlt,
  type = 'website',
  search,
}: {
  readonly title: string
  readonly description: string
  readonly path: string
  readonly image?: string | null
  readonly imageAlt?: string
  readonly type?: 'article' | 'profile' | 'website'
  readonly search?: Record<string, unknown>
}) => {
  const canonicalUrl = compactSearchUrl(path, search)
  const imageUrl = absoluteImageUrl(image)
  const safeDescription = truncateText(description || defaultDescription)
  const safeTitle = cleanText(title)
  const safeImageAlt = truncateText(
    imageAlt || `${appName} social preview image`,
    120,
  )

  return {
    meta: [
      { title: safeTitle },
      { name: 'description', content: safeDescription },
      { property: 'og:title', content: safeTitle },
      { property: 'og:description', content: safeDescription },
      { property: 'og:type', content: type },
      { property: 'og:site_name', content: appName },
      { property: 'og:url', content: canonicalUrl },
      { property: 'og:image', content: imageUrl },
      { property: 'og:image:alt', content: safeImageAlt },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: safeTitle },
      { name: 'twitter:description', content: safeDescription },
      { name: 'twitter:url', content: canonicalUrl },
      { name: 'twitter:image', content: imageUrl },
      { name: 'twitter:image:alt', content: safeImageAlt },
    ],
    links: [{ rel: 'canonical', href: canonicalUrl }],
  }
}

export const appSeoDefaults = () => [
  { charSet: 'utf-8' },
  { name: 'viewport', content: 'width=device-width, initial-scale=1' },
  { title: appName },
  { name: 'description', content: defaultDescription },
  { name: 'application-name', content: appName },
  { name: 'theme-color', content: '#f5efe2' },
]

export const appIconLinks = () => [
  { rel: 'icon', href: '/media/icons/favicon.ico', sizes: 'any' },
  {
    rel: 'icon',
    href: '/media/icons/favicon.svg',
    type: 'image/svg+xml',
  },
  {
    rel: 'icon',
    href: '/media/icons/favicon-32x32.png',
    sizes: '32x32',
    type: 'image/png',
  },
  {
    rel: 'apple-touch-icon',
    href: '/media/icons/favicon-180x180.png',
    sizes: '180x180',
  },
  { rel: 'manifest', href: '/manifest.json' },
  {
    rel: 'preload',
    href: defaultImagePath,
    as: 'image',
    type: 'image/png',
  },
]

export const homeSeoHead = (data: HomeData | undefined) =>
  createSeoHead({
    title: `${appName} | Local DDF Search`,
    description: data
      ? `Search ${number.format(data.featuredListings.length)} featured CREA DDF listings, ${number.format(data.openHouses.length)} open houses, and local office and agent data.`
      : defaultDescription,
    path: '/',
    image: pageImage(data?.featuredListings ?? []),
  })

export const listingsSeoHead = (data: ListingsData | undefined) => {
  const search = data?.search ?? defaultListingSearch
  return createSeoHead({
    title: listingSearchTitle(search),
    description: listingSearchDescription(search, data?.listings ?? []),
    path: '/listings/',
    search: compactListingSearch(search),
    image: pageImage(data?.listings ?? []),
  })
}

export const listingDetailSeoHead = (
  listing: ListingDetail | null | undefined,
  listingKey: string,
) =>
  createSeoHead({
    title: listing
      ? `${listingTitle(listing)} | ${appName}`
      : `Listing ${listingKey} | ${appName}`,
    description: listing
      ? listingDescription(listing)
      : `CREA DDF listing detail for listing key ${listingKey}.`,
    path: `/listings/${pathSegment(listing?.listingKey || listingKey)}`,
    image: listing?.imageUrl,
    imageAlt: listing?.address,
    type: 'article',
  })

export const openHousesSeoHead = (
  data: DirectoryData<OpenHouseCard> | undefined,
) => {
  const search = (data?.search ?? defaultOpenHouseSearch) as OpenHouseSearch
  const listing = data?.items.find((item) => item.property)?.property
  const filteredLabel = listing
    ? ` for ${listing.address}`
    : search.q
      ? ` matching ${search.q}`
      : ''

  return createSeoHead({
    title: `Open Houses${filteredLabel} | ${appName}`,
    description: `Browse CREA DDF open house records${filteredLabel}. Showing ${number.format(data?.items.length ?? 0)} results on page ${number.format(search.page)}.`,
    path: '/open-houses/',
    search: compactOpenHouseSearch(search),
    image:
      listing?.imageUrl ??
      data?.items.find((item) => item.property?.imageUrl)?.property?.imageUrl,
  })
}

export const openHouseDetailSeoHead = (
  openHouse: OpenHouseDetail | null | undefined,
  openHouseKey: string,
) => {
  const listing = openHouse?.property
  const date = formatDate(openHouse?.date ?? null)
  const time = [openHouse?.startTime, openHouse?.endTime]
    .filter(Boolean)
    .join(' - ')
  const titleParts = [
    date ? `Open house ${date}` : 'Open house',
    listing?.address,
  ].filter(Boolean)

  return createSeoHead({
    title: `${titleParts.join(' | ')} | ${appName}`,
    description: openHouse
      ? truncateText(
          [
            `${date ?? 'Open house'}${time ? ` from ${time}` : ''}`,
            listing ? `at ${listing.address}` : null,
            listing ? placeLabel(listing) : null,
            openHouse.type,
            openHouse.status,
            openHouse.remarks,
          ]
            .filter(Boolean)
            .join(', '),
        )
      : `CREA DDF open house detail for open house key ${openHouseKey}.`,
    path: `/open-houses/${pathSegment(openHouse?.openHouseKey || openHouseKey)}`,
    image: listing?.imageUrl,
    imageAlt: listing?.address,
    type: 'article',
  })
}

export const officesSeoHead = (
  data: DirectoryData<OfficeDetail> | undefined,
) => {
  const search = (data?.search ?? defaultDirectorySearch) as DirectorySearch
  const office = data?.items.at(0)
  const officeName = office?.officeName ?? EXIT_EXCEL_OFFICE_NAME
  return createSeoHead({
    title: `${officeName} | ${appName}`,
    description: office
      ? `${officeName} office profile with ${number.format(office.agents.length)} agents and ${number.format(office.listings.length)} active CREA DDF listings${placeLabel(office) ? ` in ${placeLabel(office)}` : ''}.`
      : `${EXIT_EXCEL_OFFICE_NAME} office profile and CREA DDF listings.`,
    path: '/offices/',
    search: compactDirectorySearch(search),
    image: office?.imageUrl,
    imageAlt: officeName,
  })
}

export const agentsSeoHead = (data: DirectoryData<PersonCard> | undefined) => {
  const search = (data?.search ?? defaultAgentSearch) as AgentSearch
  return createSeoHead({
    title: `${EXIT_EXCEL_OFFICE_NAME} Agents | ${appName}`,
    description: `Browse ${EXIT_EXCEL_OFFICE_NAME} agents attached to active CREA DDF listings. Showing ${number.format(data?.items.length ?? 0)} agents on page ${number.format(search.page)}.`,
    path: '/agents/',
    search: compactAgentSearch(search),
    image: data?.items.find((agent) => agent.imageUrl)?.imageUrl,
  })
}

export const agentDetailSeoHead = (
  agent: AgentDetail | null | undefined,
  agentKey: string,
) => {
  const name = personName(agent)
  return createSeoHead({
    title: `${name} | ${appName}`,
    description: agent
      ? `${name}${agent.jobTitle ? `, ${agent.jobTitle}` : ''}${agent.office?.officeName ? ` at ${agent.office.officeName}` : ''}. View ${number.format(agent.listings.length)} active listings and ${number.format(agent.openHouses.length)} open houses.`
      : `CREA DDF agent detail for member key ${agentKey}.`,
    path: `/agents/${pathSegment(agent?.memberKey || agentKey)}`,
    image: agent?.imageUrl,
    imageAlt: name,
    type: 'profile',
  })
}

export const searchIndexSeoHead = (data: SearchIndexData | undefined) =>
  createSeoHead({
    title: `Listing Search | ${appName}`,
    description: data
      ? `Explore CREA DDF listings by ${number.format(data.groups.length)} searchable groups, including cities, property types, amenities, parking, utilities, and more.`
      : 'Explore CREA DDF listing search groups and filterable property categories.',
    path: '/search/',
    image: pageImage(data?.featuredListings ?? []),
  })

export const searchGroupSeoHead = (
  data: SearchGroupData | undefined,
  groupSlug: string,
) => {
  const group = data?.group
  const summary = data?.summary
  const title = group
    ? `${group.pluralLabel} | ${appName}`
    : `Search group ${groupSlug} | ${appName}`
  const description = group
    ? `${group.description} ${summary ? `${number.format(summary.valueCount)} values cover ${number.format(summary.listingCount)} active listings.` : 'Browse available values for this listing group.'}`
    : `Browse CREA DDF listing search group ${groupSlug}.`

  return createSeoHead({
    title,
    description,
    path: `/search/${pathSegment(group?.slug || groupSlug)}/`,
  })
}

export const groupedListingsSeoHead = (
  data: GroupedListingsData | undefined,
  groupSlug: string,
  valueSlug: string,
) => {
  const search = data?.search ?? defaultListingSearch
  const group = data?.group
  const value = data?.matchedValue
  const label = value
    ? `${value.value} ${group?.pluralLabel.toLowerCase() ?? 'listings'}`
    : 'Grouped listings'
  const description = value
    ? `${group?.description ?? 'Browse grouped CREA DDF listings'} Showing ${number.format(data?.listings.length ?? 0)} of ${number.format(value.count)} active listings for ${value.value} on page ${number.format(search.page)}.`
    : `Browse CREA DDF listings for group ${groupSlug} and value ${valueSlug}.`

  return createSeoHead({
    title: `${label} | ${appName}`,
    description,
    path: `/search/${pathSegment(data?.requested.groupSlug || groupSlug)}/${pathSegment(
      data?.requested.valueSlug || valueSlug,
    )}`,
    search: compactListingSearch(search),
    image: pageImage(data?.listings ?? []),
  })
}

export const infiniteDataPage = <
  TData extends { readonly search: { page: number } },
>(
  data: { readonly pages: ReadonlyArray<TData> } | undefined,
  page: number,
) =>
  data?.pages.find((item) => item.search.page === page) ??
  data?.pages.at(Math.max(0, page - 1)) ??
  data?.pages.at(-1)
