import { routes } from "./routes"
import { siteConfig } from "./site-config"

const pricingFallback = new URL(
  routes.google.pricing,
  siteConfig.rootUrl
).toString()

const paymentLink = (value: string | undefined) => value || pricingFallback

export const productPaymentLinks = {
  weeklyStrategySubscriptionPaymentLink: paymentLink(
    import.meta.env.PUBLIC_Weekly_Ads_Strategy_Meeting_Subscription_Link
  ),
  weeklyStrategy4MeetingsPaymentLink: paymentLink(
    import.meta.env.PUBLIC_Weekly_Ads_Strategy_4_Meetings_Payment_Link
  ),
  weeklyStrategy12MeetingsPaymentLink: paymentLink(
    import.meta.env.PUBLIC_Weekly_Ads_Strategy_12_Meetings_Payment_Link
  ),
  weeklyStrategy48MeetingsPaymentLink: paymentLink(
    import.meta.env.PUBLIC_Weekly_Ads_Strategy_48_Meetings_Payment_Link
  ),
  googleBusinessProfilePaymentLink: paymentLink(
    import.meta.env.PUBLIC_Google_Business_Profile_Optimization_Payment_link
  ),
  adsAuditPaymentLink: paymentLink(
    import.meta.env.PUBLIC_Google_Ads_Audit_Rewrite_Payment_link
  ),
} as const
