import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useCollection(userId) {
  const [collection, setCollection] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!userId) {
      setCollection([])
      setLoading(false)
      return
    }

    const fetchCollection = async () => {
      try {
        const { data, error } = await supabase
          .from('user_collections')
          .select(`
            *,
            jerseys (
              id,
              team_name,
              season_year,
              jersey_type,
              manufacturer,
              image_url,
              rarity_level
            )
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

        if (error) throw error
        setCollection(data || [])
      } catch (err) {
        setError(err.message)
        setCollection([])
      } finally {
        setLoading(false)
      }
    }

    fetchCollection()
  }, [userId])

  const removeFromCollection = async (collectionId) => {
    try {
      const { error } = await supabase
        .from('user_collections')
        .delete()
        .eq('id', collectionId)

      if (error) throw error
      
      setCollection(prev => prev.filter(item => item.id !== collectionId))
      return { error: null }
    } catch (err) {
      return { error: err.message }
    }
  }

  const updateCollectionStatus = async (collectionId, status) => {
    try {
      const { error } = await supabase
        .from('user_collections')
        .update({ status })
        .eq('id', collectionId)

      if (error) throw error
      
      setCollection(prev => 
        prev.map(item => 
          item.id === collectionId ? { ...item, status } : item
        )
      )
      return { error: null }
    } catch (err) {
      return { error: err.message }
    }
  }

  const haveItems = collection.filter(item => item.status === 'have')
  const wantItems = collection.filter(item => item.status === 'want')

  return {
    collection,
    haveItems,
    wantItems,
    loading,
    error,
    removeFromCollection,
    updateCollectionStatus
  }
}