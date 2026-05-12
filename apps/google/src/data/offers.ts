import { productPaymentLinks } from "@/lib/payment-links"
import { routes } from "@/lib/routes"

export type OfferKey =
  | "adsAudit"
  | "weeklyStrategy"
  | "weeklyStrategy4Weeks"
  | "weeklyStrategy12Weeks"
  | "weeklyStrategy48Weeks"
  | "googleBusinessProfile"

type PricingOffer = {
  id: string
  number: string
  badge: string
  badgeStyle: string
  eyebrow: string
  title: string
  tagline: string
  price: string
  billing: string
  href: string
  cta: string
  highlight: boolean
  includes: string[]
  who: string
  turnaround: string
  guarantee: string
  detailHref: string
  detailLabel: string
  faqHref: string
}

type ServiceSummary = {
  eyebrow: string
  title: string
  href: string
  price: string
  billing: string
  description: string
}

type ProductSchemaOffer = {
  productId: string
  name: string
  description: string
  imageFilename: string
  route: string
  urlHash?: string
  price: string
  unitText?: string
}

type CatalogOffer = {
  key: OfferKey
  href: string
  paymentHref: string
  label: string
  shortLabel: string
  navLabel: string
  description: string
  shortDescription: string
  price: string
  priceWithBilling: string
  priceCta: string
  billing: string
  cta: string
  pricing: PricingOffer
  serviceSummary: ServiceSummary
  productSchema: ProductSchemaOffer
}

const weeklyBaseDescription =
  "Ongoing weekly optimization sessions. Pay weekly or save with prepaid bundles."

