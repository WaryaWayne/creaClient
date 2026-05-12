import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "astro/config"
import react from "@astrojs/react"
import sitemap from "@astrojs/sitemap"
import svgr from 'vite-plugin-svgr'

import node from "@astrojs/node"

const normalizeCanonicalUrl = (url: string | URL) => {
  const parsedUrl = new URL(url)
  if (parsedUrl.pathname !== "/") {
    parsedUrl.pathname = parsedUrl.pathname.replace(/\/$/, "")
  }
  return parsedUrl.toString()
}

// https://astro.build/config
export default defineConfig({
  site: "https://2to6x.com",
  base: "/google",
  vite: {
    plugins: [tailwindcss(), svgr()],
  },
  server: {
    host: "127.0.0.1",
    port: 4321,
    open: false,
  },
  security: {
    allowedDomains: [
      { protocol: "https", hostname: "2to6x.com" },
      { protocol: "https", hostname: "www.2to6x.com" },
    ],
    checkOrigin: true,
    // TODO: stop blocking cloudflare insights somehow
  },
  integrations: [
    react(),
    sitemap({
      changefreq: "weekly",
      lastmod: new Date(),
      filter: (page) =>
        normalizeCanonicalUrl(page) !==
        "https://2to6x.com/google/payments/success",
      serialize: (item) => ({
        ...item,
        url: normalizeCanonicalUrl(item.url),
      }),
    }),
  ],

  adapter: node({
    mode: "standalone",
  }),

  redirects: {
    "/google/policies/returns": "/google/policies/refunds",
  },
})
