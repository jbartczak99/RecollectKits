import { describe, it, expect, vi } from 'vitest'
import {
  normalizeInviteCode,
  isValidCodeFormat,
  validateInviteCode,
  isInviteCodeRequired,
} from './inviteCodes.js'

describe('normalizeInviteCode', () => {
  it('uppercases and trims', () => {
    expect(normalizeInviteCode('  rck-ab2c-d3ef  ')).toBe('RCK-AB2C-D3EF')
  })

  it('removes internal spaces from pasted codes', () => {
    expect(normalizeInviteCode('RCK - AB2C - D3EF')).toBe('RCK-AB2C-D3EF')
  })

  it('returns empty string for null/undefined/empty', () => {
    expect(normalizeInviteCode(null)).toBe('')
    expect(normalizeInviteCode(undefined)).toBe('')
    expect(normalizeInviteCode('')).toBe('')
    expect(normalizeInviteCode('   ')).toBe('')
  })
})

describe('isValidCodeFormat', () => {
  it('accepts PREFIX-XXXX-XXXX with safe alphabet', () => {
    expect(isValidCodeFormat('RCK-AB2C-D3EF')).toBe(true)
  })

  it('rejects codes with ambiguous characters (0, O, 1, I, L)', () => {
    expect(isValidCodeFormat('RCK-AB0C-D3EF')).toBe(false)
    expect(isValidCodeFormat('RCK-ABOC-D3EF')).toBe(false)
    expect(isValidCodeFormat('RCK-AB1C-D3EF')).toBe(false)
    expect(isValidCodeFormat('RCK-ABIC-D3EF')).toBe(false)
    expect(isValidCodeFormat('RCK-ABLC-D3EF')).toBe(false)
  })

  it('rejects wrong shapes', () => {
    expect(isValidCodeFormat('RCK-AB2C')).toBe(false)
    expect(isValidCodeFormat('AB2C-D3EF')).toBe(false)
    expect(isValidCodeFormat('')).toBe(false)
    expect(isValidCodeFormat('RCKAB2CD3EF')).toBe(false)
  })
})

function mockSupabaseRpc(data, error = null) {
  return { rpc: vi.fn().mockResolvedValue({ data, error }) }
}

describe('validateInviteCode', () => {
  it('returns invalid/missing without calling the RPC when code is empty', async () => {
    const supabase = mockSupabaseRpc(null)
    const result = await validateInviteCode(supabase, '   ')
    expect(result).toEqual({ valid: false, reason: 'missing' })
    expect(supabase.rpc).not.toHaveBeenCalled()
  })

  it('normalizes the code before calling the RPC', async () => {
    const supabase = mockSupabaseRpc({ valid: true, reason: null })
    await validateInviteCode(supabase, ' rck-ab2c-d3ef ')
    expect(supabase.rpc).toHaveBeenCalledWith('validate_invite_code', {
      p_code: 'RCK-AB2C-D3EF',
    })
  })

  it('passes through a valid verdict', async () => {
    const supabase = mockSupabaseRpc({ valid: true, reason: null })
    const result = await validateInviteCode(supabase, 'RCK-AB2C-D3EF')
    expect(result.valid).toBe(true)
  })

  it('passes through an invalid verdict with reason', async () => {
    const supabase = mockSupabaseRpc({ valid: false, reason: 'exhausted' })
    const result = await validateInviteCode(supabase, 'RCK-AB2C-D3EF')
    expect(result).toEqual({ valid: false, reason: 'exhausted' })
  })

  it('returns invalid/error when the RPC errors', async () => {
    const supabase = mockSupabaseRpc(null, { message: 'boom' })
    const result = await validateInviteCode(supabase, 'RCK-AB2C-D3EF')
    expect(result).toEqual({ valid: false, reason: 'error' })
  })
})

function mockSupabaseSettings(row, error = null) {
  const maybeSingle = vi.fn().mockResolvedValue({ data: row, error })
  const eq = vi.fn().mockReturnValue({ maybeSingle })
  const select = vi.fn().mockReturnValue({ eq })
  return { from: vi.fn().mockReturnValue({ select }), _fns: { select, eq, maybeSingle } }
}

describe('isInviteCodeRequired', () => {
  it('returns true when the setting is true', async () => {
    const supabase = mockSupabaseSettings({ value: true })
    expect(await isInviteCodeRequired(supabase)).toBe(true)
    expect(supabase.from).toHaveBeenCalledWith('app_settings')
  })

  it('returns false when the setting is false', async () => {
    const supabase = mockSupabaseSettings({ value: false })
    expect(await isInviteCodeRequired(supabase)).toBe(false)
  })

  it('fails open (false) when the setting row is missing', async () => {
    const supabase = mockSupabaseSettings(null)
    expect(await isInviteCodeRequired(supabase)).toBe(false)
  })

  it('fails open (false) on query error', async () => {
    const supabase = mockSupabaseSettings(null, { message: 'boom' })
    expect(await isInviteCodeRequired(supabase)).toBe(false)
  })
})
