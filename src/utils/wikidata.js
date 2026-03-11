const WIKIDATA_API = 'https://www.wikidata.org/w/api.php'

// Property IDs
const P_OCCUPATION = 'P106'
const P_POSITION = 'P413'
const P_NATIONALITY = 'P27'
const P_DOB = 'P569'
const P_TEAM = 'P54'
const P_START = 'P580'
const P_END = 'P582'
const P_SHIRT = 'P1618'
const P_INSTANCE_OF = 'P31'
const Q_FOOTBALLER = 'Q937857'
const Q_NATIONAL_TEAM = 'Q6979593'
const Q_NATIONAL_ASSOC_TEAM = 'Q135408445' // national association football team

/**
 * Search Wikidata for football players matching a name.
 * Uses the wbsearchentities API (CORS-friendly).
 * Returns { data, error } where data is an array of { wikidataId, name, description }.
 */
export async function searchPlayer(name) {
  try {
    const url = `${WIKIDATA_API}?action=wbsearchentities&search=${encodeURIComponent(name)}&language=en&type=item&limit=20&format=json&origin=*`
    const response = await fetch(url)
    if (!response.ok) throw new Error(`Wikidata search failed: ${response.status}`)

    const json = await response.json()
    const candidates = json.search || []

    // Filter to only football players by fetching their occupation
    const footballers = []
    // Check candidates in batches of 20
    if (candidates.length > 0) {
      const ids = candidates.map(c => c.id).join('|')
      const entityUrl = `${WIKIDATA_API}?action=wbgetentities&ids=${ids}&props=claims&format=json&origin=*`
      const entityResponse = await fetch(entityUrl)
      if (!entityResponse.ok) throw new Error(`Wikidata entity fetch failed: ${entityResponse.status}`)

      const entityJson = await entityResponse.json()
      const entities = entityJson.entities || {}

      for (const candidate of candidates) {
        const entity = entities[candidate.id]
        if (!entity?.claims?.[P_OCCUPATION]) continue

        const occupations = entity.claims[P_OCCUPATION]
        const isFootballer = occupations.some(
          claim => claim.mainsnak?.datavalue?.value?.id === Q_FOOTBALLER
        )
        if (isFootballer) {
          footballers.push({
            wikidataId: candidate.id,
            name: candidate.label || candidate.id,
            description: candidate.description || '',
          })
        }
      }
    }

    return { data: footballers, error: null }
  } catch (err) {
    return { data: [], error: err.message }
  }
}

/**
 * Fetch full player details from Wikidata by QID.
 * Uses wbgetentities API (CORS-friendly).
 * Returns { data, error } where data is the player object with careers.
 */
export async function fetchPlayerDetails(wikidataId) {
  try {
    const url = `${WIKIDATA_API}?action=wbgetentities&ids=${wikidataId}&props=labels|claims&languages=en&format=json&origin=*`
    const response = await fetch(url)
    if (!response.ok) throw new Error(`Wikidata fetch failed: ${response.status}`)

    const json = await response.json()
    const entity = json.entities?.[wikidataId]
    if (!entity) throw new Error('Player not found on Wikidata')

    const claims = entity.claims || {}
    const name = entity.labels?.en?.value || wikidataId

    // Position
    const position = await resolveEntityLabel(
      claims[P_POSITION]?.[0]?.mainsnak?.datavalue?.value?.id
    )

    // Nationality
    const nationality = await resolveEntityLabel(
      claims[P_NATIONALITY]?.[0]?.mainsnak?.datavalue?.value?.id
    )

    // Date of birth
    const dobClaim = claims[P_DOB]?.[0]?.mainsnak?.datavalue?.value?.time
    const dateOfBirth = dobClaim ? dobClaim.replace('+', '').split('T')[0] : null

    // Careers from P54 (member of sports team)
    const teamClaims = claims[P_TEAM] || []
    const careers = []

    // Collect all team IDs to batch-check which are national teams
    const teamIds = new Set()
    for (const claim of teamClaims) {
      const teamId = claim.mainsnak?.datavalue?.value?.id
      if (teamId) teamIds.add(teamId)
    }

    // Batch fetch team entities to check if they're national teams
    const nationalTeamIds = await identifyNationalTeams([...teamIds])

    for (const claim of teamClaims) {
      const teamId = claim.mainsnak?.datavalue?.value?.id
      if (!teamId) continue

      const teamName = await resolveEntityLabel(teamId)
      const qualifiers = claim.qualifiers || {}

      const startTime = qualifiers[P_START]?.[0]?.datavalue?.value?.time
      const endTime = qualifiers[P_END]?.[0]?.datavalue?.value?.time
      const shirtNum = qualifiers[P_SHIRT]?.[0]?.datavalue?.value

      const startYear = startTime ? parseWikidataYear(startTime) : null
      const endYear = endTime ? parseWikidataYear(endTime) : null

      careers.push({
        teamName: teamName || 'Unknown',
        seasonStart: startYear ? formatSeason(startYear) : null,
        seasonEnd: endYear ? formatSeason(endYear) : null,
        shirtNumber: shirtNum ? parseInt(shirtNum, 10) : null,
        isInternational: nationalTeamIds.has(teamId),
        startYear,
      })
    }

    // Sort: oldest first, internationals after clubs
    careers.sort((a, b) => {
      const aStart = a.startYear || 0
      const bStart = b.startYear || 0
      if (aStart !== bStart) return aStart - bStart
      return (a.isInternational ? 1 : 0) - (b.isInternational ? 1 : 0)
    })

    return {
      data: { name, position, nationality, dateOfBirth, wikidataId, careers },
      error: null,
    }
  } catch (err) {
    return { data: null, error: err.message }
  }
}

