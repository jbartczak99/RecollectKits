import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext.jsx'
import { supabase } from '../lib/supabase'
import { leagueToCountry } from '../utils/leagueToCountry'

const parseSeasonYear = (season) => {
  if (!season) return null
  const match = String(season).match(/\d{4}/)
  return match ? parseInt(match[0], 10) : null
}

const decadeOf = (year) => (year == null ? null : Math.floor(year / 10) * 10)

const topNWithOther = (counts, n) => {
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1])
  if (sorted.length <= n) return sorted.map(([name, value]) => ({ name, value }))
  const top = sorted.slice(0, n).map(([name, value]) => ({ name, value }))
  const otherTotal = sorted.slice(n).reduce((s, [, v]) => s + v, 0)
  return [...top, { name: 'Other', value: otherTotal }]
}

const formatEraRange = (minDecade, maxDecade) => {
  if (minDecade == null || maxDecade == null) return null
  return minDecade === maxDecade ? `${minDecade}s` : `${minDecade}s – ${maxDecade}s`
}

function computeStats(rows) {
  const total = rows.length
  const empty = {
    total: 0,
    addedThisMonth: 0,
    teamsCount: 0,
    eraRange: null,
    collectingSince: null,
    byTeam: [],
    byManufacturer: [],
    byLeague: [],
    byDecade: [],
    growth: [],
    teamTotal: 0,
    manufacturerTotal: 0,
    leagueTotal: 0,
    decadeTotal: 0,
    clubCount: 0,
    internationalCount: 0,
    byCountry: [],
    countriesCount: 0,
    byClubCountry: [],
    clubCountriesCount: 0,
    unmappedClubCount: 0,
    clubKitsLinkedCount: 0,
    clubKitsFallbackCount: 0,
    clubsList: [],
    mensLeagueCount: 0,
    womensLeagueCount: 0,
    unknownGenderLeagueCount: 0,
  }
  if (total === 0) return empty

  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)

  let addedThisMonth = 0
  let clubCount = 0
  let internationalCount = 0
  let unmappedClubCount = 0
  let clubKitsLinkedCount = 0
  let clubKitsFallbackCount = 0
  let mensLeagueCount = 0
  let womensLeagueCount = 0
  let unknownGenderLeagueCount = 0
  const teamCounts = {}
  const mfgCounts = {}
  const leagueCounts = {}
  const decadeCounts = {}
  const countryCounts = {}
  const clubCountryCounts = {}
  // Per-team within country, used to drop one pin per club on country click.
  // Key: `${country}|${team}`, value: { team, city, country, count }.
  const clubByTeam = {}
  const monthBuckets = {}
  let minYear = null
  let maxYear = null
  let firstAddedAt = null

  for (const r of rows) {
    if (r.team) teamCounts[r.team] = (teamCounts[r.team] || 0) + 1
    if (r.manufacturer) mfgCounts[r.manufacturer] = (mfgCounts[r.manufacturer] || 0) + 1
    if (r.league) leagueCounts[r.league] = (leagueCounts[r.league] || 0) + 1

    // public_jerseys.competition_gender is the source of truth (set at
    // submission time). Anything missing/unrecognized falls into "unknown".
    if (r.competitionGender === 'mens') mensLeagueCount += 1
    else if (r.competitionGender === 'womens') womensLeagueCount += 1
    else unknownGenderLeagueCount += 1

    if (r.kitType === 'club') {
      clubCount += 1
      // Prefer the canonical country from the clubs table when the jersey
      // is linked; fall back to the league → country heuristic otherwise.
      let country = null
      if (r.clubCountry) {
        country = r.clubCountry
        clubKitsLinkedCount += 1
      } else {
        country = leagueToCountry(r.league)
        if (country) clubKitsFallbackCount += 1
      }
      if (country) {
        clubCountryCounts[country] = (clubCountryCounts[country] || 0) + 1
        // Drop a pin when the kit is club-linked and we can place it — via the
        // club's own coords (preferred) or its city (resolved downstream).
        const hasCoords = r.clubLat != null && r.clubLng != null
        if (r.team && (r.clubCity || hasCoords)) {
          const key = `${country}|${r.team}`
          if (clubByTeam[key]) {
            clubByTeam[key].count += 1
          } else {
            clubByTeam[key] = {
              team: r.team,
              city: r.clubCity,
              country,
              lat: hasCoords ? r.clubLat : null,
              lng: hasCoords ? r.clubLng : null,
              count: 1,
            }
          }
        }
      } else {
        unmappedClubCount += 1
      }
    } else if (r.kitType === 'international') {
      internationalCount += 1
      if (r.team) countryCounts[r.team] = (countryCounts[r.team] || 0) + 1
    }

    if (r.year != null) {
      const d = decadeOf(r.year)
      decadeCounts[d] = (decadeCounts[d] || 0) + 1
      if (minYear == null || r.year < minYear) minYear = r.year
      if (maxYear == null || r.year > maxYear) maxYear = r.year
    }

    if (r.created_at) {
      const ts = new Date(r.created_at)
      if (!firstAddedAt || ts < firstAddedAt) firstAddedAt = ts
      if (ts >= monthStart) addedThisMonth += 1

      const key = `${ts.getFullYear()}-${String(ts.getMonth() + 1).padStart(2, '0')}`
      monthBuckets[key] = (monthBuckets[key] || 0) + 1
    }
  }

  // Cumulative growth — fill any gap months so the line is continuous.
  const monthKeys = Object.keys(monthBuckets).sort()
  const growth = []
  if (monthKeys.length > 0) {
    const [firstY, firstM] = monthKeys[0].split('-').map(Number)
    const [lastY, lastM] = monthKeys[monthKeys.length - 1].split('-').map(Number)
    const cursor = new Date(firstY, firstM - 1, 1)
    const end = new Date(lastY, lastM - 1, 1)
    let cumulative = 0
    while (cursor <= end) {
      const k = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`
      cumulative += monthBuckets[k] || 0
      growth.push({
        key: k,
        label: cursor.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        total: cumulative,
      })
      cursor.setMonth(cursor.getMonth() + 1)
    }
  }

  const byDecade = Object.entries(decadeCounts)
    .map(([d, v]) => ({ name: `${d}s`, decade: Number(d), value: v }))
    .sort((a, b) => a.decade - b.decade)

  const byLeague = Object.entries(leagueCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  const byCountry = Object.entries(countryCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  const byClubCountry = Object.entries(clubCountryCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  return {
    total,
    addedThisMonth,
    teamsCount: Object.keys(teamCounts).length,
    eraRange: formatEraRange(decadeOf(minYear), decadeOf(maxYear)),
    collectingSince: firstAddedAt,
    byTeam: topNWithOther(teamCounts, 5),
    byManufacturer: topNWithOther(mfgCounts, 5),
    byLeague,
    byDecade,
    growth,
    teamTotal: Object.values(teamCounts).reduce((s, v) => s + v, 0),
    manufacturerTotal: Object.values(mfgCounts).reduce((s, v) => s + v, 0),
    leagueTotal: Object.values(leagueCounts).reduce((s, v) => s + v, 0),
    decadeTotal: Object.values(decadeCounts).reduce((s, v) => s + v, 0),
    clubCount,
    internationalCount,
    byCountry,
    countriesCount: byCountry.length,
    byClubCountry,
    clubCountriesCount: byClubCountry.length,
    unmappedClubCount,
    clubKitsLinkedCount,
    clubKitsFallbackCount,
    clubsList: Object.values(clubByTeam),
    mensLeagueCount,
    womensLeagueCount,
    unknownGenderLeagueCount,
  }
}

export function useCollectionStats() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user) {
      setStats(null)
      setLoading(false)
      return
    }

    let cancelled = false
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const { data, error: queryError } = await supabase
          .from('user_jerseys')
          .select(`
            created_at,
            public_jersey:public_jerseys(
              team_name, manufacturer, league, season, kit_type, competition_gender,
              club:clubs(country, city, latitude, longitude)
            ),
            submission:jersey_submissions(team_name, brand, league, season, kit_type, competition_gender)
          `)
          .eq('user_id', user.id)

        if (queryError) throw queryError
        if (cancelled) return

        const rows = (data || []).map((r) => {
          // Cataloged kits read from public_jersey; pending (uncataloged) kits
          // read from their submission so they still count in the stats instead
          // of rendering as blank-team rows. Pending kits have no club link.
          const pj = r.public_jersey
          const sub = r.submission
          return {
            created_at: r.created_at,
            team: (pj?.team_name ?? sub?.team_name) || null,
            manufacturer: (pj?.manufacturer ?? sub?.brand) || null,
            league: (pj?.league ?? sub?.league) || null,
            year: parseSeasonYear(pj?.season ?? sub?.season),
            kitType: (pj?.kit_type ?? sub?.kit_type) || null,
            // Set only when linked to a clubs row (cataloged). Trusted ahead of
            // the league→country heuristic for club shading; coords drop the pin.
            clubCountry: pj?.club?.country || null,
            clubCity: pj?.club?.city || null,
            clubLat: pj?.club?.latitude ?? null,
            clubLng: pj?.club?.longitude ?? null,
            competitionGender: (pj?.competition_gender ?? sub?.competition_gender) || null,
          }
        })

        setStats(computeStats(rows))
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load collection stats')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [user])

  return { stats, loading, error }
}