export const offerCatalog = {
  adsAudit: {
    key: "adsAudit",
    href: routes.google.services.AdsAudit,
    paymentHref: productPaymentLinks.adsAuditPaymentLink,
    label: "Google Ads Audit & Rewrite",
    shortLabel: "Audit + Rewrite",
    navLabel: "Ads Audit & Rewrite",
    description:
      "Google Ads audit, rewrite, and improvement plan covering campaigns, copy, keywords, bids, and negatives.",
    shortDescription:
      "Account audit, ad rewrite, and clear implementation plan.",
    price: "$300",
    priceWithBilling: "$300 one-time",
    priceCta: "$300",
    billing: "one-time",
    cta: "Improve My Ads for $300",
    pricing: {
      id: "ads-audit-offer",
      number: "01",
      badge: "Most Popular",
      badgeStyle: "bg-primary/20 border-primary/40 text-primary",
      eyebrow: "One-Time Improvement",
      title: "Google Ads Audit & Rewrite",
      tagline:
        "Your ads are spending inefficiently. We find the underperforming areas and improve campaigns, copy, keywords, bids, and negatives.",
      price: "$300",
      billing: "one-time. No retainer. No surprises.",
      href: productPaymentLinks.adsAuditPaymentLink,
      cta: "Improve My Ads for $300",
      highlight: true,
      includes: [
        "Full account audit: every campaign, ad group & keyword",
        "Rewritten ad copy for all active campaigns",
        "Keyword restructuring & match type cleanup",
        "Negative keyword list (reduces inefficient spend immediately)",
        "Search term report: see what you've been paying for",
        "Bid strategy & Quality Score improvement plan",
        "Plain-English written report of every finding",
        "7 days of email Q&A after delivery",
      ],
      who: "Best if you're already running Google Ads and not happy with the results.",
      turnaround: "Full account review",
      guarantee: "Revision policy included",
      detailHref: routes.google.services.AdsAudit + "#features",
      detailLabel: "Google Ads Audit & Rewrite details",
      faqHref: routes.google.frequentlyAskedQuestions + "#audit-process",
    },
    serviceSummary: {
      eyebrow: "Audit & Rewrite",
      title: "Google Ads Audit & Rewrite",
      href: routes.google.services.AdsAudit,
      price: "$300",
      billing: "one-time",
      description:
        "We go through every campaign, keyword, and ad in your account, flag inefficient spend, and rewrite your ads from scratch. Every audit covers campaigns, copy, keywords, bids, and negatives.",
    },
    productSchema: {
      productId: "ads-audit-product",
      name: "Google Ads Audit & Rewrite",
      description:
        "One-time Google Ads account audit and rewrite for local businesses already running campaigns.",
      imageFilename: "google_ads_audit_rewrite_2to6x.png",
      route: routes.google.services.AdsAudit,
      urlHash: "#pricing",
      price: "300",
    },
  },
  googleBusinessProfile: {
    key: "googleBusinessProfile",
    href: routes.google.services.GoogleMyBusiness,
    paymentHref: productPaymentLinks.googleBusinessProfilePaymentLink,
    label: "Google Business Profile Optimization",
    shortLabel: "GMB Optimization",
    navLabel: "Google Business Profile",
    description: "One-time profile optimization for free local leads.",
    shortDescription:
      "Optimize your local profile so you capture more free map-pack leads.",
    price: "$149",
    priceWithBilling: "$149 one-time",
    priceCta: "$149",
    billing: "one-time",
    cta: "Optimize My Profile for $149",
    pricing: {
      id: "google-my-business-offer",
      number: "06",
      badge: "Free Traffic Channel",
      badgeStyle: "bg-foreground/10 border-border text-foreground",
      eyebrow: "Local SEO",
      title: "Google Business Profile Optimization",
      tagline:
        "Show up free to everyone nearby searching for your service. Set up once, works forever.",
      price: "$149",
      billing: "one-time. Set it once. Free leads from Google, forever.",
      href: productPaymentLinks.googleBusinessProfilePaymentLink,
      cta: "Optimize My Profile for $149",
      highlight: false,
      includes: [
        "Keyword-optimized business description",
        "Services & products listed and described",
        "Website, booking & call links set up",
        "Category & attribute configuration",
        "Photo guidance and alt-text recommendations",
        "Q&A section pre-populated with buyer FAQs",
        "Full profile completeness review",
        "Post-setup checklist so you never fall behind",
      ],
      who: "Best for any local business that wants to capture free search traffic alongside (or instead of) paid ads.",
      turnaround: "Delivered within 48 hours",
      guarantee: "One-time setup, permanent results",
      detailHref: routes.google.services.GoogleMyBusiness + "#whats-included",
      detailLabel: "GBP optimization deliverables",
      faqHref: routes.google.frequentlyAskedQuestions + "#pricing",
    },
    serviceSummary: {
      eyebrow: "Local SEO",
      title: "Google Business Profile Optimization",
      href: routes.google.services.GoogleMyBusiness,
      price: "$149",
      billing: "one-time",
      description:
        "We fully optimize your Google Business Profile so you show up free to everyone nearby searching for your service. Set up once, works forever.",
    },
    productSchema: {
      productId: "google-business-profile-product",
      name: "Google Business Profile Optimization",
      description:
        "One-time Google Business Profile optimization to improve local visibility and generate free leads from Google.",
      imageFilename: "google_business_profile_optimization_2to6x.png",
      route: routes.google.services.GoogleMyBusiness,
      urlHash: "#pricing",
      price: "149",
    },
  },
  weeklyStrategy: {
    key: "weeklyStrategy",
    href: routes.google.services.WeeklyStrategy,
    paymentHref: productPaymentLinks.weeklyStrategySubscriptionPaymentLink,
    label: "Weekly Ads Strategy Sessions",
    shortLabel: "Weekly Ads Check-Ins",
    navLabel: "Weekly Ads Check-Ins",
    description: weeklyBaseDescription,
    shortDescription:
      "Live weekly optimization calls with in-session campaign edits.",
    price: "$60",
    priceWithBilling: "From $60 / week",
    priceCta: "$60",
    billing: "/ week",
    cta: "Compare Plans",
    pricing: {
      id: "weekly-strategy-offer",
      number: "02",
      badge: "Ongoing Growth",
      badgeStyle: "bg-foreground/10 border-border text-foreground",
      eyebrow: "Weekly Optimization",
      title: "Weekly Ads Strategy Sessions",
      tagline:
        "A dedicated hour every week to review data, make live edits, and keep compounding results.",
      price: "$60",
      billing:
        "weekly base rate. Available in monthly, 3-month, and 12-month plans.",
      href: routes.google.services.WeeklyStrategy + "#pricing",
      cta: "Compare Plans",
      highlight: false,
      includes: [
        "1-hour live strategy call every week",
        "Live edits to your campaigns during the call",
        "Performance data review & trend analysis",
        "Search term harvesting & negative keyword updates",
        "A/B test planning and results review",
        "Bid adjustment recommendations",
        "Weekly action items you can implement immediately",
        "Choose a monthly, 3-month, or 12-month plan",
      ],
      who: "Best after your initial audit, when you're ready to compound the gains week over week.",
      turnaround: "Book within 48 hours",
      guarantee: "Starts at $60 / week",
      detailHref: routes.google.services.WeeklyStrategy + "#what-happens",
      detailLabel: "Weekly strategy session details",
      faqHref: routes.google.frequentlyAskedQuestions + "#results",
    },
    serviceSummary: {
      eyebrow: "Ongoing Optimization",
      title: "Weekly Ads Check-Ins",
      href: routes.google.services.WeeklyStrategy,
      price: "$60",
      billing: "/ week",
      description:
        "A 1-hour weekly call where we review your performance data and make live edits to your campaigns. $60 / week base rate, available in monthly, 3-month, and 12-month plans.",
    },
    productSchema: {
      productId: "weekly-strategy-weekly-product",
      name: "Weekly Ads Strategy Sessions - $60 / week Base Rate",
      description:
        "Weekly Google Ads optimization sessions with live edits, trend review, and ongoing performance improvement. Available in monthly, 3-month, and 12-month plans.",
      imageFilename: "google_ads_weekly_strategy_call_report_2to6x.png",
      route: routes.google.services.WeeklyStrategy,
      urlHash: "#pricing",
      price: "60",
      unitText: "WEEK",
    },
  },
  weeklyStrategy4Weeks: {
    key: "weeklyStrategy4Weeks",
    href: routes.google.services.WeeklyStrategy4Weeks,
    paymentHref: productPaymentLinks.weeklyStrategy4MeetingsPaymentLink,
    label: "Monthly Ads Strategy Plan",
    shortLabel: "Monthly Ads Check-Ins",
    navLabel: "4-Week Bundle",
    description: "4 weekly sessions. Save vs paying weekly.",
    shortDescription:
      "Four weekly sessions over one month to clean up search terms, tighten campaigns, and build momentum.",
    price: "$199",
    priceWithBilling: "$199 one-time",
    priceCta: "$199",
    billing: "one-time",
    cta: "Buy 4 Sessions for $199",
    pricing: {
      id: "weekly-strategy-4-sessions-offer",
      number: "03",
      badge: "Monthly Plan",
      badgeStyle: "bg-foreground/10 border-border text-foreground",
      eyebrow: "Monthly Plan",
      title: "Monthly Ads Strategy Plan",
      tagline:
        "Four weekly optimization sessions to clean up search terms, tighten campaigns, and build momentum.",
      price: "$199",
      billing:
        "one-time. Four 1-hour weekly sessions. Discounted from $240 at $60 / week.",
      href: productPaymentLinks.weeklyStrategy4MeetingsPaymentLink,
      cta: "Buy 4 Sessions for $199",
      highlight: false,
      includes: [
        "Four 1-hour weekly strategy calls",
        "Live edits to campaigns during each call",
        "Search term cleanup and negative keyword updates",
        "Ad copy and offer test recommendations",
        "Bid and budget adjustment guidance",
        "Weekly action items between sessions",
        "Month-long performance trend review",
        "Discounted from the $60 / week base rate",
      ],
      who: "Best if you want one focused month of optimization.",
      turnaround: "First session within 48 hours",
      guarantee: "Fixed 4-session scope",
      detailHref: routes.google.services.WeeklyStrategy4Weeks + "#pricing",
      detailLabel: "Monthly strategy plan details",
      faqHref: routes.google.frequentlyAskedQuestions + "#pricing",
    },
    serviceSummary: {
      eyebrow: "Monthly Plan",
      title: "Monthly Ads Check-Ins",
      href: routes.google.services.WeeklyStrategy4Weeks,
      price: "$199",
      billing: "one-time",
      description:
        "Four weekly sessions over one month to clean up search terms, tighten campaigns, and build momentum. Discounted from $240 at $60 / week.",
    },
    productSchema: {
      productId: "weekly-strategy-4-sessions-product",
      name: "Google Ads Weekly Strategy - Monthly Plan",
      description:
        "Monthly plan with 4 weekly Google Ads strategy sessions, discounted from $240 at the $60 / week base rate.",
      imageFilename: "google_ads_4_weekly_sessions_2to6x.png",
      route: routes.google.services.WeeklyStrategy4Weeks,
      urlHash: "#pricing",
      price: "199",
    },
  },
  weeklyStrategy12Weeks: {
    key: "weeklyStrategy12Weeks",
    href: routes.google.services.WeeklyStrategy12Weeks,
    paymentHref: productPaymentLinks.weeklyStrategy12MeetingsPaymentLink,
    label: "3-Month Ads Strategy Plan",
    shortLabel: "3-Month Ads Check-Ins",
    navLabel: "12-Week Bundle",
    description:
      "12 weekly sessions with deeper optimization and compounding gains.",
    shortDescription:
      "Three months of weekly optimization so tests have time to mature and gains can compound.",
    price: "$499",
    priceWithBilling: "$499 one-time",
    priceCta: "$499",
    billing: "one-time",
    cta: "Buy 12 Sessions for $499",
    pricing: {
      id: "weekly-strategy-12-sessions-offer",
      number: "04",
      badge: "3-Month Plan",
      badgeStyle: "bg-foreground/10 border-border text-foreground",
      eyebrow: "3-Month Plan",
      title: "3-Month Ads Strategy Plan",
      tagline:
        "Three months of weekly optimization so tests have time to mature and gains have time to compound.",
      price: "$499",
      billing:
        "one-time. Twelve 1-hour weekly sessions. Discounted from $720 at $60 / week.",
      href: productPaymentLinks.weeklyStrategy12MeetingsPaymentLink,
      cta: "Buy 12 Sessions for $499",
      highlight: false,
      includes: [
        "Twelve 1-hour weekly strategy calls",
        "Live campaign edits during every session",
        "Search term harvesting and inefficient-spend reduction",
        "A/B test planning and results review",
        "Bid, budget, and audience recommendations",
        "Monthly performance pattern review",
        "Action items after every session",
        "Discounted from the $60 / week base rate",
      ],
      who: "Best if you want enough time to run tests, learn from data, and steadily improve campaigns.",
      turnaround: "First session within 48 hours",
      guarantee: "Fixed 12-session scope",
      detailHref: routes.google.services.WeeklyStrategy12Weeks + "#pricing",
      detailLabel: "3-month strategy plan details",
      faqHref: routes.google.frequentlyAskedQuestions + "#pricing",
    },
    serviceSummary: {
      eyebrow: "3-Month Plan",
      title: "3-Month Ads Check-Ins",
      href: routes.google.services.WeeklyStrategy12Weeks,
      price: "$499",
      billing: "one-time",
      description:
        "Three months of weekly optimization so tests have time to mature and gains can compound. Discounted from $720 at $60 / week.",
    },
    productSchema: {
      productId: "weekly-strategy-12-sessions-product",
      name: "Google Ads Weekly Strategy - 3-Month Plan",
      description:
        "3-month plan with 12 weekly Google Ads strategy sessions, discounted from $720 at the $60 / week base rate.",
      imageFilename: "google_ads_12_weekly_sessions_2to6x.png",
      route: routes.google.services.WeeklyStrategy12Weeks,
      urlHash: "#pricing",
      price: "499",
    },
  },
  weeklyStrategy48Weeks: {
    key: "weeklyStrategy48Weeks",
    href: routes.google.services.WeeklyStrategy48Weeks,
    paymentHref: productPaymentLinks.weeklyStrategy48MeetingsPaymentLink,
    label: "12-Month Ads Strategy Plan",
    shortLabel: "12-Month Ads Check-Ins",
    navLabel: "48-Week Bundle",
    description: "Full-year optimization at the lowest weekly rate.",
    shortDescription:
      "A full year of weekly check-ins, live edits, and locked-in pricing for businesses treating Google Ads like a core growth channel.",
    price: "$1,799",
    priceWithBilling: "$1,799 one-time",
    priceCta: "$1,799",
    billing: "one-time",
    cta: "Buy 48 Sessions for $1,799",
    pricing: {
      id: "weekly-strategy-48-sessions-offer",
      number: "05",
      badge: "12-Month Plan",
      badgeStyle: "bg-foreground/10 border-border text-foreground",
      eyebrow: "12-Month Plan",
      title: "12-Month Ads Strategy Plan",
      tagline:
        "A full year of weekly check-ins, live edits, and locked-in pricing for a core growth channel.",
      price: "$1,799",
      billing:
        "one-time. Forty-eight 1-hour weekly sessions. Discounted from $2,880 at $60 / week.",
      href: productPaymentLinks.weeklyStrategy48MeetingsPaymentLink,
      cta: "Buy 48 Sessions for $1,799",
      highlight: false,
      includes: [
        "Forty-eight 1-hour weekly strategy calls",
        "Live edits and optimization every week",
        "Seasonal campaign planning and adjustments",
        "Ongoing search term and negative keyword work",
        "Offer, landing page, and ad test planning",
        "Budget pacing and performance trend review",
        "Weekly next-step action items",
        "Discounted from the $60 / week base rate",
      ],
      who: "Best if Google Ads is a core channel and you want consistent optimization all year.",
      turnaround: "First session within 48 hours",
      guarantee: "Fixed 48-session scope",
      detailHref: routes.google.services.WeeklyStrategy48Weeks + "#pricing",
      detailLabel: "12-month strategy plan details",
      faqHref: routes.google.frequentlyAskedQuestions + "#pricing",
    },
    serviceSummary: {
      eyebrow: "12-Month Plan",
      title: "12-Month Ads Check-Ins",
      href: routes.google.services.WeeklyStrategy48Weeks,
      price: "$1,799",
      billing: "one-time",
      description:
        "A full year of weekly check-ins, live edits, and locked-in pricing for businesses treating Google Ads like a core growth channel. Discounted from $2,880 at $60 / week.",
    },
    productSchema: {
      productId: "weekly-strategy-48-sessions-product",
      name: "Google Ads Weekly Strategy - 12-Month Plan",
      description:
        "12-month plan with 48 weekly Google Ads strategy sessions, discounted from $2,880 at the $60 / week base rate.",
      imageFilename: "google_ads_48_weekly_sessions_2to6x.png",
      route: routes.google.services.WeeklyStrategy48Weeks,
      urlHash: "#pricing",
      price: "1799",
    },
  },
} satisfies Record<OfferKey, CatalogOffer>

