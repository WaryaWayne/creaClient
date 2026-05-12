import type {
  BreadcrumbList,
  ContactPage,
  FAQPage,
  Graph,
  ItemList,
  LocalBusiness,
  MerchantReturnPolicy,
  Organization,
  ProfessionalService,
  Service,
  WebPage,
  WebSite,
  WithContext,
} from "schema-dts"

export type AllowedSchemaNode =
  | WithContext<Organization>
  | WithContext<LocalBusiness>
  | WithContext<ProfessionalService>
  | WithContext<WebSite>
  | WithContext<WebPage>
  | WithContext<ContactPage>
  | WithContext<FAQPage>
  | WithContext<MerchantReturnPolicy>
  | WithContext<Service>
  | WithContext<ItemList>
  | WithContext<BreadcrumbList>
  | Graph
export type OrganizationSchemaType = "Organization"

export type SchemaInput = AllowedSchemaNode | readonly AllowedSchemaNode[]

export const sharedServiceArea = [
  {
    "@type": "Country" as const,
    name: "Canada",
  },
  {
    "@type": "Country" as const,
    name: "United States",
  },
  {
    "@type": "City" as const,
    name: "Ottawa",
    containedInPlace: {
      "@type": "AdministrativeArea" as const,
      name: "Ontario",
      containedInPlace: {
        "@type": "Country" as const,
        name: "Canada",
      },
    },
  },
] as const

export const professionalServiceAddress = {
  "@type": "PostalAddress" as const,
  streetAddress: import.meta.env.PUBLIC_COMPANY_STREET_ADDRESS,
  addressLocality: import.meta.env.PUBLIC_COMPANY_CITY,
  addressRegion: import.meta.env.PUBLIC_COMPANY_REGION,
  postalCode: import.meta.env.PUBLIC_COMPANY_POSTAL_CODE,
  addressCountry: import.meta.env.PUBLIC_COMPANY_COUNTRY_CODE,
}

export const getSchemaEntityModel = (siteUrl: URL, basePath: string) => {
  const rootSiteUrl = new URL("/", siteUrl).toString()
  const appSiteUrl = new URL(basePath, siteUrl).toString()

  return {
    rootSiteUrl,
    appSiteUrl,
    ids: {
      rootOrganization: `${rootSiteUrl}#organization`,
      appWebsite: `${appSiteUrl}#website`,
      googleProfessionalService: `${appSiteUrl}#professional-service`,
      googleHomepageService: `${appSiteUrl}#homepage-service`,
    },
  }
}
