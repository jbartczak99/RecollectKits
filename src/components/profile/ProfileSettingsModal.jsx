import { useState, useEffect, useRef } from 'react'
import {
  XMarkIcon,
  GlobeAltIcon,
  LockClosedIcon,
  SparklesIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  CameraIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import { useProfileSettings } from '../../hooks/usePublicProfile'
import { useAuth } from '../../contexts/AuthContext.jsx'

export default function ProfileSettingsModal({ isOpen, onClose, onSuccess }) {
  const { user, profile, getProfile } = useAuth()
  const {
    saving, updateProfileVisibility, updateBio, updateShowFullName,
    updateUsername, uploadAvatar, removeAvatar, updateTop3Jerseys, getUserJerseys
  } = useProfileSettings()

  const fileInputRef = useRef(null)

  const [isPublic, setIsPublic] = useState(false)
  const [bio, setBio] = useState('')
  const [showFullName, setShowFullName] = useState(true)
  const [newUsername, setNewUsername] = useState('')
  const [selectedJerseys, setSelectedJerseys] = useState([])
  const [userJerseys, setUserJerseys] = useState([])
  const [loadingJerseys, setLoadingJerseys] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [saveMessage, setSaveMessage] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)

  useEffect(() => {
    if (isOpen && profile) {
      setIsPublic(profile.is_public || false)
      setBio(profile.bio || '')
      setShowFullName(profile.show_full_name !== false)
      setNewUsername(profile.username || '')
      setSelectedJerseys(profile.top_3_jersey_ids || [])
      setAvatarPreview(null)
      loadUserJerseys()
    }
  }, [isOpen, profile])

  const loadUserJerseys = async () => {
    if (!user) return
    setLoadingJerseys(true)
    const { data } = await getUserJerseys(user.id)
    setUserJerseys(data)
    setLoadingJerseys(false)
  }

  const showMsg = (type, text) => {
    setSaveMessage({ type, text })
    setTimeout(() => setSaveMessage(null), 3000)
  }

  const handleSaveVisibility = async () => {
    const { error } = await updateProfileVisibility(user.id, isPublic)
    if (error) showMsg('error', 'Failed to update visibility')
    else { showMsg('success', 'Profile visibility updated!'); await getProfile(user.id); onSuccess?.() }
  }

  const handleSaveBio = async () => {
    const { error } = await updateBio(user.id, bio)
    if (error) showMsg('error', 'Failed to update bio')
    else { showMsg('success', 'Bio updated!'); await getProfile(user.id); onSuccess?.() }
  }

  const handleSaveShowFullName = async () => {
    const { error } = await updateShowFullName(user.id, showFullName)
    if (error) showMsg('error', 'Failed to update setting')
    else { showMsg('success', 'Name visibility updated!'); await getProfile(user.id); onSuccess?.() }
  }

  const handleSaveUsername = async () => {
    if (newUsername.trim().toLowerCase() === profile.username) {
      showMsg('error', 'Username is the same as current')
      return
    }
    const { error } = await updateUsername(user.id, newUsername, profile.username_changed_at)
    if (error) showMsg('error', error.message || 'Failed to update username')
    else { showMsg('success', 'Username updated!'); await getProfile(user.id); onSuccess?.() }
  }

  const handleAvatarSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { showMsg('error', 'Image must be less than 2MB'); return }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { showMsg('error', 'Only JPG, PNG, and WebP allowed'); return }
    setAvatarPreview(URL.createObjectURL(file))
  }

  const handleUploadAvatar = async () => {
    const file = fileInputRef.current?.files?.[0]
    if (!file) return
    const { error } = await uploadAvatar(user.id, file)
    if (error) showMsg('error', error.message || 'Failed to upload')
    else { showMsg('success', 'Profile picture updated!'); setAvatarPreview(null); await getProfile(user.id); onSuccess?.() }
  }

  const handleRemoveAvatar = async () => {
    const { error } = await removeAvatar(user.id)
    if (error) showMsg('error', 'Failed to remove picture')
    else { showMsg('success', 'Profile picture removed!'); setAvatarPreview(null); await getProfile(user.id); onSuccess?.() }
  }

  const handleToggleJersey = (jerseyId) => {
    setSelectedJerseys(prev => {
      if (prev.includes(jerseyId)) return prev.filter(id => id !== jerseyId)
      if (prev.length >= 3) { showMsg('error', 'You can only select up to 3 jerseys'); return prev }
      return [...prev, jerseyId]
    })
  }

  const handleSaveTop3 = async () => {
    const { error } = await updateTop3Jerseys(user.id, selectedJerseys)
    if (error) showMsg('error', error.message || 'Failed to update top 3')
    else { showMsg('success', 'Top 3 updated!'); await getProfile(user.id); onSuccess?.() }
  }

  if (!isOpen) return null

  const profileUrl = `${window.location.origin}/@${profile?.username}`

  // Calculate username change cooldown
  const canChangeUsername = !profile?.username_changed_at ||
    (Date.now() - new Date(profile.username_changed_at).getTime()) / (1000 * 60 * 60 * 24) >= 30
  const daysUntilChange = profile?.username_changed_at
    ? Math.max(0, Math.ceil(30 - (Date.now() - new Date(profile.username_changed_at).getTime()) / (1000 * 60 * 60 * 24)))
    : 0

  const currentAvatar = avatarPreview || profile?.avatar_url

  const tabStyle = (tab) => ({
    flex: 1, padding: '12px 8px', fontSize: '13px', fontWeight: 500,
    cursor: 'pointer', border: 'none', background: 'none',
    color: activeTab === tab ? '#16a34a' : '#6b7280',
    borderBottom: activeTab === tab ? '2px solid #16a34a' : '2px solid transparent',
    transition: 'all 0.2s'
  })

  const sectionBox = { backgroundColor: '#f9fafb', borderRadius: '10px', padding: '16px', marginBottom: '16px' }
  const labelStyle = { fontWeight: 500, color: '#111827', margin: 0, fontSize: '14px' }
  const subLabelStyle = { fontSize: '12px', color: '#6b7280', margin: '2px 0 0' }
  const btnGreen = (disabled) => ({
    padding: '8px 16px', backgroundColor: '#16a34a', color: 'white', borderRadius: '8px',
    border: 'none', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1,
    fontSize: '13px', fontWeight: 500
  })
  const toggleBtn = (isOn) => ({
    position: 'relative', display: 'inline-flex', height: '24px', width: '44px',
    alignItems: 'center', borderRadius: '12px', backgroundColor: isOn ? '#16a34a' : '#d1d5db',
    transition: 'background-color 0.2s', cursor: 'pointer', border: 'none', padding: 0, flexShrink: 0
  })
  const toggleKnob = (isOn) => ({
    display: 'inline-block', height: '18px', width: '18px', borderRadius: '50%',
    backgroundColor: 'white', transition: 'transform 0.2s',
    transform: isOn ? 'translateX(23px)' : 'translateX(3px)', boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
  })

  return (
    <div
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }}
      onClick={onClose}
    >
      <div
        style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', maxWidth: '560px', width: '100%', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #e5e7eb' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827', margin: 0 }}>Profile Settings</h2>
          <button onClick={onClose} style={{ padding: '6px', color: '#9ca3af', cursor: 'pointer', border: 'none', background: 'none', borderRadius: '6px', display: 'flex' }}>
            <XMarkIcon style={{ width: '20px', height: '20px' }} />
          </button>
        </div>

        {/* Save Message */}
        {saveMessage && (
          <div style={{ margin: '12px 20px 0', padding: '10px 14px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', backgroundColor: saveMessage.type === 'success' ? '#f0fdf4' : '#fef2f2', color: saveMessage.type === 'success' ? '#15803d' : '#b91c1c' }}>
            {saveMessage.type === 'success' ? <CheckIcon style={{ width: '16px', height: '16px', flexShrink: 0 }} /> : <ExclamationTriangleIcon style={{ width: '16px', height: '16px', flexShrink: 0 }} />}
            {saveMessage.text}
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
          <button onClick={() => setActiveTab('profile')} style={tabStyle('profile')}>Profile</button>
          <button onClick={() => setActiveTab('privacy')} style={tabStyle('privacy')}>Privacy</button>
          <button onClick={() => setActiveTab('top3')} style={tabStyle('top3')}>Top 3 Kits</button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>

          {/* ===== PROFILE TAB ===== */}
          {activeTab === 'profile' && (
            <div>
              {/* Profile Picture */}
              <div style={sectionBox}>
                <p style={labelStyle}>Profile Picture</p>
                <p style={subLabelStyle}>JPG, PNG, or WebP. Max 2MB.</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '12px' }}>
                  {/* Current Avatar */}
                  {currentAvatar ? (
                    <img src={currentAvatar} alt="Avatar" style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #e5e7eb' }} />
                  ) : (
                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #4ade80, #16a34a)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #dcfce7' }}>
                      <span style={{ fontSize: '24px', fontWeight: 'bold', color: 'white' }}>{profile?.username?.charAt(0).toUpperCase()}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleAvatarSelect} style={{ display: 'none' }} />
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {avatarPreview ? (
                        <button onClick={handleUploadAvatar} disabled={saving} style={btnGreen(saving)}>
                          {saving ? 'Uploading...' : 'Save Photo'}
                        </button>
                      ) : (
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 12px', border: '1px solid #d1d5db', borderRadius: '8px', backgroundColor: 'white', color: '#374151', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}
                        >
                          <CameraIcon style={{ width: '14px', height: '14px' }} /> Change Photo
                        </button>
                      )}
                      {(profile?.avatar_url || avatarPreview) && (
                        <button
                          onClick={() => { if (avatarPreview) { setAvatarPreview(null); fileInputRef.current.value = '' } else handleRemoveAvatar() }}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 12px', border: '1px solid #fca5a5', borderRadius: '8px', backgroundColor: 'white', color: '#dc2626', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}
                        >
                          <TrashIcon style={{ width: '14px', height: '14px' }} /> {avatarPreview ? 'Cancel' : 'Remove'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Username */}
              <div style={sectionBox}>
                <p style={labelStyle}>Username</p>
                <p style={subLabelStyle}>
                  {canChangeUsername
                    ? 'You can change your username once every 30 days.'
                    : `You can change your username again in ${daysUntilChange} day${daysUntilChange !== 1 ? 's' : ''}.`}
                </p>
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                  <div style={{ flex: 1, position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '14px' }}>@</span>
                    <input
                      type="text"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                      maxLength={30}
                      disabled={!canChangeUsername}
                      style={{
                        width: '100%', padding: '8px 10px 8px 26px', border: '1px solid #d1d5db',
                        borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box',
                        backgroundColor: canChangeUsername ? 'white' : '#f3f4f6',
                        color: canChangeUsername ? '#111827' : '#6b7280'
                      }}
                    />
                  </div>
                  <button
                    onClick={handleSaveUsername}
                    disabled={saving || !canChangeUsername || newUsername.trim().toLowerCase() === profile?.username}
                    style={btnGreen(saving || !canChangeUsername || newUsername.trim().toLowerCase() === profile?.username)}
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>

              {/* Show Full Name */}
              <div style={sectionBox}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={labelStyle}>Show Real Name</p>
                    <p style={subLabelStyle}>
                      {showFullName
                        ? 'Your full name is visible on your public profile.'
                        : 'Only your username is shown on your public profile.'}
                    </p>
                  </div>
                  <button onClick={() => setShowFullName(!showFullName)} style={toggleBtn(showFullName)}>
                    <span style={toggleKnob(showFullName)} />
                  </button>
                </div>
                <button onClick={handleSaveShowFullName} disabled={saving} style={{ ...btnGreen(saving), width: '100%', marginTop: '12px' }}>
                  {saving ? 'Saving...' : 'Save Name Setting'}
                </button>
              </div>

              {/* Bio */}
              <div>
                <p style={{ ...labelStyle, marginBottom: '8px' }}>
                  Bio <span style={{ color: '#9ca3af', fontWeight: 400 }}>(optional)</span>
                </p>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell others about your collection..."
                  rows={3}
                  maxLength={500}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', resize: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                  <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>{bio.length}/500 characters</p>
                  <button onClick={handleSaveBio} disabled={saving} style={btnGreen(saving)}>
                    {saving ? 'Saving...' : 'Save Bio'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ===== PRIVACY TAB ===== */}
          {activeTab === 'privacy' && (
            <div>
              <div style={sectionBox}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {isPublic ? (
                      <GlobeAltIcon style={{ width: '28px', height: '28px', color: '#16a34a', flexShrink: 0 }} />
                    ) : (
                      <LockClosedIcon style={{ width: '28px', height: '28px', color: '#9ca3af', flexShrink: 0 }} />
                    )}
                    <div>
                      <p style={labelStyle}>Profile Visibility</p>
                      <p style={subLabelStyle}>
                        {isPublic ? 'Your profile is visible to everyone' : 'Your profile is only visible to you'}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => setIsPublic(!isPublic)} style={toggleBtn(isPublic)}>
                    <span style={toggleKnob(isPublic)} />
                  </button>
                </div>

                {isPublic && (
                  <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid #e5e7eb' }}>
                    <p style={{ fontSize: '13px', color: '#4b5563', marginBottom: '8px' }}>Your public profile URL:</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input type="text" value={profileUrl} readOnly style={{ flex: 1, padding: '8px 12px', backgroundColor: 'white', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '13px', color: '#374151', minWidth: 0 }} />
                      <button
                        onClick={() => { navigator.clipboard.writeText(profileUrl); showMsg('success', 'URL copied!') }}
                        style={{ padding: '8px 12px', backgroundColor: '#f3f4f6', color: '#374151', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 500, whiteSpace: 'nowrap' }}
                      >Copy</button>
                    </div>
                  </div>
                )}

                <button onClick={handleSaveVisibility} disabled={saving} style={{ ...btnGreen(saving), width: '100%', marginTop: '14px' }}>
                  {saving ? 'Saving...' : 'Save Visibility'}
                </button>
              </div>
            </div>
          )}

          {/* ===== TOP 3 TAB ===== */}
          {activeTab === 'top3' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', backgroundColor: '#fffbeb', borderRadius: '8px', color: '#d97706', fontSize: '13px' }}>
                <SparklesIcon style={{ width: '18px', height: '18px', flexShrink: 0 }} />
                <p style={{ margin: 0 }}>Select up to 3 jerseys to showcase on your public profile ({selectedJerseys.length}/3 selected)</p>
              </div>

              {loadingJerseys ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  {[0,1,2,3,4,5].map(i => (
                    <div key={i} style={{ backgroundColor: '#f3f4f6', borderRadius: '8px', height: '140px' }} />
                  ))}
                </div>
              ) : userJerseys.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 16px', color: '#6b7280' }}>
                  <p style={{ margin: 0 }}>You don't have any jerseys in your collection yet.</p>
                  <p style={{ fontSize: '13px', marginTop: '4px' }}>Add some jerseys to select your top 3!</p>
                </div>
              ) : (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                    {userJerseys.map((userJersey) => {
                      const jersey = userJersey.public_jersey
                      const isSelected = selectedJerseys.includes(userJersey.id)
                      const selectionIndex = selectedJerseys.indexOf(userJersey.id)
                      return (
                        <button
                          key={userJersey.id}
                          onClick={() => handleToggleJersey(userJersey.id)}
                          style={{ position: 'relative', borderRadius: '8px', border: isSelected ? '2px solid #f59e0b' : '2px solid #e5e7eb', overflow: 'hidden', cursor: 'pointer', background: 'white', padding: 0, textAlign: 'left', outline: isSelected ? '2px solid #fde68a' : 'none', outlineOffset: 0, transition: 'all 0.15s' }}
                        >
                          {isSelected && (
                            <div style={{ position: 'absolute', top: '6px', left: '6px', zIndex: 10, width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#f59e0b', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>{selectionIndex + 1}</div>
                          )}
                          {isSelected && (
                            <div style={{ position: 'absolute', top: '6px', right: '6px', zIndex: 10, width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#22c55e', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <CheckIcon style={{ width: '14px', height: '14px' }} />
                            </div>
                          )}
                          <div style={{ height: '80px', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {jersey?.front_image_url ? (
                              <img src={jersey.front_image_url} alt={jersey.team_name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', padding: '6px' }} />
                            ) : (
                              <span style={{ color: '#9ca3af', fontSize: '11px' }}>No Image</span>
                            )}
                          </div>
                          <div style={{ padding: '6px 8px', backgroundColor: 'white' }}>
                            <p style={{ fontSize: '12px', fontWeight: 500, color: '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{jersey?.team_name}</p>
                            <p style={{ fontSize: '11px', color: '#6b7280', margin: '1px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{jersey?.season}</p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                  <button onClick={handleSaveTop3} disabled={saving} style={{ width: '100%', padding: '10px 16px', backgroundColor: '#f59e0b', color: 'white', borderRadius: '8px', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.5 : 1, fontSize: '14px', fontWeight: 500 }}>
                    {saving ? 'Saving...' : 'Save Top 3 Selection'}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
