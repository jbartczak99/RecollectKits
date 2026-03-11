import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Hook to fetch squad members for a kit's team + season.
 * Only reads from our own team_squads table (source of truth).
 * Cross-references with local players table.
 */
export function useKitSquad(teamName, season) {
  const [squad, setSquad] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchSquad = useCallback(async () => {
    if (!teamName || !season) return
    setLoading(true)
    setError(null)

    try {
      const { data: localSquad } = await supabase
        .from('team_squads')
        .select('*')
        .eq('team_name', teamName)
        .eq('season', season)
        .order('shirt_number', { ascending: true })

      if (localSquad && localSquad.length > 0) {
        const enriched = await enrichWithLocalPlayers(localSquad.map(s => ({
          wikidataId: s.wikidata_id,
          name: s.player_name,
          shirtNumber: s.shirt_number,
          position: s.position,
          nationality: s.nationality,
          playerId: s.player_id,
        })))
        setSquad(enriched)
      } else {
        setSquad([])
      }
    } catch (err) {
      console.error('useKitSquad error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [teamName, season])

  useEffect(() => {
    fetchSquad()
  }, [fetchSquad])

  return { squad, loading, error, refetch: fetchSquad }
}

/**
 * Cross-reference squad members with local players table.
 */
async function enrichWithLocalPlayers(members) {
  if (members.length === 0) return []

  const wikidataIds = members.map(m => m.wikidataId).filter(Boolean)

  let wdMap = new Map()
  if (wikidataIds.length > 0) {
    const { data: wdPlayers } = await supabase
      .from('players')
      .select('id, name, wikidata_id')
      .in('wikidata_id', wikidataIds)

    if (wdPlayers) {
      for (const p of wdPlayers) {
        wdMap.set(p.wikidata_id, p)
      }
    }
  }

  let nameMap = new Map()
  const unmatchedNames = members
    .filter(m => !wdMap.has(m.wikidataId))
    .map(m => m.name)
    .filter(Boolean)

  if (unmatchedNames.length > 0) {
    const { data: namePlayers } = await supabase
      .from('players')
      .select('id, name, wikidata_id')
      .in('name', unmatchedNames)

    if (namePlayers) {
      for (const p of namePlayers) {
        nameMap.set(p.name.toLowerCase(), p)
      }
    }
  }

  return members.map(m => {
    const wdMatch = wdMap.get(m.wikidataId)
    const nameMatch = nameMap.get(m.name?.toLowerCase())
    const localPlayer = wdMatch || nameMatch || null

    return {
      wikidataId: m.wikidataId,
      name: m.name,
      shirtNumber: m.shirtNumber,
      position: m.position || null,
      nationality: m.nationality || null,
      playerId: localPlayer?.id || m.playerId || null,
      inDb: !!localPlayer || !!m.playerId,
    }
  })
}
