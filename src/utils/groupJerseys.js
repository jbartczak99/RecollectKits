/**
 * Groups jerseys by base kit (team + season + type + competition gender).
 * Blank (no player name) kits become the representative; if none exists,
 * the alphabetically first player jersey is used.
 *
 * @param {Array} jerseys - Array of jersey objects from the database
 * @returns {Array} Array of group objects sorted by representative created_at descending
 */
export function groupJerseysByBaseKit(jerseys) {
  const groupMap = new Map()

  for (const jersey of jerseys) {
    const key = [
      (jersey.team_name || '').toLowerCase().trim(),
      (jersey.season || '').toLowerCase().trim(),
      (jersey.jersey_type || '').toLowerCase().trim(),
      (jersey.competition_gender || '').toLowerCase().trim(),
    ].join('|||')

    if (!groupMap.has(key)) {
      groupMap.set(key, [])
    }
    groupMap.get(key).push(jersey)
  }

  const groups = []

  for (const [groupKey, members] of groupMap) {
    const blanks = members.filter(j => isBlankKit(j))
    const players = members.filter(j => !isBlankKit(j))

    let representative
    if (blanks.length > 0) {
      // Pick earliest created blank kit
      blanks.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      representative = blanks[0]
    } else {
      // No blank kit — pick alphabetically first player name
      players.sort((a, b) => (a.player_name || '').localeCompare(b.player_name || ''))
      representative = players[0]
    }

    // playerJerseys = all members except the representative, sorted alphabetically
    const playerJerseys = members
      .filter(j => j.id !== representative.id)
      .sort((a, b) => (a.player_name || '').localeCompare(b.player_name || ''))

    groups.push({
      groupKey,
      representative,
      playerJerseys,
      totalCount: members.length,
      hasBlankKit: blanks.length > 0,
    })
  }

  // Sort groups by representative created_at descending (newest first)
  groups.sort((a, b) => new Date(b.representative.created_at) - new Date(a.representative.created_at))

  return groups
}

function isBlankKit(jersey) {
  return !jersey.player_name || jersey.player_name.trim() === ''
}
