import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { getTeamColor } from '../utils/teamColors'

/**
 * Generate season strings from a year range.
 * e.g. startYear=2014, endYear=2022 => ["2014-15", "2015-16", ..., "2021-22"]
 * If endYear is null (present), generate up to current year.
 */
function generateSeasons(startYear, endYear) {
  if (!startYear) return []
  const end = endYear || new Date().getFullYear()
  const seasons = []
  for (let y = startYear; y < end; y++) {
    seasons.push(`${y}-${String(y + 1).slice(-2)}`)
  }
  // If start === end (single year stint), add at least one season
  if (seasons.length === 0) {
    seasons.push(`${startYear}-${String(startYear + 1).slice(-2)}`)
  }
  return seasons
}

/**
 * Extract the starting year from a season string like "2014-15" or just "2014"
 */
function parseStartYear(seasonStr) {
  if (!seasonStr) return null
  const match = seasonStr.match(/^(\d{4})/)
  return match ? parseInt(match[1], 10) : null
}

/**
 * Hook for fetching a player profile with careers and jerseys.
 * Returns rich career groups with per-season data.
 */
export function usePlayer(playerId) {
  const [player, setPlayer] = useState(null)
  const [careers, setCareers] = useState([])
  const [jerseys, setJerseys] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchPlayer = async () => {
    if (!playerId) return
    setLoading(true)
    setError(null)

    try {
      const { data: playerData, error: playerError } = await supabase
        .from('players')
        .select('*')
        .eq('id', playerId)
        .single()

      if (playerError) throw playerError
      setPlayer(playerData)

      const { data: careerData } = await supabase
        .from('player_careers')
        .select('*')
        .eq('player_id', playerId)
        .order('season_start', { ascending: true })

      setCareers(careerData || [])

      let { data: linkedJerseys } = await supabase
        .from('public_jerseys')
        .select('*')
        .eq('player_id', playerId)
        .order('season', { ascending: false })

      if ((!linkedJerseys || linkedJerseys.length === 0) && playerData.name) {
        const { data: nameMatched } = await supabase
          .from('public_jerseys')
          .select('*')
          .ilike('player_name', playerData.name)
          .order('season', { ascending: false })

        linkedJerseys = nameMatched || []
      }

      setJerseys(linkedJerseys || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlayer()
  }, [playerId])

  const careerGroups = useMemo(() => {
    const unclaimed = [...jerseys]

    // Fuzzy match jersey team to career team
    const teamMatches = (jerseyTeam, careerTeam) => {
      if (!jerseyTeam || !careerTeam) return false
      const jt = jerseyTeam.toLowerCase().trim()
      const ct = careerTeam.toLowerCase().trim()
      if (jt === ct) return true
      if (ct.includes(jt) || jt.includes(ct)) return true
      return false
    }

    // Detect international from DB flag or name
    const isIntl = (career) =>
      career.is_international || /\bnational\b/i.test(career.team_name)

    const groups = []

    for (const career of careers) {
      const matched = []
      const remaining = []

      for (const j of unclaimed) {
        if (teamMatches(j.team_name, career.team_name)) {
          matched.push(j)
        } else {
          remaining.push(j)
        }
      }

      unclaimed.length = 0
      unclaimed.push(...remaining)

      const startYear = parseStartYear(career.season_start)
      const endYear = parseStartYear(career.season_end)
      const displayStart = startYear || '?'
      const displayEnd = career.season_end ? (endYear || '?') : 'Present'

      // Generate all seasons in this career stint
      const seasonStrings = generateSeasons(startYear, endYear)

      const seasonNumbers = career.season_numbers || {}

      // Match jerseys to seasons
      const seasons = seasonStrings.map(s => {
        const seasonJerseys = matched.filter(j => {
          if (!j.season) return false
          // Match "2022-23" or just "2022" against season string
          return j.season === s || j.season === s.split('-')[0]
        })
        return { season: s, kits: seasonJerseys, shirtNumber: seasonNumbers[s] ?? null }
      })

      // Also include any jerseys that didn't match a generated season
      const assignedIds = new Set(seasons.flatMap(s => s.kits.map(k => k.id)))
      const orphanJerseys = matched.filter(j => !assignedIds.has(j.id))
      if (orphanJerseys.length > 0) {
        // Try to slot them into the right season or add as misc
        for (const j of orphanJerseys) {
          const jYear = j.season ? j.season.match(/^(\d{4})/)?.[1] : null
          if (jYear) {
            const targetSeason = seasons.find(s => s.season.startsWith(jYear))
            if (targetSeason) {
              targetSeason.kits.push(j)
              continue
            }
          }
          // Add as its own season entry
          seasons.push({ season: j.season || 'Unknown', kits: [j] })
        }
      }

      const teamColor = getTeamColor(career.team_name)

      groups.push({
        careerId: career.id,
        teamName: career.team_name,
        years: `${displayStart}-${displayEnd}`,
        shirtNumber: career.shirt_number || matched[0]?.player_number || null,
        seasonNumbers,
        isInternational: isIntl(career),
        color: teamColor,
        seasons,
        totalKits: matched.length,
        totalSeasons: seasonStrings.length,
      })
    }

    // Orphan jerseys not matching any career
    if (unclaimed.length > 0) {
      const orphanMap = new Map()
      for (const j of unclaimed) {
        const team = j.team_name || 'Unknown Team'
        if (!orphanMap.has(team)) orphanMap.set(team, [])
        orphanMap.get(team).push(j)
      }
      for (const [teamName, teamJerseys] of orphanMap) {
        teamJerseys.sort((a, b) => (b.season || '').localeCompare(a.season || ''))
        const teamColor = getTeamColor(teamName)
        groups.push({
          teamName,
          years: null,
          shirtNumber: teamJerseys[0]?.player_number || null,
          isInternational: false,
          color: teamColor,
          seasons: [{ season: 'All', kits: teamJerseys }],
          totalKits: teamJerseys.length,
          totalSeasons: 0,
        })
      }
    }

    // Split and sort: clubs first (keep career order), then international
    const clubs = groups.filter(g => !g.isInternational)
    const intl = groups.filter(g => g.isInternational)

    return [...clubs, ...intl]
  }, [jerseys, careers])

  const totalJerseys = jerseys.length

  // Summary stats
  const clubCount = careerGroups.filter(g => !g.isInternational).length
  const totalClubSeasons = careerGroups
    .filter(g => !g.isInternational)
    .reduce((sum, g) => sum + g.totalSeasons, 0)

  return { player, careers, careerGroups, totalJerseys, clubCount, totalClubSeasons, loading, error, refetch: fetchPlayer }
}
