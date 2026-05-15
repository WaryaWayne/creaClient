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
  defaultAgentSearch,
  defaultDirectorySearch,
  defaultListingSearch,
  defaultOpenHouseSearch,
} from '#/features/listings/search'
import { appIconLinks, appSeoDefaults } from '#/features/listings/seo'

import appCss from '../styles.css?url'

import type { QueryClient } from '@tanstack/react-query'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  beforeLoad: async () => {
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
    'rounded-md px-3 py-2 text-sm font-semibold text-[var(--sea-ink-soft)] no-underline transition hover:bg-white/70 hover:text-[var(--sea-ink)]'

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--header-bg)] backdrop-blur">
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
            to="/open-houses"
            search={defaultOpenHouseSearch}
            className={linkClass}
          >
            Open houses
          </Link>
          <Link to="/search" className={linkClass}>
            Search
          </Link>
          <Link
            to="/offices"
            search={defaultDirectorySearch}
            className={linkClass}
          >
            Office
          </Link>
          <Link to="/agents" search={defaultAgentSearch} className={linkClass}>
            Agents
          </Link>
        </nav>
      </div>
    </header>
  )
}

function SiteFooter() {
  return (
    <footer className="border-t border-[var(--line)] bg-white/45">
      <div className="page-wrap flex flex-col gap-3 py-6 text-sm text-[var(--sea-ink-soft)] md:flex-row md:items-center md:justify-between">
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
      <section className="grid max-w-xl gap-4 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--kicker)]">
          Not found
        </p>
        <h1 className="display-title text-4xl font-bold text-[var(--sea-ink)]">
          This page is not available.
        </h1>
        <p className="text-sm leading-6 text-[var(--sea-ink-soft)]">
          Browse the current CREA DDF listings or open houses from the main
          navigation.
        </p>
        <div>
          <Link
            to="/listings"
            search={defaultListingSearch}
            className="inline-flex min-h-10 items-center rounded-md bg-[var(--sea-ink)] px-4 py-2 text-sm font-bold text-white no-underline"
          >
            View listings
          </Link>
        </div>
      </section>
    </main>
  )
}
