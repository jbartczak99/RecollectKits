// Wikidata club/national-team import (blitz plan June 13 batch item a).
//
// Seeds the clubs table so a typical collector finds their teams in the
// catalog-first search (June 23 seed-data check: ≥80% hit rate).
//
// Usage:
//   node scripts/import-clubs-wikidata.mjs --source epl
//   node scripts/import-clubs-wikidata.mjs --source mls
//   node scripts/import-clubs-wikidata.mjs --source worldcup
//   node scripts/import-clubs-wikidata.mjs --source all
//
// Writes database/data/clubs_import_<source>_<yyyymmdd>.sql (INSERT ... ON
// CONFLICT (wikidata_id) DO NOTHING — paste after review) plus a .csv for
// the June 19 alias/duplicate review pass. NOTHING runs against the DB
// directly; review is the point.

import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ENDPOINT = 'https://query.wikidata.org/sparql'
const USER_AGENT = 'RecollectKitsImport/1.0 (https://recollectkits.com)'

// League QIDs: Premier League Q9448, Major League Soccer Q18543.
//
// National teams: Wikidata does NOT model 2026 World Cup participation on
// team entities (P1923 is empty on Q5020214; P1344 participants are players),
// so "the 48 WC nations" can't be queried directly. Instead we sweep all
// men's national teams (Q6979593) that are active, have a country, and have
// ≥10 Wikipedia sitelinks — ~278 teams, a superset of every WC nation.
// Collectors own non-qualified nations' kits anyway; the June 19 review
// pass trims anything odd.
const SOURCES = {
  // countries: gate league results to the league's own nations — UK Q145 for
  // the PL (drops a mis-tagged Romanian club); US Q30 + Canada Q16 for MLS.
  epl: { kind: 'league', qid: 'Q9448', league: 'Premier League', countries: ['Q145'] },
  mls: { kind: 'league', qid: 'Q18543', league: 'MLS', countries: ['Q30', 'Q16'] },
  worldcup: { kind: 'nations', league: 'International' },
}

function leagueQuery(leagueQid, countryQids = []) {
  // Optional country gate: P118 (league) sometimes carries stale/wrong links
  // (a Romanian club tagged "Premier League"); restricting to the league's
  // own countries drops those false positives.
  const countryGate = countryQids.length
    ? `?club wdt:P17 ?gateCountry . FILTER(?gateCountry IN (${countryQids.map((q) => 'wd:' + q).join(', ')}))`
    : ''
  return `
SELECT ?club ?clubLabel ?shortName ?countryLabel ?cityLabel ?stadiumLabel ?inception ?coords
  (GROUP_CONCAT(DISTINCT ?alias; separator="|") AS ?aliases)
WHERE {
  ?club wdt:P118 wd:${leagueQid} .
  ?club wdt:P31/wdt:P279* wd:Q476028 .   # association football club — P118 alone also matches players
  ${countryGate}
  OPTIONAL { ?club wdt:P1813 ?shortName . FILTER(LANG(?shortName) = "en") }
  OPTIONAL { ?club wdt:P17 ?country . }
  OPTIONAL { ?club wdt:P159 ?city . }
  OPTIONAL { ?club wdt:P115 ?stadium . OPTIONAL { ?stadium wdt:P625 ?coords . } }
  OPTIONAL { ?club wdt:P571 ?inception . }
  OPTIONAL { ?club skos:altLabel ?alias . FILTER(LANG(?alias) = "en") }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
GROUP BY ?club ?clubLabel ?shortName ?countryLabel ?cityLabel ?stadiumLabel ?inception ?coords`
}

