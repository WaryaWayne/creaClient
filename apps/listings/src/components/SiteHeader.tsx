import { Link } from '@tanstack/react-router'
import { ArrowRight, ChevronDown } from 'lucide-react'

import { Button } from '@workspace/ui/components/button'
import { ButtonGroup } from '@workspace/ui/components/button-group'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from '@workspace/ui/components/item'
import { AppLogo } from '#/components/AppLogo'
import { MobileNav } from '#/components/MobileNav'
import { ModeToggle } from '#/components/ModeToggle'
import {
  defaultListingSearch,
  defaultOpenHouseSearch,
} from '#/features/listings/search'

import type { ListingSearch } from '#/features/listings/search'

const desktopLinkClass =
  'text-sm font-medium text-foreground no-underline transition-colors hover:text-primary'

const toolLinkClass =
  'flex h-full min-h-[3.25rem] items-center justify-center text-center no-underline'

const estatePropertiesSearch = {
  ...defaultListingSearch,
  status: 'Active',
  minBeds: 4,
  minBaths: 3,
  minParking: 2,
  sort: 'price-desc',
} satisfies ListingSearch

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 mx-auto max-w-[1000px] bg-transparent shadow-lg backdrop-blur-2xl">
      <nav
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4"
        aria-label="Main navigation"
      >
        <Link
          to="/"
          className="flex min-w-0 items-center no-underline"
          aria-label="CreaClient home"
        >
          <AppLogo imageClassName="h-10 max-w-[152px] transition-transform duration-200 hover:scale-105" />
        </Link>

        <div className="hidden items-center gap-6 lg:flex">
          <Link
            to="/listings"
            search={defaultListingSearch}
            className={desktopLinkClass}
          >
            Listings
          </Link>
          <Link
            to="/rentals"
            search={defaultListingSearch}
            className={desktopLinkClass}
          >
            Rentals
          </Link>
          <Link
            to="/open-houses"
            search={defaultOpenHouseSearch}
            className={desktopLinkClass}
          >
            Open houses
          </Link>

          <div className="group relative">
            <Button
              variant="ghost"
              aria-expanded="false"
              aria-haspopup="true"
              type="button"
              className="py-4 text-sm font-medium"
            >
              Paths
              <ChevronDown className="h-4 w-4 transition-transform group-hover:rotate-180" />
            </Button>
            <div className="invisible absolute top-full left-1/2 z-50 w-[620px] -translate-x-1/2 border border-border bg-card p-2 opacity-0 shadow-xl transition-all duration-200 group-hover:visible group-hover:opacity-100">
              <div className="grid grid-cols-2 gap-2">
                <Item variant="outline" render={<Link to="/buyers" />}>
                  <ItemContent>
                    <ItemTitle>Buyers</ItemTitle>
                    <ItemDescription>
                      Search synced CREA DDF listings, rentals, and open houses.
                    </ItemDescription>
                  </ItemContent>
                  <ItemActions className="text-xs font-semibold text-primary">
                    Browse
                  </ItemActions>
                </Item>
                <Item variant="outline" render={<Link to="/sellers" />}>
                  <ItemContent>
                    <ItemTitle>Sellers</ItemTitle>
                    <ItemDescription>
                      Prepare, price, and compare before listing a property.
                    </ItemDescription>
                  </ItemContent>
                  <ItemActions className="text-xs font-semibold text-primary">
                    Plan
                  </ItemActions>
                </Item>
                <Item variant="outline" render={<Link to="/investments" />}>
                  <ItemContent>
                    <ItemTitle>Investments</ItemTitle>
                    <ItemDescription>
                      Screen active listings and move into deal math.
                    </ItemDescription>
                  </ItemContent>
                  <ItemActions className="text-xs font-semibold text-primary">
                    Analyze
                  </ItemActions>
                </Item>
                <Item variant="outline" render={<Link to="/estates" />}>
                  <ItemContent>
                    <ItemTitle>Estates</ItemTitle>
                    <ItemDescription>
                      Organize larger-property and executor decisions.
                    </ItemDescription>
                  </ItemContent>
                  <ItemActions className="text-xs font-semibold text-primary">
                    Plan
                  </ItemActions>
                </Item>
              </div>
              <div className="mt-2 border-t border-border px-2 pt-2">
                <Link
                  to="/search"
                  className="flex items-center justify-center gap-1 py-2 text-xs font-semibold text-primary no-underline transition-colors hover:text-primary/80"
                >
                  Search by market signal <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>

          <div className="group relative">
            <Button
              variant="ghost"
              aria-expanded="false"
              aria-haspopup="true"
              type="button"
              className="py-4 text-sm font-medium"
            >
              Tools
              <ChevronDown className="h-4 w-4 transition-transform group-hover:rotate-180" />
            </Button>
            <div className="invisible absolute top-full left-1/2 z-50 w-[680px] -translate-x-1/2 border border-border bg-card p-2 opacity-0 shadow-xl transition-all duration-200 group-hover:visible group-hover:opacity-100">
              <p className="mb-3 px-2 pt-2 text-xs font-bold tracking-widest text-primary uppercase">
                Calculators, comparisons, and directories
              </p>
              <div className="grid auto-rows-fr grid-cols-3 gap-1 px-2 pb-2">
                <Link to="/sellers/calculator" className={toolLinkClass}>
                  <span className="leading-tight font-medium">
                    Seller calculator
                  </span>
                </Link>
                <Link
                  to="/sellers/comparables"
                  search={defaultListingSearch}
                  className={toolLinkClass}
                >
                  <span className="leading-tight font-medium">Comparables</span>
                </Link>
                <Link
                  to="/investments/opportunities"
                  search={defaultListingSearch}
                  className={toolLinkClass}
                >
                  <span className="leading-tight font-medium">Investments</span>
                </Link>
                <Link to="/investments/calculator" className={toolLinkClass}>
                  <span className="leading-tight font-medium">
                    Investment calculator
                  </span>
                </Link>
                <Link to="/estates/organizer" className={toolLinkClass}>
                  <span className="leading-tight font-medium">
                    Estate organizer
                  </span>
                </Link>
                <Link to="/estates/calculator" className={toolLinkClass}>
                  <span className="leading-tight font-medium">
                    Estate calculator
                  </span>
                </Link>
                <Link
                  to="/estates/properties"
                  search={estatePropertiesSearch}
                  className={toolLinkClass}
                >
                  <span className="leading-tight font-medium">
                    Estate properties
                  </span>
                </Link>
                <Link to="/sellers/get-ready" className={toolLinkClass}>
                  <span className="leading-tight font-medium">Seller prep</span>
                </Link>
                <Link to="/investments/due-diligence" className={toolLinkClass}>
                  <span className="leading-tight font-medium">
                    Due diligence
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <ButtonGroup className="hidden lg:flex lg:items-center lg:gap-2">
          <ModeToggle />
          <Button
            nativeButton={false}
            render={<Link to="/listings" search={defaultListingSearch} />}
          >
            View listings
          </Button>
        </ButtonGroup>

        <div className="lg:hidden">
          <ButtonGroup className="flex items-center gap-2">
            <ModeToggle />
            <MobileNav />
          </ButtonGroup>
        </div>
      </nav>
    </header>
  )
}
