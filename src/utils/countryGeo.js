/**
 * Maps a country name as stored in user data (from src/data/countries.js
 * and free-text submissions) to the canonical country name used by
 * world-atlas/countries-110m.json. Returns null if no match is found.
 */

// User-side name → world-atlas name (only entries that DIFFER).
// Names that already match world-atlas are not listed.
const ALIASES = {
  'United States': 'United States of America',
  'United States of America': 'United States of America',
  USA: 'United States of America',

  'Czech Republic': 'Czechia',
  Czechia: 'Czechia',

  'Bosnia and Herzegovina': 'Bosnia and Herz.',
  'Central African Republic': 'Central African Rep.',
  'Dominican Republic': 'Dominican Rep.',
  'Equatorial Guinea': 'Eq. Guinea',
  'South Sudan': 'S. Sudan',
  'Solomon Islands': 'Solomon Is.',
  'Western Sahara': 'W. Sahara',
  'Falkland Islands': 'Falkland Is.',

  Eswatini: 'eSwatini',
  Swaziland: 'eSwatini',

  'North Macedonia': 'Macedonia',
  Macedonia: 'Macedonia',

  "Côte d'Ivoire": "Côte d'Ivoire",
  'Ivory Coast': "Côte d'Ivoire",

  'Democratic Republic of the Congo': 'Dem. Rep. Congo',
  'DR Congo': 'Dem. Rep. Congo',
  Congo: 'Congo',
  'Republic of the Congo': 'Congo',

  'East Timor': 'Timor-Leste',
  'Timor-Leste': 'Timor-Leste',

  Burma: 'Myanmar',
  Myanmar: 'Myanmar',

  // UK home nations are rendered as separate polygons (see
  // src/data/ukHomeNations.json) because each has its own league. Map each
  // accepted alias to its own home-nation name.
  England: 'England',
  Scotland: 'Scotland',
  Wales: 'Wales',
  'Northern Ireland': 'Northern Ireland',
  // Aliases that refer to the union as a whole — fold to England as a best
  // effort. Clubs in the DB should be tagged to a specific home nation.
  'Great Britain': 'England',
  'United Kingdom': 'England',
  UK: 'England',
}

/**
 * Build the lookup for the current TopoJSON dataset.
 * Returns: { normalize(name): string|null, knownNames: Set<string> }
 */
export function normalizeCountryName(name) {
  if (!name) return null
  const trimmed = String(name).trim()
  if (!trimmed) return null

  // Exact alias match first.
  if (ALIASES[trimmed]) return ALIASES[trimmed]

  // Case-insensitive alias match.
  const lower = trimmed.toLowerCase()
  for (const [from, to] of Object.entries(ALIASES)) {
    if (from.toLowerCase() === lower) return to
  }

  // Otherwise return the trimmed input — caller will check it against
  // the world-atlas name set and decide whether it resolves.
  return trimmed
}

/**
 * Given an array of { name, value } where name is the user-submitted country
 * name, returns a Map keyed by world-atlas name → total value, summing any
 * collisions (e.g. England + Scotland both folded onto United Kingdom).
 */
export function aggregateByGeoName(items) {
  const result = new Map()
  for (const item of items || []) {
    const key = normalizeCountryName(item.name)
    if (!key) continue
    result.set(key, (result.get(key) || 0) + (item.value || 0))
  }
  return result
}
