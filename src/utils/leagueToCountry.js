/**
 * Maps a league name (as stored in public_jerseys.league) to a country name
 * (matching the names normalizeCountryName() expects).
 *
 * Approximate by design — international competitions like Champions League
 * aren't mappable to a single country, so they intentionally return null and
 * those kits don't appear on the club map.
 */

const LEAGUE_TO_COUNTRY = {
  // Men's
  'Premier League': 'England',
  'La Liga': 'Spain',
  'LaLiga': 'Spain',
  'Serie A': 'Italy',
  'Bundesliga': 'Germany',
  'Ligue 1': 'France',
  'MLS': 'United States',
  'Eredivisie': 'Netherlands',
  'Liga Portugal': 'Portugal',
  'Primeira Liga': 'Portugal',
  'Championship': 'England',
  'Saudi Pro League': 'Saudi Arabia',

  // Women's
  'NWSL': 'United States',
  'USL Super League': 'United States',
  'WSL': 'England',
  'Liga F': 'Spain',
  'Serie A Femminile': 'Italy',
  'Frauen-Bundesliga': 'Germany',
  'D1 Arkema': 'France',
  'A-League Women': 'Australia',

  // International competitions — explicitly unmappable.
  'Champions League': null,
  'UEFA Champions League': null,
  'Europa League': null,
  'UEFA Europa League': null,
  'Conference League': null,
  'World Cup': null,
  'Copa America': null,
  'Copa Libertadores': null,
  'AFC Champions League': null,
  'CAF Champions League': null,
  'CONCACAF Champions League': null,
  'International': null,
  'Other': null,
}

export function leagueToCountry(league) {
  if (!league) return null
  if (Object.prototype.hasOwnProperty.call(LEAGUE_TO_COUNTRY, league)) {
    return LEAGUE_TO_COUNTRY[league]
  }
  return null
}
