import { describe, expect, it } from 'vitest'

import {
  applyUsageLoaderExecution,
  applyUsageMetricEvent,
  createUsageMetricsDocument,
} from './schema'

import type { UsageEffectMetrics } from './schema'

const now = '2026-05-15T12:00:00.000Z'

const effectMetrics = {
  updatedAt: now,
  snapshots: [],
} satisfies UsageEffectMetrics

describe('usage metrics document updates', () => {
  it('increments page buckets without replacing the rest of the document', () => {
    const first = applyUsageMetricEvent({
      document: createUsageMetricsDocument(now),
      input: {
        kind: 'page_view',
        path: '/listings',
      },
      now,
      effectMetrics,
    })
    const second = applyUsageMetricEvent({
      document: first,
      input: {
        kind: 'page_view',
        path: '/listings',
      },
      now,
      effectMetrics,
    })

    expect(second.totals.pageViews).toBe(2)
    expect(Object.values(second.pages)).toEqual([
      expect.objectContaining({
        path: '/listings',
        views: 2,
      }),
    ])
  })

  it('keeps button and loader fields in their own buckets', () => {
    const withButton = applyUsageMetricEvent({
      document: createUsageMetricsDocument(now),
      input: {
        kind: 'button_click',
        path: '/',
        label: 'Browse listings',
      },
      now,
      effectMetrics,
    })
    const withLoader = applyUsageLoaderExecution({
      document: withButton,
      input: {
        loader: 'Listings.loadHome',
        success: true,
        durationMs: 42,
      },
      now,
      effectMetrics,
    })

    expect(withLoader.totals.buttonClicks).toBe(1)
    expect(withLoader.totals.loaderExecutions).toBe(1)
    expect(Object.values(withLoader.buttons)[0]).toEqual(
      expect.objectContaining({
        label: 'Browse listings',
        clicks: 1,
      }),
    )
    expect(Object.values(withLoader.loaders)[0]).toEqual(
      expect.objectContaining({
        loader: 'Listings.loadHome',
        executions: 1,
        averageDurationMs: 42,
      }),
    )
  })
})
