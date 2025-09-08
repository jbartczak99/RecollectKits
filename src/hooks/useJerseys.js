import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth.jsx'

// Hook for fetching all jerseys from public_jerseys table
export function usePublicJerseys(searchTerm = '', filters = {}) {
  const [jerseys, setJerseys] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchPublicJerseys = async () => {
      setLoading(true)
      setError(null)
      
      try {
        let query = supabase
          .from('public_jerseys')
          .select('*')
          .order('created_at', { ascending: false })
          
        // Apply search term
        if (searchTerm) {
          query = query.or(`team_name.ilike.%${searchTerm}%,player_name.ilike.%${searchTerm}%,season.ilike.%${searchTerm}%`)
        }
        
        // Apply additional filters
        if (filters.team) {
          query = query.eq('team_name', filters.team)
        }
        if (filters.season) {
          query = query.eq('season', filters.season)
        }
        if (filters.type) {
          query = query.eq('jersey_type', filters.type)
        }
        if (filters.manufacturer) {
          query = query.eq('manufacturer', filters.manufacturer)
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

    fetchPublicJerseys()
  }, [searchTerm, filters])

  const addPublicJersey = async (jerseyData) => {
    try {
      setError(null)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('User must be authenticated to add jerseys')
      }

      const { data, error } = await supabase
        .from('public_jerseys')
        .insert({
          ...jerseyData,
          created_by: user.id,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error
      
      // Update local state
      setJerseys(prev => [data, ...prev])
      
      return { data, error: null }
    } catch (err) {
      const errorMessage = err.message
      setError(errorMessage)
      return { data: null, error: errorMessage }
    }
  }

  const updatePublicJersey = async (id, updates) => {
    try {
      setError(null)
      const { data, error } = await supabase
        .from('public_jerseys')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      
      // Update local state
      setJerseys(prev => prev.map(jersey => 
        jersey.id === id ? { ...jersey, ...data } : jersey
      ))
      
      return { data, error: null }
    } catch (err) {
      const errorMessage = err.message
      setError(errorMessage)
      return { data: null, error: errorMessage }
    }
  }

  return { 
    jerseys, 
    loading, 
    error, 
    addPublicJersey, 
    updatePublicJersey,
    refetch: () => {
      setLoading(true)
      // This will trigger the useEffect to refetch
    }
  }
}

// Hook for managing user's personal collections
export function useUserCollections() {
  const { user } = useAuth()
  const [collections, setCollections] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user) {
      setCollections([])
      setLoading(false)
      return
    }

    const fetchUserCollections = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const { data, error } = await supabase
          .from('user_collections')
          .select(`
            *,
            jersey:public_jerseys(*)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
        
        if (error) throw error
        setCollections(data || [])
      } catch (err) {
        setError(err.message)
        setCollections([])
      } finally {
        setLoading(false)
      }
    }

    fetchUserCollections()
  }, [user])

  const addToCollection = async (jerseyId, collectionType = 'have') => {
    try {
      setError(null)
      
      if (!user) {
        throw new Error('User must be authenticated to manage collections')
      }

      // Check if already in collection
      const { data: existing } = await supabase
        .from('user_collections')
        .select('id')
        .eq('user_id', user.id)
        .eq('jersey_id', jerseyId)
        .single()

      if (existing) {
        // Update existing entry
        const { data, error } = await supabase
          .from('user_collections')
          .update({ 
            collection_type: collectionType,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id)
          .select(`
            *,
            jersey:public_jerseys(*)
          `)
          .single()

        if (error) throw error
        
        // Update local state
        setCollections(prev => prev.map(item => 
          item.id === existing.id ? data : item
        ))
        
        return { data, error: null }
      } else {
        // Create new entry
        const { data, error } = await supabase
          .from('user_collections')
          .insert({
            user_id: user.id,
            jersey_id: jerseyId,
            collection_type: collectionType,
            created_at: new Date().toISOString()
          })
          .select(`
            *,
            jersey:public_jerseys(*)
          `)
          .single()

        if (error) throw error
        
        // Update local state
        setCollections(prev => [data, ...prev])
        
        return { data, error: null }
      }
    } catch (err) {
      const errorMessage = err.message
      setError(errorMessage)
      return { data: null, error: errorMessage }
    }
  }

  const removeFromCollection = async (jerseyId) => {
    try {
      setError(null)
      
      if (!user) {
        throw new Error('User must be authenticated to manage collections')
      }

      const { error } = await supabase
        .from('user_collections')
        .delete()
        .eq('user_id', user.id)
        .eq('jersey_id', jerseyId)

      if (error) throw error
      
      // Update local state
      setCollections(prev => prev.filter(item => item.jersey_id !== jerseyId))
      
      return { error: null }
    } catch (err) {
      const errorMessage = err.message
      setError(errorMessage)
      return { error: errorMessage }
    }
  }

  const getCollectionByType = (type) => {
    return collections.filter(item => item.collection_type === type)
  }

  const isInCollection = (jerseyId, type = null) => {
    if (type) {
      return collections.some(item => item.jersey_id === jerseyId && item.collection_type === type)
    }
    return collections.some(item => item.jersey_id === jerseyId)
  }

  return {
    collections,
    loading,
    error,
    addToCollection,
    removeFromCollection,
    getCollectionByType,
    isInCollection,
    haveCollection: getCollectionByType('have'),
    wantCollection: getCollectionByType('want'),
    refetch: () => {
      setLoading(true)
      // This will trigger the useEffect to refetch
    }
  }
}

// Legacy hook for backwards compatibility
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