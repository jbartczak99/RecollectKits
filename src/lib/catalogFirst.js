// Catalog-first add flow, found path (Docs/CATALOG_FIRST_DESIGN.md).
// Search the catalog, add instantly on "I have this" — details are chased
// afterward by the existing details_completed flag + notification loop.

// Season tokens: "2014", "2019/20", "2019-20"
const SEASON_TOKEN = /^\d{4}(?:[/-]\d{2,4})?$/

export function parseKitSearch(term) {
  const tokens = (term || '').trim().split(/\s+/).filter(Boolean)
  const seasonIdx = tokens.findIndex((t) => SEASON_TOKEN.test(t))
  const season = seasonIdx === -1 ? null : tokens[seasonIdx]
  const text = tokens.filter((_, i) => i !== seasonIdx).join(' ')
  return { text, season }
}

export async function searchCatalog(supabase, term) {
  const { text, season } = parseKitSearch(term)
  if (!text && !season) return { data: [], error: null }

  let query = supabase
    .from('public_jerseys')
    .select('id, team_name, season, jersey_type, kit_type, front_image_url, league, competition_gender')

  if (text) query = query.ilike('team_name', `%${text}%`)
  if (season) query = query.ilike('season', `%${season}%`)

  const { data, error } = await query.order('season', { ascending: false }).limit(60)
  return { data: data || [], error }
}

export async function addKitInstantly(supabase, userId, publicJerseyId) {
  if (!userId || !publicJerseyId) {
    return { status: 'error', message: 'missing user or kit' }
  }

  const { error } = await supabase.from('user_jerseys').insert({
    user_id: userId,
    public_jersey_id: publicJerseyId,
    details_completed: false,
    created_at: new Date().toISOString(),
  })

  if (!error) return { status: 'added' }
  if (error.code === '23505') return { status: 'already' }
  return { status: 'error', message: error.message }
}

export async function getCollectionIds(supabase, userId) {
  if (!userId) return new Set()

  const { data, error } = await supabase
    .from('user_jerseys')
    .select('public_jersey_id')
    .eq('user_id', userId)

  if (error || !data) return new Set()
  return new Set(data.map((r) => r.public_jersey_id).filter(Boolean))
}
