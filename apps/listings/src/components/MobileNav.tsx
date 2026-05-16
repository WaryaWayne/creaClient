import { Link } from '@tanstack/react-router'
import { ArrowRight, Logs, Menu } from 'lucide-react'

import { Button } from '@workspace/ui/components/button'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from '@workspace/ui/components/sheet'
import { AppLogo } from '#/components/AppLogo'
import {
  defaultListingSearch,
  defaultOpenHouseSearch,
} from '#/features/listings/search'

import type { ListingSearch } from '#/features/listings/search'

const sheetLinkClass =
  'block py-2.5 font-medium text-foreground no-underline hover:text-primary'

const sheetCardLinkClass =
  'block border border-border px-3 py-3 text-foreground no-underline hover:border-primary/30 hover:bg-primary/5 hover:backdrop-blur-sm'

const estatePropertiesSearch = {
  ...defaultListingSearch,
  status: 'Active',
  minBeds: 4,
  minBaths: 3,
  minParking: 2,
  sort: 'price-desc',
} satisfies ListingSearch

export function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button variant="ghost" size="icon-lg" aria-label="Open Main Menu" />
        }
      >
        <Menu className="size-8 text-primary" />
      </SheetTrigger>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="overflow-y-auto border-border bg-card text-card-foreground"
      >
        <div className="flex flex-col gap-1 px-4 py-4 text-sm">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="flex items-center py-2.5 no-underline"
              aria-label="CreaClient home"
            >
              <AppLogo imageClassName="h-8 max-w-[142px]" />
            </Link>
            <SheetClose className="cursor-pointer">
              <Logs className="size-8 text-primary transition-transform duration-300 hover:rotate-90" />
              <span className="sr-only">Close menu</span>
            </SheetClose>
          </div>

          <div className="border-t border-border pt-2">
            <SheetClose
              nativeButton={false}
              render={
                <Link
                  to="/listings"
                  search={defaultListingSearch}
                  className={sheetLinkClass}
                />
              }
            >
              Listings
            </SheetClose>
            <SheetClose
              nativeButton={false}
              render={
                <Link
                  to="/rentals"
                  search={defaultListingSearch}
                  className={sheetLinkClass}
                />
              }
            >
              Rentals
            </SheetClose>
            <SheetClose
              nativeButton={false}
              render={
                <Link
                  to="/open-houses"
                  search={defaultOpenHouseSearch}
                  className={sheetLinkClass}
                />
              }
            >
              Open houses
            </SheetClose>
            <SheetClose
              nativeButton={false}
              render={<Link to="/search" className={sheetLinkClass} />}
            >
              Search
            </SheetClose>
          </div>

          <div className="border-t border-border py-2">
            <p className="py-2 text-xs tracking-wider text-foreground uppercase">
              Real estate paths
            </p>
            <div className="space-y-2">
              <SheetClose
                nativeButton={false}
                render={<Link to="/buyers" className={sheetCardLinkClass} />}
              >
                <p className="font-semibold text-foreground">Buyers</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Browse current local inventory and open-house options.
                </p>
              </SheetClose>
              <SheetClose
                nativeButton={false}
                render={<Link to="/sellers" className={sheetCardLinkClass} />}
              >
                <p className="font-semibold text-foreground">Sellers</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Pricing, preparation, and market comparison tools.
                </p>
              </SheetClose>
              <SheetClose
                nativeButton={false}
                render={
                  <Link to="/investments" className={sheetCardLinkClass} />
                }
              >
                <p className="font-semibold text-foreground">Investments</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Screen active listings and move into deal math.
                </p>
              </SheetClose>
              <SheetClose
                nativeButton={false}
                render={<Link to="/estates" className={sheetCardLinkClass} />}
              >
                <p className="font-semibold text-foreground">Estates</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Organize sale planning, documents, and property decisions.
                </p>
              </SheetClose>
            </div>
          </div>

          <div className="border-t border-border py-2">
            <p className="py-2 text-xs tracking-wider text-foreground uppercase">
              Tools
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              <SheetClose
                nativeButton={false}
                render={
                  <Link
                    to="/sellers/calculator"
                    className="flex min-h-[3.5rem] items-center gap-2 border border-border px-3 py-2 text-sm text-foreground no-underline hover:border-primary/30 hover:bg-primary/5 hover:text-primary hover:backdrop-blur-sm"
                  />
                }
              >
                <span className="leading-snug font-medium">
                  Seller calculator
                </span>
              </SheetClose>
              <SheetClose
                nativeButton={false}
                render={
                  <Link
                    to="/sellers/comparables"
                    search={defaultListingSearch}
                    className="flex min-h-[3.5rem] items-center gap-2 border border-border px-3 py-2 text-sm text-foreground no-underline hover:border-primary/30 hover:bg-primary/5 hover:text-primary hover:backdrop-blur-sm"
                  />
                }
              >
                <span className="leading-snug font-medium">Comparables</span>
              </SheetClose>
              <SheetClose
                nativeButton={false}
                render={
                  <Link
                    to="/investments/opportunities"
                    search={defaultListingSearch}
                    className="flex min-h-[3.5rem] items-center gap-2 border border-border px-3 py-2 text-sm text-foreground no-underline hover:border-primary/30 hover:bg-primary/5 hover:text-primary hover:backdrop-blur-sm"
                  />
                }
              >
                <span className="leading-snug font-medium">Investments</span>
              </SheetClose>
              <SheetClose
                nativeButton={false}
                render={
                  <Link
                    to="/investments/calculator"
                    className="flex min-h-[3.5rem] items-center gap-2 border border-border px-3 py-2 text-sm text-foreground no-underline hover:border-primary/30 hover:bg-primary/5 hover:text-primary hover:backdrop-blur-sm"
                  />
                }
              >
                <span className="leading-snug font-medium">
                  Investment calculator
                </span>
              </SheetClose>
              <SheetClose
                nativeButton={false}
                render={
                  <Link
                    to="/estates/organizer"
                    className="flex min-h-[3.5rem] items-center gap-2 border border-border px-3 py-2 text-sm text-foreground no-underline hover:border-primary/30 hover:bg-primary/5 hover:text-primary hover:backdrop-blur-sm"
                  />
                }
              >
                <span className="leading-snug font-medium">
                  Estate organizer
                </span>
              </SheetClose>
              <SheetClose
                nativeButton={false}
                render={
                  <Link
                    to="/estates/calculator"
                    className="flex min-h-[3.5rem] items-center gap-2 border border-border px-3 py-2 text-sm text-foreground no-underline hover:border-primary/30 hover:bg-primary/5 hover:text-primary hover:backdrop-blur-sm"
                  />
                }
              >
                <span className="leading-snug font-medium">
                  Estate calculator
                </span>
              </SheetClose>
              <SheetClose
                nativeButton={false}
                render={
                  <Link
                    to="/estates/properties"
                    search={estatePropertiesSearch}
                    className="flex min-h-[3.5rem] items-center gap-2 border border-border px-3 py-2 text-sm text-foreground no-underline hover:border-primary/30 hover:bg-primary/5 hover:text-primary hover:backdrop-blur-sm"
                  />
                }
              >
                <span className="leading-snug font-medium">
                  Estate properties
                </span>
              </SheetClose>
              <SheetClose
                nativeButton={false}
                render={
                  <Link
                    to="/sellers/get-ready"
                    className="flex min-h-[3.5rem] items-center gap-2 border border-border px-3 py-2 text-sm text-foreground no-underline hover:border-primary/30 hover:bg-primary/5 hover:text-primary hover:backdrop-blur-sm"
                  />
                }
              >
                <span className="leading-snug font-medium">Seller prep</span>
              </SheetClose>
              <SheetClose
                nativeButton={false}
                render={
                  <Link
                    to="/investments/due-diligence"
                    className="flex min-h-[3.5rem] items-center gap-2 border border-border px-3 py-2 text-sm text-foreground no-underline hover:border-primary/30 hover:bg-primary/5 hover:text-primary hover:backdrop-blur-sm"
                  />
                }
              >
                <span className="leading-snug font-medium">Due diligence</span>
              </SheetClose>
            </div>
            <SheetClose
              nativeButton={false}
              render={
                <Link
                  to="/listings"
                  search={defaultListingSearch}
                  className="mt-2 inline-flex items-center gap-1 py-2 text-xs font-semibold text-primary no-underline hover:text-primary/80"
                />
              }
            >
              View all listings <ArrowRight className="h-3.5 w-3.5" />
            </SheetClose>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