export const offerOrder = [
  "adsAudit",
  "weeklyStrategy",
  "weeklyStrategy4Weeks",
  "weeklyStrategy12Weeks",
  "weeklyStrategy48Weeks",
  "googleBusinessProfile",
] as const

export const offers = offerOrder.map((key) => offerCatalog[key])

export const pricingOffers = offers.map((offer) => offer.pricing)
export const servicesIndexOffers = [
  offerCatalog.adsAudit,
  offerCatalog.googleBusinessProfile,
  offerCatalog.weeklyStrategy,
  offerCatalog.weeklyStrategy4Weeks,
  offerCatalog.weeklyStrategy12Weeks,
  offerCatalog.weeklyStrategy48Weeks,
].map((offer) => offer.serviceSummary)
export const productSchemaOffers: ProductSchemaOffer[] = offers.map(
  (offer) => offer.productSchema
)

export const serviceNavigationOffers = [
  offerCatalog.adsAudit,
  offerCatalog.googleBusinessProfile,
  offerCatalog.weeklyStrategy,
  offerCatalog.weeklyStrategy4Weeks,
  offerCatalog.weeklyStrategy12Weeks,
  offerCatalog.weeklyStrategy48Weeks,
].map((offer) => ({
  href: offer.href,
  label: offer.navLabel,
  description: offer.description,
  price:
    offer.key === "adsAudit"
      ? "$300 one-time"
      : offer.key === "weeklyStrategy"
        ? "$60 / week"
        : offer.priceWithBilling,
}))

