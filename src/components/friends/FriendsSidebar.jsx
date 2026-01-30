import { useState } from 'react'
import { Link } from 'react-router-dom'
import { UsersIcon, UserPlusIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { useFriends } from '../../hooks/useFriends'
import FriendsListModal from './FriendsListModal'

/**
 * Sidebar component for displaying friends on a profile page
 * @param {Object} props
 * @param {string} props.profileUserId - The profile owner's user ID
 * @param {string} props.currentUserId - The logged-in user's ID (if any)
 * @param {boolean} props.isOwnProfile - Whether viewing own profile
 */
export default function FriendsSidebar({ profileUserId, currentUserId, isOwnProfile }) {
  const [showModal, setShowModal] = useState(false)
  const [modalInitialTab, setModalInitialTab] = useState('friends')

  const {
    friends,
    pendingReceived,
    pendingSent,
    loading,
    acceptFriendRequest,
    rejectFriendRequest
  } = useFriends(profileUserId)

  const openModal = (tab = 'friends') => {
    setModalInitialTab(tab)
    setShowModal(true)
  }

  const handleAccept = async (friendshipId) => {
    await acceptFriendRequest(friendshipId)
  }

  const handleReject = async (friendshipId) => {
    await rejectFriendRequest(friendshipId)
  }

  // Show up to 6 friends in the sidebar
  const displayedFriends = friends.slice(0, 6)
  const hasMoreFriends = friends.length > 6

  if (loading) {
    return (
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        padding: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <div style={{ width: '20px', height: '20px', backgroundColor: '#e5e7eb', borderRadius: '4px' }} />
          <div style={{ width: '80px', height: '18px', backgroundColor: '#e5e7eb', borderRadius: '4px' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#e5e7eb', margin: '0 auto 6px' }} />
              <div style={{ width: '50px', height: '12px', backgroundColor: '#e5e7eb', borderRadius: '4px', margin: '0 auto' }} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 16px',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UsersIcon style={{ width: '20px', height: '20px', color: '#16a34a' }} />
            <span style={{ fontWeight: 600, color: '#111827', fontSize: '15px' }}>Friends</span>
            <span style={{
              backgroundColor: '#f3f4f6',
              color: '#6b7280',
              padding: '2px 8px',
              borderRadius: '99px',
              fontSize: '12px',
              fontWeight: 500
            }}>
              {friends.length}
            </span>
          </div>
          {friends.length > 0 && (
            <button
              onClick={() => openModal('friends')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
                color: '#16a34a',
                fontSize: '13px',
                fontWeight: 500,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: '6px'
              }}
            >
              See All
              <ChevronRightIcon style={{ width: '14px', height: '14px' }} />
            </button>
          )}
        </div>

        {/* Pending Requests Alert (only for own profile) */}
        {isOwnProfile && pendingReceived.length > 0 && (
          <button
            onClick={() => openModal('received')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 16px',
              backgroundColor: '#fffbeb',
              border: 'none',
              borderBottom: '1px solid #fde68a',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#fef3c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <UserPlusIcon style={{ width: '16px', height: '16px', color: '#d97706' }} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 600, color: '#92400e', margin: 0, fontSize: '13px' }}>
                {pendingReceived.length} pending request{pendingReceived.length > 1 ? 's' : ''}
              </p>
            </div>
            <ChevronRightIcon style={{ width: '16px', height: '16px', color: '#d97706' }} />
          </button>
        )}

        {/* Friends Grid */}
        <div style={{ padding: '16px' }}>
          {friends.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: '#f3f4f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px'
              }}>
                <UsersIcon style={{ width: '24px', height: '24px', color: '#9ca3af' }} />
              </div>
              <p style={{ color: '#6b7280', fontSize: '13px', margin: 0 }}>
                {isOwnProfile ? 'No friends yet' : 'No friends to show'}
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '12px'
            }}>
              {displayedFriends.map(friend => (
                <Link
                  key={friend.id}
                  to={`/@${friend.username}`}
                  style={{
                    textAlign: 'center',
                    textDecoration: 'none',
                    color: 'inherit'
                  }}
                >
                  {friend.avatar_url ? (
                    <img
                      src={friend.avatar_url}
                      alt={friend.username}
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '2px solid #dcfce7',
                        margin: '0 auto 6px',
                        display: 'block'
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #4ade80, #16a34a)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid #dcfce7',
                      margin: '0 auto 6px'
                    }}>
                      <span style={{ fontSize: '16px', fontWeight: 'bold', color: 'white' }}>
                        {friend.username?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <p style={{
                    fontSize: '12px',
                    color: '#374151',
                    margin: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontWeight: 500
                  }}>
                    {friend.full_name || friend.username}
                  </p>
                </Link>
              ))}
            </div>
          )}

          {hasMoreFriends && (
            <button
              onClick={() => openModal('friends')}
              style={{
                width: '100%',
                marginTop: '12px',
                padding: '10px',
                backgroundColor: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                color: '#374151',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              View all {friends.length} friends
            </button>
          )}
        </div>
      </div>

      {/* Friends Modal */}
      {isOwnProfile && (
        <FriendsListModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          userId={profileUserId}
          initialTab={modalInitialTab}
        />
      )}
    </>
  )
}
