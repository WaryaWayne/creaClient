import { useEffect } from 'react'
import { useRouterState } from '@tanstack/react-router'

import { defaultUsageMetricsApp, type UsageMetricEventInput } from './schema'

const endpoint = '/api/usage-metrics'

const normalizeLabel = (value: string | null | undefined) => {
  const text = value?.replace(/\s+/g, ' ').trim()
  return text && text.length > 0 ? text.slice(0, 180) : undefined
}

const routeIdFromPath = (path: string) => path || '/'

export const trackUsageMetricEvent = (input: UsageMetricEventInput) => {
  if (typeof window === 'undefined') return

  const body = JSON.stringify({
    app: defaultUsageMetricsApp,
    ...input,
  })

  void fetch(endpoint, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body,
    keepalive: true,
  }).catch(() => undefined)
}

const trackPageView = (href: string) => {
  const url = new URL(href, window.location.origin)
  trackUsageMetricEvent({
    kind: 'page_view',
    path: url.pathname,
    routeId: routeIdFromPath(url.pathname),
    href: `${url.pathname}${url.search}`,
  })
}

const targetElement = (eventTarget: EventTarget | null) => {
  if (!(eventTarget instanceof Element)) return null
  return eventTarget.closest<HTMLElement>(
    '[data-usage-id], button, a, [role="button"]',
  )
}

const linkHref = (element: HTMLElement) => {
  if (element instanceof HTMLAnchorElement) {
    return element.href
  }
  const link = element.closest<HTMLAnchorElement>('a[href]')
  return link?.href
}

const trackActionClick = (element: HTMLElement) => {
  const href = linkHref(element)
  const label =
    normalizeLabel(element.dataset.usageLabel) ??
    normalizeLabel(element.getAttribute('aria-label')) ??
    normalizeLabel(element.getAttribute('title')) ??
    normalizeLabel(element.textContent) ??
    normalizeLabel(href) ??
    element.tagName.toLowerCase()

  trackUsageMetricEvent({
    kind: 'button_click',
    path: window.location.pathname,
    routeId: routeIdFromPath(window.location.pathname),
    id:
      normalizeLabel(element.dataset.usageId) ??
      normalizeLabel(element.id) ??
      undefined,
    label,
    href: href ? new URL(href, window.location.origin).pathname : undefined,
    metadata: {
      tag: element.tagName.toLowerCase(),
      role: element.getAttribute('role'),
    },
  })
}

export function UsageMetricsClient() {
  const href = useRouterState({
    select: (state) => state.location.href,
  })

  useEffect(() => {
    trackPageView(href)
  }, [href])

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const element = targetElement(event.target)
      if (element !== null) {
        trackActionClick(element)
      }
    }

    document.addEventListener('click', onClick, { capture: true })
    return () =>
      document.removeEventListener('click', onClick, { capture: true })
  }, [])

  return null
}