export const successSetupOffers = [
  {
    id: "audit",
    title: offerCatalog.adsAudit.label,
    price: offerCatalog.adsAudit.priceWithBilling,
    description: offerCatalog.adsAudit.shortDescription,
  },
  {
    id: "gmb",
    title: offerCatalog.googleBusinessProfile.label,
    price: offerCatalog.googleBusinessProfile.priceWithBilling,
    description: offerCatalog.googleBusinessProfile.shortDescription,
  },
  {
    id: "weekly",
    title: offerCatalog.weeklyStrategy.label,
    price: offerCatalog.weeklyStrategy.priceWithBilling,
    description: offerCatalog.weeklyStrategy.shortDescription,
  },
] as const

export const successSetupServiceLabels = {
  audit: offerCatalog.adsAudit.label,
  gmb: offerCatalog.googleBusinessProfile.label,
  weekly: offerCatalog.weeklyStrategy.label,
} as const

export const contactShortcutOffers = [
  {
    href: offerCatalog.adsAudit.href,
    title: offerCatalog.adsAudit.shortLabel,
    description: "Best for businesses already running Google Ads",
    submittedDescription:
      "Full-scope review for underperforming Google Ads accounts",
    price: offerCatalog.adsAudit.priceCta,
  },
  {
    href: offerCatalog.weeklyStrategy.href,
    title: offerCatalog.weeklyStrategy.shortLabel,
    description:
      "Best for ongoing optimization after the initial improvement plan",
    submittedDescription: "Live account edits and weekly optimization",
    price: offerCatalog.weeklyStrategy.priceCta,
  },
  {
    href: offerCatalog.googleBusinessProfile.href,
    title: "GMB Optimization",
    submittedTitle: "GMB Optimization Only",
    description: "Best low-ticket entry offer for local businesses",
    submittedDescription: "Free traffic from Google, forever",
    price: offerCatalog.googleBusinessProfile.priceCta,
  },
] as const

export const beforeAfterPriceAssets = [
  {
    title: offerCatalog.adsAudit.shortLabel,
    price: offerCatalog.adsAudit.price,
    description: "Campaigns, copy, keywords, bids, and negatives.",
  },
  {
    title: "GMB Optimization",
    price: offerCatalog.googleBusinessProfile.price,
    description: "Boost your local Google presence.",
  },
  {
    title: "Weekly Strategy",
    price: offerCatalog.weeklyStrategy.price,
    description: "Ongoing optimization, every week.",
  },
] as const

export const auditOfferBlockIncluded = [
  "Complete Google Ads account audit (we look at everything)",
  "Rewritten ad copy for all active campaigns",
  "Keyword restructuring recommendations",
  "Negative keyword list (reduces inefficient spend immediately)",
  "Search term report: see what you've been paying for",
  "Bid strategy review and recommendations",
  "Quality Score improvement plan",
  "Plain-English written report of every finding and recommended improvement",
  "7 days of email Q&A after delivery",
] as const
