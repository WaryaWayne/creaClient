import { routes } from "./routes"
import { offerCatalog, serviceNavigationOffers } from "@/data/offers"

export type NavLink = {
  href: string
  label: string
}

export type ServiceLink = NavLink & {
  description: string
  price: string
}

export const serviceLinks: ServiceLink[] = serviceNavigationOffers

export const primaryNavLinks: NavLink[] = [
  { href: routes.google.services.Index, label: "Services" },
  { href: routes.google.pricing, label: "Pricing" },
  { href: routes.google.frequentlyAskedQuestions, label: "FAQ" },
  { href: routes.google.contact, label: "Contact" },
]

export const servicesOverviewHref = routes.google.services.Index
export const industriesOverviewHref = routes.google.industry.Index
export const primaryCtaHref = offerCatalog.adsAudit.href

export const industryNavSlugOrder = [
  "plumbers",
  "tow-trucks",
  "dentists",
  "locksmiths",
  "hvac",
  "electricians",
  "roofers",
  "pest-control",
  "movers",
  "auto-glass",
  "garage-door",
  "tree-service",
  "appliance-repair",
  "carpet-cleaning",
  "water-damage",
] as const

export function orderIndustriesForNav<T extends { slug: string }>(
  industries: T[]
): T[] {
  const bySlug = new Map(
    industries.map((industry) => [industry.slug, industry])
  )
  const ordered = industryNavSlugOrder
    .map((slug) => bySlug.get(slug))
    .filter((industry): industry is T => Boolean(industry))

  const missing = industries.filter(
    (industry) =>
      !industryNavSlugOrder.includes(
        industry.slug as (typeof industryNavSlugOrder)[number]
      )
  )
  return [...ordered, ...missing]
}
