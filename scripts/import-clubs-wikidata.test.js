import { describe, it, expect } from 'vitest'
import {
  buildClubRecord,
  mergeByWikidataId,
  buildClubsInsertSql,
  buildReviewCsv,
} from './import-clubs-wikidata.mjs'

// Shape of one SPARQL JSON binding, trimmed to what the script reads.
const binding = (over = {}) => ({
  club: { value: 'http://www.wikidata.org/entity/Q9617' },
  clubLabel: { value: 'Arsenal F.C.' },
  shortName: { value: 'Arsenal' },
  countryLabel: { value: 'United Kingdom' },
  cityLabel: { value: 'London' },
  stadiumLabel: { value: 'Emirates Stadium' },
  inception: { value: '1886-01-01T00:00:00Z' },
  coords: { value: 'Point(-0.108438 51.554888)' },
  aliases: { value: 'The Gunners|Arsenal FC' },
  ...over,
})

describe('buildClubRecord', () => {
  it('maps a SPARQL binding to a clubs row', () => {
    const rec = buildClubRecord(binding(), 'Premier League')
    expect(rec).toMatchObject({
      wikidata_id: 'Q9617',
      name: 'Arsenal F.C.',
      short_name: 'Arsenal',
      country: 'United Kingdom',
      city: 'London',
      stadium_name: 'Emirates Stadium',
      founded_year: 1886,
      primary_league: 'Premier League',
      source: 'wikidata',
    })
    expect(rec.aliases).toContain('The Gunners')
    expect(rec.aliases).toContain('Arsenal FC')
  })

  it('parses WKT coordinates into lat/long', () => {
    const rec = buildClubRecord(binding(), 'Premier League')
    expect(rec.latitude).toBeCloseTo(51.554888)
    expect(rec.longitude).toBeCloseTo(-0.108438)
  })

  it('tolerates missing optional fields', () => {
    const rec = buildClubRecord(
      binding({ shortName: undefined, cityLabel: undefined, stadiumLabel: undefined, inception: undefined, coords: undefined, aliases: undefined }),
      'MLS'
    )
    expect(rec.short_name).toBeNull()
    expect(rec.city).toBeNull()
    expect(rec.stadium_name).toBeNull()
    expect(rec.founded_year).toBeNull()
    expect(rec.latitude).toBeNull()
    expect(rec.aliases).toEqual([])
  })

  it('includes the short name among aliases for typeahead matching', () => {
    const rec = buildClubRecord(binding(), 'Premier League')
    expect(rec.aliases).toContain('Arsenal')
  })
})

describe('isYouthTeam', () => {
  it('flags under-XX and U-XX squads', async () => {
    const { isYouthTeam } = await import('./import-clubs-wikidata.mjs')
    expect(isYouthTeam('England national under-17 association football team')).toBe(true)
    expect(isYouthTeam('Mexico U20')).toBe(true)
    expect(isYouthTeam('Japan national under-20 football team')).toBe(true)
  })

  it('keeps senior men and women teams', async () => {
    const { isYouthTeam } = await import('./import-clubs-wikidata.mjs')
    expect(isYouthTeam('Brazil national football team')).toBe(false)
    expect(isYouthTeam("Zambia women's national association football team")).toBe(false)
  })
})

describe('mergeByWikidataId', () => {
  it('dedupes rows, unioning aliases', () => {
    const a = buildClubRecord(binding(), 'Premier League')
    const b = buildClubRecord(binding({ aliases: { value: 'Gunners' } }), 'Premier League')
    const merged = mergeByWikidataId([a, b])
    expect(merged).toHaveLength(1)
    expect(merged[0].aliases).toEqual(expect.arrayContaining(['The Gunners', 'Arsenal FC', 'Gunners']))
  })
})

describe('buildClubsInsertSql', () => {
  it('emits one INSERT with ON CONFLICT (wikidata_id) DO NOTHING', () => {
    const sql = buildClubsInsertSql([buildClubRecord(binding(), 'Premier League')])
    expect(sql).toContain('INSERT INTO clubs')
    expect(sql).toContain('ON CONFLICT (wikidata_id) DO NOTHING')
    expect(sql).toContain("'Q9617'")
  })

  it('escapes quotes and renders text[] aliases', () => {
    const rec = buildClubRecord(
      binding({ clubLabel: { value: "Newell's Old Boys" }, aliases: { value: "Newell's" } }),
      'Liga'
    )
    const sql = buildClubsInsertSql([rec])
    expect(sql).toContain("Newell''s Old Boys")
    expect(sql).toContain('ARRAY[')
  })

  it('renders NULLs for missing optionals', () => {
    const rec = buildClubRecord(
      binding({ cityLabel: undefined, coords: undefined, inception: undefined, stadiumLabel: undefined, shortName: undefined }),
      'MLS'
    )
    expect(buildClubsInsertSql([rec])).toContain('NULL')
  })
})

describe('buildReviewCsv', () => {
  it('emits a header and one row per club for the June 19 review pass', () => {
    const csv = buildReviewCsv([buildClubRecord(binding(), 'Premier League')])
    const lines = csv.trim().split('\n')
    expect(lines[0]).toBe('wikidata_id,name,country,primary_league,aliases')
    expect(lines).toHaveLength(2)
    expect(lines[1]).toContain('Q9617')
  })
})
