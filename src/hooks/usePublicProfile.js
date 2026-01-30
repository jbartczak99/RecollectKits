import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function usePublicProfile(username) {
  const [profile, setProfile] = useState(null)
  const [collections, setCollections] = useState([])
  const [top3Jerseys, setTop3Jerseys] = useState([])
  const [stats, setStats] = useState({ total_jerseys: 0, public_collections: 0, liked_jerseys: 0 })
  const [allKits, setAllKits] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchPublicProfile = useCallback(async () => {
    if (!username) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      // 1. Fetch profile directly from the profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, bio, is_public, top_3_jersey_ids, all_kits_public, approval_status, requested_at')
        .eq('username', username)
        .eq('is_public', true)
        .eq('approval_status', 'approved')
        .single()

      if (profileError) {
        if (profileError.code === 'PGRST116') {
          // No rows returned
          setError('Profile not found or is private')
        } else {
          console.error('Profile fetch error:', profileError)
          setError('Failed to load profile')
        }
        setLoading(false)
        return
      }

      setProfile(profileData)
      const userId = profileData.id

      // 2. Fetch everything else in parallel
      const [statsResult, collectionsResult, top3Result, allKitsResult] = await Promise.all([
        fetchStats(userId, profileData.all_kits_public),
        fetchPublicCollections(userId),
        profileData.top_3_jersey_ids?.length > 0
          ? fetchTop3(profileData.top_3_jersey_ids)
          : Promise.resolve([]),
        profileData.all_kits_public
          ? fetchAllKits(userId)
          : Promise.resolve([])
      ])

      setStats(statsResult)
      setCollections(collectionsResult)
      setTop3Jerseys(top3Result)
      setAllKits(allKitsResult)

    } catch (err) {
      console.error('Error fetching public profile:', err)
      setError(err.message || 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }, [username])

  const fetchStats = async (userId, allKitsPublic) => {
    try {
      const [jerseysCount, collectionsCount, likesCount] = await Promise.all([
        allKitsPublic
          ? supabase.from('user_jerseys').select('id', { count: 'exact', head: true }).eq('user_id', userId)
          : Promise.resolve({ count: 0 }),
        supabase.from('collections').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('is_public', true),
        supabase.from('jersey_likes').select('id', { count: 'exact', head: true }).eq('user_id', userId)
      ])

      return {
        total_jerseys: jerseysCount.count || 0,
        public_collections: collectionsCount.count || 0,
        liked_jerseys: likesCount.count || 0
      }
    } catch (err) {
      console.error('Error fetching stats:', err)
      return { total_jerseys: 0, public_collections: 0, liked_jerseys: 0 }
    }
  }

  const fetchPublicCollections = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('collections')
        .select('id, name, description, created_at')
        .eq('user_id', userId)
        .eq('is_public', true)
        .order('created_at', { ascending: false })

      if (error) throw error

      // For each collection, get jersey count and thumbnails
      const collectionsWithDetails = await Promise.all(
        (data || []).map(async (collection) => {
          // Special handling for "Liked Kits" - data is in jersey_likes table
          if (collection.name === 'Liked Kits') {
            const { count } = await supabase
              .from('jersey_likes')
              .select('id', { count: 'exact', head: true })
              .eq('user_id', userId)

            const { data: likesData } = await supabase
              .from('jersey_likes')
              .select('jersey_id')
              .eq('user_id', userId)
              .order('created_at', { ascending: false })
              .limit(4)

            let thumbnail_urls = []
            if (likesData && likesData.length > 0) {
              const jerseyIds = likesData.map(item => item.jersey_id)
              const { data: jerseysData } = await supabase
                .from('public_jerseys')
                .select('id, front_image_url')
                .in('id', jerseyIds)

              thumbnail_urls = jerseyIds
                .map(id => jerseysData?.find(j => j.id === id)?.front_image_url)
                .filter(Boolean)
            }

            return {
              ...collection,
              jersey_count: count || 0,
              thumbnail_urls
            }
          }

          // Special handling for "Wishlist" - data is in user_wishlist table
          if (collection.name === 'Wishlist') {
            const { count } = await supabase
              .from('user_wishlist')
              .select('id', { count: 'exact', head: true })
              .eq('user_id', userId)

            const { data: wishlistData } = await supabase
              .from('user_wishlist')
              .select('public_jersey_id')
              .eq('user_id', userId)
              .order('created_at', { ascending: false })
              .limit(4)

            let thumbnail_urls = []
            if (wishlistData && wishlistData.length > 0) {
              const jerseyIds = wishlistData.map(item => item.public_jersey_id)
              const { data: jerseysData } = await supabase
                .from('public_jerseys')
                .select('id, front_image_url')
                .in('id', jerseyIds)

              thumbnail_urls = jerseyIds
                .map(id => jerseysData?.find(j => j.id === id)?.front_image_url)
                .filter(Boolean)
            }

            return {
              ...collection,
              jersey_count: count || 0,
              thumbnail_urls
            }
          }

          // Regular collections - data is in collection_jerseys table
          const { count } = await supabase
            .from('collection_jerseys')
            .select('id', { count: 'exact', head: true })
            .eq('collection_id', collection.id)

          const { data: thumbData } = await supabase
            .from('collection_jerseys')
            .select('user_jersey:user_jerseys(public_jersey:public_jerseys(front_image_url))')
            .eq('collection_id', collection.id)
            .limit(4)

          const thumbnail_urls = (thumbData || [])
            .map(t => t.user_jersey?.public_jersey?.front_image_url)
            .filter(Boolean)

          return {
            ...collection,
            jersey_count: count || 0,
            thumbnail_urls
          }
        })
      )

      return collectionsWithDetails
    } catch (err) {
      console.error('Error fetching public collections:', err)
      return []
    }
  }

  const fetchTop3 = async (userJerseyIds) => {
    try {
      // Fetch the user jerseys with their public jersey data
      const { data, error } = await supabase
        .from('user_jerseys')
        .select(`
          id,
          public_jersey:public_jerseys(
            id,
            team_name,
            player_name,
            season,
            jersey_type,
            kit_type,
            manufacturer,
            front_image_url,
            back_image_url
          )
        `)
        .in('id', userJerseyIds)

      if (error) throw error

      // Maintain the order from the top_3_jersey_ids array
      const ordered = userJerseyIds
        .map(id => {
          const match = (data || []).find(d => d.id === id)
          if (!match?.public_jersey) return null
          return {
            user_jersey_id: match.id,
            id: match.public_jersey.id,
            team_name: match.public_jersey.team_name,
            player_name: match.public_jersey.player_name,
            season: match.public_jersey.season,
            jersey_type: match.public_jersey.jersey_type,
            kit_type: match.public_jersey.kit_type,
            manufacturer: match.public_jersey.manufacturer,
            front_image_url: match.public_jersey.front_image_url,
            back_image_url: match.public_jersey.back_image_url
          }
        })
        .filter(Boolean)

      return ordered
    } catch (err) {
      console.error('Error fetching top 3:', err)
      return []
    }
  }

  const fetchAllKits = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_jerseys')
        .select(`
          id,
          size,
          condition,
          acquired_from,
          notes,
          created_at,
          public_jersey:public_jerseys(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (err) {
      console.error('Error fetching all kits:', err)
      return []
    }
  }

  useEffect(() => {
    fetchPublicProfile()
  }, [fetchPublicProfile])

  return {
    profile,
    collections,
    top3Jerseys,
    stats,
    allKits,
    loading,
    error,
    refetch: fetchPublicProfile
  }
}

// Hook for managing profile settings (for the profile owner)
export function useProfileSettings() {
  const [saving, setSaving] = useState(false)

  const updateProfileVisibility = async (userId, isPublic) => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_public: isPublic })
        .eq('id', userId)

      if (error) throw error
      return { error: null }
    } catch (error) {
      console.error('Error updating profile visibility:', error)
      return { error }
    } finally {
      setSaving(false)
    }
  }

  const updateBio = async (userId, bio) => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ bio })
        .eq('id', userId)

      if (error) throw error
      return { error: null }
    } catch (error) {
      console.error('Error updating bio:', error)
      return { error }
    } finally {
      setSaving(false)
    }
  }

  const updateShowFullName = async (userId, showFullName) => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ show_full_name: showFullName })
        .eq('id', userId)

      if (error) throw error
      return { error: null }
    } catch (error) {
      console.error('Error updating show_full_name:', error)
      return { error }
    } finally {
      setSaving(false)
    }
  }

  const updateUsername = async (userId, newUsername, currentChangedAt) => {
    setSaving(true)
    try {
      // Validate username format
      const trimmed = newUsername.trim().toLowerCase()
      if (trimmed.length < 3) {
        throw new Error('Username must be at least 3 characters')
      }
      if (trimmed.length > 30) {
        throw new Error('Username must be 30 characters or less')
      }
      if (!/^[a-z0-9_]+$/.test(trimmed)) {
        throw new Error('Username can only contain letters, numbers, and underscores')
      }

      // Check 30-day cooldown
      if (currentChangedAt) {
        const lastChanged = new Date(currentChangedAt)
        const daysSince = (Date.now() - lastChanged.getTime()) / (1000 * 60 * 60 * 24)
        if (daysSince < 30) {
          const daysLeft = Math.ceil(30 - daysSince)
          throw new Error(`You can change your username again in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`)
        }
      }

      // Check if username is already taken
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', trimmed)
        .neq('id', userId)
        .single()

      if (existing) {
        throw new Error('This username is already taken')
      }

      // Update username
      const { error } = await supabase
        .from('profiles')
        .update({
          username: trimmed,
          username_changed_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (error) throw error
      return { error: null }
    } catch (error) {
      console.error('Error updating username:', error)
      return { error }
    } finally {
      setSaving(false)
    }
  }

  const uploadAvatar = async (userId, file) => {
    setSaving(true)
    try {
      // Validate file
      if (!file) throw new Error('No file selected')
      if (file.size > 2 * 1024 * 1024) {
        throw new Error('Image must be less than 2MB')
      }
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        throw new Error('Only JPG, PNG, and WebP images are allowed')
      }

      // Create file path: avatars/{userId}/avatar.{ext}
      const ext = file.name.split('.').pop()
      const filePath = `${userId}/avatar.${ext}`

      // Upload to Supabase Storage (upsert to replace existing)
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      // Add cache-busting timestamp to force refresh
      const avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', userId)

      if (updateError) throw updateError

      return { error: null, url: avatarUrl }
    } catch (error) {
      console.error('Error uploading avatar:', error)
      return { error }
    } finally {
      setSaving(false)
    }
  }

  const removeAvatar = async (userId) => {
    setSaving(true)
    try {
      // Clear avatar_url in profile
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', userId)

      if (error) throw error
      return { error: null }
    } catch (error) {
      console.error('Error removing avatar:', error)
      return { error }
    } finally {
      setSaving(false)
    }
  }

  const updateTop3Jerseys = async (userId, jerseyIds) => {
    setSaving(true)
    try {
      if (jerseyIds.length > 3) {
        throw new Error('You can only select up to 3 jerseys')
      }

      const { error } = await supabase
        .from('profiles')
        .update({ top_3_jersey_ids: jerseyIds })
        .eq('id', userId)

      if (error) throw error
      return { error: null }
    } catch (error) {
      console.error('Error updating top 3 jerseys:', error)
      return { error }
    } finally {
      setSaving(false)
    }
  }

  const getUserJerseys = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_jerseys')
        .select(`
          id,
          public_jersey:public_jerseys(
            id,
            team_name,
            player_name,
            season,
            jersey_type,
            kit_type,
            front_image_url
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return { data: data || [], error: null }
    } catch (error) {
      console.error('Error fetching user jerseys:', error)
      return { data: [], error }
    }
  }

  return {
    saving,
    updateProfileVisibility,
    updateBio,
    updateShowFullName,
    updateUsername,
    uploadAvatar,
    removeAvatar,
    updateTop3Jerseys,
    getUserJerseys
  }
}