/**
 * Convert Wikidata player details into objects ready for Supabase insert.
 */
export function mapToPlayerRecord(details) {
  const player = {
    name: details.name,
    position: details.position,
    nationality: details.nationality,
    date_of_birth: details.dateOfBirth || null,
    wikidata_id: details.wikidataId,
  }

  const careers = details.careers.map(c => ({
    team_name: c.teamName,
    season_start: c.seasonStart || null,
    season_end: c.seasonEnd || null,
    shirt_number: c.shirtNumber || null,
    is_international: c.isInternational,
  }))

  return { player, careers }
}

/**
 * Search Wikidata for a team entity by name.
 * Returns the first matching team's QID, or null.
 */
export async function searchTeamEntity(teamName) {
  try {
    const url = `${WIKIDATA_API}?action=wbsearchentities&search=${encodeURIComponent(teamName)}&language=en&type=item&limit=10&format=json&origin=*`
    const response = await fetch(url)
    if (!response.ok) return null

    const json = await response.json()
    const candidates = json.search || []
    if (candidates.length === 0) return null

    // Check which candidates are sports teams (P31 = Q476028 football club, or Q6979593 national team, etc.)
    const ids = candidates.map(c => c.id).join('|')
    const entityUrl = `${WIKIDATA_API}?action=wbgetentities&ids=${ids}&props=claims&format=json&origin=*`
    const entityResponse = await fetch(entityUrl)
    if (!entityResponse.ok) return candidates[0] ? { id: candidates[0].id, name: candidates[0].label } : null

    const entityJson = await entityResponse.json()
    const entities = entityJson.entities || {}

    // Look for entities that have P54 backlinks (are sports teams) or have P31 as football club
    for (const candidate of candidates) {
      const entity = entities[candidate.id]
      if (!entity?.claims) continue
      // Check if it's a sports team type (Q476028, Q15944511, Q6979593, Q135408445)
      const instanceClaims = entity.claims[P_INSTANCE_OF] || []
      const teamTypes = ['Q476028', 'Q15944511', 'Q6979593', 'Q135408445', 'Q847017']
      const isTeam = instanceClaims.some(c => teamTypes.includes(c.mainsnak?.datavalue?.value?.id))
      if (isTeam) {
        return { id: candidate.id, name: candidate.label || candidate.id }
      }
    }

    // Fallback: return first result
    return candidates[0] ? { id: candidates[0].id, name: candidates[0].label } : null
  } catch {
    return null
  }
}

const SPARQL_ENDPOINT = 'https://query.wikidata.org/sparql'

/**
 * Fetch squad members for a team during a specific season using Wikidata SPARQL.
 * teamQID: Wikidata QID like "Q7156" (FC Barcelona)
 * seasonStartYear: e.g. 2024 for "2024-25" season
 * Returns array of { wikidataId, name, shirtNumber }
 */
