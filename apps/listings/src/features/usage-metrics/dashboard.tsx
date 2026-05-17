import { useEffect, useMemo, useState } from 'react'
import { Activity, BarChart3, Clock3, MousePointerClick } from 'lucide-react'

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@workspace/ui/components/alert'
import { Badge } from '@workspace/ui/components/badge'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'
import { Skeleton } from '@workspace/ui/components/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table'

import type { LucideIcon } from 'lucide-react'

import type { UsageMetricsDocument } from './schema'

const numberFormat = new Intl.NumberFormat('en-CA')

const formatNumber = (value: number) => numberFormat.format(value)

const formatDate = (value: string | null | undefined) =>
  value
    ? new Intl.DateTimeFormat('en-CA', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(value))
    : '-'

const sortByCount = <TValue,>(
  values: ReadonlyArray<TValue>,
  count: (value: TValue) => number,
) => [...values].sort((a, b) => count(b) - count(a))

function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  readonly icon: LucideIcon
  readonly label: string
  readonly value: string
  readonly detail: string
}) {
  return (
    <Card size="sm" className="text-foreground">
      <CardHeader>
        <CardTitle className="text-sm font-extrabold uppercase tracking-[0.14em]">
          {label}
        </CardTitle>
        <CardAction className="grid size-10 place-items-center rounded-md bg-background">
          <Icon className="size-5" />
        </CardAction>
      </CardHeader>
      <CardContent className="grid gap-3">
        <strong className="text-3xl font-black leading-none">{value}</strong>
        <CardDescription className="text-sm leading-6 text-foreground">
          {detail}
        </CardDescription>
      </CardContent>
    </Card>
  )
}

function UsageTable<TValue>({
  title,
  values,
  columns,
}: {
  readonly title: string
  readonly values: ReadonlyArray<TValue>
  readonly columns: ReadonlyArray<{
    readonly key: string
    readonly label: string
    readonly render: (value: TValue) => React.ReactNode
  }>
}) {
  return (
    <Card size="sm" className="gap-3">
      <CardHeader>
        <CardTitle className="text-xl font-black text-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead className="font-black" key={column.key}>
                  {column.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {values.map((value, index) => (
              <TableRow key={index}>
                {columns.map((column) => (
                  <TableCell className="align-top" key={column.key}>
                    {column.render(value)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
            {values.length === 0 ? (
              <TableRow>
                <TableCell
                  className="py-8 text-center text-sm font-semibold text-foreground"
                  colSpan={columns.length}
                >
                  No usage has been recorded yet.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export function UsageMetricsDashboard() {
  const [document, setDocument] = useState<UsageMetricsDocument | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    void fetch('/api/usage-metrics', {
      headers: {
        accept: 'application/json',
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Metrics request failed with ${response.status}`)
        }
        return response.json() as Promise<UsageMetricsDocument>
      })
      .then((nextDocument) => {
        if (active) setDocument(nextDocument)
      })
      .catch((requestError: unknown) => {
        if (active) setError(String(requestError))
      })

    return () => {
      active = false
    }
  }, [])

  const pages = useMemo(
    () =>
      sortByCount(
        Object.values(document?.pages ?? {}),
        (page) => page.views,
      ).slice(0, 12),
    [document],
  )
  const buttons = useMemo(
    () =>
      sortByCount(
        Object.values(document?.buttons ?? {}),
        (button) => button.clicks,
      ).slice(0, 12),
    [document],
  )
  const loaders = useMemo(
    () =>
      sortByCount(
        Object.values(document?.loaders ?? {}),
        (loader) => loader.executions,
      ).slice(0, 12),
    [document],
  )

  if (error !== null) {
    return (
      <main className="page-wrap grid min-h-[55vh] place-items-center py-16">
        <Alert className="max-w-xl">
          <AlertTitle className="text-2xl font-black">
            Usage metrics unavailable
          </AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </main>
    )
  }

  if (document === null) {
    return (
      <main className="page-wrap grid min-h-[55vh] place-items-center py-16">
        <div className="grid w-full max-w-xl gap-3">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-32 w-full" />
        </div>
      </main>
    )
  }

  return (
    <main className="page-wrap grid gap-8 py-8">
      <section className="grid gap-3">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-foreground">
          App usage
        </p>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="display-title text-4xl font-black text-foreground">
              Usage metrics
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-foreground">
              Last updated {formatDate(document.updatedAt)}
            </p>
          </div>
          <Badge variant="outline" className="h-auto py-2 font-bold">
            {document.schema}
          </Badge>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={Activity}
          label="Events"
          value={formatNumber(document.totals.events)}
          detail="Page, button, and loader events persisted to JSON."
        />
        <MetricCard
          icon={BarChart3}
          label="Page views"
          value={formatNumber(document.totals.pageViews)}
          detail={`${formatNumber(Object.keys(document.pages).length)} page buckets`}
        />
        <MetricCard
          icon={MousePointerClick}
          label="Button clicks"
          value={formatNumber(document.totals.buttonClicks)}
          detail={`${formatNumber(Object.keys(document.buttons).length)} button buckets`}
        />
        <MetricCard
          icon={Clock3}
          label="Loaders"
          value={formatNumber(document.totals.loaderExecutions)}
          detail={`${formatNumber(document.totals.loaderFailures)} loader failures`}
        />
      </section>

      <UsageTable
        title="Top Pages"
        values={pages}
        columns={[
          {
            key: 'path',
            label: 'Path',
            render: (page) => (
              <span className="font-bold text-foreground">{page.path}</span>
            ),
          },
          {
            key: 'views',
            label: 'Views',
            render: (page) => formatNumber(page.views),
          },
          {
            key: 'lastSeenAt',
            label: 'Last Seen',
            render: (page) => formatDate(page.lastSeenAt),
          },
        ]}
      />

      <UsageTable
        title="Top Buttons"
        values={buttons}
        columns={[
          {
            key: 'label',
            label: 'Button',
            render: (button) => (
              <span className="font-bold text-foreground">
                {button.label ?? button.id ?? button.href ?? button.key}
              </span>
            ),
          },
          {
            key: 'path',
            label: 'Path',
            render: (button) => button.path ?? '-',
          },
          {
            key: 'clicks',
            label: 'Clicks',
            render: (button) => formatNumber(button.clicks),
          },
        ]}
      />

      <UsageTable
        title="Loader Executions"
        values={loaders}
        columns={[
          {
            key: 'loader',
            label: 'Loader',
            render: (loader) => (
              <span className="font-bold text-foreground">{loader.loader}</span>
            ),
          },
          {
            key: 'executions',
            label: 'Runs',
            render: (loader) => formatNumber(loader.executions),
          },
          {
            key: 'averageDurationMs',
            label: 'Avg Ms',
            render: (loader) => formatNumber(loader.averageDurationMs),
          },
          {
            key: 'failures',
            label: 'Failures',
            render: (loader) => formatNumber(loader.failures),
          },
        ]}
      />
    </main>
  )
}
