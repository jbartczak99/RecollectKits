import { describe, it, expect } from 'vitest'
import { summarizeWaitlist, INTEREST_LABELS } from './waitlist.js'

const DAY = 86400000
const now = 1_000_000_000_000 // fixed "now" for deterministic week math

const row = (interest, daysAgo) => ({
  email: `x${daysAgo}@e.com`,
  first_name: 'X',
  interest,
  created_at: new Date(now - daysAgo * DAY).toISOString(),
})

describe('summarizeWaitlist', () => {
  it('totals all rows', () => {
    const s = summarizeWaitlist([row('collector', 1), row('creator', 2)], now)
    expect(s.total).toBe(2)
  })

  it('counts only the last 7 days as this week', () => {
    const s = summarizeWaitlist([row('collector', 1), row('collector', 6), row('collector', 10)], now)
    expect(s.thisWeek).toBe(2)
  })

  it('breaks down by interest, bucketing null/unknown', () => {
    const s = summarizeWaitlist(
      [row('collector', 1), row('collector', 1), row('creator', 1), row(null, 1), row('weird', 1)],
      now
    )
    expect(s.byInterest.collector).toBe(2)
    expect(s.byInterest.creator).toBe(1)
    expect(s.byInterest.unknown).toBe(2) // null + unrecognized
  })

  it('handles an empty list', () => {
    const s = summarizeWaitlist([], now)
    expect(s).toEqual({ total: 0, thisWeek: 0, byInterest: { collector: 0, creator: 0, shop: 0, club: 0, unknown: 0 } })
  })

  it('exposes labels for every known interest', () => {
    expect(Object.keys(INTEREST_LABELS)).toEqual(['collector', 'creator', 'shop', 'club'])
  })
})
