// Product-analytics event scaffolding (blitz plan June 13 batch item d).
//
// The activation funnel: signup → first kit → 5 kits → share. This module
// owns the event vocabulary and instrumentation points; the provider is
// pluggable. Until one is wired (decision deferred — Vercel Analytics or
// PostHog, week 3), events buffer in memory (capped) and log in dev, so
// call sites are real but nothing leaves the browser.

export const EVENTS = Object.freeze({
  SIGNUP_COMPLETED: 'signup_completed',
  KIT_ADDED: 'kit_added',
  KIT_MILESTONE: 'kit_milestone',
  SHARE_CLICKED: 'share_clicked',
})

export const MILESTONES = Object.freeze([1, 5, 10, 25, 50, 100])

const KNOWN = new Set(Object.values(EVENTS))
const BUFFER_CAP = 200

export const _buffer = []

function defaultTransport(name, props) {
  if (_buffer.length >= BUFFER_CAP) _buffer.shift()
  _buffer.push({ name, props })
  if (import.meta.env?.DEV) {
    console.debug('[analytics]', name, props || {})
  }
}

let transport = defaultTransport

export function setTransport(fn) {
  transport = fn || defaultTransport
}

export function _resetForTests() {
  transport = defaultTransport
  _buffer.length = 0
}

export function track(event, props) {
  if (!KNOWN.has(event)) return false
  try {
    transport(event, props)
  } catch {
    // Analytics must never break the product.
  }
  return true
}

export function trackKitAdded(count) {
  if (!Number.isInteger(count) || count < 1) return
  track(EVENTS.KIT_ADDED, { count })
  if (MILESTONES.includes(count)) {
    track(EVENTS.KIT_MILESTONE, { count })
  }
}
