import { useState } from 'react'
import {
  UserPlusIcon,
  UserMinusIcon,
  ClockIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { useFriendshipStatus } from '../../hooks/useFriends'
import { supabase } from '../../lib/supabase'

/**
 * Button component for profile pages to handle friend requests
 * @param {Object} props
 * @param {string} props.currentUserId - The logged-in user's ID
 * @param {string} props.targetUserId - The profile owner's ID
 * @param {string} props.style - Additional styles
 */
export default function FriendRequestButton({ currentUserId, targetUserId, style = {} }) {
  const { status, friendshipId, loading, refetch } = useFriendshipStatus(currentUserId, targetUserId)
  const [actionLoading, setActionLoading] = useState(false)

  // Don't render if viewing own profile or not logged in
  if (!currentUserId || !targetUserId || currentUserId === targetUserId) {
    return null
  }

  const handleSendRequest = async () => {
    setActionLoading(true)
    try {
      const { error } = await supabase
        .from('user_friends')
        .insert({
          requester_id: currentUserId,
          addressee_id: targetUserId
        })

      if (error) throw error
      refetch()
    } catch (err) {
      console.error('Error sending friend request:', err)
    } finally {
      setActionLoading(false)
    }
  }

  const handleCancelRequest = async () => {
    if (!friendshipId) return
    setActionLoading(true)
    try {
      const { error } = await supabase
        .from('user_friends')
        .delete()
        .eq('id', friendshipId)

      if (error) throw error
      refetch()
    } catch (err) {
      console.error('Error canceling friend request:', err)
    } finally {
      setActionLoading(false)
    }
  }

  const handleAcceptRequest = async () => {
    if (!friendshipId) return
    setActionLoading(true)
    try {
      const { error } = await supabase
        .from('user_friends')
        .update({ status: 'accepted' })
        .eq('id', friendshipId)

      if (error) throw error
      refetch()
    } catch (err) {
      console.error('Error accepting friend request:', err)
    } finally {
      setActionLoading(false)
    }
  }

  const handleRejectRequest = async () => {
    if (!friendshipId) return
    setActionLoading(true)
    try {
      const { error } = await supabase
        .from('user_friends')
        .delete()
        .eq('id', friendshipId)

      if (error) throw error
      refetch()
    } catch (err) {
      console.error('Error rejecting friend request:', err)
    } finally {
      setActionLoading(false)
    }
  }

  const handleRemoveFriend = async () => {
    if (!friendshipId) return
    setActionLoading(true)
    try {
      const { error } = await supabase
        .from('user_friends')
        .delete()
        .eq('id', friendshipId)

      if (error) throw error
      refetch()
    } catch (err) {
      console.error('Error removing friend:', err)
    } finally {
      setActionLoading(false)
    }
  }

  const baseButtonStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '7px 14px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: 500,
    cursor: (loading || actionLoading) ? 'not-allowed' : 'pointer',
    opacity: (loading || actionLoading) ? 0.7 : 1,
    transition: 'all 0.15s ease',
    ...style
  }

  if (loading) {
    return (
      <button
        disabled
        style={{
          ...baseButtonStyle,
          border: '1px solid #d1d5db',
          backgroundColor: 'white',
          color: '#6b7280'
        }}
      >
        <div
          style={{
            width: '14px',
            height: '14px',
            border: '2px solid #d1d5db',
            borderTopColor: '#6b7280',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
          }}
        />
        Loading...
      </button>
    )
  }

  // No friendship - show "Add Friend" button
  if (status === 'none') {
    return (
      <button
        onClick={handleSendRequest}
        disabled={actionLoading}
        style={{
          ...baseButtonStyle,
          border: 'none',
          backgroundColor: '#16a34a',
          color: 'white'
        }}
      >
        <UserPlusIcon style={{ width: '16px', height: '16px' }} />
        Add Friend
      </button>
    )
  }

  // Pending sent - show "Pending" with cancel option
  if (status === 'pending_sent') {
    return (
      <button
        onClick={handleCancelRequest}
        disabled={actionLoading}
        title="Click to cancel request"
        style={{
          ...baseButtonStyle,
          border: '1px solid #fde68a',
          backgroundColor: '#fffbeb',
          color: '#b45309'
        }}
      >
        <ClockIcon style={{ width: '16px', height: '16px' }} />
        Pending
      </button>
    )
  }

  // Pending received - show Accept/Reject buttons
  if (status === 'pending_received') {
    return (
      <div style={{ display: 'flex', gap: '8px', ...style }}>
        <button
          onClick={handleAcceptRequest}
          disabled={actionLoading}
          style={{
            ...baseButtonStyle,
            border: 'none',
            backgroundColor: '#16a34a',
            color: 'white'
          }}
        >
          <CheckIcon style={{ width: '16px', height: '16px' }} />
          Accept
        </button>
        <button
          onClick={handleRejectRequest}
          disabled={actionLoading}
          style={{
            ...baseButtonStyle,
            border: '1px solid #fecaca',
            backgroundColor: '#fef2f2',
            color: '#dc2626'
          }}
        >
          <XMarkIcon style={{ width: '16px', height: '16px' }} />
          Reject
        </button>
      </div>
    )
  }

  // Friends - show "Friends" with remove option
  if (status === 'accepted') {
    return (
      <button
        onClick={handleRemoveFriend}
        disabled={actionLoading}
        title="Click to remove friend"
        style={{
          ...baseButtonStyle,
          border: '1px solid #bbf7d0',
          backgroundColor: '#dcfce7',
          color: '#16a34a'
        }}
      >
        <CheckIcon style={{ width: '16px', height: '16px' }} />
        Friends
      </button>
    )
  }

  return null
}
