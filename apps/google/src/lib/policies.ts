import { routes } from "./routes"
import type { NavLink } from "./site-nav"

export const policyLinks: NavLink[] = [
  { href: routes.google.policies.TermsOfService, label: "Terms of Service" },
  { href: routes.google.policies.Privacy, label: "Privacy Policy" },
  { href: routes.google.policies.Cookies, label: "Cookie Policy" },
  { href: routes.google.policies.TrackingOptOut, label: "Ad Tracking Opt-Out" },
  { href: routes.google.policies.Refunds, label: "Refund Policy" },
  { href: routes.google.policies.Disclaimer, label: "Disclaimer" },
  {
    href: routes.google.policies.AcceptableUse,
    label: "Acceptable Use Policy",
  },
]
