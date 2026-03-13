import { useState } from 'react'
import { Link } from 'react-router-dom'
import { UsersIcon, UserPlusIcon, ChevronRightIcon, MagnifyingGlassIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'
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
  const [activeTab, setActiveTab] = useState('friends')
  const [actionLoadingId, setActionLoadingId] = useState(null)

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
    setActionLoadingId(friendshipId)
    await acceptFriendRequest(friendshipId)
    setActionLoadingId(null)
  }

  const handleReject = async (friendshipId) => {
    setActionLoadingId(friendshipId)
    await rejectFriendRequest(friendshipId)
    setActionLoadingId(null)
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
        {/* Tabs - only show for own profile */}
        {isOwnProfile ? (
          <div style={{
            display: 'flex',
            borderBottom: '1px solid #e5e7eb'
          }}>
            <button
              onClick={() => setActiveTab('friends')}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '12px 8px',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 600,
                color: activeTab === 'friends' ? '#16a34a' : '#6b7280',
                borderBottom: activeTab === 'friends' ? '2px solid #16a34a' : '2px solid transparent',
                marginBottom: '-1px'
              }}
            >
              <UsersIcon style={{ width: '16px', height: '16px' }} />
              Friends
              <span style={{
                backgroundColor: activeTab === 'friends' ? '#dcfce7' : '#f3f4f6',
                color: activeTab === 'friends' ? '#16a34a' : '#6b7280',
                padding: '1px 7px',
                borderRadius: '99px',
                fontSize: '11px',
                fontWeight: 600
              }}>
                {friends.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '12px 8px',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 600,
                color: activeTab === 'requests' ? '#7c3aed' : '#6b7280',
                borderBottom: activeTab === 'requests' ? '2px solid #7c3aed' : '2px solid transparent',
                marginBottom: '-1px'
              }}
            >
              <UserPlusIcon style={{ width: '16px', height: '16px' }} />
              Requests
              {pendingReceived.length > 0 && (
                <span style={{
                  backgroundColor: activeTab === 'requests' ? '#f3e8ff' : '#fef2f2',
                  color: activeTab === 'requests' ? '#7c3aed' : '#ef4444',
                  padding: '1px 7px',
                  borderRadius: '99px',
                  fontSize: '11px',
                  fontWeight: 600
                }}>
                  {pendingReceived.length}
                </span>
              )}
            </button>
          </div>
        ) : (
          /* Header for visitors (no tabs) */
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
        )}

        {/* Friends Tab Content */}
        {(activeTab === 'friends' || !isOwnProfile) && (
          <>
            {/* Find Friends Button (own profile only) */}
            {isOwnProfile && (
              <button
                onClick={() => openModal('find')}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 16px',
                  backgroundColor: '#f0fdf4',
                  border: 'none',
                  borderBottom: '1px solid #e5e7eb',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  <MagnifyingGlassIcon style={{ width: '16px', height: '16px', color: '#16a34a' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, color: '#166534', margin: 0, fontSize: '13px' }}>Find friends</p>
                </div>
                <ChevronRightIcon style={{ width: '16px', height: '16px', color: '#16a34a' }} />
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
                  <p style={{ color: '#6b7280', fontSize: '13px', margin: '0 0 12px' }}>
                    {isOwnProfile ? 'No friends yet' : 'No friends to show'}
                  </p>
                  {isOwnProfile && (
                    <button
                      onClick={() => openModal('find')}
                      style={{
                        padding: '8px 16px', backgroundColor: '#16a34a', color: 'white',
                        borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: 500, cursor: 'pointer',
                        display: 'inline-flex', alignItems: 'center', gap: '6px'
                      }}
                    >
                      <UserPlusIcon style={{ width: '14px', height: '14px' }} />
                      Find Friends
                    </button>
                  )}
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
          </>
        )}

        {/* Requests Tab Content (own profile only) */}
        {isOwnProfile && activeTab === 'requests' && (
          <div style={{ padding: '12px' }}>
            {pendingReceived.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
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
                  <UserPlusIcon style={{ width: '24px', height: '24px', color: '#9ca3af' }} />
                </div>
                <p style={{ color: '#6b7280', fontSize: '13px', margin: 0 }}>
                  No pending requests
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {pendingReceived.map(request => (
                  <div
                    key={request.friendship_id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px',
                      borderRadius: '10px',
                      backgroundColor: '#faf5ff',
                      border: '1px solid #e9d5ff'
                    }}
                  >
                    {/* Avatar */}
                    <Link to={`/@${request.username}`} style={{ flexShrink: 0 }}>
                      {request.avatar_url ? (
                        <img
                          src={request.avatar_url}
                          alt={request.username}
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '2px solid #e9d5ff',
                            display: 'block'
                          }}
                        />
                      ) : (
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #a78bfa, #7c3aed)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '2px solid #e9d5ff'
                        }}>
                          <span style={{ fontSize: '14px', fontWeight: 'bold', color: 'white' }}>
                            {request.username?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </Link>

                    {/* Name */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Link
                        to={`/@${request.username}`}
                        style={{
                          fontSize: '13px',
                          fontWeight: 600,
                          color: '#111827',
                          textDecoration: 'none',
                          display: 'block',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {request.full_name || request.username}
                      </Link>
                      <p style={{
                        fontSize: '11px',
                        color: '#9ca3af',
                        margin: '1px 0 0'
                      }}>
                        @{request.username}
                      </p>
                    </div>

                    {/* Accept / Reject buttons */}
                    <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                      <button
                        onClick={() => handleAccept(request.friendship_id)}
                        disabled={actionLoadingId === request.friendship_id}
                        title="Accept"
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          border: 'none',
                          backgroundColor: '#16a34a',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: actionLoadingId === request.friendship_id ? 'not-allowed' : 'pointer',
                          opacity: actionLoadingId === request.friendship_id ? 0.6 : 1
                        }}
                      >
                        <CheckIcon style={{ width: '16px', height: '16px' }} />
                      </button>
                      <button
                        onClick={() => handleReject(request.friendship_id)}
                        disabled={actionLoadingId === request.friendship_id}
                        title="Reject"
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          border: '1px solid #fecaca',
                          backgroundColor: '#fef2f2',
                          color: '#ef4444',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: actionLoadingId === request.friendship_id ? 'not-allowed' : 'pointer',
                          opacity: actionLoadingId === request.friendship_id ? 0.6 : 1
                        }}
                      >
                        <XMarkIcon style={{ width: '16px', height: '16px' }} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Sent requests section */}
            {pendingSent.length > 0 && (
              <div style={{ marginTop: '16px' }}>
                <p style={{ fontSize: '11px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 8px', padding: '0 4px' }}>
                  Sent
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {pendingSent.map(request => (
                    <div
                      key={request.friendship_id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        backgroundColor: '#fffbeb',
                        border: '1px solid #fde68a'
                      }}
                    >
                      <Link to={`/@${request.username}`} style={{ flexShrink: 0 }}>
                        {request.avatar_url ? (
                          <img
                            src={request.avatar_url}
                            alt={request.username}
                            style={{
                              width: '32px', height: '32px', borderRadius: '50%',
                              objectFit: 'cover', border: '2px solid #fde68a', display: 'block'
                            }}
                          />
                        ) : (
                          <div style={{
                            width: '32px', height: '32px', borderRadius: '50%',
                            background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            border: '2px solid #fde68a'
                          }}>
                            <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'white' }}>
                              {request.username?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </Link>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <Link
                          to={`/@${request.username}`}
                          style={{
                            fontSize: '12px', fontWeight: 600, color: '#111827',
                            textDecoration: 'none', overflow: 'hidden',
                            textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block'
                          }}
                        >
                          {request.full_name || request.username}
                        </Link>
                      </div>
                      <span style={{ fontSize: '11px', color: '#b45309', fontWeight: 500, flexShrink: 0 }}>
                        Pending
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Friends Modal */}
      {currentUserId && (
        <FriendsListModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          userId={isOwnProfile ? profileUserId : currentUserId}
          initialTab={modalInitialTab}
        />
      )}
    </>
  )
}
