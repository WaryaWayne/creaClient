export const usageMetricsSchema = 'creaclient.usage-metrics.v1'
export const defaultUsageMetricsApp = 'listings'
export const maxRecentUsageEvents = 200

export type UsageMetricKind = 'page_view' | 'button_click' | 'loader_execution'

export type UsageMetricMetadata = Readonly<
  Record<string, string | number | boolean | null>
>

export type UsageMetricEventInput = {
  readonly kind: Extract<UsageMetricKind, 'page_view' | 'button_click'>
  readonly app?: string
  readonly path?: string
  readonly routeId?: string
  readonly id?: string
  readonly label?: string
  readonly href?: string
  readonly metadata?: UsageMetricMetadata
}

export type UsageMetricLoaderInput = {
  readonly app?: string
  readonly loader: string
  readonly success: boolean
  readonly durationMs: number
  readonly metadata?: UsageMetricMetadata
}

export type UsageMetricsAppSummary = {
  readonly events: number
  readonly pageViews: number
  readonly buttonClicks: number
  readonly loaderExecutions: number
  readonly loaderFailures: number
  readonly firstSeenAt: string | null
  readonly lastSeenAt: string | null
}

export type UsageMetricsTotals = {
  readonly events: number
  readonly pageViews: number
  readonly buttonClicks: number
  readonly loaderExecutions: number
  readonly loaderFailures: number
}

export type UsageMetricPageBucket = {
  readonly app: string
  readonly path: string
  readonly routeId: string | null
  readonly views: number
  readonly firstSeenAt: string
  readonly lastSeenAt: string
}

export type UsageMetricButtonBucket = {
  readonly app: string
  readonly key: string
  readonly id: string | null
  readonly label: string | null
  readonly path: string | null
  readonly routeId: string | null
  readonly href: string | null
  readonly clicks: number
  readonly firstSeenAt: string
  readonly lastSeenAt: string
}

export type UsageMetricLoaderBucket = {
  readonly app: string
  readonly loader: string
  readonly executions: number
  readonly failures: number
  readonly totalDurationMs: number
  readonly averageDurationMs: number
  readonly maxDurationMs: number
  readonly lastDurationMs: number
  readonly firstRunAt: string
  readonly lastRunAt: string
}

export type UsageMetricRecentEvent = {
  readonly kind: UsageMetricKind
  readonly app: string
  readonly at: string
  readonly key: string
  readonly label: string | null
  readonly path: string | null
  readonly routeId: string | null
  readonly href: string | null
  readonly success?: boolean
  readonly durationMs?: number
  readonly metadata?: UsageMetricMetadata
}

export type UsageEffectMetricSnapshot = {
  readonly id: string
  readonly type: string
  readonly description: string | null
  readonly attributes: Readonly<Record<string, string>>
  readonly state: unknown
}

export type UsageEffectMetrics = {
  readonly updatedAt: string
  readonly snapshots: ReadonlyArray<UsageEffectMetricSnapshot>
}

export type UsageMetricsDocument = {
  readonly schema: typeof usageMetricsSchema
  readonly createdAt: string
  readonly updatedAt: string
  readonly totals: UsageMetricsTotals
  readonly apps: Readonly<Record<string, UsageMetricsAppSummary>>
  readonly byKind: Readonly<Record<UsageMetricKind, number>>
  readonly pages: Readonly<Record<string, UsageMetricPageBucket>>
  readonly buttons: Readonly<Record<string, UsageMetricButtonBucket>>
  readonly loaders: Readonly<Record<string, UsageMetricLoaderBucket>>
  readonly recentEvents: ReadonlyArray<UsageMetricRecentEvent>
  readonly effectMetrics: UsageEffectMetrics
}

const emptyTotals = (): UsageMetricsTotals => ({
  events: 0,
  pageViews: 0,
  buttonClicks: 0,
  loaderExecutions: 0,
  loaderFailures: 0,
})

const emptyByKind = (): Record<UsageMetricKind, number> => ({
  page_view: 0,
  button_click: 0,
  loader_execution: 0,
})

const emptyEffectMetrics = (updatedAt: string): UsageEffectMetrics => ({
  updatedAt,
  snapshots: [],
})

export const createUsageMetricsDocument = (
  now: string,
): UsageMetricsDocument => ({
  schema: usageMetricsSchema,
  createdAt: now,
  updatedAt: now,
  totals: emptyTotals(),
  apps: {},
  byKind: emptyByKind(),
  pages: {},
  buttons: {},
  loaders: {},
  recentEvents: [],
  effectMetrics: emptyEffectMetrics(now),
})

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const finiteNumber = (value: unknown, fallback = 0) =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback

