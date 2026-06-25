import { describe, it, expect } from 'vitest'
import { mapToClubRecord } from './wikidata.js'

describe('mapToClubRecord', () => {
  const base = {
    wikidataId: 'Q41420',
    name: 'Borussia Dortmund',
    shortName: 'BVB',
    aliases: ['BVB', 'Die Borussen', 'Borussia Dortmund'],
    country: 'Germany',
    city: 'Dortmund',
    stadiumName: 'Signal Iduna Park',
    foundedYear: 1909,
  }

  it('maps to a clubs-insert record with wikidata source', () => {
    expect(mapToClubRecord(base)).toEqual({
      name: 'Borussia Dortmund',
      short_name: 'BVB',
      aliases: expect.arrayContaining(['BVB', 'Die Borussen']),
      country: 'Germany',
      city: 'Dortmund',
      stadium_name: 'Signal Iduna Park',
      founded_year: 1909,
      wikidata_id: 'Q41420',
      source: 'wikidata',
    })
  })

  it('dedupes aliases and includes the short name', () => {
    const r = mapToClubRecord({ ...base, aliases: ['BVB', 'BVB', 'Die Borussen'] })
    expect(r.aliases.filter((a) => a === 'BVB')).toHaveLength(1)
    expect(r.aliases).toContain('BVB')
  })

  it('nulls missing optionals and rejects a non-numeric year', () => {
    const r = mapToClubRecord({ wikidataId: 'Q1', name: 'Obscure FC', aliases: [], foundedYear: null })
    expect(r.short_name).toBeNull()
    expect(r.country).toBeNull()
    expect(r.city).toBeNull()
    expect(r.stadium_name).toBeNull()
    expect(r.founded_year).toBeNull()
    expect(r.aliases).toEqual([])
  })
})
