// Sentry wiring (blitz plan June 13 batch item b). Entirely inert until
// VITE_SENTRY_DSN is set (Vercel env var) — no DSN, no SDK init, no traffic.
import * as Sentry from '@sentry/react'

const dsn = import.meta.env.VITE_SENTRY_DSN

export function initSentry() {
  if (!dsn) return false
  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    // Collectors' emails/names stay out of error payloads.
    sendDefaultPii: false,
    tracesSampleRate: 0.1,
  })
  return true
}

export function captureError(error, context) {
  if (!dsn) return
  Sentry.captureException(error, context ? { extra: context } : undefined)
}
