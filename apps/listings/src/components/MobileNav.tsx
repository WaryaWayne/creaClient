import { Link } from '@tanstack/react-router'
import { ArrowRight, Logs, Menu } from 'lucide-react'

import { Button } from '@workspace/ui/components/button'
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from '@workspace/ui/components/item'
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

const toolLinkClass =
  'flex min-h-[3.5rem] items-center gap-2 text-sm text-foreground no-underline hover:text-primary'

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
                render={
                  <Item variant="outline" render={<Link to="/buyers" />} />
                }
              >
                <ItemContent>
                  <ItemTitle>Buyers</ItemTitle>
                  <ItemDescription>
                    Browse current local inventory and open-house options.
                  </ItemDescription>
                </ItemContent>
              </SheetClose>
              <SheetClose
                nativeButton={false}
                render={
                  <Item variant="outline" render={<Link to="/sellers" />} />
                }
              >
                <ItemContent>
                  <ItemTitle>Sellers</ItemTitle>
                  <ItemDescription>
                    Pricing, preparation, and market comparison tools.
                  </ItemDescription>
                </ItemContent>
              </SheetClose>
              <SheetClose
                nativeButton={false}
                render={
                  <Item variant="outline" render={<Link to="/investments" />} />
                }
              >
                <ItemContent>
                  <ItemTitle>Investments</ItemTitle>
                  <ItemDescription>
                    Screen active listings and move into deal math.
                  </ItemDescription>
                </ItemContent>
              </SheetClose>
              <SheetClose
                nativeButton={false}
                render={
                  <Item variant="outline" render={<Link to="/estates" />} />
                }
              >
                <ItemContent>
                  <ItemTitle>Estates</ItemTitle>
                  <ItemDescription>
                    Organize sale planning, documents, and property decisions.
                  </ItemDescription>
                </ItemContent>
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
                  <Link to="/sellers/calculator" className={toolLinkClass} />
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
                    className={toolLinkClass}
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
                    className={toolLinkClass}
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
                    className={toolLinkClass}
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
                  <Link to="/estates/organizer" className={toolLinkClass} />
                }
              >
                <span className="leading-snug font-medium">
                  Estate organizer
                </span>
              </SheetClose>
              <SheetClose
                nativeButton={false}
                render={
                  <Link to="/estates/calculator" className={toolLinkClass} />
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
                    className={toolLinkClass}
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
                  <Link to="/sellers/get-ready" className={toolLinkClass} />
                }
              >
                <span className="leading-snug font-medium">Seller prep</span>
              </SheetClose>
              <SheetClose
                nativeButton={false}
                render={
                  <Link
                    to="/investments/due-diligence"
                    className={toolLinkClass}
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
