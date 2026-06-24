// Uncataloged ("pending") kit support — catalog-first not-found path
// (Docs/CATALOG_FIRST_DESIGN.md decisions 1 & 5). A user_jerseys row is
// either cataloged (public_jersey set) or pending (submission set); this
// module gives views one identity shape for both.

// Expects a row selected with:
//   public_jersey:public_jerseys(...), submission:jersey_submissions(...)
export function kitIdentity(row) {
  const pj = row?.public_jersey
  const sub = row?.submission

  if (pj) {
    return {
      public_jersey_id: pj.id ?? null,
      team_name: pj.team_name,
      season: pj.season,
      jersey_type: pj.jersey_type,
      kit_type: pj.kit_type ?? null,
      front_image_url: pj.front_image_url ?? null,
      back_image_url: pj.back_image_url ?? null,
      player_name: pj.player_name ?? null,
      isPending: false,
    }
  }

  if (sub) {
    return {
      public_jersey_id: null,
      team_name: sub.team_name,
      season: sub.season,
      jersey_type: sub.jersey_type,
      kit_type: sub.kit_type ?? null,
      front_image_url: sub.front_image_url ?? null,
      back_image_url: sub.back_image_url ?? null,
      player_name: sub.player_name ?? null,
      isPending: true,
    }
  }

  return {
    public_jersey_id: null,
    team_name: 'Unknown kit',
    season: '',
    jersey_type: '',
    kit_type: null,
    front_image_url: null,
    player_name: null,
    isPending: false,
  }
}

export async function submitUncatalogedKit(supabase, fields) {
  const teamName = (fields.teamName || '').trim()
  const season = (fields.season || '').trim()
  const jerseyType = (fields.jerseyType || '').trim()
  if (!teamName || !season || !jerseyType) {
    return { ok: false, message: 'team, season and kit type are required' }
  }

  const { data, error } = await supabase.rpc('submit_uncataloged_kit', {
    p_team_name: teamName,
    p_season: season,
    p_jersey_type: jerseyType,
    p_kit_type: fields.kitType || 'club',
    p_competition_gender: fields.competitionGender || 'mens',
    p_league: fields.league || null,
    p_brand: fields.brand || null,
    p_front_image_url: fields.frontImageUrl || null,
    p_back_image_url: fields.backImageUrl || null,
    p_primary_color: fields.primaryColor || null,
    p_secondary_color: fields.secondaryColor || null,
    p_main_sponsor: fields.mainSponsor || null,
    p_player_name: fields.playerName || null,
    p_description: fields.description || null,
  })

  if (error || !data) return { ok: false, message: error?.message || 'unknown error' }
  return { ok: true, submissionId: data.submission_id, userJerseyId: data.user_jersey_id }
}
