import {
  Config,
  DateTime,
  Duration,
  Effect,
  Exit,
  FileSystem,
  Metric,
  Schema,
  Semaphore,
} from 'effect'

import {
  applyUsageLoaderExecution,
  applyUsageMetricEvent,
  createUsageMetricsDocument,
  defaultUsageMetricsApp,
  normalizeUsageMetricsDocument,
} from './schema'

import type {
  UsageEffectMetricSnapshot,
  UsageEffectMetrics,
  UsageMetricEventInput,
  UsageMetricLoaderInput,
  UsageMetricsDocument,
} from './schema'

const defaultUsageMetricsFilePath = '.usage-metrics/usage-metrics.json'
const usageMetricsFilePath = Config.string(
  'CREACLIENT_USAGE_METRICS_FILE',
).pipe(Config.withDefault(defaultUsageMetricsFilePath))

const usageEventCounter = Metric.counter('creaclient_usage_events_total', {
  description: 'All persisted app usage metric events',
  incremental: true,
})

const pageViewCounter = Metric.counter('creaclient_usage_page_views_total', {
  description: 'Client-side page view events',
  incremental: true,
})

const buttonClickCounter = Metric.counter(
  'creaclient_usage_button_clicks_total',
  {
    description: 'Client-side button and action clicks',
    incremental: true,
  },
)

const loaderExecutionCounter = Metric.counter(
  'creaclient_usage_loader_executions_total',
  {
    description: 'Server data loader executions',
    incremental: true,
  },
)

const loaderFailureCounter = Metric.counter(
  'creaclient_usage_loader_failures_total',
  {
    description: 'Server data loader failures',
    incremental: true,
  },
)

const loaderDuration = Metric.timer('creaclient_usage_loader_duration', {
  description: 'Server data loader execution duration',
})

const documentSemaphore = Semaphore.makeUnsafe(1)

const getNowIso = DateTime.now.pipe(Effect.map(DateTime.formatIso))
const encodeJson = Schema.encodeUnknownSync(Schema.UnknownFromJsonString)

const toPersistenceError = (error: unknown) => {
  if (error instanceof Error) return error.message
  return String(error)
}

const directoryName = (path: string) => {
  const index = path.lastIndexOf('/')
  return index >= 0 ? path.slice(0, index) || '/' : '.'
}

const decodeJson = (raw: string, now: string) =>
  Schema.decodeUnknownEffect(Schema.UnknownFromJsonString)(raw).pipe(
    Effect.map((value) => normalizeUsageMetricsDocument(value, now)),
    Effect.mapError(toPersistenceError),
  )

const readDocumentOrCreate = Effect.fn('UsageMetrics.readDocumentOrCreate')(
  function* (now: string) {
    const fs = yield* FileSystem.FileSystem
    const filePath = yield* usageMetricsFilePath
    const exists = yield* fs.exists(filePath)

    if (!exists) {
      return createUsageMetricsDocument(now)
    }

    const raw = yield* fs.readFileString(filePath)
    return yield* decodeJson(raw, now)
  },
)

const writeDocument = Effect.fn('UsageMetrics.writeDocument')(function* (
  document: UsageMetricsDocument,
) {
  const fs = yield* FileSystem.FileSystem
  const filePath = yield* usageMetricsFilePath
  const temporaryPath = `${filePath}.tmp`

  yield* fs.makeDirectory(directoryName(filePath), { recursive: true })
  yield* fs.writeFileString(temporaryPath, `${encodeJson(document)}\n`)
  yield* fs.rename(temporaryPath, filePath)
})

const updateDocumentFile = Effect.fn('UsageMetrics.updateDocumentFile')(
  function* (
    now: string,
    update: (
      document: UsageMetricsDocument,
      now: string,
      effectMetrics: UsageEffectMetrics,
    ) => UsageMetricsDocument,
    effectMetrics: UsageEffectMetrics,
  ) {
    return yield* documentSemaphore.withPermit(
      Effect.gen(function* () {
        const current = yield* readDocumentOrCreate(now)
        const next = update(current, now, effectMetrics)
        yield* writeDocument(next)
        return next
      }),
    )
  },
)

const toJsonMetricState = (value: unknown): unknown => {
  if (typeof value === 'bigint') return value.toString()
  if (Array.isArray(value)) return value.map(toJsonMetricState)
  if (value instanceof Map) {
    return Object.fromEntries(
      Array.from(value.entries()).map(([key, entry]) => [
        String(key),
        toJsonMetricState(entry),
      ]),
    )
  }
  if (typeof value === 'object' && value !== null) {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [
        key,
        toJsonMetricState(entry),
      ]),
    )
  }
  return value
}

