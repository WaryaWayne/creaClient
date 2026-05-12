const brandAssetVersion = import.meta.env.PUBLIC_BRAND_ASSET_VERSION

export const siteConfig = {
  name: "2To6X",
  legalName: "2To6X",
  rootUrl: "https://2to6x.com",
  defaultSeoTitle:
    "Improve Google Ads ROI | Expert Google Ads Optimization | 2To6X",
  defaultSeoDescription:
    "We audit, rewrite, and optimize Google Ads campaigns for local businesses seeking better qualified clicks. One-time $300 project fee. Same-day turnaround.",
  descriptions: {
    organization:
      "2To6X audits, rewrites, and optimizes Google Ads campaigns for local businesses.",
  },
  app: {
    shortName: "2To6X",
    manifest: "media/site.webmanifest",
    themeColor: "#090b0c",
    backgroundColor: "#fdf1db",
  },
  images: {
    openGraph: "og_image_2to6x.png",
    twitter: "twitter_x_og_2to6x.png",
    logo: `media/icons/logo-light-512w.png?v=${brandAssetVersion}`,
    logoSvg: `media/icons/logo-light.svg?v=${brandAssetVersion}`,
    logoVariants: [
      {
        path: `media/icons/logo-light.svg?v=${brandAssetVersion}`,
        theme: "light",
        type: "image/svg+xml",
      },
      {
        path: `media/icons/logo-dark.svg?v=${brandAssetVersion}`,
        theme: "dark",
        type: "image/svg+xml",
      },
      {
        path: `media/icons/logo-light-512w.png?v=${brandAssetVersion}`,
        theme: "light",
        type: "image/png",
        width: 512,
        height: 127,
      },
      {
        path: `media/icons/logo-light-1024w.png?v=${brandAssetVersion}`,
        theme: "light",
        type: "image/png",
        width: 1024,
        height: 254,
      },
      {
        path: `media/icons/logo-dark-512w.png?v=${brandAssetVersion}`,
        theme: "dark",
        type: "image/png",
        width: 512,
        height: 127,
      },
      {
        path: `media/icons/logo-dark-1024w.png?v=${brandAssetVersion}`,
        theme: "dark",
        type: "image/png",
        width: 1024,
        height: 254,
      },
    ],
    favicon: `media/icons/favicon.svg?v=${brandAssetVersion}`,
    faviconIco: `media/icons/favicon.ico?v=${brandAssetVersion}`,
    faviconPng: `media/icons/favicon-32x32.png?v=${brandAssetVersion}`,
    favicons: [
      {
        path: `media/icons/favicon-16x16.png?v=${brandAssetVersion}`,
        sizes: "16x16",
        type: "image/png",
      },
      {
        path: `media/icons/favicon-32x32.png?v=${brandAssetVersion}`,
        sizes: "32x32",
        type: "image/png",
      },
      {
        path: `media/icons/favicon-48x48.png?v=${brandAssetVersion}`,
        sizes: "48x48",
        type: "image/png",
      },
      {
        path: `media/icons/favicon-64x64.png?v=${brandAssetVersion}`,
        sizes: "64x64",
        type: "image/png",
      },
      {
        path: `media/icons/favicon-180x180.png?v=${brandAssetVersion}`,
        sizes: "180x180",
        type: "image/png",
      },
      {
        path: `media/icons/favicon-192x192.png?v=${brandAssetVersion}`,
        sizes: "192x192",
        type: "image/png",
      },
      {
        path: `media/icons/favicon-256x256.png?v=${brandAssetVersion}`,
        sizes: "256x256",
        type: "image/png",
      },
      {
        path: `media/icons/favicon-512x512.png?v=${brandAssetVersion}`,
        sizes: "512x512",
        type: "image/png",
      },
      {
        path: `media/icons/favicon-1024x1024.png?v=${brandAssetVersion}`,
        sizes: "1024x1024",
        type: "image/png",
      },
    ],
    maskableFavicons: [
      {
        path: `media/icons/favicon-maskable-192x192.png?v=${brandAssetVersion}`,
        sizes: "192x192",
        type: "image/png",
      },
      {
        path: `media/icons/favicon-maskable-256x256.png?v=${brandAssetVersion}`,
        sizes: "256x256",
        type: "image/png",
      },
      {
        path: `media/icons/favicon-maskable-512x512.png?v=${brandAssetVersion}`,
        sizes: "512x512",
        type: "image/png",
      },
      {
        path: `media/icons/favicon-maskable-1024x1024.png?v=${brandAssetVersion}`,
        sizes: "1024x1024",
        type: "image/png",
      },
    ],
    appleTouchIcon: `media/icons/favicon-180x180.png?v=${brandAssetVersion}`,
  },
} as const

export const getContactEmail = () => import.meta.env.PUBLIC_CONTACT_EMAIL

export const getLegalEmail = () => import.meta.env.PUBLIC_LEGAL_EMAIL

export const getBillingEmail = () => import.meta.env.PUBLIC_BILLING_EMAIL

export const getCompanyPhoneNumber = () =>
  import.meta.env.PUBLIC_COMPANY_PHONE_NUMBER

export const getCompanyPhoneNumberDisplay = () =>
  import.meta.env.PUBLIC_COMPANY_PHONE_NUMBER_DISPLAY

export const getCompanyAddress = () => ({
  streetAddress: import.meta.env.PUBLIC_COMPANY_STREET_ADDRESS,
  city: import.meta.env.PUBLIC_COMPANY_CITY,
  region: import.meta.env.PUBLIC_COMPANY_REGION,
  postalCode: import.meta.env.PUBLIC_COMPANY_POSTAL_CODE,
  country: import.meta.env.PUBLIC_COMPANY_COUNTRY,
  countryCode: import.meta.env.PUBLIC_COMPANY_COUNTRY_CODE,
})

export const getCompanyAddressDisplay = () => {
  const { streetAddress, city, region, postalCode, country } =
    getCompanyAddress()
  const regionPostal = [region, postalCode].filter(Boolean).join(" ")
  const cityLine = [city, regionPostal].filter(Boolean).join(", ")

  return [streetAddress, cityLine, country].filter(Boolean).join(", ")
}

export const getWhatsappUrl = () => {
  const phoneDigits = getCompanyPhoneNumber().replace(/\D/g, "")

  return phoneDigits ? `https://wa.me/${phoneDigits}` : undefined
}

export const getSocialUrls = () => ({
  facebook: import.meta.env.PUBLIC_FACEBOOK_URL,
  instagram: import.meta.env.PUBLIC_INSTAGRAM_URL,
  x: import.meta.env.PUBLIC_X_URL,
  gmb: import.meta.env.PUBLIC_GMB_URL,
})
