// Waitlist aggregation for the admin view. Source of truth is the
// waitlist_signups table (the waitlist API writes there before Resend), so
// the admin panel never needs to touch Resend to see who's signing up.

export const INTEREST_LABELS = {
  collector: 'Collector',
  creator: 'Content creator',
  shop: 'Shop / retailer',
  club: 'Club / org',
}

const WEEK_MS = 7 * 86400000

export function summarizeWaitlist(rows, nowMs = Date.now()) {
  const byInterest = { collector: 0, creator: 0, shop: 0, club: 0, unknown: 0 }
  let thisWeek = 0

  for (const r of rows || []) {
    const key = Object.prototype.hasOwnProperty.call(byInterest, r.interest) && r.interest !== 'unknown'
      ? r.interest
      : 'unknown'
    byInterest[key] += 1

    const t = r.created_at ? Date.parse(r.created_at) : NaN
    if (!Number.isNaN(t) && nowMs - t <= WEEK_MS) thisWeek += 1
  }

  return { total: (rows || []).length, thisWeek, byInterest }
}
