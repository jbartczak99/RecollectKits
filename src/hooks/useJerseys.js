import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext.jsx'

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
    likeCollection: getCollectionByType('like'),
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

// Hook for fetching a weekly random jersey from public_jerseys
// Updates every Sunday at 12:00am EST
export function useRandomJersey() {
  const [jersey, setJersey] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Get the current week number (starting from a fixed epoch)
  const getCurrentWeekSeed = () => {
    const now = new Date()
    
    // Convert to EST (UTC-5) or EDT (UTC-4)
    // For simplicity, we'll use a fixed UTC-5 offset
    const estOffset = -5 * 60 // EST is UTC-5
    const estTime = new Date(now.getTime() + estOffset * 60 * 1000)
    
    // Get the most recent Sunday at 12:00am EST
    const dayOfWeek = estTime.getDay() // 0 = Sunday, 1 = Monday, etc.
    const daysSinceSunday = dayOfWeek === 0 ? 0 : dayOfWeek
    
    const currentSunday = new Date(estTime)
    currentSunday.setDate(estTime.getDate() - daysSinceSunday)
    currentSunday.setHours(0, 0, 0, 0) // Set to midnight
    
    // Use the current Sunday's timestamp as our seed
    // This ensures the same jersey is shown for the entire week
    const weekSeed = Math.floor(currentSunday.getTime() / (1000 * 60 * 60 * 24 * 7))
    
    return weekSeed
  }

  // Simple pseudo-random number generator using the week seed
  const seededRandom = (seed) => {
    const x = Math.sin(seed) * 10000
    return x - Math.floor(x)
  }

  const fetchWeeklyJersey = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // First get the count of total jerseys
      const { count, error: countError } = await supabase
        .from('public_jerseys')
        .select('*', { count: 'exact', head: true })
      
      if (countError) throw countError
      
      if (count === 0) {
        setJersey(null)
        setLoading(false)
        return
      }
      
      // Generate a deterministic offset based on the current week
      const weekSeed = getCurrentWeekSeed()
      const randomValue = seededRandom(weekSeed)
      const weeklyOffset = Math.floor(randomValue * count)
      
      // Fetch one jersey at the weekly offset
      const { data, error } = await supabase
        .from('public_jerseys')
        .select('*')
        .range(weeklyOffset, weeklyOffset)
        .limit(1)
      
      if (error) throw error
      setJersey(data && data.length > 0 ? data[0] : null)
    } catch (err) {
      setError(err.message)
      setJersey(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWeeklyJersey()
    
    // Set up an interval to check for week changes
    // Check every hour to see if we've crossed into a new week
    const interval = setInterval(() => {
      const currentWeekSeed = getCurrentWeekSeed()
      
      // Store the current week seed to detect changes
      if (!fetchWeeklyJersey.lastWeekSeed || fetchWeeklyJersey.lastWeekSeed !== currentWeekSeed) {
        fetchWeeklyJersey.lastWeekSeed = currentWeekSeed
        fetchWeeklyJersey()
      }
    }, 60 * 60 * 1000) // Check every hour
    
    return () => clearInterval(interval)
  }, [])

  return { 
    jersey, 
    loading, 
    error
  }
}