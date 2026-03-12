import { useState, useEffect } from 'react'
import { XMarkIcon, MagnifyingGlassIcon, UsersIcon, InboxIcon, PaperAirplaneIcon, UserPlusIcon } from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'
import FriendCard from './FriendCard'
import { useFriends } from '../../hooks/useFriends'
import { supabase } from '../../lib/supabase'

/**
 * Modal for displaying friends list with tabs for Friends, Received, Sent
 * @param {Object} props
 * @param {boolean} props.isOpen - Modal open state
 * @param {Function} props.onClose - Close handler
 * @param {string} props.userId - Current user's ID
 * @param {string} props.initialTab - Initial tab to show ('friends', 'received', 'sent')
 */
export default function FriendsListModal({ isOpen, onClose, userId, initialTab = 'friends' }) {
  const [activeTab, setActiveTab] = useState(initialTab)
  const [searchQuery, setSearchQuery] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  // Find friends state
  const [findQuery, setFindQuery] = useState('')
  const [findResults, setFindResults] = useState([])
  const [findLoading, setFindLoading] = useState(false)
  const [sentRequests, setSentRequests] = useState({}) // track in-flight requests by user id

  const {
    friends,
    pendingReceived,
    pendingSent,
    loading,
    acceptFriendRequest,
    rejectFriendRequest,
    cancelFriendRequest,
    removeFriend,
    sendFriendRequest
  } = useFriends(userId)

  // Sync initialTab when modal opens
  useEffect(() => {
    if (isOpen) setActiveTab(initialTab)
  }, [isOpen, initialTab])

  // Debounced user search for Find tab
  useEffect(() => {
    if (activeTab !== 'find' || !findQuery.trim()) {
      setFindResults([])
      return
    }
    const timer = setTimeout(async () => {
      setFindLoading(true)
      const q = findQuery.trim()
      const { data } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, bio')
        .or(`username.ilike.%${q}%,full_name.ilike.%${q}%`)
        .neq('id', userId)
        .limit(20)

      if (data) {
        // Exclude existing friends and pending
        const friendIds = new Set(friends.map(f => f.id))
        const sentIds = new Set(pendingSent.map(f => f.id))
        const receivedIds = new Set(pendingReceived.map(f => f.id))
        setFindResults(data.map(u => ({
          ...u,
          isFriend: friendIds.has(u.id),
          isPendingSent: sentIds.has(u.id),
          isPendingReceived: receivedIds.has(u.id)
        })))
      }
      setFindLoading(false)
    }, 300)
    return () => clearTimeout(timer)
  }, [findQuery, activeTab, friends, pendingSent, pendingReceived])

  if (!isOpen) return null

  const handleSendRequest = async (targetUserId) => {
    setSentRequests(prev => ({ ...prev, [targetUserId]: 'sending' }))
    try {
      const { error } = await supabase
        .from('user_friends')
        .insert({ requester_id: userId, addressee_id: targetUserId })
      if (!error) {
        setSentRequests(prev => ({ ...prev, [targetUserId]: 'sent' }))
      } else {
        setSentRequests(prev => ({ ...prev, [targetUserId]: 'error' }))
      }
    } catch {
      setSentRequests(prev => ({ ...prev, [targetUserId]: 'error' }))
    }
  }

  const handleAccept = async (friendshipId) => {
    setActionLoading(true)
    await acceptFriendRequest(friendshipId)
    setActionLoading(false)
  }

  const handleReject = async (friendshipId) => {
    setActionLoading(true)
    await rejectFriendRequest(friendshipId)
    setActionLoading(false)
  }

  const handleCancel = async (friendshipId) => {
    setActionLoading(true)
    await cancelFriendRequest(friendshipId)
    setActionLoading(false)
  }

  const handleRemove = async (friendshipId) => {
    if (window.confirm('Are you sure you want to remove this friend?')) {
      setActionLoading(true)
      await removeFriend(friendshipId)
      setActionLoading(false)
    }
  }

  // Filter based on search
  const filterUsers = (users) => {
    if (!searchQuery.trim()) return users
    const query = searchQuery.toLowerCase()
    return users.filter(
      user =>
        user.username?.toLowerCase().includes(query) ||
        user.full_name?.toLowerCase().includes(query)
    )
  }

  const filteredFriends = filterUsers(friends)
  const filteredReceived = filterUsers(pendingReceived)
  const filteredSent = filterUsers(pendingSent)

  const tabs = [
    { id: 'find', label: 'Find', icon: MagnifyingGlassIcon, count: 0 },
    { id: 'friends', label: 'Friends', icon: UsersIcon, count: friends.length },
    { id: 'received', label: 'Received', icon: InboxIcon, count: pendingReceived.length },
    { id: 'sent', label: 'Sent', icon: PaperAirplaneIcon, count: pendingSent.length }
  ]

  const currentList =
    activeTab === 'friends' ? filteredFriends :
    activeTab === 'received' ? filteredReceived :
    activeTab === 'sent' ? filteredSent :
    []

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
    >
      {/* Backdrop */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)'
        }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        style={{
          position: 'relative',
          backgroundColor: 'white',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '500px',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid #e5e7eb'
          }}
        >
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
            Friends
          </h2>
          <button
            onClick={onClose}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#f3f4f6',
              color: '#6b7280',
              cursor: 'pointer'
            }}
          >
            <XMarkIcon style={{ width: '20px', height: '20px' }} />
          </button>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid #e5e7eb',
            padding: '0 16px'
          }}
        >
          {tabs.map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '12px 16px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: isActive ? '#16a34a' : '#6b7280',
                  fontSize: '14px',
                  fontWeight: isActive ? 600 : 500,
                  cursor: 'pointer',
                  borderBottom: isActive ? '2px solid #16a34a' : '2px solid transparent',
                  marginBottom: '-1px'
                }}
              >
                <Icon style={{ width: '16px', height: '16px' }} />
                {tab.label}
                {tab.count > 0 && (
                  <span
                    style={{
                      minWidth: '20px',
                      height: '20px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '99px',
                      fontSize: '12px',
                      fontWeight: 600,
                      backgroundColor: isActive ? '#dcfce7' : '#f3f4f6',
                      color: isActive ? '#16a34a' : '#6b7280',
                      padding: '0 6px'
                    }}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Search */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
              border: '1px solid #e5e7eb'
            }}
          >
            <MagnifyingGlassIcon style={{ width: '18px', height: '18px', color: '#9ca3af', flexShrink: 0 }} />
            <input
              type="text"
              placeholder={activeTab === 'find' ? 'Search by username or name...' : 'Search...'}
              value={activeTab === 'find' ? findQuery : searchQuery}
              onChange={(e) => activeTab === 'find' ? setFindQuery(e.target.value) : setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                border: 'none',
                backgroundColor: 'transparent',
                outline: 'none',
                fontSize: '14px',
                color: '#111827'
              }}
            />
          </div>
        </div>

        {/* Content */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px'
          }}
        >
          {activeTab === 'find' ? (
            /* Find Friends Tab */
            findLoading ? (
              <div style={{ textAlign: 'center', padding: '32px', color: '#6b7280' }}>
                Searching...
              </div>
            ) : !findQuery.trim() ? (
              <div style={{ textAlign: 'center', padding: '32px' }}>
                <div style={{
                  width: '56px', height: '56px', margin: '0 auto 14px', borderRadius: '50%',
                  backgroundColor: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <UserPlusIcon style={{ width: '28px', height: '28px', color: '#4ade80' }} />
                </div>
                <p style={{ color: '#111827', fontSize: '15px', fontWeight: 600, margin: '0 0 4px' }}>Find friends</p>
                <p style={{ color: '#6b7280', fontSize: '13px', margin: 0 }}>
                  Search by username or name to add friends
                </p>
              </div>
            ) : findResults.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px' }}>
                <div style={{
                  width: '48px', height: '48px', margin: '0 auto 12px', borderRadius: '50%',
                  backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <UsersIcon style={{ width: '24px', height: '24px', color: '#9ca3af' }} />
                </div>
                <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>No users found for "{findQuery}"</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {findResults.map(u => {
                  const reqState = sentRequests[u.id]
                  return (
                    <div
                      key={u.id}
                      style={{
                        backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb',
                        padding: '16px', display: 'flex', alignItems: 'center', gap: '12px'
                      }}
                    >
                      {/* Avatar */}
                      <Link to={`/@${u.username}`} onClick={onClose} style={{ flexShrink: 0 }}>
                        {u.avatar_url ? (
                          <img src={u.avatar_url} alt={u.username} style={{
                            width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #dcfce7'
                          }} />
                        ) : (
                          <div style={{
                            width: '48px', height: '48px', borderRadius: '50%',
                            background: 'linear-gradient(135deg, #4ade80, #16a34a)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #dcfce7'
                          }}>
                            <span style={{ fontSize: '18px', fontWeight: 'bold', color: 'white' }}>
                              {u.username?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </Link>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <Link to={`/@${u.username}`} onClick={onClose} style={{
                          fontWeight: 600, color: '#111827', textDecoration: 'none', display: 'block',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                        }}>
                          {u.full_name || u.username}
                        </Link>
                        <span style={{ fontSize: '13px', color: '#6b7280', display: 'block',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          @{u.username}
                        </span>
                        {u.bio && (
                          <p style={{ fontSize: '12px', color: '#9ca3af', margin: '4px 0 0',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {u.bio}
                          </p>
                        )}
                      </div>

                      {/* Action Button */}
                      <div style={{ flexShrink: 0 }}>
                        {u.isFriend ? (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                            padding: '6px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: 500,
                            backgroundColor: '#dcfce7', color: '#16a34a', border: '1px solid #bbf7d0'
                          }}>
                            Friends
                          </span>
                        ) : u.isPendingSent || reqState === 'sent' ? (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                            padding: '6px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: 500,
                            backgroundColor: '#fffbeb', color: '#b45309', border: '1px solid #fde68a'
                          }}>
                            Pending
                          </span>
                        ) : u.isPendingReceived ? (
                          <Link to={`/@${u.username}`} onClick={onClose} style={{
                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                            padding: '6px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: 500,
                            backgroundColor: '#dbeafe', color: '#2563eb', border: '1px solid #bfdbfe',
                            textDecoration: 'none'
                          }}>
                            Respond
                          </Link>
                        ) : reqState === 'sending' ? (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                            padding: '6px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: 500,
                            backgroundColor: '#f3f4f6', color: '#6b7280'
                          }}>
                            Sending...
                          </span>
                        ) : (
                          <button
                            onClick={() => handleSendRequest(u.id)}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: '4px',
                              padding: '6px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: 500,
                              backgroundColor: '#16a34a', color: 'white', border: 'none', cursor: 'pointer'
                            }}
                          >
                            <UserPlusIcon style={{ width: '14px', height: '14px' }} />
                            Add Friend
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          ) : loading ? (
            <div style={{ textAlign: 'center', padding: '32px', color: '#6b7280' }}>
              Loading...
            </div>
          ) : currentList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  margin: '0 auto 12px',
                  borderRadius: '50%',
                  backgroundColor: '#f3f4f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <UsersIcon style={{ width: '24px', height: '24px', color: '#9ca3af' }} />
              </div>
              <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
                {searchQuery
                  ? 'No results found'
                  : activeTab === 'friends'
                  ? 'No friends yet'
                  : activeTab === 'received'
                  ? 'No pending requests'
                  : 'No sent requests'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {currentList.map(user => (
                <FriendCard
                  key={user.id}
                  user={user}
                  friendshipId={user.friendship_id}
                  type={activeTab === 'friends' ? 'friend' : activeTab === 'received' ? 'received' : 'sent'}
                  onAccept={handleAccept}
                  onReject={handleReject}
                  onCancel={handleCancel}
                  onRemove={handleRemove}
                  actionLoading={actionLoading}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
