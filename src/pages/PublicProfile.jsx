import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ShareIcon,
  CheckIcon,
  LockClosedIcon,
  SparklesIcon,
  FolderIcon,
  Cog6ToothIcon,
  StarIcon,
  TrophyIcon
} from '@heroicons/react/24/outline'
import { usePublicProfile } from '../hooks/usePublicProfile'
import { useAuth } from '../contexts/AuthContext.jsx'
import ProfileSettingsModal from '../components/profile/ProfileSettingsModal'
import { CreatorFounderBadge, CreatorFounderPill, CreatorFounderAvatar } from '../components/profile/CreatorFounderBadge'
import FriendRequestButton from '../components/friends/FriendRequestButton'
import FriendsSidebar from '../components/friends/FriendsSidebar'

const iconSize = { width: '20px', height: '20px', flexShrink: 0 }
const iconSmall = { width: '16px', height: '16px', flexShrink: 0 }

export default function PublicProfile() {
  const { username: rawUsername } = useParams()
  const username = rawUsername?.startsWith('@') ? rawUsername.slice(1) : rawUsername
  const { user, profile: currentUserProfile } = useAuth()
  const { profile, collections, top3Jerseys, dreamKits, badges, stats, allKits, loading, error } = usePublicProfile(username, user?.id)
  const [copied, setCopied] = useState(false)
  const [imageStates, setImageStates] = useState({})
  const [showProfileSettings, setShowProfileSettings] = useState(false)
  const [settingsTab, setSettingsTab] = useState('profile')
  const [selectedBadge, setSelectedBadge] = useState(null)

  const openSettings = (tab = 'profile') => {
    setSettingsTab(tab)
    setShowProfileSettings(true)
  }

  const isOwnProfile = user && currentUserProfile?.username === username
  const isFounder = username === 'jbartczak'

  // Avatar border based on subscription tier
  const getAvatarBorder = () => {
    if (isFounder) return null // founder uses CreatorFounderAvatar
    const tier = profile?.subscription_tier
    if (tier === 'creator') return { border: '3px solid #ef4444', boxShadow: '0 0 12px rgba(239,68,68,0.3)' }
    if (tier === 'pro') return { border: '3px solid #3b82f6', boxShadow: '0 0 12px rgba(59,130,246,0.3)' }
    return { border: 'none' } // free tier
  }

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
          {isFounder ? (
            <CreatorFounderAvatar
              initials={profile.username?.charAt(0).toUpperCase()}
              imageSrc={profile.avatar_url || null}
            />
          ) : profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.username}
              style={{ width: '88px', height: '88px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0, ...getAvatarBorder() }}
            />
          ) : (
            <div style={{
              width: '88px', height: '88px', borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, #4ade80, #16a34a)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              ...getAvatarBorder()
            }}>
              <span style={{ fontSize: '32px', fontWeight: 'bold', color: 'white' }}>
                {profile.username?.charAt(0).toUpperCase()}
              </span>
            </div>
          )}

          {/* Info */}
          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
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
              {isFounder && <CreatorFounderPill />}
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
                  onClick={() => openSettings('profile')}
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

      {/* Badges */}
      {(badges.length > 0 || isOwnProfile || isFounder) && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <TrophyIcon style={{ width: '22px', height: '22px', color: '#f59e0b' }} />
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827', margin: 0 }}>Badges</h2>
            {(badges.length > 0 || isFounder) && (
              <span style={{ fontSize: '13px', color: '#6b7280' }}>({badges.length + (isFounder ? 1 : 0)})</span>
            )}
          </div>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
            {/* Creator & Founder badge - only for founder */}
            {isFounder && (
              <button
                onClick={() => setSelectedBadge({
                  id: 'founder',
                  name: 'Creator & Founder',
                  icon: null,
                  rarity: 'mythic',
                  description: 'Awarded to the visionary who created RecollectKits from the ground up. This one-of-a-kind badge recognizes the original founder who turned a passion for jersey collecting into a thriving community platform. There will only ever be one.',
                  awarded_at: '2025-07-24T22:56:28-04:00',
                  isFounderBadge: true
                })}
                style={{ textAlign: 'center', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
              >
                <CreatorFounderBadge size={160} />
              </button>
            )}

            {/* DB-driven badges */}
            {badges.length > 0 && badges.map((badge) => {
              const rarityColors = {
                common: { bg: '#f3f4f6', border: '#d1d5db', text: '#374151' },
                uncommon: { bg: '#dcfce7', border: '#86efac', text: '#166534' },
                rare: { bg: '#dbeafe', border: '#93c5fd', text: '#1e40af' },
                epic: { bg: '#f3e8ff', border: '#c084fc', text: '#6b21a8' },
                legendary: { bg: '#fef9c3', border: '#fde047', text: '#854d0e' }
              }
              const colors = rarityColors[badge.rarity] || rarityColors.common

              return (
                <button
                  key={badge.id}
                  onClick={() => setSelectedBadge(badge)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    padding: '12px 16px', borderRadius: '12px',
                    backgroundColor: colors.bg, border: `1px solid ${colors.border}`,
                    minWidth: '80px', cursor: 'pointer',
                    transition: 'transform 0.15s, box-shadow 0.15s'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)' }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none' }}
                >
                  <span style={{ fontSize: '28px', lineHeight: 1 }}>{badge.icon || '🏆'}</span>
                  <span style={{
                    fontSize: '11px', fontWeight: 600, color: colors.text,
                    marginTop: '6px', textAlign: 'center', lineHeight: 1.2,
                    maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis',
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'
                  }}>
                    {badge.name}
                  </span>
                  <span style={{
                    fontSize: '9px', fontWeight: 500, color: colors.text, opacity: 0.7,
                    marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.5px'
                  }}>
                    {badge.rarity}
                  </span>
                </button>
              )
            })}
          </div>

          {badges.length === 0 && !isFounder && (
            <div style={{
              backgroundColor: '#f9fafb', borderRadius: '12px', border: '2px dashed #e5e7eb',
              padding: '32px', textAlign: 'center'
            }}>
              <TrophyIcon style={{ width: '36px', height: '36px', color: '#d1d5db', margin: '0 auto 8px' }} />
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>No badges earned yet</p>
              <p style={{ fontSize: '12px', color: '#9ca3af', margin: '4px 0 0' }}>Badges are earned by completing actions on RecollectKits</p>
            </div>
          )}
        </div>
      )}

      {/* Top 3 Showcase - show for owner always, for visitors only if they have selections */}
      {(isOwnProfile || top3Jerseys.length > 0) && (
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
                // Empty placeholder slot — clickable for owner to open settings
                const Wrapper = isOwnProfile ? 'button' : 'div'
                return (
                  <Wrapper
                    key={`empty-${index}`}
                    {...(isOwnProfile ? { onClick: () => openSettings('top3') } : {})}
                    style={{
                      backgroundColor: 'white', borderRadius: '10px',
                      border: '2px dashed #e5e7eb', overflow: 'hidden',
                      position: 'relative', opacity: 0.6,
                      cursor: isOwnProfile ? 'pointer' : 'default',
                      padding: 0, textAlign: 'left', display: 'block', width: '100%'
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
                      <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0, fontStyle: 'italic' }}>
                        {isOwnProfile ? 'Click to choose' : 'Not yet chosen'}
                      </p>
                    </div>
                  </Wrapper>
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

      {/* Dream Kits - show for owner always, for visitors only if they have selections */}
      {(isOwnProfile || dreamKits.length > 0) && (
        <div style={{
          background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
          borderRadius: '12px', border: '1px solid #bfdbfe', padding: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <StarIcon style={{ width: '22px', height: '22px', color: '#2563eb' }} />
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827', margin: 0 }}>Top 3 Dream Kits</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {[0, 1, 2].map((index) => {
              const jersey = dreamKits[index]

              if (!jersey) {
                const Wrapper = isOwnProfile ? 'button' : 'div'
                return (
                  <Wrapper
                    key={`dream-empty-${index}`}
                    {...(isOwnProfile ? { onClick: () => openSettings('dreamkits') } : {})}
                    style={{
                      backgroundColor: 'white', borderRadius: '10px',
                      border: '2px dashed #bfdbfe', overflow: 'hidden',
                      position: 'relative', opacity: 0.6,
                      cursor: isOwnProfile ? 'pointer' : 'default',
                      padding: 0, textAlign: 'left', display: 'block', width: '100%'
                    }}
                  >
                    <div style={{
                      position: 'absolute', top: '8px', left: '8px', zIndex: 2,
                      width: '28px', height: '28px', borderRadius: '50%',
                      backgroundColor: index === 0 ? '#2563eb' : index === 1 ? '#60a5fa' : '#93c5fd',
                      color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '13px', fontWeight: 'bold'
                    }}>
                      {index + 1}
                    </div>
                    <div style={{ height: '160px', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="64" height="72" viewBox="0 0 64 72" fill="none" style={{ opacity: 0.3 }}>
                        <path d="M20 4 L44 4 L52 16 L52 68 L12 68 L12 16 Z" stroke="#93c5fd" strokeWidth="2" fill="none" />
                        <path d="M20 4 L32 12 L44 4" stroke="#93c5fd" strokeWidth="2" fill="none" />
                        <path d="M12 16 L4 24 L4 44 L12 40" stroke="#93c5fd" strokeWidth="2" fill="none" />
                        <path d="M52 16 L60 24 L60 44 L52 40" stroke="#93c5fd" strokeWidth="2" fill="none" />
                        <text x="32" y="48" textAnchor="middle" fill="#93c5fd" fontSize="20" fontWeight="bold">?</text>
                      </svg>
                    </div>
                    <div style={{ padding: '12px', textAlign: 'center' }}>
                      <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0, fontStyle: 'italic' }}>
                        {isOwnProfile ? 'Click to choose' : 'Not yet chosen'}
                      </p>
                    </div>
                  </Wrapper>
                )
              }

              return (
                <Link
                  key={jersey.id}
                  to={`/jerseys/${jersey.id}`}
                  style={{
                    backgroundColor: 'white', borderRadius: '10px', border: '1px solid #bfdbfe',
                    overflow: 'hidden', textDecoration: 'none', color: 'inherit',
                    position: 'relative', display: 'block'
                  }}
                >
                  <div style={{
                    position: 'absolute', top: '8px', left: '8px', zIndex: 2,
                    width: '28px', height: '28px', borderRadius: '50%',
                    backgroundColor: index === 0 ? '#2563eb' : index === 1 ? '#60a5fa' : '#93c5fd',
                    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '13px', fontWeight: 'bold'
                  }}>
                    {index + 1}
                  </div>

                  <div style={{ height: '160px', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                    {jersey.front_image_url ? (
                      <img
                        src={imageStates[`dream-${jersey.id}`] ? (jersey.back_image_url || jersey.front_image_url) : jersey.front_image_url}
                        alt={`${jersey.team_name} kit`}
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', padding: '12px' }}
                      />
                    ) : (
                      <span style={{ color: '#9ca3af', fontSize: '13px' }}>No Image</span>
                    )}
                  </div>

                  {jersey.front_image_url && jersey.back_image_url && (
                    <div style={{ textAlign: 'center', padding: '6px', borderTop: '1px solid #f3f4f6' }}>
                      <button
                        onClick={(e) => { e.preventDefault(); setImageStates(p => ({ ...p, [`dream-${jersey.id}`]: false })) }}
                        style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 500, color: !imageStates[`dream-${jersey.id}`] ? '#2563eb' : '#9ca3af', padding: '2px 6px' }}
                      >Front</button>
                      <span style={{ color: '#d1d5db', margin: '0 4px' }}>|</span>
                      <button
                        onClick={(e) => { e.preventDefault(); setImageStates(p => ({ ...p, [`dream-${jersey.id}`]: true })) }}
                        style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 500, color: imageStates[`dream-${jersey.id}`] ? '#2563eb' : '#9ca3af', padding: '2px 6px' }}
                      >Back</button>
                    </div>
                  )}

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

      {/* Badge Detail Modal */}
      {selectedBadge && (() => {
        const tierConfig = {
          common: { label: 'Common', bg: '#f3f4f6', border: '#d1d5db', text: '#374151', glow: 'none', gradient: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)' },
          uncommon: { label: 'Uncommon', bg: '#dcfce7', border: '#86efac', text: '#166534', glow: '0 0 20px rgba(34,197,94,0.2)', gradient: 'linear-gradient(135deg, #dcfce7, #bbf7d0)' },
          rare: { label: 'Rare', bg: '#dbeafe', border: '#93c5fd', text: '#1e40af', glow: '0 0 20px rgba(59,130,246,0.25)', gradient: 'linear-gradient(135deg, #dbeafe, #bfdbfe)' },
          epic: { label: 'Epic', bg: '#f3e8ff', border: '#c084fc', text: '#6b21a8', glow: '0 0 24px rgba(168,85,247,0.3)', gradient: 'linear-gradient(135deg, #f3e8ff, #e9d5ff)' },
          legendary: { label: 'Legendary', bg: '#fef9c3', border: '#fde047', text: '#854d0e', glow: '0 0 28px rgba(234,179,8,0.35)', gradient: 'linear-gradient(135deg, #fef9c3, #fde68a)' },
          mythic: { label: 'Mythic', bg: '#1a0533', border: '#c084fc', text: '#e9d5ff', glow: '0 0 40px rgba(168,85,247,0.5), 0 0 80px rgba(245,158,11,0.3)', gradient: 'linear-gradient(135deg, #2e1065, #4c1d95, #1e1b4b)' }
        }
        const tier = tierConfig[selectedBadge.rarity] || tierConfig.common
        const isMythic = selectedBadge.rarity === 'mythic'

        return (
          <div
            onClick={() => setSelectedBadge(null)}
            style={{
              position: 'fixed', inset: 0, zIndex: 9999,
              backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '16px'
            }}
          >
            <div
              onClick={e => e.stopPropagation()}
              style={{
                background: isMythic
                  ? 'linear-gradient(145deg, #1a0533 0%, #2e1065 30%, #4c1d95 60%, #1e1b4b 100%)'
                  : 'white',
                borderRadius: '20px',
                border: `2px solid ${tier.border}`,
                boxShadow: tier.glow !== 'none' ? tier.glow : '0 20px 60px rgba(0,0,0,0.15)',
                maxWidth: '400px', width: '100%',
                overflow: 'hidden',
                position: 'relative'
              }}
            >
              {/* Tier banner */}
              <div style={{
                background: tier.gradient,
                padding: '12px 24px',
                borderBottom: `1px solid ${tier.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
              }}>
                <span style={{
                  fontSize: '11px', fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: '2px', color: tier.text
                }}>
                  {isMythic ? '✦ ' : ''}{tier.label} Tier{isMythic ? ' ✦' : ''}
                </span>
                <button
                  onClick={() => setSelectedBadge(null)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: '20px', lineHeight: 1, color: tier.text, padding: '0 4px'
                  }}
                >
                  ×
                </button>
              </div>

              {/* Badge display */}
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                padding: '32px 24px 24px'
              }}>
                {selectedBadge.isFounderBadge ? (
                  <CreatorFounderBadge size={180} />
                ) : (
                  <div style={{
                    width: '96px', height: '96px', borderRadius: '50%',
                    background: tier.gradient, border: `3px solid ${tier.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '48px', boxShadow: tier.glow !== 'none' ? tier.glow : undefined
                  }}>
                    {selectedBadge.icon || '🏆'}
                  </div>
                )}

                <h3 style={{
                  fontSize: '20px', fontWeight: 700, margin: '20px 0 4px',
                  color: isMythic ? '#e9d5ff' : '#111827', textAlign: 'center'
                }}>
                  {selectedBadge.name}
                </h3>

                {/* Rarity pill */}
                <span style={{
                  display: 'inline-block', padding: '4px 14px', borderRadius: '99px',
                  fontSize: '11px', fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: '1.5px', marginBottom: '16px',
                  backgroundColor: isMythic ? 'rgba(192,132,252,0.2)' : tier.bg,
                  color: tier.text,
                  border: `1px solid ${tier.border}`
                }}>
                  {tier.label}
                </span>

                {/* Description */}
                <p style={{
                  fontSize: '14px', lineHeight: 1.6, textAlign: 'center', margin: '0 0 20px',
                  color: isMythic ? '#c4b5fd' : '#4b5563'
                }}>
                  {selectedBadge.description || 'No description available.'}
                </p>

                {/* Earned date */}
                {selectedBadge.awarded_at && (
                  <div style={{
                    fontSize: '12px', color: isMythic ? '#8b5cf6' : '#9ca3af',
                    display: 'flex', alignItems: 'center', gap: '6px'
                  }}>
                    <TrophyIcon style={{ width: '14px', height: '14px' }} />
                    Earned {new Date(selectedBadge.awarded_at).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })()}

      {/* Profile Settings Modal */}
      <ProfileSettingsModal
        isOpen={showProfileSettings}
        onClose={() => setShowProfileSettings(false)}
        initialTab={settingsTab}
      />
    </div>
  )
}