function nationalTeamsQuery() {
  // FIFA national teams (men's + women's), filtering out the CONIFA/regional
  // noise that shares the men's-national-team class. Signals stack:
  //   * Q135408445 = men's national team (current class, e.g. Brazil);
  //     Q6979593 = older/broader class still carrying women's teams.
  //   * P1532 (country for sport) present — FIFA-recognized sporting nations
  //     carry it; autonomous-region teams (Andalusia, Galicia, Padania…) and
  //     non-FIFA micro-islands (Kiribati, Falklands…) mostly don't.
  //   * NOT member (P463) of CONIFA (Q15999031) or N.F.-Board (Q270403) — the
  //     non-FIFA federations Catalonia/Silesia/Basque/West Papua belong to.
  //   * ≥10 sitelinks, not dissolved.
  // Olympic (U-23) sides slip the class net by name → dropped by the JS
  // youth/olympic filter post-fetch.
  return `
SELECT ?club ?clubLabel ?shortName ?countryLabel ?inception
  (GROUP_CONCAT(DISTINCT ?alias; separator="|") AS ?aliases)
WHERE {
  VALUES ?teamClass { wd:Q135408445 wd:Q6979593 }
  ?club wdt:P31 ?teamClass .
  ?club wdt:P17 ?country .
  ?club wdt:P1532 ?countryForSport .
  ?club wikibase:sitelinks ?links . FILTER(?links >= 10)
  FILTER NOT EXISTS { ?club wdt:P576 ?dissolved . }
  FILTER NOT EXISTS { ?club wdt:P463 wd:Q15999031 . }
  FILTER NOT EXISTS { ?club wdt:P463 wd:Q270403 . }
  OPTIONAL { ?club wdt:P1813 ?shortName . FILTER(LANG(?shortName) = "en") }
  OPTIONAL { ?club wdt:P571 ?inception . }
  OPTIONAL { ?club skos:altLabel ?alias . FILTER(LANG(?alias) = "en") }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
GROUP BY ?club ?clubLabel ?shortName ?countryLabel ?inception`
}

// --- pure transforms (unit-tested) ---

const val = (binding, key) => binding?.[key]?.value ?? null

export function buildClubRecord(binding, primaryLeague) {
  const uri = val(binding, 'club') || ''
  const wikidataId = uri.slice(uri.lastIndexOf('/') + 1) || null

  const shortName = val(binding, 'shortName')
  const aliasBlob = val(binding, 'aliases')
  const aliases = new Set(
    (aliasBlob ? aliasBlob.split('|') : []).map((a) => a.trim()).filter(Boolean)
  )
  if (shortName) aliases.add(shortName)

  let latitude = null
  let longitude = null
  const wkt = val(binding, 'coords')
  const m = wkt && wkt.match(/Point\(([-\d.]+) ([-\d.]+)\)/)
  if (m) {
    longitude = parseFloat(m[1])
    latitude = parseFloat(m[2])
  }

  const inception = val(binding, 'inception')
  const foundedYear = inception ? parseInt(inception.slice(0, 4), 10) : null

  return {
    wikidata_id: wikidataId,
    name: val(binding, 'clubLabel'),
    short_name: shortName,
    aliases: [...aliases],
    country: val(binding, 'countryLabel'),
    city: val(binding, 'cityLabel'),
    primary_league: primaryLeague,
    founded_year: Number.isFinite(foundedYear) ? foundedYear : null,
    stadium_name: val(binding, 'stadiumLabel'),
    latitude,
    longitude,
    source: 'wikidata',
  }
}

// Youth sides (U-17/U-20/U-23...) and Olympic teams (U-23 in all but name)
// are typed as national teams on Wikidata but are catalog noise. Senior
// women's teams stay — women's kits are in scope (competition_gender is
// canonical on public_jerseys).
export function isYouthTeam(name) {
  return /\bunder[ -]?\d+\b|\bu-?\d+\b|\byouth\b|\bolympic\b/i.test(name || '')
}

// Non-FIFA entities that survive the structural filters because Wikidata
// models them identically to legitimate non-sovereign FIFA members (P1532
// set, P17 = a FIFA country, not CONIFA-tagged). Curated from the 2026-06-24
// review. Kept on purpose: cult-favorite real island associations collectors
// chase (Greenland, Zanzibar, Isle of Man, Faroe Islands).
const NON_FIFA_NAMES = new Set([
  'catalonia national football team',
  'silesia national football team',
  'basque country regional football team',
  'aragon national football team',
  'asturias autonomous football team',
  'cantabria autonomous football team',
  'occitania national football team',
  'corsica national football team',
  'shetland association football team',
  'sark association football team',
  'alderney official association football team',
  'sealand national football team',
  'chechnya national football team',
  'big kurdistan national football team',
  'bohemia and moravia national football team',
  "east germany women's national football team",
])

export function isExcludedNation(name) {
  return isYouthTeam(name) || NON_FIFA_NAMES.has((name || '').trim().toLowerCase())
}

