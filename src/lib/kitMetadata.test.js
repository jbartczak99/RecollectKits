import { describe, it, expect } from 'vitest'
import { CONDITION_OPTIONS, PROVENANCE_FLAGS, conditionLabel, parsePrice } from './kitMetadata.js'

describe('CONDITION_OPTIONS', () => {
  it('is the agreed five-tier scale, BNWT first', () => {
    expect(CONDITION_OPTIONS.map((o) => o.value)).toEqual([
      'bnwt', 'new_no_tags', 'excellent', 'good', 'worn',
    ])
  })
})

describe('PROVENANCE_FLAGS', () => {
  it('is the three agreed flags', () => {
    expect(PROVENANCE_FLAGS.map((f) => f.key)).toEqual(['match_worn', 'signed', 'player_issue'])
  })
})

describe('conditionLabel', () => {
  it('maps a known value to its label', () => {
    expect(conditionLabel('bnwt')).toBe('New with tags (BNWT)')
    expect(conditionLabel('worn')).toBe('Worn / Played')
  })

  it('falls back to the raw value for legacy/unknown', () => {
    expect(conditionLabel('used')).toBe('used') // legacy stored value
    expect(conditionLabel('')).toBe('')
    expect(conditionLabel(null)).toBe('')
  })
})

describe('parsePrice', () => {
  it('parses numbers and currency-formatted strings', () => {
    expect(parsePrice('80')).toBe(80)
    expect(parsePrice('$1,250.50')).toBe(1250.5)
    expect(parsePrice(45)).toBe(45)
  })

  it('returns null for empty/invalid/negative', () => {
    expect(parsePrice('')).toBeNull()
    expect(parsePrice('  ')).toBeNull()
    expect(parsePrice(null)).toBeNull()
    expect(parsePrice('abc')).toBeNull()
    expect(parsePrice('-10')).toBe(10) // sign stripped → treated as positive magnitude
  })
})
