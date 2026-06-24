// Canonical season options + normalization for the kit add flow. Standardizes
// on two shapes: a single calendar year ("2026", tournament/international
// kits) and a split season labeled by its start year ("2025/26", club kits).

export const SEASON_MIN_YEAR = 1900

export function generateSeasonOptions(currentYear = new Date().getFullYear()) {
  const opts = []
  for (let y = currentYear; y >= SEASON_MIN_YEAR; y--) {
    const next = String(y + 1).slice(-2) // two digits, wraps centuries (1999→00)
    opts.push(`${y}/${next}`)
    opts.push(`${y}`)
  }
  return opts
}

export function normalizeSeason(input) {
  const s = (input || '').trim()
  if (!s) return ''
  // YYYY[-/–]YY  →  YYYY/YY
  let m = s.match(/^(\d{4})[-/–](\d{2})$/)
  if (m) return `${m[1]}/${m[2]}`
  // YYYY[-/–]YYYY  →  YYYY/YY
  m = s.match(/^(\d{4})[-/–](\d{4})$/)
  if (m) return `${m[1]}/${m[2].slice(-2)}`
  return s
}

export function filterSeasons(options, query, limit = 12) {
  const q = (query || '').trim().toLowerCase()
  if (!q) return options.slice(0, limit)
  return options
    .filter((o) => o.toLowerCase().startsWith(q) || o.includes(q))
    .slice(0, limit)
}
