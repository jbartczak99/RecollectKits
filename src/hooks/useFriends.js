import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Main hook for managing friends and friend requests
 * @param {string} userId - The current user's ID
 */
export function useFriends(userId) {
  const [friends, setFriends] = useState([])
  const [pendingReceived, setPendingReceived] = useState([])
  const [pendingSent, setPendingSent] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchFriends = useCallback(async () => {
    if (!userId) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Fetch all friendships where user is involved
      const { data, error: fetchError } = await supabase
        .from('user_friends')
        .select(`
          id,
          requester_id,
          addressee_id,
          status,
          created_at,
          updated_at,
          requester:profiles!user_friends_requester_id_fkey(id, username, full_name, avatar_url),
          addressee:profiles!user_friends_addressee_id_fkey(id, username, full_name, avatar_url)
        `)
        .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)

      if (fetchError) throw fetchError

      // Separate into categories
      const acceptedFriends = []
      const received = []
      const sent = []

      ;(data || []).forEach(friendship => {
        if (friendship.status === 'accepted') {
          // Add the other user as a friend
          const friend = friendship.requester_id === userId
            ? friendship.addressee
            : friendship.requester
          acceptedFriends.push({
            ...friend,
            friendship_id: friendship.id,
            friendship_created_at: friendship.created_at
          })
        } else if (friendship.status === 'pending') {
          if (friendship.addressee_id === userId) {
            // Received request
            received.push({
              ...friendship.requester,
              friendship_id: friendship.id,
              request_created_at: friendship.created_at
            })
          } else {
            // Sent request
            sent.push({
              ...friendship.addressee,
              friendship_id: friendship.id,
              request_created_at: friendship.created_at
            })
          }
        }
      })

      setFriends(acceptedFriends)
      setPendingReceived(received)
      setPendingSent(sent)
    } catch (err) {
      console.error('Error fetching friends:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [userId])

  // Send a friend request
  const sendFriendRequest = async (targetUserId) => {
    if (!userId || !targetUserId) return { error: new Error('Invalid user IDs') }

    try {
      const { data, error } = await supabase
        .from('user_friends')
        .insert({
          requester_id: userId,
          addressee_id: targetUserId
        })
        .select()
        .single()

      if (error) throw error

      // Refresh friends list
      await fetchFriends()
      return { data, error: null }
    } catch (err) {
      console.error('Error sending friend request:', err)
      return { error: err }
    }
  }

  // Accept a friend request
  const acceptFriendRequest = async (friendshipId) => {
    if (!friendshipId) return { error: new Error('Invalid friendship ID') }

    try {
      const { data, error } = await supabase
        .from('user_friends')
        .update({ status: 'accepted' })
        .eq('id', friendshipId)
        .select()
        .single()

      if (error) throw error

      // Refresh friends list
      await fetchFriends()
      return { data, error: null }
    } catch (err) {
      console.error('Error accepting friend request:', err)
      return { error: err }
    }
  }

  // Reject a friend request (delete the pending request)
  const rejectFriendRequest = async (friendshipId) => {
    if (!friendshipId) return { error: new Error('Invalid friendship ID') }

    try {
      const { error } = await supabase
        .from('user_friends')
        .delete()
        .eq('id', friendshipId)

      if (error) throw error

      // Refresh friends list
      await fetchFriends()
      return { error: null }
    } catch (err) {
      console.error('Error rejecting friend request:', err)
      return { error: err }
    }
  }

  // Cancel a sent friend request
  const cancelFriendRequest = async (friendshipId) => {
    if (!friendshipId) return { error: new Error('Invalid friendship ID') }

    try {
      const { error } = await supabase
        .from('user_friends')
        .delete()
        .eq('id', friendshipId)

      if (error) throw error

      // Refresh friends list
      await fetchFriends()
      return { error: null }
    } catch (err) {
      console.error('Error canceling friend request:', err)
      return { error: err }
    }
  }

  // Remove a friend
  const removeFriend = async (friendshipId) => {
    if (!friendshipId) return { error: new Error('Invalid friendship ID') }

    try {
      const { error } = await supabase
        .from('user_friends')
        .delete()
        .eq('id', friendshipId)

      if (error) throw error

      // Refresh friends list
      await fetchFriends()
      return { error: null }
    } catch (err) {
      console.error('Error removing friend:', err)
      return { error: err }
    }
  }

  // Set up real-time subscription
  useEffect(() => {
    fetchFriends()

    if (!userId) return

    // Subscribe to changes in user_friends table
    const channel = supabase
      .channel('user_friends_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_friends',
          filter: `requester_id=eq.${userId}`
        },
        () => fetchFriends()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_friends',
          filter: `addressee_id=eq.${userId}`
        },
        () => fetchFriends()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, fetchFriends])

  return {
    friends,
    pendingReceived,
    pendingSent,
    loading,
    error,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    cancelFriendRequest,
    removeFriend,
    refetch: fetchFriends
  }
}

/**
 * Lightweight hook for checking friendship status between two users
 * @param {string} currentUserId - The current user's ID
 * @param {string} otherUserId - The other user's ID
 */
export function useFriendshipStatus(currentUserId, otherUserId) {
  const [status, setStatus] = useState('none') // 'none', 'pending_sent', 'pending_received', 'accepted'
  const [friendshipId, setFriendshipId] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchStatus = useCallback(async () => {
    if (!currentUserId || !otherUserId || currentUserId === otherUserId) {
      setStatus('none')
      setFriendshipId(null)
      setLoading(false)
      return
    }

    setLoading(true)

    try {
      const { data, error } = await supabase
        .from('user_friends')
        .select('id, requester_id, status')
        .or(`and(requester_id.eq.${currentUserId},addressee_id.eq.${otherUserId}),and(requester_id.eq.${otherUserId},addressee_id.eq.${currentUserId})`)
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows returned
        throw error
      }

      if (!data) {
        setStatus('none')
        setFriendshipId(null)
      } else if (data.status === 'accepted') {
        setStatus('accepted')
        setFriendshipId(data.id)
      } else if (data.requester_id === currentUserId) {
        setStatus('pending_sent')
        setFriendshipId(data.id)
      } else {
        setStatus('pending_received')
        setFriendshipId(data.id)
      }
    } catch (err) {
      console.error('Error fetching friendship status:', err)
      setStatus('none')
      setFriendshipId(null)
    } finally {
      setLoading(false)
    }
  }, [currentUserId, otherUserId])

  useEffect(() => {
    fetchStatus()

    if (!currentUserId || !otherUserId) return

    // Subscribe to changes
    const channel = supabase
      .channel(`friendship_${currentUserId}_${otherUserId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_friends'
        },
        (payload) => {
          // Check if this change involves both users
          const record = payload.new || payload.old
          if (
            record &&
            ((record.requester_id === currentUserId && record.addressee_id === otherUserId) ||
             (record.requester_id === otherUserId && record.addressee_id === currentUserId))
          ) {
            fetchStatus()
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [currentUserId, otherUserId, fetchStatus])

  return {
    status,
    friendshipId,
    loading,
    refetch: fetchStatus
  }
}
