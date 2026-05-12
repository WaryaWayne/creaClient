declare module "*.svg?react" {
  import type { FunctionComponent, SVGProps } from "react"

  const ReactComponent: FunctionComponent<SVGProps<SVGSVGElement>>
  export default ReactComponent
}

interface ImportMetaEnv {
  PUBLIC_Google_Business_Profile_Optimization_Payment_link: string
  PUBLIC_Google_Ads_Audit_Rewrite_Payment_link: string
  PUBLIC_Weekly_Ads_Strategy_Meeting_Subscription_Link: string
  PUBLIC_Weekly_Ads_Strategy_4_Meetings_Payment_Link: string
  PUBLIC_Weekly_Ads_Strategy_12_Meetings_Payment_Link: string
  PUBLIC_Weekly_Ads_Strategy_48_Meetings_Payment_Link: string
  PUBLIC_COMPANY_PHONE_NUMBER: string
  PUBLIC_COMPANY_PHONE_NUMBER_DISPLAY: string
  PUBLIC_SUPPORT_EMAIL: string
  PUBLIC_LEGAL_EMAIL: string
  PUBLIC_BILLING_EMAIL: string
  PUBLIC_CONTACT_EMAIL: string
  PUBLIC_GMB_URL: string
  PUBLIC_FACEBOOK_URL: string
  PUBLIC_INSTAGRAM_URL: string
  PUBLIC_LINKEDIN_URL: string
  PUBLIC_X_URL: string
  PUBLIC_YOUTUBE_URL: string
  PUBLIC_COMPANY_STREET_ADDRESS: string
  PUBLIC_COMPANY_CITY: string
  PUBLIC_COMPANY_REGION: string
  PUBLIC_COMPANY_POSTAL_CODE: string
  PUBLIC_COMPANY_COUNTRY: string
  PUBLIC_COMPANY_COUNTRY_CODE: string
  PUBLIC_SERVICE_AREA: string
  TELEGRAM_BOT_TOKEN: string
  TELEGRAM_USER_ID: string
  TURNSTILE_SECRET_KEY: string
  TURNSTILE_SITE_KEY: string
  PUBLIC_BRAND_ASSET_VERSION: string
  PUBLIC_GOOGLE_MAPS_LINK: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface Window {
  turnstile?: {
    render: (
      container: HTMLElement,
      options: {
        sitekey: string
        theme: "light" | "dark"
        size: "normal" | "flexible" | "compact"
        callback: (token: string) => void
        "expired-callback": () => void
        "error-callback": () => void
      }
    ) => string
    reset: (widgetId?: string) => void
    remove: (widgetId: string) => void
  }
  zaraz?: {
    track: (
      eventName: string,
      eventProperties?: Record<string, unknown>
    ) => Promise<void>
    ecommerce: (
      eventName: string,
      eventProperties?: Record<string, unknown>
    ) => Promise<void>
  }
}
