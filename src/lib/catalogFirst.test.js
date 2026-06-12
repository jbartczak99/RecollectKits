import { describe, it, expect, vi } from 'vitest'
import {
  parseKitSearch,
  searchCatalog,
  addKitInstantly,
  getCollectionIds,
} from './catalogFirst.js'

describe('parseKitSearch', () => {
  it('splits a season year out of the text', () => {
    expect(parseKitSearch('arsenal 2019')).toEqual({ text: 'arsenal', season: '2019' })
  })

  it('handles split-season notation', () => {
    expect(parseKitSearch('arsenal 2019/20')).toEqual({ text: 'arsenal', season: '2019/20' })
  })

  it('handles a leading season', () => {
    expect(parseKitSearch('2014 germany home')).toEqual({ text: 'germany home', season: '2014' })
  })

  it('returns null season when none present', () => {
    expect(parseKitSearch('manchester united')).toEqual({ text: 'manchester united', season: null })
  })

  it('handles empty and whitespace input', () => {
    expect(parseKitSearch('')).toEqual({ text: '', season: null })
    expect(parseKitSearch('   ')).toEqual({ text: '', season: null })
  })
})

// Builder mock: every query method chains, and the object is awaitable.
function mockQuery(result) {
  const q = {}
  for (const m of ['select', 'ilike', 'eq', 'order', 'limit']) {
    q[m] = vi.fn().mockReturnValue(q)
  }
  q.then = (resolve) => resolve(result)
  return q
}

describe('searchCatalog', () => {
  it('returns empty without querying when the term is blank', async () => {
    const supabase = { from: vi.fn() }
    const result = await searchCatalog(supabase, '   ')
    expect(result).toEqual({ data: [], error: null })
    expect(supabase.from).not.toHaveBeenCalled()
  })

  it('searches team_name with the text portion', async () => {
    const q = mockQuery({ data: [{ id: '1' }], error: null })
    const supabase = { from: vi.fn().mockReturnValue(q) }
    const result = await searchCatalog(supabase, 'arsenal')
    expect(supabase.from).toHaveBeenCalledWith('public_jerseys')
    expect(q.ilike).toHaveBeenCalledWith('team_name', '%arsenal%')
    expect(result.data).toEqual([{ id: '1' }])
  })

  it('adds a season filter when the term contains one', async () => {
    const q = mockQuery({ data: [], error: null })
    const supabase = { from: vi.fn().mockReturnValue(q) }
    await searchCatalog(supabase, 'arsenal 2019/20')
    expect(q.ilike).toHaveBeenCalledWith('team_name', '%arsenal%')
    expect(q.ilike).toHaveBeenCalledWith('season', '%2019/20%')
  })

  it('searches by season alone when only a season is given', async () => {
    const q = mockQuery({ data: [], error: null })
    const supabase = { from: vi.fn().mockReturnValue(q) }
    await searchCatalog(supabase, '2014')
    expect(q.ilike).toHaveBeenCalledWith('season', '%2014%')
    expect(q.ilike).not.toHaveBeenCalledWith('team_name', expect.anything())
  })

  it('passes through query errors', async () => {
    const q = mockQuery({ data: null, error: { message: 'boom' } })
    const supabase = { from: vi.fn().mockReturnValue(q) }
    const result = await searchCatalog(supabase, 'arsenal')
    expect(result.error).toEqual({ message: 'boom' })
  })
})

describe('addKitInstantly', () => {
  function mockInsert(result) {
    const insert = vi.fn().mockResolvedValue(result)
    return { supabase: { from: vi.fn().mockReturnValue({ insert }) }, insert }
  }

  it('inserts with details_completed false so the details nag loop picks it up', async () => {
    const { supabase, insert } = mockInsert({ error: null })
    const result = await addKitInstantly(supabase, 'user-1', 'kit-1')
    expect(supabase.from).toHaveBeenCalledWith('user_jerseys')
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'user-1',
        public_jersey_id: 'kit-1',
        details_completed: false,
      })
    )
    expect(result).toEqual({ status: 'added' })
  })

  it('maps a unique violation to already-in-collection', async () => {
    const { supabase } = mockInsert({ error: { code: '23505', message: 'dup' } })
    const result = await addKitInstantly(supabase, 'user-1', 'kit-1')
    expect(result).toEqual({ status: 'already' })
  })

  it('surfaces other errors', async () => {
    const { supabase } = mockInsert({ error: { code: '42501', message: 'denied' } })
    const result = await addKitInstantly(supabase, 'user-1', 'kit-1')
    expect(result).toEqual({ status: 'error', message: 'denied' })
  })

  it('refuses without user or kit id, without inserting', async () => {
    const { supabase, insert } = mockInsert({ error: null })
    expect(await addKitInstantly(supabase, null, 'kit-1')).toEqual({ status: 'error', message: 'missing user or kit' })
    expect(await addKitInstantly(supabase, 'user-1', null)).toEqual({ status: 'error', message: 'missing user or kit' })
    expect(insert).not.toHaveBeenCalled()
  })
})

describe('getCollectionIds', () => {
  it('returns the set of cataloged kit ids in the collection', async () => {
    const q = mockQuery({ data: [{ public_jersey_id: 'a' }, { public_jersey_id: 'b' }, { public_jersey_id: null }], error: null })
    const supabase = { from: vi.fn().mockReturnValue(q) }
    const ids = await getCollectionIds(supabase, 'user-1')
    expect(q.eq).toHaveBeenCalledWith('user_id', 'user-1')
    expect(ids).toEqual(new Set(['a', 'b']))
  })

  it('returns an empty set without querying when userId is missing', async () => {
    const supabase = { from: vi.fn() }
    expect(await getCollectionIds(supabase, null)).toEqual(new Set())
    expect(supabase.from).not.toHaveBeenCalled()
  })

  it('returns an empty set on error', async () => {
    const q = mockQuery({ data: null, error: { message: 'boom' } })
    const supabase = { from: vi.fn().mockReturnValue(q) }
    expect(await getCollectionIds(supabase, 'user-1')).toEqual(new Set())
  })
})
