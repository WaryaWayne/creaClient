import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { Button } from '@workspace/ui/components/button'
import { cn } from '#/lib/utils'

import type { DetailGroup } from '../data'

export function DetailsDialog({
  title,
  open,
  onOpenChange,
  children,
  className,
}: {
  readonly title: string
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly children: ReactNode
  readonly className?: string
}) {
  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onOpenChange(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onOpenChange, open])

  if (!open) return null

  if (typeof document === 'undefined') return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-[rgba(23,58,64,0.28)] p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onOpenChange(false)
      }}
    >
      <section
        aria-modal="true"
        role="dialog"
        aria-labelledby={`${title.replace(/\W+/g, '-').toLowerCase()}-dialog-title`}
        className={cn(
          'relative grid max-h-[min(88vh,760px)] w-full max-w-3xl gap-5 overflow-y-auto rounded-lg border border-[var(--line)] bg-white p-5 text-[var(--sea-ink)] shadow-[0_30px_90px_rgba(23,58,64,0.28)]',
          className,
        )}
      >
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Close dialog"
          className="absolute right-3 top-3"
          onClick={() => onOpenChange(false)}
        >
          <X />
        </Button>
        <h2
          id={`${title.replace(/\W+/g, '-').toLowerCase()}-dialog-title`}
          className="display-title pr-10 text-3xl font-bold text-[var(--sea-ink)]"
        >
          {title}
        </h2>
        {children}
      </section>
    </div>,
    document.body,
  )
}

export function MetricPill({
  icon: Icon,
  children,
}: {
  readonly icon: LucideIcon
  readonly children: ReactNode
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-[var(--line)] bg-white/70 px-2.5 py-1 text-xs font-semibold text-[var(--sea-ink)]">
      <Icon className="size-3.5 text-[var(--lagoon-deep)]" />
      {children}
    </span>
  )
}

export function SectionHeader({
  title,
  action,
}: {
  readonly title: string
  readonly action?: ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <h2 className="display-title text-3xl font-bold text-[var(--sea-ink)]">
        {title}
      </h2>
      {action}
    </div>
  )
}

export function DirectoryPanel({
  title,
  children,
}: {
  readonly title: string
  readonly children: ReactNode
}) {
  return (
    <section className="rounded-lg border border-[var(--line)] bg-white/72 p-5">
      <h3 className="text-lg font-extrabold text-[var(--sea-ink)]">{title}</h3>
      <div className="mt-4 grid gap-3 lg:grid-cols-2">{children}</div>
    </section>
  )
}

export function InfoSection({
  title,
  children,
}: {
  readonly title: string
  readonly children: ReactNode
}) {
  return (
    <section className="rounded-lg border border-[var(--line)] bg-white/78 p-5">
      <h2 className="text-xl font-extrabold text-[var(--sea-ink)]">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  )
}

export function DetailGroupSection({ group }: { readonly group: DetailGroup }) {
  return (
    <InfoSection title={group.title}>
      <div className="grid gap-3 sm:grid-cols-2">
        {group.facts.map((item) => (
          <DetailItem
            label={item.label}
            value={item.value}
            key={`${group.title}-${item.label}`}
          />
        ))}
      </div>
    </InfoSection>
  )
}

export function DetailItem({
  label,
  value,
}: {
  readonly label: string
  readonly value: string | number | null
}) {
  return (
    <div className="rounded-md border border-[var(--line)] bg-white/70 p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--sea-ink-soft)]">
        {label}
      </p>
      <p className="mt-1 text-base font-extrabold text-[var(--sea-ink)]">
        {value ?? '-'}
      </p>
    </div>
  )
}

export function Pagination({
  page,
  hasNextPage,
  isPending = false,
  onPage,
}: {
  readonly page: number
  readonly hasNextPage: boolean
  readonly isPending?: boolean
  readonly onPage: (page: number) => void
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-[var(--line)] bg-white/70 p-3">
      <Button
        type="button"
        variant="outline"
        disabled={isPending || page <= 1}
        onClick={() => onPage(Math.max(1, page - 1))}
      >
        Previous
      </Button>
      <span className="text-sm font-semibold text-[var(--sea-ink-soft)]">
        Page {page}
      </span>
      <Button
        type="button"
        variant="outline"
        disabled={isPending || !hasNextPage}
        onClick={() => onPage(page + 1)}
      >
        Next
      </Button>
    </div>
  )
}
