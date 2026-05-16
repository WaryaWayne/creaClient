import { createFileRoute } from '@tanstack/react-router'
import { Effect } from 'effect'
import * as BunFileSystem from '@effect/platform-bun/BunFileSystem'

import {
  readUsageMetricsDocument,
  recordUsageMetricEvent,
} from '#/features/usage-metrics/server'
import { parseUsageMetricEventInput } from '#/features/usage-metrics/schema'

const jsonHeaders = {
  'cache-control': 'no-store',
  'content-type': 'application/json; charset=utf-8',
}

const jsonResponse = (body: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(body, null, 2), {
    ...init,
    headers: {
      ...jsonHeaders,
      ...init?.headers,
    },
  })

const parseRequestJson = (request: Request) =>
  Effect.tryPromise({
    try: () => request.json() as Promise<unknown>,
    catch: () => null,
  })

export const Route = createFileRoute('/api/usage-metrics')({
  server: {
    handlers: {
      GET: () =>
        Effect.runPromise(
          readUsageMetricsDocument().pipe(Effect.provide(BunFileSystem.layer)),
        ).then((document) => jsonResponse(document)),
      POST: ({ request }) =>
        Effect.runPromise(
          Effect.gen(function* () {
            const body = yield* parseRequestJson(request)
            const input = parseUsageMetricEventInput(body)

            if (input === null) {
              return jsonResponse(
                {
                  ok: false,
                  error:
                    'Expected a page_view or button_click usage metric event.',
                },
                { status: 400 },
              )
            }

            const document = yield* recordUsageMetricEvent(input)
            return jsonResponse({ ok: true, totals: document.totals })
          }).pipe(
            Effect.provide(BunFileSystem.layer),
            Effect.catch((error) =>
              Effect.succeed(
                jsonResponse(
                  {
                    ok: false,
                    error: String(error),
                  },
                  { status: 500 },
                ),
              ),
            ),
          ),
        ),
    },
  },
})
