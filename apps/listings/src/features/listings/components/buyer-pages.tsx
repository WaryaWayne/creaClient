import { Link } from '@tanstack/react-router'
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Home,
  ListChecks,
  MapPin,
  Search,
} from 'lucide-react'

import { Button } from '@workspace/ui/components/button'

import { defaultListingSearch, defaultOpenHouseSearch } from '../search'
import { AskExpertButton, ExpertHelpCallout } from './contact'

import type { ListingSearch } from '../search'

const buyerPlanId = 'buyer-plan'
const buyerShortlistId = 'buyer-shortlist'
const buyerTourId = 'buyer-tour'

const buyerSearch = {
  ...defaultListingSearch,
  status: 'Active',
  minBeds: 2,
  sort: 'newest',
  page: 1,
} satisfies ListingSearch

const buyerNavigation = [
  {
    title: 'Plan',
    description: 'Set the must-haves before the search gets noisy.',
    hash: buyerPlanId,
    icon: ListChecks,
  },
  {
    title: 'Shortlist',
    description: 'Compare listings by evidence, not just the cover photo.',
    hash: buyerShortlistId,
    icon: Home,
  },
  {
    title: 'Tour',
    description:
      'Use open houses and questions to decide what is worth seeing.',
    hash: buyerTourId,
    icon: CalendarDays,
  },
] as const

const buyerChecks = [
  {
    title: 'Budget lane',
    description:
      'Know the payment comfort, cash needed, closing-cost buffer, and where price flexibility ends.',
  },
  {
    title: 'Location tradeoffs',
    description:
      'Separate commute, school, transit, parking, and neighbourhood needs from nice-to-have preferences.',
  },
  {
    title: 'Property fit',
    description:
      'Compare bedrooms, baths, parking, property type, utilities, and maintenance exposure before touring.',
  },
] as const

export function BuyerLandingPage() {
  return (
    <main className="page-wrap grid gap-6 py-8">
      <section className="grid gap-5 rounded-lg border border-border bg-card p-5 lg:grid-cols-[1fr_360px]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-foreground">
            Buyer path
          </p>
          <h1 className="display-title mt-2 max-w-4xl text-4xl font-bold text-foreground md:text-5xl">
            Find the listings worth a closer look.
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-foreground">
            Start from active local listings, keep the filters shareable, and
            ask for help when a home, open house, or buying tradeoff needs a
            practical read.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button
              nativeButton={false}
              render={<Link to="/listings" search={buyerSearch} />}
            >
              <Search />
              Browse buyer matches
            </Button>
            <AskExpertButton
              context={{
                source: 'buyer-hero',
                audience: 'buyer',
                tool: 'buyer-start',
              }}
              label="Ask a buyer expert"
              defaultMessage="I need help deciding what to focus on as a buyer."
            />
          </div>
        </div>
        <aside className="grid content-start gap-3 rounded-lg border border-border bg-card p-4">
          <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-foreground">
            Buyer workflow
          </p>
          {buyerNavigation.map((item) => {
            const Icon = item.icon
            return (
              <Link
                to="/buyers"
                hash={item.hash}
                className="flex items-center justify-between gap-3 rounded-md border border-border bg-card px-3 py-3 text-foreground no-underline hover:border-foreground/50"
                key={item.hash}
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-background">
                    <Icon className="size-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-extrabold">
                      {item.title}
                    </span>
                    <span className="mt-0.5 block text-xs leading-5">
                      {item.description}
                    </span>
                  </span>
                </span>
                <ArrowRight className="size-4 shrink-0" />
              </Link>
            )
          })}
        </aside>
      </section>

      <section
        id={buyerPlanId}
        className="grid scroll-mt-24 gap-5 lg:grid-cols-[1fr_340px]"
      >
        <div className="grid gap-4 rounded-lg border border-border bg-card p-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-foreground">
              Buying plan
            </p>
            <h2 className="display-title mt-2 text-3xl font-bold text-foreground">
              Start with the decision, then open the listings.
            </h2>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {buyerChecks.map((item) => (
              <article
                className="rounded-lg border border-border bg-card p-4"
                key={item.title}
              >
                <CheckCircle2 className="size-5 text-foreground" />
                <h3 className="mt-3 text-sm font-extrabold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-foreground">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </div>
        <ExpertHelpCallout
          context={{
            source: 'buyer-plan-callout',
            audience: 'buyer',
            tool: 'plan',
          }}
          title="Not sure what matters most?"
          description="Send the constraint you are stuck on and we will help turn it into a usable search path."
          buttonLabel="Ask about my plan"
          defaultMessage="I need help turning my buyer priorities into a search plan."
        />
      </section>

      <section
        id={buyerShortlistId}
        className="grid scroll-mt-24 gap-5 rounded-lg border border-border bg-card p-5 lg:grid-cols-[1fr_300px]"
      >
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-foreground">
            Shortlist
          </p>
          <h2 className="display-title mt-2 text-3xl font-bold text-foreground">
            Compare the same facts across every candidate.
          </h2>
          <p className="mt-3 text-sm leading-6 text-foreground">
            Use the listing grid for price, type, beds, baths, parking, rooms,
            media, office and agent credits, then share the URL once the filters
            match the real buy box.
          </p>
        </div>
        <div className="grid content-start gap-3">
          <Button
            nativeButton={false}
            render={<Link to="/listings" search={buyerSearch} />}
          >
            <Home />
            Open listings
          </Button>
          <Button
            nativeButton={false}
            render={<Link to="/search" />}
            variant="outline"
          >
            <MapPin />
            Browse categories
          </Button>
        </div>
      </section>

      <section
        id={buyerTourId}
        className="grid scroll-mt-24 gap-5 rounded-lg border border-border bg-card p-5 lg:grid-cols-[1fr_300px]"
      >
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-foreground">
            Tours and open houses
          </p>
          <h2 className="display-title mt-2 text-3xl font-bold text-foreground">
            Use showings to answer specific questions.
          </h2>
          <p className="mt-3 text-sm leading-6 text-foreground">
            Before spending time on a tour, write down what the listing page
            cannot prove: noise, layout flow, parking, condition, disclosures,
            commute, and what would make the home a yes or no.
          </p>
        </div>
        <div className="grid content-start gap-3">
          <Button
            nativeButton={false}
            render={<Link to="/open-houses" search={defaultOpenHouseSearch} />}
          >
            <CalendarDays />
            View open houses
          </Button>
          <AskExpertButton
            context={{
              source: 'buyer-tour-callout',
              audience: 'buyer',
              tool: 'tour',
            }}
            label="Ask before touring"
            defaultMessage="I need help deciding what to ask before a showing or open house."
          />
        </div>
      </section>
    </main>
  )
}
