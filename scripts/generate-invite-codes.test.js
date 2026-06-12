import { describe, it, expect } from 'vitest'
import {
  SAFE_ALPHABET,
  generateCode,
  generateBatch,
  buildInsertSql,
  buildCsv,
} from './generate-invite-codes.mjs'

describe('SAFE_ALPHABET', () => {
  it('contains no ambiguous characters', () => {
    for (const ch of ['0', 'O', '1', 'I', 'L']) {
      expect(SAFE_ALPHABET).not.toContain(ch)
    }
  })
})

describe('generateCode', () => {
  it('produces PREFIX-XXXX-XXXX from the safe alphabet', () => {
    const code = generateCode('RCK')
    expect(code).toMatch(/^RCK-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{4}-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{4}$/)
  })

  it('respects a custom prefix, uppercased', () => {
    const code = generateCode('beta')
    expect(code.startsWith('BETA-')).toBe(true)
  })
})

describe('generateBatch', () => {
  it('produces the requested number of unique codes', () => {
    const batch = generateBatch({ channel: 'discord', count: 50 })
    expect(batch).toHaveLength(50)
    expect(new Set(batch.map((r) => r.code)).size).toBe(50)
  })

  it('stamps every row with the channel and defaults', () => {
    const batch = generateBatch({ channel: 'waitlist', count: 3 })
    for (const row of batch) {
      expect(row.channel).toBe('waitlist')
      expect(row.max_uses).toBe(1)
      expect(row.expires_at).toBeNull()
    }
  })

  it('honors max_uses and expires_at overrides', () => {
    const batch = generateBatch({
      channel: 'creator',
      count: 2,
      maxUses: 5,
      expiresAt: '2026-07-31',
    })
    for (const row of batch) {
      expect(row.max_uses).toBe(5)
      expect(row.expires_at).toBe('2026-07-31')
    }
  })

  it('rejects a missing channel or non-positive count', () => {
    expect(() => generateBatch({ channel: '', count: 5 })).toThrow()
    expect(() => generateBatch({ channel: 'x', count: 0 })).toThrow()
  })
})

describe('buildInsertSql', () => {
  it('emits a single INSERT covering every row', () => {
    const batch = generateBatch({ channel: 'discord', count: 3 })
    const sql = buildInsertSql(batch)
    expect(sql).toContain('INSERT INTO invite_codes (code, channel, max_uses, expires_at)')
    for (const row of batch) {
      expect(sql).toContain(row.code)
    }
    expect(sql.trim().endsWith(';')).toBe(true)
  })

  it('escapes single quotes in channel names', () => {
    const sql = buildInsertSql([
      { code: 'RCK-AB2C-D3EF', channel: "josh's list", max_uses: 1, expires_at: null },
    ])
    expect(sql).toContain("'josh''s list'")
  })

  it('renders NULL for missing expiry and timestamps for present ones', () => {
    const sql = buildInsertSql([
      { code: 'RCK-AB2C-D3EF', channel: 'a', max_uses: 1, expires_at: null },
      { code: 'RCK-D3EF-AB2C', channel: 'a', max_uses: 1, expires_at: '2026-07-31' },
    ])
    expect(sql).toContain('NULL')
    expect(sql).toContain("'2026-07-31'")
  })
})

describe('buildCsv', () => {
  it('emits a header plus one line per code', () => {
    const batch = generateBatch({ channel: 'discord', count: 2 })
    const csv = buildCsv(batch)
    const lines = csv.trim().split('\n')
    expect(lines[0]).toBe('code,channel,max_uses,expires_at')
    expect(lines).toHaveLength(3)
  })
})