export function mergeByWikidataId(records) {
  const byId = new Map()
  for (const rec of records) {
    const existing = byId.get(rec.wikidata_id)
    if (!existing) {
      byId.set(rec.wikidata_id, { ...rec })
    } else {
      existing.aliases = [...new Set([...existing.aliases, ...rec.aliases])]
    }
  }
  return [...byId.values()]
}

function sqlText(value) {
  if (value === null || value === undefined) return 'NULL'
  return `'${String(value).replace(/'/g, "''")}'`
}

function sqlNum(value) {
  return value === null || value === undefined ? 'NULL' : String(value)
}

function sqlTextArray(values) {
  if (!values || values.length === 0) return "'{}'::text[]"
  return `ARRAY[${values.map(sqlText).join(', ')}]::text[]`
}

export function buildClubsInsertSql(records) {
  const rows = records.map((r) =>
    `  (${sqlText(r.name)}, ${sqlText(r.short_name)}, ${sqlTextArray(r.aliases)}, ${sqlText(r.country)}, ${sqlText(r.city)}, ${sqlText(r.primary_league)}, ${sqlNum(r.founded_year)}, ${sqlNum(r.latitude)}, ${sqlNum(r.longitude)}, ${sqlText(r.stadium_name)}, ${sqlText(r.wikidata_id)}, ${sqlText(r.source)})`
  )
  return (
    'INSERT INTO clubs (name, short_name, aliases, country, city, primary_league, founded_year, latitude, longitude, stadium_name, wikidata_id, source) VALUES\n' +
    rows.join(',\n') +
    '\nON CONFLICT (wikidata_id) DO NOTHING;\n'
  )
}

export function buildReviewCsv(records) {
  const header = 'wikidata_id,name,country,primary_league,aliases'
  const rows = records.map((r) => {
    const cells = [r.wikidata_id, r.name, r.country, r.primary_league, (r.aliases || []).join('|')]
    return cells.map((c) => {
      const s = c === null || c === undefined ? '' : String(c)
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
    }).join(',')
  })
  return [header, ...rows].join('\n') + '\n'
}

// --- network + CLI (not unit-tested; review the artifacts instead) ---

async function runSparql(query) {
  const res = await fetch(`${ENDPOINT}?format=json&query=${encodeURIComponent(query)}`, {
    headers: { 'User-Agent': USER_AGENT, Accept: 'application/sparql-results+json' },
  })
  if (!res.ok) throw new Error(`SPARQL ${res.status}: ${await res.text()}`)
  const json = await res.json()
  return json.results.bindings
}

async function importSource(key) {
  const src = SOURCES[key]
  const query = src.kind === 'league' ? leagueQuery(src.qid, src.countries) : nationalTeamsQuery()
  const bindings = await runSparql(query)
  let records = mergeByWikidataId(bindings.map((b) => buildClubRecord(b, src.league)))
  if (src.kind === 'nations') {
    const before = records.length
    records = records.filter((r) => !isExcludedNation(r.name))
    console.log(`[${key}] filtered ${before - records.length} youth/olympic/non-FIFA teams`)
  }
  console.log(`[${key}] ${records.length} teams fetched`)
  if (key === 'worldcup' && records.length < 48) {
    console.warn(`[worldcup] fewer than 48 nations returned (${records.length}) — the WC nations can't all be covered; investigate before the seed-data check`)
  }
  return records
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]
if (isMain) {
  const idx = process.argv.indexOf('--source')
  const source = idx === -1 ? 'all' : process.argv[idx + 1]
  const keys = source === 'all' ? Object.keys(SOURCES) : [source]
  if (keys.some((k) => !SOURCES[k])) {
    console.error(`Unknown source "${source}". Use: ${Object.keys(SOURCES).join(', ')}, all`)
    process.exit(1)
  }

  const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
  const outDir = join(repoRoot, 'database', 'data')
  mkdirSync(outDir, { recursive: true })
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '')

  for (const key of keys) {
    const records = await importSource(key)
    const sqlPath = join(outDir, `clubs_import_${key}_${stamp}.sql`)
    const csvPath = join(outDir, `clubs_import_${key}_${stamp}.csv`)
    writeFileSync(sqlPath, buildClubsInsertSql(records))
    writeFileSync(csvPath, buildReviewCsv(records))
    console.log(`  SQL: ${sqlPath}`)
    console.log(`  CSV: ${csvPath}`)
  }
}
