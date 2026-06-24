import { describe, it, expect } from 'vitest'
import { generateSeasonOptions, normalizeSeason, filterSeasons } from './seasons.js'

describe('generateSeasonOptions', () => {
  it('emits the split season and the calendar year for each start year, newest first', () => {
    const opts = generateSeasonOptions(2026)
    expect(opts[0]).toBe('2026/27')
    expect(opts[1]).toBe('2026')
    expect(opts).toContain('2025/26')
    expect(opts).toContain('2025')
  })

  it('pads the second half of the split to two digits across centuries', () => {
    const opts = generateSeasonOptions(2009)
    expect(opts).toContain('2009/10')
    expect(opts).toContain('1999/00')
  })

  it('runs back to the historical floor', () => {
    const opts = generateSeasonOptions(2026)
    expect(opts).toContain('1900')
    expect(opts).not.toContain('1899')
  })
})

describe('normalizeSeason', () => {
  it('canonicalizes dash and long forms to YYYY/YY', () => {
    expect(normalizeSeason('2025-26')).toBe('2025/26')
    expect(normalizeSeason('2025–26')).toBe('2025/26') // en dash
    expect(normalizeSeason('2025/2026')).toBe('2025/26')
    expect(normalizeSeason('2025-2026')).toBe('2025/26')
  })

  it('leaves a clean single year or canonical season untouched', () => {
    expect(normalizeSeason('2026')).toBe('2026')
    expect(normalizeSeason('2025/26')).toBe('2025/26')
  })

  it('trims and passes through anything it does not recognize', () => {
    expect(normalizeSeason('  2026 ')).toBe('2026')
    expect(normalizeSeason('')).toBe('')
    expect(normalizeSeason('summer 2026')).toBe('summer 2026')
  })
})

describe('filterSeasons', () => {
  const opts = generateSeasonOptions(2026)

  it('returns the most recent options when query is empty', () => {
    expect(filterSeasons(opts, '', 5)).toEqual(['2026/27', '2026', '2025/26', '2025', '2024/25'])
  })

  it('matches by prefix', () => {
    const r = filterSeasons(opts, '2019')
    expect(r).toContain('2019/20')
    expect(r).toContain('2019')
  })

  it('matches a typed split fragment', () => {
    expect(filterSeasons(opts, '94/95')).toContain('1994/95')
  })

  it('caps results', () => {
    expect(filterSeasons(opts, '', 3).length).toBe(3)
  })
})
