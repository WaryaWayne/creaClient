import {
  Link,
  Outlet,
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { RegistryProvider } from '@effect/atom-react'
import { TooltipProvider } from '@workspace/ui/components/tooltip'

import TanStackQueryDevtools from '../integrations/tanstack-query/devtools'

import { AppLogo } from '#/components/AppLogo'
import { getLocale } from '#/paraglide/runtime'
import {
  defaultListingSearch,
  defaultOpenHouseSearch,
} from '#/features/listings/search'
import { EmptyState } from '#/features/listings/components/shared'
import { appIconLinks, appSeoDefaults } from '#/features/listings/seo'

import appCss from '../styles.css?url'

import type { QueryClient } from '@tanstack/react-query'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  beforeLoad: () => {
    // Other redirect strategies are possible; see
    // https://github.com/TanStack/router/tree/main/examples/react/i18n-paraglide#offline-redirect
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('lang', getLocale())
    }
  },
  head: () => ({
    meta: appSeoDefaults(),
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
      ...appIconLinks(),
    ],
  }),
  component: Outlet,
  notFoundComponent: NotFoundView,
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang={getLocale()}>
      <head>
        <HeadContent />
      </head>
      <body>
        <RegistryProvider>
          <SiteHeader />
          <TooltipProvider>{children}</TooltipProvider>
          <SiteFooter />
        </RegistryProvider>
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
            TanStackQueryDevtools,
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}

function SiteHeader() {
  const linkClass =
    'rounded-md px-3 py-2 text-sm font-semibold text-foreground no-underline transition hover:bg-background hover:text-foreground'

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background backdrop-blur">
      <div className="page-wrap flex min-h-16 items-center justify-between gap-4">
        <Link
          to="/"
          className="inline-flex min-w-0 items-center no-underline"
          aria-label="CreaClient home"
        >
          <AppLogo imageClassName="h-9 max-w-[152px]" />
        </Link>
        <nav className="flex flex-wrap items-center justify-end gap-1">
          <Link
            to="/listings"
            search={defaultListingSearch}
            className={linkClass}
          >
            Listings
          </Link>
          <Link
            to="/rentals"
            search={defaultListingSearch}
            className={linkClass}
          >
            Rentals
          </Link>
          <Link
            to="/open-houses"
            search={defaultOpenHouseSearch}
            className={linkClass}
          >
            Open houses
          </Link>
          <Link to="/sellers" className={linkClass}>
            Sellers
          </Link>
          <Link to="/search" className={linkClass}>
            Search
          </Link>
        </nav>
      </div>
    </header>
  )
}

function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="page-wrap flex flex-col gap-3 py-6 text-sm text-foreground md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
          <AppLogo imageClassName="h-8 max-w-[142px]" />
          <span>CREA DDF local listings browser</span>
        </div>
        <span>Filters, pages, and detail views are shareable by URL.</span>
      </div>
    </footer>
  )
}

function NotFoundView() {
  return (
    <main className="page-wrap grid min-h-[55vh] place-items-center py-16">
      <EmptyState
        title="This page is not available."
        description="Browse the current CREA DDF listings or open houses from the main navigation."
        className="max-w-xl"
      >
        <Link
          to="/listings"
          search={defaultListingSearch}
          className="inline-flex min-h-10 items-center rounded-md bg-background px-4 py-2 text-sm font-bold text-foreground no-underline"
        >
          View listings
        </Link>
      </EmptyState>
    </main>
  )
}
