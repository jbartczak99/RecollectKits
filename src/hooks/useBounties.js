import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useBounties() {
  const [bounties, setBounties] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchBounties = async () => {
      try {
        const { data, error } = await supabase
          .from('bounties')
          .select(`
            *,
            jerseys (
              team_name,
              season_year,
              jersey_type,
              image_url
            ),
            profiles!created_by (
              username
            )
          `)
          .eq('status', 'active')
          .order('created_at', { ascending: false })

        if (error) throw error
        setBounties(data || [])
      } catch (err) {
        setError(err.message)
        setBounties([])
      } finally {
        setLoading(false)
      }
    }

    fetchBounties()
  }, [])

  const createBounty = async (bountyData) => {
    try {
      const { data, error } = await supabase
        .from('bounties')
        .insert({
          ...bountyData,
          created_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select(`
          *,
          jerseys (
            team_name,
            season_year,
            jersey_type,
            image_url
          ),
          profiles!created_by (
            username
          )
        `)
        .single()

      if (error) throw error
      
      setBounties(prev => [data, ...prev])
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err.message }
    }
  }

  const fulfillBounty = async (bountyId) => {
    try {
      const user = (await supabase.auth.getUser()).data.user
      
      const { error } = await supabase
        .from('bounties')
        .update({
          status: 'fulfilled',
          fulfilled_by: user?.id,
          fulfilled_at: new Date().toISOString()
        })
        .eq('id', bountyId)

      if (error) throw error
      
      setBounties(prev => prev.filter(bounty => bounty.id !== bountyId))
      return { error: null }
    } catch (err) {
      return { error: err.message }
    }
  }

  return {
    bounties,
    loading,
    error,
    createBounty,
    fulfillBounty
  }
}