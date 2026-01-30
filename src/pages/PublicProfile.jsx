import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ShareIcon,
  CheckIcon,
  LockClosedIcon,
  SparklesIcon,
  FolderIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'
import { usePublicProfile } from '../hooks/usePublicProfile'
import { useAuth } from '../contexts/AuthContext.jsx'
import ProfileSettingsModal from '../components/profile/ProfileSettingsModal'
import FriendRequestButton from '../components/friends/FriendRequestButton'
import FriendsSidebar from '../components/friends/FriendsSidebar'

const iconSize = { width: '20px', height: '20px', flexShrink: 0 }
const iconSmall = { width: '16px', height: '16px', flexShrink: 0 }

export default function PublicProfile() {
  const { username: rawUsername } = useParams()
  const username = rawUsername?.startsWith('@') ? rawUsername.slice(1) : rawUsername
  const { user, profile: currentUserProfile } = useAuth()
  const { profile, collections, top3Jerseys, stats, allKits, loading, error } = usePublicProfile(username)
  const [copied, setCopied] = useState(false)
  const [imageStates, setImageStates] = useState({})
  const [showProfileSettings, setShowProfileSettings] = useState(false)

  const isOwnProfile = user && currentUserProfile?.username === username

  useEffect(() => {
    if (profile) {
      const name = profile.full_name || profile.username
      document.title = `${name} (@${profile.username}) - RecollectKits`
    }
    return () => { document.title = 'RecollectKits' }
  }, [profile])

  const handleShare = async () => {
    const url = window.location.href
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      const t = document.createElement('textarea')
      t.value = url
      document.body.appendChild(t)
      t.select()
      document.execCommand('copy')
      document.body.removeChild(t)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // --- Loading ---
  if (loading) {
    return (
      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '32px', display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{ width: '96px', height: '96px', borderRadius: '50%', backgroundColor: '#e5e7eb' }} />
            <div style={{ flex: 1 }}>
              <div style={{ height: '28px', backgroundColor: '#e5e7eb', borderRadius: '6px', width: '200px', marginBottom: '8px' }} />
              <div style={{ height: '16px', backgroundColor: '#e5e7eb', borderRadius: '6px', width: '280px' }} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {[0,1,2].map(i => (
              <div key={i} style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '16px', textAlign: 'center' }}>
                <div style={{ height: '32px', backgroundColor: '#e5e7eb', borderRadius: '6px', width: '40px', margin: '0 auto 8px' }} />
                <div style={{ height: '14px', backgroundColor: '#e5e7eb', borderRadius: '6px', width: '50px', margin: '0 auto' }} />
              </div>
            ))}
          </div>
        </div>
        <div style={{ width: '280px', flexShrink: 0 }} className="profile-sidebar">
          <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '16px' }}>
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
        </div>
      </div>
    )
  }

  // --- Error / Not Found ---
  if (error || !profile) {
    return (
      <div style={{ textAlign: 'center', padding: '64px 16px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#f3f4f6', marginBottom: '16px' }}>
          <LockClosedIcon style={{ width: '32px', height: '32px', color: '#9ca3af' }} />
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>Profile Not Found</h1>
        <p style={{ color: '#4b5563', marginBottom: '24px' }}>This profile doesn't exist or is set to private.</p>
        <Link to="/jerseys" style={{ display: 'inline-block', padding: '8px 16px', backgroundColor: '#16a34a', color: 'white', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>
          Browse Jerseys
        </Link>
      </div>
    )
  }

  // --- Profile Page ---
  return (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
      {/* Main Content */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Profile Header */}
      <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          {/* Avatar */}
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.username}
              style={{ width: '88px', height: '88px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #dcfce7', flexShrink: 0 }}
            />
          ) : (
            <div style={{
              width: '88px', height: '88px', borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, #4ade80, #16a34a)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '3px solid #dcfce7'
            }}>
              <span style={{ fontSize: '32px', fontWeight: 'bold', color: 'white' }}>
                {profile.username?.charAt(0).toUpperCase()}
              </span>
            </div>
          )}

          {/* Info */}
          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
              {profile.show_full_name !== false && profile.full_name ? (
                <>
                  <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                    {profile.full_name}
                  </h1>
                  <span style={{ fontSize: '16px', color: '#6b7280' }}>@{profile.username}</span>
                </>
              ) : (
                <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                  @{profile.username}
                </h1>
              )}
            </div>

            {profile.bio && (
              <p style={{ color: '#4b5563', margin: '8px 0 0', fontSize: '14px', maxWidth: '480px' }}>{profile.bio}</p>
            )}

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '14px', flexWrap: 'wrap' }}>
              {!isOwnProfile && user && (
                <FriendRequestButton
                  currentUserId={user.id}
                  targetUserId={profile.id}
                />
              )}
              <button
                onClick={handleShare}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '7px 14px', border: '1px solid #d1d5db', borderRadius: '8px',
                  backgroundColor: 'white', color: copied ? '#16a34a' : '#374151',
                  cursor: 'pointer', fontSize: '13px', fontWeight: 500
                }}
              >
                {copied ? (
                  <><CheckIcon style={iconSmall} /> Copied!</>
                ) : (
                  <><ShareIcon style={iconSmall} /> Share Profile</>
                )}
              </button>
              {isOwnProfile && (
                <button
                  onClick={() => setShowProfileSettings(true)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    padding: '7px 14px', border: '1px solid #d1d5db', borderRadius: '8px',
                    backgroundColor: 'white', color: '#374151',
                    cursor: 'pointer', fontSize: '13px', fontWeight: 500
                  }}
                >
                  <Cog6ToothIcon style={iconSmall} /> Profile Settings
                </button>
              )}
              {isOwnProfile && (
                <Link to="/collection" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '7px 14px', backgroundColor: '#16a34a', color: 'white',
                  borderRadius: '8px', textDecoration: 'none', fontSize: '13px', fontWeight: 500
                }}>
                  Manage Collection
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
        {[
          { value: stats.total_jerseys, label: 'Kits' },
          { value: stats.public_collections, label: 'Collections' },
          { value: stats.liked_jerseys, label: 'Liked' }
        ].map((s, i) => (
          <div key={i} style={{
            backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb',
            padding: '16px', textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>{s.value}</div>
            <div style={{ fontSize: '13px', color: '#6b7280' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Top 3 Showcase */}
      {top3Jerseys.length > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, #fffbeb, #fef9c3)',
          borderRadius: '12px', border: '1px solid #fde68a', padding: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <SparklesIcon style={{ width: '22px', height: '22px', color: '#f59e0b' }} />
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827', margin: 0 }}>Top 3 Favorite Kits</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {[0, 1, 2].map((index) => {
              const jersey = top3Jerseys[index]

              if (!jersey) {
                // Empty placeholder slot
                return (
                  <div
                    key={`empty-${index}`}
                    style={{
                      backgroundColor: 'white', borderRadius: '10px',
                      border: '2px dashed #e5e7eb', overflow: 'hidden',
                      position: 'relative', opacity: 0.6
                    }}
                  >
                    {/* Rank Badge */}
                    <div style={{
                      position: 'absolute', top: '8px', left: '8px', zIndex: 2,
                      width: '28px', height: '28px', borderRadius: '50%',
                      backgroundColor: index === 0 ? '#eab308' : index === 1 ? '#9ca3af' : '#d97706',
                      color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '13px', fontWeight: 'bold'
                    }}>
                      {index + 1}
                    </div>

                    {/* Placeholder Image */}
                    <div style={{ height: '160px', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="64" height="72" viewBox="0 0 64 72" fill="none" style={{ opacity: 0.3 }}>
                        <path d="M20 4 L44 4 L52 16 L52 68 L12 68 L12 16 Z" stroke="#9ca3af" strokeWidth="2" fill="none" />
                        <path d="M20 4 L32 12 L44 4" stroke="#9ca3af" strokeWidth="2" fill="none" />
                        <path d="M12 16 L4 24 L4 44 L12 40" stroke="#9ca3af" strokeWidth="2" fill="none" />
                        <path d="M52 16 L60 24 L60 44 L52 40" stroke="#9ca3af" strokeWidth="2" fill="none" />
                        <text x="32" y="48" textAnchor="middle" fill="#9ca3af" fontSize="20" fontWeight="bold">?</text>
                      </svg>
                    </div>

                    {/* Placeholder Info */}
                    <div style={{ padding: '12px', textAlign: 'center' }}>
                      <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0, fontStyle: 'italic' }}>Not yet chosen</p>
                    </div>
                  </div>
                )
              }

              // Filled jersey slot
              return (
                <Link
                  key={jersey.user_jersey_id}
                  to={`/jerseys/${jersey.id}`}
                  style={{
                    backgroundColor: 'white', borderRadius: '10px', border: '1px solid #fde68a',
                    overflow: 'hidden', textDecoration: 'none', color: 'inherit',
                    position: 'relative', display: 'block'
                  }}
                >
                  {/* Rank Badge */}
                  <div style={{
                    position: 'absolute', top: '8px', left: '8px', zIndex: 2,
                    width: '28px', height: '28px', borderRadius: '50%',
                    backgroundColor: index === 0 ? '#eab308' : index === 1 ? '#9ca3af' : '#d97706',
                    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '13px', fontWeight: 'bold'
                  }}>
                    {index + 1}
                  </div>

                  {/* Image */}
                  <div style={{ height: '160px', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                    {jersey.front_image_url ? (
                      <img
                        src={imageStates[jersey.user_jersey_id] ? (jersey.back_image_url || jersey.front_image_url) : jersey.front_image_url}
                        alt={`${jersey.team_name} kit`}
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', padding: '12px' }}
                      />
                    ) : (
                      <span style={{ color: '#9ca3af', fontSize: '13px' }}>No Image</span>
                    )}
                  </div>

                  {/* Front/Back Toggle */}
                  {jersey.front_image_url && jersey.back_image_url && (
                    <div style={{ textAlign: 'center', padding: '6px', borderTop: '1px solid #f3f4f6' }}>
                      <button
                        onClick={(e) => { e.preventDefault(); setImageStates(p => ({ ...p, [jersey.user_jersey_id]: false })) }}
                        style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 500, color: !imageStates[jersey.user_jersey_id] ? '#2563eb' : '#9ca3af', padding: '2px 6px' }}
                      >Front</button>
                      <span style={{ color: '#d1d5db', margin: '0 4px' }}>|</span>
                      <button
                        onClick={(e) => { e.preventDefault(); setImageStates(p => ({ ...p, [jersey.user_jersey_id]: true })) }}
                        style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 500, color: imageStates[jersey.user_jersey_id] ? '#2563eb' : '#9ca3af', padding: '2px 6px' }}
                      >Back</button>
                    </div>
                  )}

                  {/* Info */}
                  <div style={{ padding: '12px' }}>
                    <h3 style={{ fontWeight: 600, color: '#111827', margin: '0 0 4px', fontSize: '14px' }}>{jersey.team_name}</h3>
                    <p style={{ fontSize: '13px', color: '#4b5563', margin: 0 }}>
                      {jersey.player_name && <span>{jersey.player_name} - </span>}
                      {jersey.season}
                    </p>
                    <div style={{ display: 'flex', gap: '4px', marginTop: '8px', flexWrap: 'wrap' }}>
                      <span style={{
                        padding: '2px 8px', borderRadius: '99px', fontSize: '11px', fontWeight: 500,
                        backgroundColor: jersey.kit_type === 'international' ? '#f3e8ff' : '#dcfce7',
                        color: jersey.kit_type === 'international' ? '#7c3aed' : '#16a34a'
                      }}>
                        {jersey.kit_type === 'international' ? 'International' : 'Club'}
                      </span>
                      {jersey.jersey_type && (
                        <span style={{ padding: '2px 8px', borderRadius: '99px', fontSize: '11px', fontWeight: 500, backgroundColor: '#dbeafe', color: '#2563eb', textTransform: 'capitalize' }}>
                          {jersey.jersey_type}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Public Collections */}
      {collections.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <FolderIcon style={{ width: '22px', height: '22px', color: '#6b7280' }} />
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827', margin: 0 }}>Public Collections</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
            {collections.map((collection) => (
              <div key={collection.id} style={{ backgroundColor: 'white', borderRadius: '10px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                {/* Thumbnails */}
                <div style={{ height: '100px', backgroundColor: '#f3f4f6', display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: '2px', padding: '2px', overflow: 'hidden' }}>
                  {collection.thumbnail_urls?.slice(0, 4).map((url, i) => (
                    <div key={i} style={{ backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '4px' }} />
                    </div>
                  ))}
                  {/* Fill empty slots */}
                  {collection.thumbnail_urls && collection.thumbnail_urls.length > 0 && collection.thumbnail_urls.length < 4 && (
                    [...Array(4 - collection.thumbnail_urls.length)].map((_, i) => (
                      <div key={`empty-${i}`} style={{ backgroundColor: '#f9fafb' }} />
                    ))
                  )}
                  {(!collection.thumbnail_urls || collection.thumbnail_urls.length === 0) && (
                    <div style={{ gridColumn: 'span 2', gridRow: 'span 2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FolderIcon style={{ width: '32px', height: '32px', color: '#d1d5db' }} />
                    </div>
                  )}
                </div>
                <div style={{ padding: '12px' }}>
                  <h3 style={{ fontWeight: 600, color: '#111827', margin: '0 0 4px', fontSize: '14px' }}>{collection.name}</h3>
                  {collection.description && (
                    <p style={{ fontSize: '13px', color: '#4b5563', margin: '0 0 6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{collection.description}</p>
                  )}
                  <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
                    {collection.jersey_count} {collection.jersey_count === 1 ? 'kit' : 'kits'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Kits */}
      {allKits.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827', margin: 0 }}>All Kits</h2>
            <span style={{ fontSize: '14px', color: '#6b7280' }}>({allKits.length})</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
            {allKits.map((userJersey) => {
              const jersey = userJersey.public_jersey
              return (
                <Link
                  key={userJersey.id}
                  to={`/jerseys/${jersey?.id}`}
                  style={{
                    backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb',
                    overflow: 'hidden', textDecoration: 'none', color: 'inherit', display: 'block'
                  }}
                >
                  <div style={{ height: '120px', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {jersey?.front_image_url ? (
                      <img src={jersey.front_image_url} alt={`${jersey.team_name} kit`} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', padding: '8px' }} />
                    ) : (
                      <span style={{ color: '#9ca3af', fontSize: '12px' }}>No Image</span>
                    )}
                  </div>
                  <div style={{ padding: '8px 10px' }}>
                    <h3 style={{ fontWeight: 500, fontSize: '13px', color: '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{jersey?.team_name}</h3>
                    <p style={{ fontSize: '12px', color: '#6b7280', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {jersey?.player_name && `${jersey.player_name} - `}{jersey?.season}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {collections.length === 0 && allKits.length === 0 && top3Jerseys.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 16px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <div style={{ width: '48px', height: '48px', margin: '0 auto 16px', color: '#d1d5db' }}>
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '100%', height: '100%' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 style={{ fontSize: '16px', fontWeight: 500, color: '#111827', marginBottom: '8px' }}>No public content yet</h3>
          <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
            {isOwnProfile
              ? "Make some of your collections public to share them with others!"
              : "This user hasn't shared any public collections yet."}
          </p>
        </div>
      )}

      </div>

      {/* Right Sidebar - Friends */}
      <div style={{
        width: '280px',
        flexShrink: 0,
        position: 'sticky',
        top: '24px'
      }} className="profile-sidebar">
        <FriendsSidebar
          profileUserId={profile.id}
          currentUserId={user?.id}
          isOwnProfile={isOwnProfile}
        />
      </div>

      {/* Profile Settings Modal */}
      <ProfileSettingsModal
        isOpen={showProfileSettings}
        onClose={() => setShowProfileSettings(false)}
      />
    </div>
  )
}
