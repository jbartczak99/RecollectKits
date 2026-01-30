import { useState } from 'react'
import { XMarkIcon, MagnifyingGlassIcon, UsersIcon, InboxIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline'
import FriendCard from './FriendCard'
import { useFriends } from '../../hooks/useFriends'

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

  const {
    friends,
    pendingReceived,
    pendingSent,
    loading,
    acceptFriendRequest,
    rejectFriendRequest,
    cancelFriendRequest,
    removeFriend
  } = useFriends(userId)

  if (!isOpen) return null

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
    { id: 'friends', label: 'Friends', icon: UsersIcon, count: friends.length },
    { id: 'received', label: 'Received', icon: InboxIcon, count: pendingReceived.length },
    { id: 'sent', label: 'Sent', icon: PaperAirplaneIcon, count: pendingSent.length }
  ]

  const currentList =
    activeTab === 'friends' ? filteredFriends :
    activeTab === 'received' ? filteredReceived :
    filteredSent

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
            <MagnifyingGlassIcon style={{ width: '18px', height: '18px', color: '#9ca3af' }} />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
          {loading ? (
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
