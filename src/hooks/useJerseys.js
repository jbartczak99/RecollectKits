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

// Hook for checking if jerseys are in user's main collection (user_jerseys)
export function useUserJerseys() {
  const { user } = useAuth()
  const [userJerseys, setUserJerseys] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setUserJerseys([])
      setLoading(false)
      return
    }

    const fetchUserJerseys = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('user_jerseys')
          .select('public_jersey_id')
          .eq('user_id', user.id)

        if (error) throw error
        setUserJerseys(data || [])
      } catch (err) {
        console.error('Error fetching user jerseys:', err)
        setUserJerseys([])
      } finally {
        setLoading(false)
      }
    }

    fetchUserJerseys()
  }, [user])

  const isInMainCollection = (publicJerseyId) => {
    return userJerseys.some(item => item.public_jersey_id === publicJerseyId)
  }

  const refetch = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('user_jerseys')
        .select('public_jersey_id')
        .eq('user_id', user.id)

      if (error) throw error
      setUserJerseys(data || [])
    } catch (err) {
      console.error('Error refetching user jerseys:', err)
    }
  }

  return {
    userJerseys,
    loading,
    isInMainCollection,
    refetch
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

// Hook for fetching the most liked jersey of the week
// Updates every Sunday at 12:00am EST
export function useMostLikedJersey() {
  const [jersey, setJersey] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [likeCount, setLikeCount] = useState(0)

  // Get the start of the current week (Sunday 12:00am EST)
  const getWeekStart = () => {
    const now = new Date()

    // Convert to EST (UTC-5)
    const estOffset = -5 * 60
    const estTime = new Date(now.getTime() + estOffset * 60 * 1000)

    // Get the most recent Sunday at 12:00am EST
    const dayOfWeek = estTime.getDay()
    const daysSinceSunday = dayOfWeek === 0 ? 0 : dayOfWeek

    const currentSunday = new Date(estTime)
    currentSunday.setDate(estTime.getDate() - daysSinceSunday)
    currentSunday.setHours(0, 0, 0, 0)

    return currentSunday.toISOString()
  }

  useEffect(() => {
    const fetchMostLikedJersey = async () => {
      setLoading(true)
      setError(null)

      try {
        const weekStart = getWeekStart()

        // Get all likes from this week from jersey_likes table
        const { data: likesData, error: likesError } = await supabase
          .from('jersey_likes')
          .select('jersey_id')
          .gte('created_at', weekStart)

        if (likesError) throw likesError

        if (!likesData || likesData.length === 0) {
          // No likes this week, fall back to all-time most liked
          const { data: allTimeLikes, error: allTimeError } = await supabase
            .from('jersey_likes')
            .select('jersey_id')

          if (allTimeError) throw allTimeError

          if (!allTimeLikes || allTimeLikes.length === 0) {
            setJersey(null)
            setLikeCount(0)
            setLoading(false)
            return
          }

          // Count likes per jersey
          const likeCounts = allTimeLikes.reduce((acc, item) => {
            acc[item.jersey_id] = (acc[item.jersey_id] || 0) + 1
            return acc
          }, {})

          // Find jersey with most likes
          const mostLikedId = Object.entries(likeCounts)
            .sort((a, b) => b[1] - a[1])[0]

          if (mostLikedId) {
            const { data: jerseyData, error: jerseyError } = await supabase
              .from('public_jerseys')
              .select('*')
              .eq('id', mostLikedId[0])
              .single()

            if (jerseyError) throw jerseyError
            setJersey(jerseyData)
            setLikeCount(mostLikedId[1])
          }
        } else {
          // Count likes per jersey for this week
          const likeCounts = likesData.reduce((acc, item) => {
            acc[item.jersey_id] = (acc[item.jersey_id] || 0) + 1
            return acc
          }, {})

          // Find jersey with most likes this week
          const mostLikedId = Object.entries(likeCounts)
            .sort((a, b) => b[1] - a[1])[0]

          if (mostLikedId) {
            const { data: jerseyData, error: jerseyError } = await supabase
              .from('public_jerseys')
              .select('*')
              .eq('id', mostLikedId[0])
              .single()

            if (jerseyError) throw jerseyError
            setJersey(jerseyData)
            setLikeCount(mostLikedId[1])
          }
        }
      } catch (err) {
        setError(err.message)
        setJersey(null)
        setLikeCount(0)
      } finally {
        setLoading(false)
      }
    }

    fetchMostLikedJersey()

    // Check every hour for week changes
    const interval = setInterval(() => {
      fetchMostLikedJersey()
    }, 60 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  return {
    jersey,
    loading,
    error,
    likeCount
  }
}

// Hook for managing jersey likes
export function useJerseyLikes(userId) {
  const [userLikes, setUserLikes] = useState([]) // Array of jersey_ids the user has liked
  const [likeCounts, setLikeCounts] = useState({}) // Map of jersey_id -> like count
  const [loading, setLoading] = useState(true)

  // Fetch user's likes and all like counts
  useEffect(() => {
    const fetchLikes = async () => {
      setLoading(true)
      try {
        // Get all likes to count them
        const { data: allLikes, error: allError } = await supabase
          .from('jersey_likes')
          .select('jersey_id')

        if (allError) throw allError

        // Count likes per jersey
        const counts = (allLikes || []).reduce((acc, item) => {
          acc[item.jersey_id] = (acc[item.jersey_id] || 0) + 1
          return acc
        }, {})
        setLikeCounts(counts)

        // Get user's likes if logged in
        if (userId) {
          const { data: userLikesData, error: userError } = await supabase
            .from('jersey_likes')
            .select('jersey_id')
            .eq('user_id', userId)

          if (userError) throw userError
          setUserLikes((userLikesData || []).map(item => item.jersey_id))
        }
      } catch (err) {
        console.error('Error fetching likes:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchLikes()
  }, [userId])

  // Check if user has liked a jersey
  const hasLiked = (jerseyId) => {
    return userLikes.includes(jerseyId)
  }

  // Get like count for a jersey
  const getLikeCount = (jerseyId) => {
    return likeCounts[jerseyId] || 0
  }

  // Toggle like (add or remove)
  const toggleLike = async (jerseyId) => {
    if (!userId) {
      return { error: 'Must be logged in to like' }
    }

    try {
      if (hasLiked(jerseyId)) {
        // Remove like
        const { error } = await supabase
          .from('jersey_likes')
          .delete()
          .eq('jersey_id', jerseyId)
          .eq('user_id', userId)

        if (error) throw error

        setUserLikes(prev => prev.filter(id => id !== jerseyId))
        setLikeCounts(prev => ({
          ...prev,
          [jerseyId]: Math.max((prev[jerseyId] || 1) - 1, 0)
        }))
      } else {
        // Add like
        const { error } = await supabase
          .from('jersey_likes')
          .insert({ jersey_id: jerseyId, user_id: userId })

        if (error) throw error

        setUserLikes(prev => [...prev, jerseyId])
        setLikeCounts(prev => ({
          ...prev,
          [jerseyId]: (prev[jerseyId] || 0) + 1
        }))
      }
      return { error: null }
    } catch (err) {
      console.error('Error toggling like:', err)
      return { error: err.message }
    }
  }

  return {
    hasLiked,
    getLikeCount,
    toggleLike,
    loading
  }
}

// Hook for fetching a weekly random jersey from public_jerseys
// Updates every Sunday at 12:00am EST
// kitType parameter: 'club', 'international', or null for any
export function useRandomJersey(kitType = null) {
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

  useEffect(() => {
    const fetchWeeklyJersey = async () => {
      setLoading(true)
      setError(null)

      try {
        // Build query with optional kit_type filter
        let countQuery = supabase
          .from('public_jerseys')
          .select('*', { count: 'exact', head: true })

        if (kitType) {
          countQuery = countQuery.eq('kit_type', kitType)
        }

        const { count, error: countError } = await countQuery

        if (countError) throw countError

        if (count === 0) {
          setJersey(null)
          setLoading(false)
          return
        }

        // Generate a deterministic offset based on the current week
        // Add kitType to seed so club and international get different jerseys
        const weekSeed = getCurrentWeekSeed()
        const kitTypeOffset = kitType === 'international' ? 12345 : kitType === 'club' ? 67890 : 0
        const randomValue = seededRandom(weekSeed + kitTypeOffset)
        const weeklyOffset = Math.floor(randomValue * count)

        // Build data query with optional kit_type filter
        let dataQuery = supabase
          .from('public_jerseys')
          .select('*')

        if (kitType) {
          dataQuery = dataQuery.eq('kit_type', kitType)
        }

        const { data, error } = await dataQuery
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

    fetchWeeklyJersey()

    // Set up an interval to check for week changes
    // Check every hour to see if we've crossed into a new week
    let lastWeekSeed = getCurrentWeekSeed()
    const interval = setInterval(() => {
      const currentWeekSeed = getCurrentWeekSeed()

      if (lastWeekSeed !== currentWeekSeed) {
        lastWeekSeed = currentWeekSeed
        fetchWeeklyJersey()
      }
    }, 60 * 60 * 1000) // Check every hour

    return () => clearInterval(interval)
  }, [kitType])

  return {
    jersey,
    loading,
    error
  }
}