const boundedString = (value: unknown, maxLength = 240) => {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed.slice(0, maxLength) : undefined
}

const cleanApp = (app: unknown) =>
  boundedString(app, 80) ?? defaultUsageMetricsApp

const cleanMetadata = (value: unknown): UsageMetricMetadata | undefined => {
  if (!isRecord(value)) return undefined

  const entries = Object.entries(value).flatMap(([key, entry]) => {
    if (!boundedString(key, 80)) return []
    if (
      typeof entry === 'string' ||
      typeof entry === 'number' ||
      typeof entry === 'boolean' ||
      entry === null
    ) {
      return [[key, entry] as const]
    }
    return []
  })

  return entries.length > 0 ? Object.fromEntries(entries) : undefined
}

export const parseUsageMetricEventInput = (
  value: unknown,
): UsageMetricEventInput | null => {
  if (!isRecord(value)) return null
  const kind = value.kind
  if (kind !== 'page_view' && kind !== 'button_click') return null

  return {
    kind,
    app: cleanApp(value.app),
    path: boundedString(value.path, 300),
    routeId: boundedString(value.routeId, 240),
    id: boundedString(value.id, 180),
    label: boundedString(value.label, 180),
    href: boundedString(value.href, 300),
    metadata: cleanMetadata(value.metadata),
  }
}

export const normalizeUsageMetricsDocument = (
  value: unknown,
  now: string,
): UsageMetricsDocument => {
  if (!isRecord(value)) return createUsageMetricsDocument(now)

  const document = createUsageMetricsDocument(now)
  const totals = isRecord(value.totals) ? value.totals : {}
  const byKind = isRecord(value.byKind) ? value.byKind : {}

  return {
    ...document,
    createdAt: boundedString(value.createdAt) ?? now,
    updatedAt: boundedString(value.updatedAt) ?? now,
    totals: {
      events: finiteNumber(totals.events),
      pageViews: finiteNumber(totals.pageViews),
      buttonClicks: finiteNumber(totals.buttonClicks),
      loaderExecutions: finiteNumber(totals.loaderExecutions),
      loaderFailures: finiteNumber(totals.loaderFailures),
    },
    apps: isRecord(value.apps)
      ? (value.apps as Record<string, UsageMetricsAppSummary>)
      : {},
    byKind: {
      page_view: finiteNumber(byKind.page_view),
      button_click: finiteNumber(byKind.button_click),
      loader_execution: finiteNumber(byKind.loader_execution),
    },
    pages: isRecord(value.pages)
      ? (value.pages as Record<string, UsageMetricPageBucket>)
      : {},
    buttons: isRecord(value.buttons)
      ? (value.buttons as Record<string, UsageMetricButtonBucket>)
      : {},
    loaders: isRecord(value.loaders)
      ? (value.loaders as Record<string, UsageMetricLoaderBucket>)
      : {},
    recentEvents: Array.isArray(value.recentEvents)
      ? value.recentEvents.slice(0, maxRecentUsageEvents)
      : [],
    effectMetrics: isRecord(value.effectMetrics)
      ? (value.effectMetrics as UsageEffectMetrics)
      : emptyEffectMetrics(now),
  }
}

const increment = (value: unknown, by = 1) => finiteNumber(value) + by

const metricKeyPart = (value: string | null | undefined, fallback: string) =>
  (value ?? fallback)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9._~:/?#[\]@!$&'()*+,;=-]+/g, '-')
    .slice(0, 180)

const averageDuration = (totalDurationMs: number, executions: number) =>
  executions > 0 ? Number((totalDurationMs / executions).toFixed(2)) : 0

const updateAppSummary = (
  apps: Record<string, UsageMetricsAppSummary>,
  app: string,
  now: string,
  kind: UsageMetricKind,
  failedLoader: boolean,
) => {
  const current = apps[app] ?? {
    events: 0,
    pageViews: 0,
    buttonClicks: 0,
    loaderExecutions: 0,
    loaderFailures: 0,
    firstSeenAt: now,
    lastSeenAt: now,
  }

  apps[app] = {
    ...current,
    events: current.events + 1,
    pageViews: current.pageViews + (kind === 'page_view' ? 1 : 0),
    buttonClicks: current.buttonClicks + (kind === 'button_click' ? 1 : 0),
    loaderExecutions:
      current.loaderExecutions + (kind === 'loader_execution' ? 1 : 0),
    loaderFailures: current.loaderFailures + (failedLoader ? 1 : 0),
    firstSeenAt: current.firstSeenAt ?? now,
    lastSeenAt: now,
  }
}

const appendRecentEvent = (
  document: UsageMetricsDocument,
  event: UsageMetricRecentEvent,
) => [event, ...document.recentEvents].slice(0, maxRecentUsageEvents)

