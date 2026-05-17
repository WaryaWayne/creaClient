import { Link } from '@tanstack/react-router'
import { ArrowLeft, ArrowRight, Search } from 'lucide-react'

import { Button } from '@workspace/ui/components/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'

import { defaultListingSearch } from '../search'

import type { ListingSearch } from '../search'

type AudienceShellPoint = {
  readonly title: string
  readonly description: string
}

export type AudienceShellProps = {
  readonly eyebrow: string
  readonly title: string
  readonly description: string
  readonly searchLabel: string
  readonly search: Partial<ListingSearch>
  readonly points: readonly [
    AudienceShellPoint,
    AudienceShellPoint,
    AudienceShellPoint,
  ]
}

const listingSearch = (search: Partial<ListingSearch>): ListingSearch => ({
  ...defaultListingSearch,
  ...search,
  page: 1,
})

export function AudienceShell({
  eyebrow,
  title,
  description,
  searchLabel,
  search,
  points,
}: AudienceShellProps) {
  return (
    <main className="page-wrap grid gap-6 py-8">
      <Card className="grid gap-6 lg:grid-cols-[1fr_340px] lg:items-start">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-foreground">
            {eyebrow}
          </p>
          <h1 className="display-title mt-2 text-4xl font-bold text-foreground">
            {title}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-foreground">
            {description}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              nativeButton={false}
              render={<Link to="/listings" search={listingSearch(search)} />}
            >
              <Search />
              {searchLabel}
            </Button>
            <Button
              nativeButton={false}
              render={<Link to="/" />}
              variant="outline"
            >
              <ArrowLeft />
              Compare paths
            </Button>
          </div>
        </div>
        <Card size="sm" className="grid gap-3">
          <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-foreground">
            Next steps
          </p>
          <Button
            nativeButton={false}
            render={<Link to="/search" />}
            variant="outline"
            className="justify-between font-extrabold"
          >
            Browse indexed categories
            <ArrowRight className="size-4" />
          </Button>
        </Card>
      </Card>

      <section className="grid gap-3 md:grid-cols-3">
        {points.map((point) => (
          <Card size="sm" key={point.title}>
            <CardHeader>
              <CardTitle className="text-lg font-extrabold text-foreground">
                {point.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-6 text-foreground">
              {point.description}
            </CardContent>
          </Card>
        ))}
      </section>
    </main>
  )
}
