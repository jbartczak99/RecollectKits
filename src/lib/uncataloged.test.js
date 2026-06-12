import { describe, it, expect, vi } from 'vitest'
import { kitIdentity, submitUncatalogedKit } from './uncataloged.js'

describe('kitIdentity', () => {
  const catalogRow = {
    id: 'uj-1',
    size: 'L',
    public_jersey: { id: 'pj-1', team_name: 'Arsenal F.C.', season: '2019/20', jersey_type: 'home', kit_type: 'club', front_image_url: 'x.jpg', player_name: null },
    submission: null,
  }
  const pendingRow = {
    id: 'uj-2',
    size: null,
    public_jersey: null,
    submission: { id: 'sub-1', team_name: 'Zanzibar XI', season: '2024', jersey_type: 'away', kit_type: 'club', front_image_url: null, player_name: 'Mussa', status: 'pending' },
  }

  it('reads identity from the catalog row when linked', () => {
    const identity = kitIdentity(catalogRow)
    expect(identity).toMatchObject({
      team_name: 'Arsenal F.C.',
      season: '2019/20',
      jersey_type: 'home',
      isPending: false,
    })
    expect(identity.public_jersey_id).toBe('pj-1')
  })

  it('reads identity from the submission while pending', () => {
    const identity = kitIdentity(pendingRow)
    expect(identity).toMatchObject({
      team_name: 'Zanzibar XI',
      season: '2024',
      jersey_type: 'away',
      player_name: 'Mussa',
      isPending: true,
    })
    expect(identity.public_jersey_id).toBeNull()
  })

  it('prefers the catalog when both are present (approved, link kept for provenance)', () => {
    const both = { ...catalogRow, submission: pendingRow.submission }
    const identity = kitIdentity(both)
    expect(identity.team_name).toBe('Arsenal F.C.')
    expect(identity.isPending).toBe(false)
  })

  it('returns a renderable unknown for rows with neither (legacy/broken)', () => {
    const identity = kitIdentity({ id: 'uj-3', public_jersey: null, submission: null })
    expect(identity.team_name).toBe('Unknown kit')
    expect(identity.isPending).toBe(false)
  })
})

describe('submitUncatalogedKit', () => {
  function mockRpc(data, error = null) {
    return { rpc: vi.fn().mockResolvedValue({ data, error }) }
  }

  it('calls the RPC with trimmed required fields and null optionals', async () => {
    const supabase = mockRpc({ submission_id: 's1', user_jersey_id: 'u1' })
    const result = await submitUncatalogedKit(supabase, {
      teamName: ' Zanzibar XI ',
      season: '2024',
      jerseyType: 'away',
      kitType: 'club',
      competitionGender: 'mens',
    })
    expect(supabase.rpc).toHaveBeenCalledWith('submit_uncataloged_kit', expect.objectContaining({
      p_team_name: 'Zanzibar XI',
      p_season: '2024',
      p_jersey_type: 'away',
      p_kit_type: 'club',
      p_competition_gender: 'mens',
      p_front_image_url: null,
    }))
    expect(result).toEqual({ ok: true, submissionId: 's1', userJerseyId: 'u1' })
  })

  it('passes optional extras when provided', async () => {
    const supabase = mockRpc({ submission_id: 's1', user_jersey_id: 'u1' })
    await submitUncatalogedKit(supabase, {
      teamName: 'X', season: '2024', jerseyType: 'home',
      frontImageUrl: 'img.jpg', brand: 'Nike', mainSponsor: 'Acme',
    })
    expect(supabase.rpc).toHaveBeenCalledWith('submit_uncataloged_kit', expect.objectContaining({
      p_front_image_url: 'img.jpg',
      p_brand: 'Nike',
      p_main_sponsor: 'Acme',
    }))
  })

  it('rejects missing required fields without calling the RPC', async () => {
    const supabase = mockRpc(null)
    const result = await submitUncatalogedKit(supabase, { teamName: '', season: '2024', jerseyType: 'home' })
    expect(result.ok).toBe(false)
    expect(supabase.rpc).not.toHaveBeenCalled()
  })

  it('surfaces RPC errors', async () => {
    const supabase = mockRpc(null, { message: 'boom' })
    const result = await submitUncatalogedKit(supabase, { teamName: 'X', season: '2024', jerseyType: 'home' })
    expect(result).toEqual({ ok: false, message: 'boom' })
  })
})