export const applyUsageMetricEvent = ({
  document,
  input,
  now,
  effectMetrics,
}: {
  readonly document: UsageMetricsDocument
  readonly input: UsageMetricEventInput
  readonly now: string
  readonly effectMetrics: UsageEffectMetrics
}): UsageMetricsDocument => {
  const app = cleanApp(input.app)
  const apps = { ...document.apps }
  const pages = { ...document.pages }
  const buttons = { ...document.buttons }
  const byKind = { ...document.byKind }
  const totals = { ...document.totals }
  const path = input.path ?? null
  const routeId = input.routeId ?? null
  const href = input.href ?? null

  updateAppSummary(apps, app, now, input.kind, false)
  totals.events = increment(totals.events)
  byKind[input.kind] = increment(byKind[input.kind])

  if (input.kind === 'page_view') {
    const pageKey = `${app}:${metricKeyPart(path, 'unknown-page')}`
    const current = pages[pageKey]
    pages[pageKey] = {
      app,
      path: path ?? 'unknown',
      routeId,
      views: increment(current?.views),
      firstSeenAt: current?.firstSeenAt ?? now,
      lastSeenAt: now,
    }
    totals.pageViews = increment(totals.pageViews)

    return {
      ...document,
      updatedAt: now,
      totals,
      apps,
      byKind,
      pages,
      recentEvents: appendRecentEvent(document, {
        kind: input.kind,
        app,
        at: now,
        key: pageKey,
        label: input.label ?? null,
        path,
        routeId,
        href,
        metadata: input.metadata,
      }),
      effectMetrics,
    }
  }

  const buttonIdentity =
    input.id ?? input.label ?? input.href ?? `${input.kind}-unknown`
  const buttonKey = `${app}:${metricKeyPart(path, 'unknown-path')}:${metricKeyPart(buttonIdentity, 'button')}`
  const current = buttons[buttonKey]
  buttons[buttonKey] = {
    app,
    key: buttonKey,
    id: input.id ?? null,
    label: input.label ?? null,
    path,
    routeId,
    href,
    clicks: increment(current?.clicks),
    firstSeenAt: current?.firstSeenAt ?? now,
    lastSeenAt: now,
  }
  totals.buttonClicks = increment(totals.buttonClicks)

  return {
    ...document,
    updatedAt: now,
    totals,
    apps,
    byKind,
    buttons,
    recentEvents: appendRecentEvent(document, {
      kind: input.kind,
      app,
      at: now,
      key: buttonKey,
      label: input.label ?? null,
      path,
      routeId,
      href,
      metadata: input.metadata,
    }),
    effectMetrics,
  }
}

export const applyUsageLoaderExecution = ({
  document,
  input,
  now,
  effectMetrics,
}: {
  readonly document: UsageMetricsDocument
  readonly input: UsageMetricLoaderInput
  readonly now: string
  readonly effectMetrics: UsageEffectMetrics
}): UsageMetricsDocument => {
  const app = cleanApp(input.app)
  const apps = { ...document.apps }
  const loaders = { ...document.loaders }
  const byKind = { ...document.byKind }
  const totals = { ...document.totals }
  const durationMs = Math.max(0, Math.round(input.durationMs))
  const key = `${app}:${metricKeyPart(input.loader, 'loader')}`
  const current = loaders[key]
  const executions = increment(current?.executions)
  const failures = increment(current?.failures, input.success ? 0 : 1)
  const totalDurationMs = increment(current?.totalDurationMs, durationMs)

  updateAppSummary(apps, app, now, 'loader_execution', !input.success)
  totals.events = increment(totals.events)
  totals.loaderExecutions = increment(totals.loaderExecutions)
  totals.loaderFailures = increment(
    totals.loaderFailures,
    input.success ? 0 : 1,
  )
  byKind.loader_execution = increment(byKind.loader_execution)

  loaders[key] = {
    app,
    loader: input.loader,
    executions,
    failures,
    totalDurationMs,
    averageDurationMs: averageDuration(totalDurationMs, executions),
    maxDurationMs: Math.max(finiteNumber(current?.maxDurationMs), durationMs),
    lastDurationMs: durationMs,
    firstRunAt: current?.firstRunAt ?? now,
    lastRunAt: now,
  }

  return {
    ...document,
    updatedAt: now,
    totals,
    apps,
    byKind,
    loaders,
    recentEvents: appendRecentEvent(document, {
      kind: 'loader_execution',
      app,
      at: now,
      key,
      label: input.loader,
      path: null,
      routeId: null,
      href: null,
      success: input.success,
      durationMs,
      metadata: input.metadata,
    }),
    effectMetrics,
  }
}