const toUsageEffectMetricSnapshot = (
  snapshot: Metric.Metric.Snapshot,
): UsageEffectMetricSnapshot => ({
  id: snapshot.id,
  type: snapshot.type,
  description: snapshot.description ?? null,
  attributes: snapshot.attributes ?? {},
  state: toJsonMetricState(snapshot.state),
})

const readUsageEffectMetrics = Effect.fn('UsageMetrics.readEffectMetrics')(
  function* (now: string) {
    const snapshots = yield* Metric.snapshot
    return {
      updatedAt: now,
      snapshots: snapshots
        .filter((snapshot) => snapshot.id.startsWith('creaclient_usage_'))
        .map(toUsageEffectMetricSnapshot),
    }
  },
)

const updateUsageDocument = Effect.fn('UsageMetrics.updateDocument')(function* (
  update: (
    document: UsageMetricsDocument,
    now: string,
    effectMetrics: UsageEffectMetrics,
  ) => UsageMetricsDocument,
) {
  const now = yield* getNowIso
  const effectMetrics = yield* readUsageEffectMetrics(now)

  return yield* updateDocumentFile(now, update, effectMetrics)
})

export const readUsageMetricsDocument = Effect.fn('UsageMetrics.readDocument')(
  function* () {
    const now = yield* getNowIso

    return yield* readDocumentOrCreate(now)
  },
)

export const recordUsageMetricEvent = Effect.fn('UsageMetrics.recordEvent')(
  function* (input: UsageMetricEventInput) {
    const app = input.app ?? defaultUsageMetricsApp
    yield* Metric.update(
      Metric.withAttributes(usageEventCounter, {
        app,
        kind: input.kind,
      }),
      1,
    )

    if (input.kind === 'page_view') {
      yield* Metric.update(
        Metric.withAttributes(pageViewCounter, {
          app,
          path: input.path ?? 'unknown',
        }),
        1,
      )
    } else {
      yield* Metric.update(
        Metric.withAttributes(buttonClickCounter, {
          app,
          label: input.label ?? input.id ?? 'unknown',
        }),
        1,
      )
    }

    return yield* updateUsageDocument((document, now, effectMetrics) =>
      applyUsageMetricEvent({
        document,
        input,
        now,
        effectMetrics,
      }),
    )
  },
)

const recordLoaderMetricEvent = Effect.fn('UsageMetrics.recordLoader')(
  function* (input: UsageMetricLoaderInput) {
    const app = input.app ?? defaultUsageMetricsApp

    yield* Metric.update(
      Metric.withAttributes(loaderExecutionCounter, {
        app,
        loader: input.loader,
      }),
      1,
    )
    yield* Metric.update(
      Metric.withAttributes(loaderDuration, {
        app,
        loader: input.loader,
        success: String(input.success),
      }),
      Duration.millis(input.durationMs),
    )

    if (!input.success) {
      yield* Metric.update(
        Metric.withAttributes(loaderFailureCounter, {
          app,
          loader: input.loader,
        }),
        1,
      )
    }

    return yield* updateUsageDocument((document, now, effectMetrics) =>
      applyUsageLoaderExecution({
        document,
        input,
        now,
        effectMetrics,
      }),
    )
  },
)

const logMetricWriteFailure = (name: string, error: unknown) =>
  Effect.logWarning(`Usage metric persistence failed for ${name}`, {
    error: String(error),
  })

export const trackLoaderExecution = <TValue, TError, TRequirements>(
  loader: string,
  effect: Effect.Effect<TValue, TError, TRequirements>,
): Effect.Effect<TValue, TError, TRequirements | FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const startedAt = yield* Effect.clockWith(
      (clock) => clock.currentTimeMillis,
    )
    const exit = yield* Effect.exit(effect)
    const endedAt = yield* Effect.clockWith((clock) => clock.currentTimeMillis)
    const durationMs = Math.max(0, endedAt - startedAt)

    yield* recordLoaderMetricEvent({
      app: defaultUsageMetricsApp,
      loader,
      success: Exit.isSuccess(exit),
      durationMs,
    }).pipe(Effect.catch((error) => logMetricWriteFailure(loader, error)))

    if (Exit.isSuccess(exit)) return exit.value
    return yield* Effect.failCause(exit.cause)
  })
