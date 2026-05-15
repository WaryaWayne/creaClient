import { Link, createFileRoute } from '@tanstack/react-router'
import {
  ArrowRight,
  Building2,
  CalendarDays,
  Home as HomeIcon,
  KeyRound,
  Landmark,
  Search,
  TrendingUp,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { homeSeoHead } from '#/features/listings/seo'
import {
  defaultListingSearch,
  defaultOpenHouseSearch,
} from '#/features/listings/search'
import { Button } from '@workspace/ui/components/button'

import type { ListingSearch } from '#/features/listings/search'

export const Route = createFileRoute('/')({
  head: () => homeSeoHead(undefined),
  component: Home,
})

type AudienceRoute =
  | '/sellers'
  | '/buyers'
  | '/rentals'
  | '/estates'
  | '/investments'

type AudienceOption = {
  readonly title: string
  readonly eyebrow: string
  readonly description: string
  readonly to: AudienceRoute
  readonly icon: LucideIcon
  readonly searchLabel: string
  readonly search: Partial<ListingSearch>
  readonly bullets: readonly [string, string]
}

const listingSearch = (search: Partial<ListingSearch>): ListingSearch => ({
  ...defaultListingSearch,
  ...search,
  page: 1,
})

const audienceOptions: readonly AudienceOption[] = [
  {
    title: 'Sellers',
    eyebrow: 'I need to sell',
    description:
      'Prepare a listing path, compare active inventory, and see how local properties are presented.',
    to: '/sellers',
    icon: HomeIcon,
    searchLabel: 'See active listings',
    search: { status: 'Active', sort: 'newest' },
    bullets: ['Position the property', 'Check live competition'],
  },
  {
    title: 'Buyers',
    eyebrow: 'I want to buy',
    description:
      'Start with current listings, then narrow by city, budget, beds, baths, and property type.',
    to: '/buyers',
    icon: Search,
    searchLabel: 'Browse buyer matches',
    search: { minBeds: 2, sort: 'newest' },
    bullets: ['Search shareable URLs', 'Review listing details'],
  },
  {
    title: 'Rentals',
    eyebrow: 'I need a rental',
    description:
      'Use rental-focused starting points and keep open houses close when a listing is ready to tour.',
    to: '/rentals',
    icon: KeyRound,
    searchLabel: 'Search rental budget',
    search: { maxPrice: 3500, sort: 'price-asc' },
    bullets: ['Start by monthly budget', 'Track open house options'],
  },
  {
    title: 'Estates',
    eyebrow: 'I am handling an estate',
    description:
      'Find larger-property comps, organize sale context, and keep the next steps easy to hand off.',
    to: '/estates',
    icon: Landmark,
    searchLabel: 'View estate-scale homes',
    search: { minBeds: 4, minParking: 2, sort: 'price-desc' },
    bullets: ['Compare larger homes', 'Keep details shareable'],
  },
  {
    title: 'Investments',
    eyebrow: 'I am investing',
    description:
      'Look for properties through a yield-minded lens, then move into filtered search when ready.',
    to: '/investments',
    icon: TrendingUp,
    searchLabel: 'Scan investment starts',
    search: { minParking: 1, sort: 'price-asc' },
    bullets: ['Sort by price quickly', 'Explore income signals'],
  },
]

const siteHighlights = [
  {
    title: 'Listings',
    description:
      'Browse synced CREA DDF listings with filters that stay in the URL.',
    icon: Building2,
  },
  {
    title: 'Open Houses',
    description:
      'Jump into current open house records and follow them back to listing details.',
    icon: CalendarDays,
  },
  {
    title: 'Search Pages',
    description:
      'Use category pages for cities, property types, lease signals, and other indexed fields.',
    icon: Search,
  },
] as const

function Home() {
  return (
    <main className="grid gap-10 pb-12">
      <section className="page-wrap grid gap-8 py-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div className="grid gap-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-foreground">
              CREA listings browser
            </p>
            <h1 className="display-title mt-3 max-w-3xl text-5xl font-bold leading-[1.03] text-foreground md:text-6xl">
              Start with who you are.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-foreground">
              Choose a path for selling, buying, rentals, estates, or
              investments. Each path can branch into the same listings, open
              houses, and search pages already on the site.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              nativeButton={false}
              render={<Link to="/listings" search={defaultListingSearch} />}
              size="lg"
            >
              <Search />
              Browse listings
            </Button>
            <Button
              nativeButton={false}
              render={
                <Link to="/open-houses" search={defaultOpenHouseSearch} />
              }
              size="lg"
              variant="outline"
            >
              <CalendarDays />
              Open houses
            </Button>
          </div>
        </div>
        <div className="grid gap-3 rounded-lg border border-border bg-background p-4 shadow-[0_18px_42px_rgba(23,58,64,0.08)]">
          <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-foreground">
            What you can do here
          </p>
          <div className="grid gap-3">
            {siteHighlights.map((item) => (
              <SiteHighlight item={item} key={item.title} />
            ))}
          </div>
        </div>
      </section>

      <section className="page-wrap grid gap-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-foreground">
              Choose a path
            </p>
            <h2 className="display-title mt-2 text-4xl font-bold text-foreground">
              Who are you today?
            </h2>
          </div>
          <Link
            to="/search"
            className="inline-flex w-fit items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm font-extrabold text-foreground no-underline hover:border-border"
          >
            Search all categories
            <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="grid items-stretch gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(100%,15rem),1fr))]">
          {audienceOptions.map((option) => (
            <AudienceCard option={option} key={option.to} />
          ))}
        </div>
      </section>
    </main>
  )
}

function SiteHighlight({
  item,
}: {
  readonly item: (typeof siteHighlights)[number]
}) {
  const Icon = item.icon
  return (
    <article className="grid gap-3 rounded-lg border border-border bg-background p-4 sm:grid-cols-[auto_1fr] sm:items-start">
      <span className="flex size-10 items-center justify-center rounded-md bg-background text-foreground">
        <Icon className="size-5" />
      </span>
      <span>
        <span className="block text-base font-extrabold text-foreground">
          {item.title}
        </span>
        <span className="mt-1 block text-sm leading-6 text-foreground">
          {item.description}
        </span>
      </span>
    </article>
  )
}

function AudienceCard({ option }: { readonly option: AudienceOption }) {
  const Icon = option.icon
  return (
    <article className="feature-card grid min-h-[22rem] content-between gap-5 rounded-lg border border-border p-5 text-foreground">
      <div className="grid gap-4">
        <div className="flex items-start justify-between gap-3">
          <span className="flex size-11 items-center justify-center rounded-md bg-background text-foreground">
            <Icon className="size-5" />
          </span>
          <span className="rounded-full border border-border bg-background px-2.5 py-1 text-xs font-bold text-foreground">
            {option.title}
          </span>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-foreground">
            {option.eyebrow}
          </p>
          <h3 className="display-title mt-2 text-2xl font-bold leading-tight text-foreground">
            {option.title}
          </h3>
          <p className="mt-3 text-sm leading-6 text-foreground">
            {option.description}
          </p>
        </div>
        <div className="grid gap-2">
          {option.bullets.map((bullet) => (
            <span
              className="rounded-md border border-border bg-background px-3 py-2 text-sm font-semibold text-foreground"
              key={bullet}
            >
              {bullet}
            </span>
          ))}
        </div>
      </div>
      <div className="grid gap-2">
        <Button
          nativeButton={false}
          render={<Link to={option.to} />}
          className="w-full justify-between"
        >
          Start here
          <ArrowRight />
        </Button>
        <Button
          nativeButton={false}
          render={<Link to="/listings" search={listingSearch(option.search)} />}
          className="w-full justify-between"
          variant="outline"
        >
          {option.searchLabel}
          <Search />
        </Button>
      </div>
    </article>
  )
}
