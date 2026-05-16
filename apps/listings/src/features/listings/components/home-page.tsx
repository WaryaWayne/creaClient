import { Link } from '@tanstack/react-router'
import { CalendarDays, Search } from 'lucide-react'

import { Button } from '@workspace/ui/components/button'

import type { HomeData } from '../data'
import { defaultListingSearch, defaultOpenHouseSearch } from '../search'
import { OpenHouseRow } from './directory-pages'
import { ListingCard, ListingsGrid } from './listing-card'
import { DirectoryPanel, SectionHeader } from './shared'
import { number } from './utils'

export function HomePage({ data }: { readonly data: HomeData }) {
  const heroListing = data.featuredListings.at(0) ?? null
  return (
    <main>
      <section className="page-wrap grid gap-8 py-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="grid gap-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-foreground">
              CREA DDF browser
            </p>
            <h1 className="display-title mt-3 max-w-3xl text-5xl font-bold leading-[1.02] text-foreground md:text-6xl">
              Find the right listing from the local data already synced here.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-foreground">
              Browse listings and open houses from the local database. Office
              and agent credits stay attached to the listings they represent.
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
          <div className="grid gap-3 sm:grid-cols-3">
            <SummaryStat
              label="Listings shown"
              value={data.featuredListings.length}
            />
            <SummaryStat
              label="Cities sampled"
              value={data.facets.cities.length}
            />
            <SummaryStat label="Open houses" value={data.openHouses.length} />
          </div>
        </div>
        {heroListing ? (
          <div className="lg:pl-4">
            <ListingCard listing={heroListing} />
          </div>
        ) : null}
      </section>
      <section className="page-wrap grid gap-8 pb-12">
        <SectionHeader
          title="Latest listings"
          action={
            <Button
              nativeButton={false}
              render={<Link to="/listings" search={defaultListingSearch} />}
              variant="outline"
            >
              View all
            </Button>
          }
        />
        <ListingsGrid listings={data.featuredListings.slice(0, 6)} />
        {data.openHouses.length > 0 ? (
          <DirectoryPanel title="Open houses">
            {data.openHouses.slice(0, 4).map((openHouse) => (
              <OpenHouseRow
                openHouse={openHouse}
                key={openHouse.openHouseKey}
              />
            ))}
          </DirectoryPanel>
        ) : null}
      </section>
    </main>
  )
}

function SummaryStat({
  label,
  value,
}: {
  readonly label: string
  readonly value: number
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-2xl font-extrabold text-foreground">
        {number.format(value)}
      </p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-foreground">
        {label}
      </p>
    </div>
  )
}
