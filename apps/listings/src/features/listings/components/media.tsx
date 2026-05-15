import type { ReactNode } from 'react'
import { ExternalLink, FileImage, FileText, PlayCircle } from 'lucide-react'

import type { MediaCard } from '../data'

const mediaSortValue = (media: MediaCard) =>
  media.sortOrder === null ? Number.MAX_SAFE_INTEGER : media.sortOrder

const displayMedia = (media: ReadonlyArray<MediaCard>) => {
  const seen = new Set<string>()
  return [...media]
    .filter((item) => item.mediaUrl !== null)
    .sort((left, right) => {
      if (left.preferredPhoto === true && right.preferredPhoto !== true)
        return -1
      if (right.preferredPhoto === true && left.preferredPhoto !== true)
        return 1
      return mediaSortValue(left) - mediaSortValue(right)
    })
    .filter((item) => {
      if (item.mediaUrl === null) return false
      if (seen.has(item.mediaUrl)) return false
      seen.add(item.mediaUrl)
      return true
    })
}

const mediaCategory = (media: MediaCard) =>
  (media.mediaCategory ?? media.longDescription ?? '').toLowerCase()

const mediaUrlPath = (media: MediaCard) => {
  if (media.mediaUrl === null) return ''
  try {
    return new URL(media.mediaUrl).pathname.toLowerCase()
  } catch {
    return media.mediaUrl.toLowerCase()
  }
}

const hasImageExtension = (media: MediaCard) =>
  /\.(avif|gif|jpe?g|png|webp)$/i.test(mediaUrlPath(media))

const hasVideoExtension = (media: MediaCard) =>
  /\.(m4v|mov|mp4|webm)$/i.test(mediaUrlPath(media))

const isImageMedia = (media: MediaCard) => {
  const category = mediaCategory(media)
  if (category.includes('website') && !hasImageExtension(media)) return false
  if (
    category.includes('video') ||
    category.includes('tour') ||
    category.includes('document')
  ) {
    return false
  }
  if (
    category.includes('photo') ||
    category.includes('picture') ||
    category.includes('logo')
  ) {
    return true
  }
  return hasImageExtension(media)
}

const isVideoMedia = (media: MediaCard) => {
  const category = mediaCategory(media)
  return (
    category.includes('video') ||
    category.includes('tour') ||
    hasVideoExtension(media)
  )
}

const isBlueprintMedia = (media: MediaCard) => {
  const category = mediaCategory(media)
  return (
    category.includes('blueprint') ||
    category.includes('floor plan') ||
    category.includes('floorplan') ||
    category.includes('site plan')
  )
}

const isDocumentMedia = (media: MediaCard) => {
  const category = mediaCategory(media)
  return (
    category.includes('document') ||
    category.includes('brochure') ||
    category.includes('certificate') ||
    category.includes('financial') ||
    /\.pdf$/i.test(mediaUrlPath(media))
  )
}

const mediaTitle = (media: MediaCard, fallback: string) =>
  media.longDescription ?? media.mediaCategory ?? fallback

export const mediaKey = (media: MediaCard) =>
  media.mediaKey ?? media.mediaUrl ?? ''

export const mediaGroups = (media: ReadonlyArray<MediaCard>) => {
  const all = displayMedia(media)
  const photos = all.filter(isImageMedia)
  const plans = all.filter(
    (item) => isBlueprintMedia(item) && !isVideoMedia(item),
  )
  const documents = all.filter(
    (item) =>
      !isVideoMedia(item) && !isBlueprintMedia(item) && isDocumentMedia(item),
  )
  const videos = all.filter(isVideoMedia)
  const other = all.filter(
    (item) =>
      !photos.includes(item) &&
      !plans.includes(item) &&
      !documents.includes(item) &&
      !videos.includes(item),
  )

  return { all, photos, plans, documents, videos, other }
}

