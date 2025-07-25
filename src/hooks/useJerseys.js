import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useJerseys(searchTerm = '') {
  const [jerseys, setJerseys] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchJerseys = async () => {
      setLoading(true)
      try {
        let query = supabase
          .from('jerseys')
          .select('*')
          .eq('approved', true)
          .order('created_at', { ascending: false })
          
        if (searchTerm) {
          query = query.ilike('team_name', `%${searchTerm}%`)
        }
        
        const { data, error } = await query
        
        if (error) throw error
        setJerseys(data || [])
      } catch (err) {
        setError(err.message)
        setJerseys([])
      } finally {
        setLoading(false)
      }
    }

    fetchJerseys()
  }, [searchTerm])

  const createJersey = async (jerseyData) => {
    try {
      const { data, error } = await supabase
        .from('jerseys')
        .insert({
          ...jerseyData,
          created_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err.message }
    }
  }

  return { jerseys, loading, error, createJersey }
}