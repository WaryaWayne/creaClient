import * as React from "react"
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb"

interface PathBreadcrumbProps {
  /**
   * The path/location string to display as breadcrumbs.
   * Segments separated by "/" will be split into individual breadcrumb items.
   * If the string contains a "#", the hash portion will be displayed at the end in a different color.
   * @example "Home/Services/Flatbed Towing#Emergency"
   * @example "/service-areas/kanata"
   */
  location: string
  /**
   * Optional base URL for generating links. Defaults to import.meta.env.BASE_URL (or "/").
   * Each breadcrumb segment will link to the accumulated path.
   */
  baseUrl?: string
  /**
   * Optional className for styling
   */
  className?: string
  /**
   * Maximum number of items to show before collapsing with ellipsis
   * @default 4
   */
  maxItems?: number
  /**
   * Optional callback when a breadcrumb item is clicked
   */
  onItemClick?: (segment: string, index: number, path: string) => void
}

/**
 * PathBreadcrumb - A reusable breadcrumb component that parses a location string
 * and displays it as breadcrumbs using shadcn/ui's Breadcrumb component.
 *
 * Features:
 * - Splits location by "/" to create breadcrumb segments
 * - Displays hash (#) portion at the end in a different color (amber)
 * - Supports automatic link generation
 * - Collapses long breadcrumbs with ellipsis
 * - Fully accessible with proper ARIA labels
 */
export function PathBreadcrumb({
  location,
  baseUrl,
  className,
  maxItems = 4,
  onItemClick,
}: PathBreadcrumbProps) {
  // Extract hash if present
  const hashIndex = location.indexOf("#")
  const hash = hashIndex !== -1 ? location.slice(hashIndex + 1) : null
  const pathWithoutHash =
    hashIndex !== -1 ? location.slice(0, hashIndex) : location

  // Split by "/" and filter out empty segments
  const allSegments = pathWithoutHash
    .split("/")
    .map((s) => s.trim())
    .filter((s) => s.length > 0)

  // Treat base URL path segments as routing context, not visible crumbs.
  const resolvedBaseUrl = baseUrl ?? import.meta.env.BASE_URL ?? "/"
  const baseSegments = resolvedBaseUrl
    .split("/")
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
  const rootLabel =
    baseSegments.length > 0
      ? formatSegment(baseSegments[baseSegments.length - 1])
      : "Home"

  const hasBasePrefix =
    baseSegments.length > 0 &&
    baseSegments.every((segment, idx) => allSegments[idx] === segment)

  const segments = hasBasePrefix
    ? allSegments.slice(baseSegments.length)
    : allSegments

  // Build cumulative paths for each visible segment
  const buildPath = (index: number) => {
    const pathSegments =
      index >= 0
        ? [...baseSegments, ...segments.slice(0, index + 1)]
        : baseSegments
    const path = pathSegments.join("/")
    return path ? `/${path}` : "/"
  }

  // Determine if we need to collapse
  const shouldCollapse = segments.length > maxItems
  const visibleStartCount = shouldCollapse ? 1 : segments.length
  const visibleEndCount = shouldCollapse ? 2 : 0

  const handleClick =
    (segment: string, index: number) => (e: React.MouseEvent) => {
      if (onItemClick) {
        e.preventDefault()
        onItemClick(segment, index, buildPath(index))
      }
    }

  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        {/* Root link - always shown */}
        <BreadcrumbItem>
          <BreadcrumbLink
            href={buildPath(-1)}
            onClick={handleClick(rootLabel, -1)}
          >
            <span className="capitalize">{rootLabel}</span>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {segments.length > 0 && <BreadcrumbSeparator />}

        {/* First segment(s) */}
        {segments.slice(0, visibleStartCount).map((segment, idx) => {
          const isLast = idx === segments.length - 1 && !hash
          const path = buildPath(idx)

          return (
            <React.Fragment key={`start-${path}`}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage className="capitalize">
                    {formatSegment(segment)}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    href={path}
                    onClick={handleClick(segment, idx)}
                  >
                    <span className="capitalize">{formatSegment(segment)}</span>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </React.Fragment>
          )
        })}

        {/* Ellipsis for collapsed breadcrumbs */}
        {shouldCollapse && (
          <>
            <BreadcrumbItem>
              <BreadcrumbEllipsis />
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </>
        )}

        {/* Last segments when collapsed */}
        {shouldCollapse &&
          segments.slice(-visibleEndCount).map((segment, idx) => {
            const actualIndex = segments.length - visibleEndCount + idx
            const isLast = actualIndex === segments.length - 1 && !hash
            const path = buildPath(actualIndex)

            return (
              <React.Fragment key={`end-${path}`}>
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage className="capitalize">
                      {formatSegment(segment)}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink
                      href={path}
                      onClick={handleClick(segment, actualIndex)}
                    >
                      <span className="capitalize">
                        {formatSegment(segment)}
                      </span>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!isLast && <BreadcrumbSeparator />}
              </React.Fragment>
            )
          })}

        {/* Hash tag - displayed at the end in amber color */}
        {hash && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <span className="text-sm font-medium text-primary capitalize">
                #{formatSegment(hash)}
              </span>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

/**
 * Formats a segment by:
 * - Replacing hyphens with spaces
 * - Converting URL slugs to readable text
 * - Decoding URL-encoded characters
 */
function formatSegment(segment: string): string {
  return decodeURIComponent(segment).replace(/-/g, " ").replace(/_/g, " ")
}

export default PathBreadcrumb