export function MediaGroupsView({
  listingAddress,
  media,
}: {
  readonly listingAddress: string
  readonly media: ReturnType<typeof mediaGroups>
}) {
  return (
    <div className="grid gap-6">
      {media.photos.length > 0 ? (
        <MediaGrid title="Photos">
          {media.photos.map((item) => (
            <ImageMediaTile
              media={item}
              altFallback={listingAddress}
              key={mediaKey(item)}
            />
          ))}
        </MediaGrid>
      ) : null}
      {media.plans.length > 0 ? (
        <MediaGrid title="Floor plans and blueprints">
          {media.plans.map((item) => (
            <LinkedMediaTile
              icon={FileImage}
              media={item}
              altFallback={listingAddress}
              key={mediaKey(item)}
            />
          ))}
        </MediaGrid>
      ) : null}
      {media.documents.length > 0 ? (
        <MediaGrid title="Documents">
          {media.documents.map((item) => (
            <LinkedMediaTile
              icon={FileText}
              media={item}
              altFallback={listingAddress}
              key={mediaKey(item)}
            />
          ))}
        </MediaGrid>
      ) : null}
      {media.other.length > 0 ? (
        <MediaGrid title="Other media">
          {media.other.map((item) => (
            <LinkedMediaTile
              icon={FileText}
              media={item}
              altFallback={listingAddress}
              key={mediaKey(item)}
            />
          ))}
        </MediaGrid>
      ) : null}
      {media.videos.length > 0 ? (
        <MediaGrid title="Videos and tours">
          {media.videos.map((item) => (
            <VideoMediaTile media={item} key={mediaKey(item)} />
          ))}
        </MediaGrid>
      ) : null}
    </div>
  )
}

function MediaGrid({
  title,
  children,
}: {
  readonly title: string
  readonly children: ReactNode
}) {
  return (
    <div className="grid gap-3">
      <h3 className="text-base font-extrabold text-[var(--sea-ink)]">
        {title}
      </h3>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{children}</div>
    </div>
  )
}

function ImageMediaTile({
  media,
  altFallback,
}: {
  readonly media: MediaCard
  readonly altFallback: string
}) {
  return (
    <figure className="overflow-hidden rounded-md border border-[var(--line)] bg-white/70">
      <img
        src={media.mediaUrl ?? ''}
        alt={media.longDescription ?? altFallback}
        className="aspect-[4/3] w-full object-cover"
        loading="lazy"
      />
      {(media.longDescription ?? media.mediaCategory) ? (
        <figcaption className="p-3 text-sm text-[var(--sea-ink-soft)]">
          {media.longDescription ?? media.mediaCategory}
        </figcaption>
      ) : null}
    </figure>
  )
}

function LinkedMediaTile({
  media,
  altFallback,
  icon: Icon,
}: {
  readonly media: MediaCard
  readonly altFallback: string
  readonly icon: typeof FileImage
}) {
  const isImage = hasImageExtension(media)
  return (
    <div className="overflow-hidden rounded-md border border-[var(--line)] bg-white/70">
      {isImage ? (
        <img
          src={media.mediaUrl ?? ''}
          alt={media.longDescription ?? altFallback}
          className="aspect-[4/3] w-full object-contain bg-[var(--sand)]"
          loading="lazy"
        />
      ) : (
        <div className="flex aspect-[4/3] items-center justify-center bg-[var(--sand)] text-[var(--palm)]">
          <Icon className="size-10" />
        </div>
      )}
      <MediaLink media={media} label={mediaTitle(media, 'Open media')} />
    </div>
  )
}

function VideoMediaTile({ media }: { readonly media: MediaCard }) {
  const directVideo = hasVideoExtension(media)
  return (
    <div className="overflow-hidden rounded-md border border-[var(--line)] bg-white/70">
      {directVideo ? (
        <video
          src={media.mediaUrl ?? ''}
          className="aspect-video w-full bg-black"
          controls
          preload="metadata"
        />
      ) : (
        <div className="flex aspect-video items-center justify-center bg-[var(--sand)] text-[var(--palm)]">
          <PlayCircle className="size-12" />
        </div>
      )}
      <MediaLink
        media={media}
        label={mediaTitle(media, 'Open video or tour')}
      />
    </div>
  )
}

function MediaLink({
  media,
  label,
}: {
  readonly media: MediaCard
  readonly label: string
}) {
  return (
    <a
      className="flex items-start justify-between gap-3 p-3 text-sm font-semibold text-[var(--sea-ink)] no-underline hover:text-[var(--lagoon-deep)]"
      href={media.mediaUrl ?? '#'}
      target="_blank"
      rel="noreferrer"
    >
      <span>
        {label}
        {media.mediaCategory ? (
          <span className="mt-1 block text-xs font-semibold text-[var(--sea-ink-soft)]">
            {media.mediaCategory}
          </span>
        ) : null}
      </span>
      <ExternalLink className="mt-0.5 size-4 shrink-0" />
    </a>
  )
}
