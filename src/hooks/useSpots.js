import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useSpots() {
  const [spots, setSpots] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchSpots = async () => {
      try {
        const { data, error } = await supabase
          .from('jersey_spots')
          .select(`
            *,
            jerseys (
              team_name,
              season_year,
              jersey_type,
              image_url
            ),
            profiles!spotted_by (
              username
            )
          `)
          .order('created_at', { ascending: false })

        if (error) throw error
        setSpots(data || [])
      } catch (err) {
        setError(err.message)
        setSpots([])
      } finally {
        setLoading(false)
      }
    }

    fetchSpots()
  }, [])

  const createSpot = async (spotData) => {
    try {
      const { data, error } = await supabase
        .from('jersey_spots')
        .insert({
          ...spotData,
          spotted_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select(`
          *,
          jerseys (
            team_name,
            season_year,
            jersey_type,
            image_url
          ),
          profiles!spotted_by (
            username
          )
        `)
        .single()

      if (error) throw error
      
      setSpots(prev => [data, ...prev])
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err.message }
    }
  }

  return {
    spots,
    loading,
    error,
    createSpot
  }
}