import { MapPin } from 'lucide-react'

import { cn } from '#/lib/utils'

type LocationMapPlace = {
  readonly address?: string | null
  readonly city?: string | null
  readonly province?: string | null
  readonly postalCode?: string | null
  readonly country?: string | null
  readonly latitude?: number | null
  readonly longitude?: number | null
}

const isCoordinate = (value: number | null | undefined) =>
  typeof value === 'number' && Number.isFinite(value)

const addressQuery = (place: LocationMapPlace) =>
  [place.address, place.city, place.province, place.postalCode, place.country]
    .map((part) => part?.trim())
    .filter((part): part is string => !!part)
    .join(', ')

const mapQuery = (place: LocationMapPlace) => {
  if (isCoordinate(place.latitude) && isCoordinate(place.longitude)) {
    return `${place.latitude},${place.longitude}`
  }

  return addressQuery(place)
}

const googleMapsEmbedSrc = (query: string) =>
  `https://www.google.com/maps?q=${encodeURIComponent(query)}&z=16&output=embed`

export function LocationMap({
  place,
  title,
  className,
  iframeClassName,
}: {
  readonly place: LocationMapPlace
  readonly title: string
  readonly className?: string
  readonly iframeClassName?: string
}) {
  const query = mapQuery(place)
  if (!query) return null

  const label = addressQuery(place) || query

  return (
    <div
      className={cn(
        'overflow-hidden rounded-lg border border-border bg-card',
        className,
      )}
    >
      <div className="flex items-start gap-2 border-b border-border p-3 text-sm font-semibold text-foreground">
        <MapPin className="mt-0.5 size-4 shrink-0" />
        <span className="min-w-0">{label}</span>
      </div>
      <iframe
        src={googleMapsEmbedSrc(query)}
        title={title}
        className={cn('h-64 w-full border-0', iframeClassName)}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  )
}