export async function fetchSquadForSeason(teamQID, seasonStartYear) {
  const endYear = seasonStartYear + 1

  // Only include players with solid date evidence:
  // Must have a start date AND either an end date that overlaps, or
  // a recent start (within 2 years) with no end date (likely still at club).
  // Also include anyone with a shirt number regardless.
  const sparql = `
SELECT DISTINCT ?player ?playerLabel ?number WHERE {
  ?player p:P54 ?stmt .
  ?stmt ps:P54 wd:${teamQID} .
  OPTIONAL { ?stmt pq:P1618 ?number }
  OPTIONAL { ?stmt pq:P580 ?start }
  OPTIONAL { ?stmt pq:P582 ?end }
  FILTER(BOUND(?start))
  FILTER(YEAR(?start) <= ${endYear})
  FILTER(
    (BOUND(?end) && YEAR(?end) >= ${seasonStartYear}) ||
    (BOUND(?number)) ||
    (!BOUND(?end) && YEAR(?start) >= ${seasonStartYear - 2})
  )
  ?player wdt:P106 wd:Q937857 .
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en" . }
}
ORDER BY ?playerLabel
`

  try {
    const url = `${SPARQL_ENDPOINT}?query=${encodeURIComponent(sparql)}`
    const response = await fetch(url, {
      headers: { 'Accept': 'application/sparql-results+json' }
    })
    if (!response.ok) throw new Error(`SPARQL query failed: ${response.status}`)

    const json = await response.json()
    const bindings = json.results?.bindings || []

    const players = bindings.map(b => {
      const uri = b.player?.value || ''
      const qid = uri.split('/').pop()
      return {
        wikidataId: qid,
        name: b.playerLabel?.value || qid,
        shirtNumber: b.number?.value ? parseInt(b.number.value, 10) : null,
      }
    })

    // Deduplicate by wikidataId
    const seen = new Set()
    return players.filter(p => {
      if (seen.has(p.wikidataId)) return false
      seen.add(p.wikidataId)
      return true
    })
  } catch (err) {
    console.error('SPARQL squad query error:', err)
    return []
  }
}

// --- Internal helpers ---

// Cache for resolved entity labels
const labelCache = new Map()

async function resolveEntityLabel(entityId) {
  if (!entityId) return null
  if (labelCache.has(entityId)) return labelCache.get(entityId)

  try {
    const url = `${WIKIDATA_API}?action=wbgetentities&ids=${entityId}&props=labels&languages=en&format=json&origin=*`
    const response = await fetch(url)
    if (!response.ok) return entityId

    const json = await response.json()
    const label = json.entities?.[entityId]?.labels?.en?.value || entityId
    labelCache.set(entityId, label)
    return label
  } catch {
    return entityId
  }
}

async function identifyNationalTeams(teamIds) {
  const nationalIds = new Set()
  if (teamIds.length === 0) return nationalIds

  try {
    // Batch fetch in groups of 50
    for (let i = 0; i < teamIds.length; i += 50) {
      const batch = teamIds.slice(i, i + 50).join('|')
      const url = `${WIKIDATA_API}?action=wbgetentities&ids=${batch}&props=claims|labels&languages=en&format=json&origin=*`
      const response = await fetch(url)
      if (!response.ok) continue

      const json = await response.json()
      const entities = json.entities || {}

      for (const [id, entity] of Object.entries(entities)) {
        const instanceClaims = entity.claims?.[P_INSTANCE_OF] || []
        const isNational = instanceClaims.some(claim => {
          const typeId = claim.mainsnak?.datavalue?.value?.id
          return typeId === Q_NATIONAL_TEAM || typeId === Q_NATIONAL_ASSOC_TEAM
        })
        // Also check label for "national" as a fallback
        const label = (entity.labels?.en?.value || '').toLowerCase()
        if (isNational || label.includes('national')) {
          nationalIds.add(id)
        }
      }
    }
  } catch {
    // Fallback: don't mark any as national
  }

  return nationalIds
}

function formatSeason(year) {
  const nextYear = (year + 1).toString().slice(-2)
  return `${year}-${nextYear}`
}

// Wikidata times can have 00 for month/day (e.g. +2014-00-00T00:00:00Z)
// which creates invalid JS dates. Extract year directly instead.
function parseWikidataYear(timeStr) {
  const match = timeStr.replace('+', '').match(/^(\d{4})/)
  return match ? parseInt(match[1], 10) : null
}
