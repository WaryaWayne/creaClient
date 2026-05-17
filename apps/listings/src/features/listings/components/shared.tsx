import type { ReactNode } from 'react'
import { CircleOff } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog'
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from '@workspace/ui/components/item'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@workspace/ui/components/empty'
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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'max-h-[min(88vh,760px)] overflow-y-auto text-foreground sm:max-w-3xl',
          className,
        )}
      >
        <DialogHeader>
          <DialogTitle className="display-title pr-10 text-3xl font-bold text-foreground">
            {title}
          </DialogTitle>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
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
    <Badge variant="outline" className="gap-1 py-1 font-semibold">
      <Icon className="size-3.5 text-foreground" />
      {children}
    </Badge>
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
      <h2 className="display-title text-3xl font-bold text-foreground">
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
    <Card size="sm">
      <CardHeader>
        <CardTitle className="text-lg font-extrabold text-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 lg:grid-cols-2">
        {children}
      </CardContent>
    </Card>
  )
}

const hasRenderableNode = (node: ReactNode) =>
  node !== undefined &&
  node !== null &&
  node !== false &&
  node !== true &&
  node !== ''

export function EmptyState({
  title,
  description,
  icon: Icon = CircleOff,
  align = 'center',
  size = 'default',
  children,
  className,
}: {
  readonly title: ReactNode
  readonly description?: ReactNode
  readonly icon?: LucideIcon
  readonly align?: 'center' | 'start'
  readonly size?: 'default' | 'compact'
  readonly children?: ReactNode
  readonly className?: string
}) {
  const isStart = align === 'start'
  const isCompact = size === 'compact'
  const hasDescription = hasRenderableNode(description)
  const hasChildren = hasRenderableNode(children)

  return (
    <Empty
      className={cn(
        'border border-dashed border-border bg-card p-8',
        isStart && 'items-start text-left',
        isCompact && 'gap-2 p-4',
        className,
      )}
    >
      <EmptyHeader className={cn(isStart && 'items-start text-left')}>
        <EmptyMedia variant="icon" className="bg-background text-foreground">
          <Icon className="size-5" />
        </EmptyMedia>
        <EmptyTitle
          className={cn(
            'font-extrabold text-foreground',
            isCompact ? 'text-sm' : 'text-lg',
          )}
        >
          {title}
        </EmptyTitle>
        {hasDescription ? (
          <EmptyDescription
            className={cn('text-sm text-foreground', isStart && 'text-left')}
          >
            {description}
          </EmptyDescription>
        ) : null}
      </EmptyHeader>
      {hasChildren ? (
        <EmptyContent className={cn(isStart && 'items-start')}>
          {children}
        </EmptyContent>
      ) : null}
    </Empty>
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
    <Card size="sm">
      <CardHeader>
        <CardTitle className="text-xl font-extrabold text-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
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
    <Item variant="outline" size="sm">
      <ItemContent>
        <ItemDescription className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground">
          {label}
        </ItemDescription>
        <ItemTitle className="text-base font-extrabold text-foreground">
          {value ?? '-'}
        </ItemTitle>
      </ItemContent>
    </Item>
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
    <Card size="sm" className="gap-0">
      <CardFooter className="justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          disabled={isPending || page <= 1}
          onClick={() => onPage(Math.max(1, page - 1))}
        >
          Previous
        </Button>
        <span className="text-sm font-semibold text-foreground">
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
      </CardFooter>
    </Card>
  )
}
