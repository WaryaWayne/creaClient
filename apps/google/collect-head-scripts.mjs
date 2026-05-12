import { promises as fs } from "node:fs"
import path from "node:path"

const appDir = process.cwd()
const pagesDir = path.join(appDir, "src", "pages")
const serviceTypesFile = path.join(appDir, "src", "data", "service-types.ts")
const outputFile = path.join(appDir, "head-scripts-report.md")
const origin = "https://2to6x.com"
const basePath = "/google"

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath)))
      continue
    }

    files.push(fullPath)
  }

  return files
}

function pageFileToRoute(filePath) {
  const relativePath = path.relative(pagesDir, filePath)
  const parsed = path.parse(relativePath)
  const segments = path
    .join(parsed.dir, parsed.name)
    .split(path.sep)
    .filter(Boolean)

  if (segments.some((segment) => segment.startsWith("_"))) return null
  if (segments.includes("api")) return null

  const routeSegments = segments.filter((segment) => segment !== "index")
  return `${basePath}/${routeSegments.join("/")}`.replace(/\/$/, "") || basePath
}

async function getIndustryRoutes() {
  const source = await fs.readFile(serviceTypesFile, "utf8")
  const slugs = [...source.matchAll(/slug:\s*["']([^"']+)["']/g)].map(
    (match) => match[1]
  )

  return slugs.map((slug) => `${basePath}/industry/${slug}`)
}

function normalizeScriptTag(tag) {
  return tag.replace(/\s+$/g, "").trim()
}

function extractHeadScripts(html) {
  const headMatch = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)
  if (!headMatch) return { scripts: [], hasHead: false }

  const headHtml = headMatch[1]
  const scripts = [
    ...headHtml.matchAll(/<script\b[\s\S]*?<\/script>/gi),
    ...headHtml.matchAll(/<script\b[^>]*\/>/gi),
  ].map((match) => normalizeScriptTag(match[0]))

  return { scripts, hasHead: true }
}

async function fetchRoute(route) {
  const url = new URL(route, origin).toString()

  try {
    const response = await fetch(url, {
      headers: {
        "user-agent": "2to6x-head-script-audit/1.0",
      },
    })
    const html = await response.text()
    const { scripts, hasHead } = extractHeadScripts(html)

    return {
      route,
      url,
      status: response.status,
      ok: response.ok,
      hasHead,
      scripts,
      error: null,
    }
  } catch (error) {
    return {
      route,
      url,
      status: null,
      ok: false,
      hasHead: false,
      scripts: [],
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

async function main() {
  const pageFiles = (await walk(pagesDir)).filter((file) =>
    file.endsWith(".astro")
  )

  const staticRoutes = pageFiles
    .map(pageFileToRoute)
    .filter(Boolean)
    .filter((route) => !route.includes("["))

  const dynamicRoutes = await getIndustryRoutes()
  const routes = [...new Set([...staticRoutes, ...dynamicRoutes])].sort((a, b) =>
    a.localeCompare(b)
  )

  const results = []
  for (const route of routes) {
    results.push(await fetchRoute(route))
  }

  const fetchedAt = new Date().toISOString()
  const totalScripts = results.reduce(
    (sum, result) => sum + result.scripts.length,
    0
  )
  const failed = results.filter((result) => !result.ok)

  const lines = [
    "# Deployed Head Script Tags Report",
    "",
    `Generated: ${fetchedAt}`,
    `Source: deployed pages under ${origin}${basePath}`,
    `Routes checked: ${results.length}`,
    `Head script tags found: ${totalScripts}`,
    failed.length ? `Fetch issues: ${failed.length}` : "Fetch issues: 0",
    "",
    "Each section contains only `<script>` tags found inside the deployed page `<head>`.",
    "",
  ]

  for (const result of results) {
    lines.push(`## ${result.route}`)
    lines.push(`URL: ${result.url}`)
    lines.push(`Status: ${result.status ?? "FETCH_ERROR"}`)

    if (result.error) {
      lines.push(`Error: ${result.error}`)
    }

    if (!result.hasHead) {
      lines.push("Head: not found")
    }

    lines.push(`Head script tags: ${result.scripts.length}`)
    lines.push("")

    if (result.scripts.length === 0) {
      lines.push("No `<script>` tags found in `<head>`.")
      lines.push("")
      continue
    }

    result.scripts.forEach((script, index) => {
      lines.push(`### Script ${index + 1}`)
      lines.push("```html")
      lines.push(script)
      lines.push("```")
      lines.push("")
    })
  }

  await fs.writeFile(outputFile, `${lines.join("\n").trimEnd()}\n`, "utf8")

  console.log(`Wrote ${outputFile}`)
  console.log(`Routes checked: ${results.length}`)
  console.log(`Head script tags found: ${totalScripts}`)
  if (failed.length) {
    console.log(`Fetch issues: ${failed.length}, ${failed.map((f) => f.route).join(", ")}`)
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
