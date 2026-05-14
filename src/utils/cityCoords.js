/**
 * Static lookup from `${city}|${country}` (as stored on clubs rows) to
 * [latitude, longitude]. Used to place pins on the countries map when a user
 * clicks a country in club view.
 *
 * The `country` half of the key is the raw value on the clubs row (e.g.
 * "England", "Wales") — NOT the world-atlas polygon name (normalizeCountryName
 * is applied separately for shading). Keep them in sync with admin entries.
 *
 * When admins add a club with a city not listed here, the pin is silently
 * skipped. Add the entry below to surface it.
 */

const CITY_COORDS = {
  'Toronto|Canada': [43.6532, -79.3832],
  'Birmingham|England': [52.4862, -1.8904],
  'London|England': [51.5074, -0.1278],
  'Rome|Italy': [41.9028, 12.4964],
  'Swansea|Wales': [51.6214, -3.9436],
}

export function cityToCoords(city, country) {
  if (!city || !country) return null
  return CITY_COORDS[`${city}|${country}`] || null
}
