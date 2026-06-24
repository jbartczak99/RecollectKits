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

// True when VITE_SENTRY_DSN was present at build time (baked into the bundle).
export function isSentryEnabled() {
  return Boolean(dsn)
}

// Diagnostic for the temp admin test button. Returns whether the DSN is in the
// build and whether the event flushed to Sentry's transport.
export async function sendTestError() {
  if (!dsn) return { enabled: false, flushed: false }
  Sentry.captureException(new Error(`Sentry test error (admin panel) — ${new Date().toISOString()}`), {
    extra: { source: 'admin-test-button' },
  })
  let flushed = false
  try {
    flushed = await Sentry.flush(3000)
  } catch {
    flushed = false
  }
  return { enabled: true, flushed }
}
