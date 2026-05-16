import { Link } from '@tanstack/react-router'
import { ArrowLeft, ArrowRight, Search } from 'lucide-react'

import { Button } from '@workspace/ui/components/button'

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
      <section className="grid gap-6 rounded-lg border border-border bg-card p-6 lg:grid-cols-[1fr_340px] lg:items-start">
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
        <aside className="grid gap-3 rounded-lg border border-border bg-card p-4">
          <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-foreground">
            Next steps
          </p>
          <Link
            to="/search"
            className="inline-flex items-center justify-between gap-3 rounded-md border border-border bg-card px-3 py-2 text-sm font-extrabold text-foreground no-underline hover:border-border"
          >
            Browse indexed categories
            <ArrowRight className="size-4" />
          </Link>
        </aside>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        {points.map((point) => (
          <article
            className="rounded-lg border border-border bg-card p-4"
            key={point.title}
          >
            <h2 className="text-lg font-extrabold text-foreground">
              {point.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-foreground">
              {point.description}
            </p>
          </article>
        ))}
      </section>
    </main>
  )
}
