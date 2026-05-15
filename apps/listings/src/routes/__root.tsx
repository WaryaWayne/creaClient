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

import TanStackQueryDevtools from '../integrations/tanstack-query/devtools'

import { getLocale } from '#/paraglide/runtime'
import {
  defaultListingSearch,
  defaultOpenHouseSearch,
} from '#/features/listings/search'

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
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'CREA Listings Browser',
      },
      {
        name: 'description',
        content:
          'Browse local CREA DDF listings and open houses with office and agent credits attached to each listing.',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
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
          {children}
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
          className="display-title text-xl font-bold text-[var(--sea-ink)] no-underline"
        >
          CreaClient
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
        </nav>
      </div>
    </header>
  )
}

function SiteFooter() {
  return (
    <footer className="border-t border-[var(--line)] bg-white/45">
      <div className="page-wrap flex flex-col gap-2 py-6 text-sm text-[var(--sea-ink-soft)] md:flex-row md:items-center md:justify-between">
        <span>CREA DDF local listings browser</span>
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
