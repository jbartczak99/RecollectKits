import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { usePlayer } from '../hooks/usePlayer'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useUserJerseys, useJerseyLikes, useWishlist } from '../hooks/useJerseys'
import { supabase } from '../lib/supabase'
import './PlayerProfile.css'

/* ── Icons ─────────────────────────────────── */

const ChevronLeft = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
)
const Plus = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
)
const ChevronDown = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
)
const ChevronUp = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
  </svg>
)

/* ── Helpers ─────────────────────────────────── */

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''
}

const FLAGS = {
  'poland':'🇵🇱','england':'🇬🇧','france':'🇫🇷','germany':'🇩🇪','spain':'🇪🇸',
  'brazil':'🇧🇷','argentina':'🇦🇷','italy':'🇮🇹','netherlands':'🇳🇱','portugal':'🇵🇹',
  'belgium':'🇧🇪','croatia':'🇭🇷','usa':'🇺🇸','united states':'🇺🇸','mexico':'🇲🇽',
  'japan':'🇯🇵','south korea':'🇰🇷','nigeria':'🇳🇬','morocco':'🇲🇦','colombia':'🇨🇴',
  'uruguay':'🇺🇾','denmark':'🇩🇰','sweden':'🇸🇪','norway':'🇳🇴','switzerland':'🇨🇭',
  'austria':'🇦🇹','turkey':'🇹🇷','serbia':'🇷🇸','australia':'🇦🇺','canada':'🇨🇦',
  'scotland':'🏴󠁧󠁢󠁳󠁣󠁴󠁿','wales':'🏴󠁧󠁢󠁷󠁬󠁳󠁿','ireland':'🇮🇪','czech republic':'🇨🇿',
  'senegal':'🇸🇳','ghana':'🇬🇭','cameroon':'🇨🇲','egypt':'🇪🇬','chile':'🇨🇱','peru':'🇵🇪',
}

/* ── Kit Card ────────────────────────────────── */

function KitCard({ jersey, teamColor, isOwned, isWishlisted }) {
  return (
    <Link to={`/jerseys/${jersey.id}`} className="kit-card">
      {(isOwned || isWishlisted) && (
        <div className="kit-card-indicators">
          {isOwned && <span className="kit-card-indicator owned">✓</span>}
          {isWishlisted && <span className="kit-card-indicator wishlisted">♥</span>}
        </div>
      )}
      <div className="kit-card-image">
        {jersey.front_image_url || jersey.back_image_url ? (
          <img
            src={jersey.front_image_url || jersey.back_image_url}
            alt={`${jersey.team_name} ${jersey.season} ${jersey.jersey_type || ''}`}
            onError={(e) => { e.target.style.display = 'none' }}
          />
        ) : (
          <div className="kit-card-placeholder" style={{ backgroundColor: teamColor }}>
            {jersey.player_number || jersey.jersey_number || '?'}
          </div>
        )}
      </div>
      <div className="kit-card-info">
        <p className="kit-card-type">{capitalize(jersey.jersey_type)}</p>
        <p className="kit-card-brand">{jersey.manufacturer || ''}</p>
      </div>
    </Link>
  )
}

/* ── Season Row ───────────────────────────────── */

function SeasonRow({ season, teamColor, defaultNumber, isInMainCollection, isInWishlist, isAdmin, careerId, seasonNumbers, onUpdate }) {
  const hasKits = season.kits && season.kits.length > 0
  const [editing, setEditing] = useState(false)
  const [editNum, setEditNum] = useState(season.shirtNumber ?? '')
  const [saving, setSaving] = useState(false)

  const displayNumber = season.shirtNumber ?? defaultNumber
  const isOverride = season.shirtNumber != null && season.shirtNumber !== defaultNumber

  const handleSave = async () => {
    if (!careerId) return
    setSaving(true)
    const val = editNum === '' ? null : parseInt(editNum, 10)
    const updated = { ...seasonNumbers }
    if (val == null || isNaN(val)) {
      delete updated[season.season]
    } else {
      updated[season.season] = val
    }
    const { error } = await supabase
      .from('player_careers')
      .update({ season_numbers: updated })
      .eq('id', careerId)
    setSaving(false)
    if (!error) {
      setEditing(false)
      if (onUpdate) onUpdate()
    }
  }

  return (
    <div className="season-row">
      <div className="season-header">
        <div className="season-header-left">
          <div className="season-dot" style={{ backgroundColor: teamColor }} />
          <span className="season-name">{season.season}</span>
          {displayNumber && (
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 600,
                color: isOverride ? 'var(--primary-700)' : 'var(--gray-400)',
                background: isOverride ? 'var(--primary-100)' : 'var(--gray-100)',
                padding: '1px 6px',
                borderRadius: '4px',
                cursor: isAdmin ? 'pointer' : 'default'
              }}
              onClick={isAdmin ? () => { setEditNum(season.shirtNumber ?? ''); setEditing(true) } : undefined}
              title={isAdmin ? 'Click to set season-specific number' : undefined}
            >
              #{displayNumber}{isOverride ? '' : ''}
            </span>
          )}
          {!displayNumber && isAdmin && (
            <span
              style={{
                fontSize: '0.65rem', color: 'var(--gray-400)', cursor: 'pointer',
                textDecoration: 'underline'
              }}
              onClick={() => { setEditNum(''); setEditing(true) }}
            >set #</span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {hasKits ? (
            <span className="season-kit-count">{season.kits.length} kit{season.kits.length > 1 ? 's' : ''}</span>
          ) : (
            <span className="season-kit-count empty">0 kits</span>
          )}
        </div>
      </div>

      {editing && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.5rem 0', paddingLeft: '1.25rem' }}>
          <input
            type="number"
            value={editNum}
            onChange={e => setEditNum(e.target.value)}
            placeholder={defaultNumber ? `Default: ${defaultNumber}` : '#'}
            style={{
              width: 64, height: 28, textAlign: 'center', fontWeight: 600,
              fontSize: '0.8rem', borderRadius: '0.375rem',
              border: '2px solid var(--primary-600)', outline: 'none', padding: '0 4px'
            }}
            min="1" max="99"
            autoFocus
            onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') setEditing(false) }}
          />
          <span style={{ fontSize: '0.7rem', color: 'var(--gray-400)' }}>
            {editNum === '' ? 'Clear to use default' : `Override for ${season.season}`}
          </span>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              marginLeft: 'auto', padding: '3px 10px', fontSize: '0.7rem',
              background: 'var(--primary-600)', color: 'white',
              border: 'none', borderRadius: '0.25rem', cursor: 'pointer', fontWeight: 600
            }}
          >{saving ? '...' : 'Save'}</button>
          <button
            onClick={() => setEditing(false)}
            style={{
              padding: '3px 8px', fontSize: '0.7rem',
              background: 'var(--gray-200)', color: 'var(--gray-600)',
              border: 'none', borderRadius: '0.25rem', cursor: 'pointer'
            }}
          >Cancel</button>
        </div>
      )}

      {hasKits ? (
        <div className="kit-grid">
          {season.kits.map(kit => (
            <KitCard
              key={kit.id}
              jersey={kit}
              teamColor={teamColor}
              isOwned={isInMainCollection(kit.id)}
              isWishlisted={isInWishlist(kit.id)}
            />
          ))}
          <button className="kit-add-btn">
            <Plus />
            <span>Add</span>
          </button>
        </div>
      ) : (
        <div className="season-empty">
          <span className="season-empty-text">No kits yet</span>
          <button className="season-add-link">+ Add first</button>
        </div>
      )}
    </div>
  )
}

/* ── Add Career Form ──────────────────────────── */

function AddCareerForm({ playerId, isInternational, onSave, onCancel }) {
  const [teamName, setTeamName] = useState('')
  const [startYear, setStartYear] = useState('')
  const [endYear, setEndYear] = useState('')
  const [shirtNumber, setShirtNumber] = useState('')
  const [isPresent, setIsPresent] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!teamName.trim() || !startYear) return
    setSaving(true)
    setError(null)

    const seasonStart = `${startYear}-${String(Number(startYear) + 1).slice(-2)}`
    const seasonEnd = isPresent ? null : (endYear ? `${endYear}-${String(Number(endYear) + 1).slice(-2)}` : null)
    const num = shirtNumber ? parseInt(shirtNumber, 10) : null

    const { error: dbError } = await supabase
      .from('player_careers')
      .insert({
        player_id: playerId,
        team_name: teamName.trim(),
        season_start: seasonStart,
        season_end: seasonEnd,
        shirt_number: isNaN(num) ? null : num,
        is_international: isInternational,
        season_numbers: {}
      })

    setSaving(false)
    if (dbError) {
      setError(dbError.message)
    } else {
      onSave()
    }
  }

  const currentYear = new Date().getFullYear()

  return (
    <form onSubmit={handleSubmit} className="admin-career-form">
      <div className="admin-career-form-title">
        Add {isInternational ? 'International' : 'Club'} Career
      </div>
      <div className="admin-career-form-grid">
        <div className="admin-career-form-field">
          <label>Team Name</label>
          <input
            type="text"
            value={teamName}
            onChange={e => setTeamName(e.target.value)}
            placeholder={isInternational ? 'e.g. Poland' : 'e.g. FC Barcelona'}
            required
          />
        </div>
        <div className="admin-career-form-field">
          <label>Shirt #</label>
          <input
            type="number"
            value={shirtNumber}
            onChange={e => setShirtNumber(e.target.value)}
            placeholder="9"
            min="1" max="99"
          />
        </div>
        <div className="admin-career-form-field">
          <label>Start Year</label>
          <input
            type="number"
            value={startYear}
            onChange={e => setStartYear(e.target.value)}
            placeholder={String(currentYear)}
            min="1900" max={currentYear + 1}
            required
          />
        </div>
        <div className="admin-career-form-field">
          <label>End Year</label>
          <input
            type="number"
            value={endYear}
            onChange={e => setEndYear(e.target.value)}
            placeholder="Present"
            min="1900" max={currentYear + 1}
            disabled={isPresent}
          />
        </div>
        <div className="admin-career-form-field" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingTop: '1.25rem' }}>
          <input
            type="checkbox"
            id="is-present"
            checked={isPresent}
            onChange={e => { setIsPresent(e.target.checked); if (e.target.checked) setEndYear('') }}
          />
          <label htmlFor="is-present" style={{ marginBottom: 0 }}>Present</label>
        </div>
      </div>
      {error && <div style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.5rem' }}>{error}</div>}
      <div className="admin-career-form-actions">
        <button type="submit" disabled={saving} className="admin-career-form-save">
          {saving ? 'Saving...' : 'Add Career'}
        </button>
        <button type="button" onClick={onCancel} className="admin-career-form-cancel">
          Cancel
        </button>
      </div>
    </form>
  )
}

/* ── Edit Career Form (inline for end date) ──── */

function EditCareerForm({ career, onSave, onCancel, onDelete }) {
  const [endYear, setEndYear] = useState(() => {
    if (!career.years) return ''
    const parts = career.years.split('-')
    const end = parts[parts.length - 1]?.trim()
    return end === 'Present' ? '' : end
  })
  const [isPresent, setIsPresent] = useState(() => {
    return career.years?.includes('Present') ?? false
  })
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    const seasonEnd = isPresent ? null : (endYear ? `${endYear}-${String(Number(endYear) + 1).slice(-2)}` : null)
    const { error } = await supabase
      .from('player_careers')
      .update({ season_end: seasonEnd })
      .eq('id', career.careerId)
    setSaving(false)
    if (!error) onSave()
  }

  const handleDelete = async () => {
    setSaving(true)
    const { error } = await supabase
      .from('player_careers')
      .delete()
      .eq('id', career.careerId)
    setSaving(false)
    if (!error) onSave()
  }

  return (
    <div className="admin-career-edit-bar">
      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-700)' }}>
        Edit end date for {career.teamName}:
      </span>
      <input
        type="number"
        value={endYear}
        onChange={e => setEndYear(e.target.value)}
        placeholder="Year"
        disabled={isPresent}
        style={{
          width: 64, height: 28, textAlign: 'center', fontSize: '0.8rem',
          borderRadius: '0.375rem', border: '1px solid var(--gray-300)',
          outline: 'none', padding: '0 4px'
        }}
        min="1900" max={new Date().getFullYear() + 1}
      />
      <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--gray-500)' }}>
        <input
          type="checkbox"
          checked={isPresent}
          onChange={e => { setIsPresent(e.target.checked); if (e.target.checked) setEndYear('') }}
        />
        Present
      </label>
      <button onClick={handleSave} disabled={saving} className="admin-career-form-save" style={{ padding: '3px 10px', fontSize: '0.7rem' }}>
        {saving ? '...' : 'Save'}
      </button>
      <button onClick={onCancel} className="admin-career-form-cancel" style={{ padding: '3px 8px', fontSize: '0.7rem' }}>
        Cancel
      </button>
      <div style={{ marginLeft: 'auto' }}>
        {confirmDelete ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span style={{ fontSize: '0.7rem', color: '#dc2626' }}>Sure?</span>
            <button onClick={handleDelete} disabled={saving} style={{
              padding: '3px 8px', fontSize: '0.7rem', background: '#dc2626', color: 'white',
              border: 'none', borderRadius: '0.25rem', cursor: 'pointer'
            }}>Delete</button>
            <button onClick={() => setConfirmDelete(false)} style={{
              padding: '3px 8px', fontSize: '0.7rem', background: 'var(--gray-200)', color: 'var(--gray-600)',
              border: 'none', borderRadius: '0.25rem', cursor: 'pointer'
            }}>No</button>
          </span>
        ) : (
          <button onClick={() => setConfirmDelete(true)} style={{
            padding: '3px 8px', fontSize: '0.7rem', background: 'none', color: '#dc2626',
            border: '1px solid #dc2626', borderRadius: '0.25rem', cursor: 'pointer'
          }}>Delete</button>
        )}
      </div>
    </div>
  )
}

/* ── Career Item ──────────────────────────────── */

function CareerItem({ group, isLast, defaultExpanded, isInMainCollection, isInWishlist, isAdmin, onUpdate }) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  const [editing, setEditing] = useState(false)
  const [editingCareer, setEditingCareer] = useState(false)
  const [editNumber, setEditNumber] = useState(group.shirtNumber || '')
  const [saving, setSaving] = useState(false)
  const seasonCount = group.seasons?.length || 0
  const totalKits = group.totalKits || 0

  const handleSave = async () => {
    if (!group.careerId) return
    setSaving(true)
    const num = editNumber === '' ? null : parseInt(editNumber, 10)
    const { error } = await supabase
      .from('player_careers')
      .update({ shirt_number: isNaN(num) ? null : num })
      .eq('id', group.careerId)
    setSaving(false)
    if (!error) {
      setEditing(false)
      if (onUpdate) onUpdate()
    }
  }

  return (
    <div className="career-item">
      {/* Timeline */}
      <div className="career-timeline">
        <div className="career-dot" style={{ backgroundColor: group.color.bg }} />
        <div className={`career-line${isLast ? ' hidden' : ''}`} />
      </div>

      {/* Content */}
      <div className="career-content">
        {/* Edit row (outside the clickable row to avoid nested button issues) */}
        {editing && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <input
              type="number"
              value={editNumber}
              onChange={e => setEditNumber(e.target.value)}
              placeholder="#"
              style={{
                width: 48, height: 32, textAlign: 'center', fontWeight: 700,
                fontSize: '0.875rem', borderRadius: '0.5rem',
                border: '2px solid var(--primary-600)', outline: 'none',
                padding: 0
              }}
              min="1" max="99"
              autoFocus
              onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') setEditing(false) }}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>for {group.teamName}</span>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                marginLeft: 'auto', padding: '4px 12px', fontSize: '0.75rem',
                background: 'var(--primary-600)', color: 'white',
                border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontWeight: 600
              }}
            >{saving ? 'Saving...' : 'Save'}</button>
            <button
              onClick={() => { setEditing(false); setEditNumber(group.shirtNumber || '') }}
              style={{
                padding: '4px 10px', fontSize: '0.75rem',
                background: 'var(--gray-200)', color: 'var(--gray-600)',
                border: 'none', borderRadius: '0.375rem', cursor: 'pointer'
              }}
            >Cancel</button>
          </div>
        )}

        <button
          onClick={() => !editing && setIsExpanded(!isExpanded)}
          className="career-row"
        >
          <div className="career-row-left">
            <div
              className="career-number-badge"
              style={{
                backgroundColor: group.shirtNumber ? group.color.bg : '#E5E7EB',
                color: group.shirtNumber ? group.color.text : '#6B7280',
                cursor: isAdmin ? 'pointer' : undefined,
                position: 'relative'
              }}
              onClick={isAdmin ? (e) => { e.stopPropagation(); setEditing(true) } : undefined}
              title={isAdmin ? 'Click to edit shirt number' : undefined}
            >
              {group.shirtNumber || '—'}
              {isAdmin && !editing && (
                <span style={{
                  position: 'absolute', bottom: -2, right: -2,
                  width: 12, height: 12, borderRadius: '50%',
                  background: 'var(--primary-600)', color: 'white',
                  fontSize: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  lineHeight: 1
                }}>✎</span>
              )}
            </div>
            <div>
              <span className="career-team-name">{group.teamName}</span>
              <span className="career-years">{group.years}</span>
            </div>
          </div>

          <div className="career-row-right">
            {seasonCount > 0 && (
              <span className="career-season-count">
                <span>{seasonCount}</span>
                <span className="career-season-label">season{seasonCount !== 1 ? 's' : ''}</span>
              </span>
            )}
            {totalKits > 0 && (
              <span className="career-kit-badge">
                {totalKits} kit{totalKits > 1 ? 's' : ''}
              </span>
            )}
            <span className="career-chevron">
              {isExpanded ? <ChevronUp /> : <ChevronDown />}
            </span>
          </div>
        </button>

        {/* Admin: edit career bar */}
        {isAdmin && group.careerId && editingCareer && (
          <EditCareerForm
            career={group}
            onSave={() => { setEditingCareer(false); onUpdate() }}
            onCancel={() => setEditingCareer(false)}
          />
        )}

        {/* Admin: edit link */}
        {isAdmin && group.careerId && !editingCareer && (
          <div style={{ marginTop: '0.25rem' }}>
            <button
              onClick={() => setEditingCareer(true)}
              style={{
                fontSize: '0.7rem', color: 'var(--gray-400)', background: 'none',
                border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline'
              }}
            >Edit career dates / Delete</button>
          </div>
        )}

        {/* Expanded Seasons */}
        {isExpanded && (
          <div className="career-seasons">
            {group.seasons?.map((season, i) => (
              <SeasonRow
                key={season.season + i}
                season={season}
                teamColor={group.color.bg}
                defaultNumber={group.shirtNumber}
                isInMainCollection={isInMainCollection}
                isInWishlist={isInWishlist}
                isAdmin={isAdmin}
                careerId={group.careerId}
                seasonNumbers={group.seasonNumbers || {}}
                onUpdate={onUpdate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Main Page ───────────────────────────────── */

export default function PlayerProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const isAdmin = !!profile?.is_admin
  const {
    player, careers, careerGroups, totalJerseys,
    clubCount, totalClubSeasons, loading, error, refetch
  } = usePlayer(id)
  const { isInMainCollection } = useUserJerseys()
  const { hasLiked, getLikeCount, toggleLike } = useJerseyLikes(user?.id)
  const { isInWishlist, toggleWishlist } = useWishlist(user?.id)
  const [showAddClub, setShowAddClub] = useState(false)
  const [showAddIntl, setShowAddIntl] = useState(false)

  if (loading) {
    return (
      <div className="player-page">
        <div className="player-breadcrumb">
          <div className="player-breadcrumb-inner">
            <div style={{ height: '1rem', width: '12rem', background: 'var(--gray-100)', borderRadius: '0.25rem' }} />
          </div>
        </div>
        <div className="player-container" style={{ paddingTop: '1.5rem' }}>
          <div className="player-card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--gray-100)' }} />
              <div>
                <div style={{ height: '1.5rem', width: '12rem', background: 'var(--gray-200)', borderRadius: '0.25rem', marginBottom: '0.5rem' }} />
                <div style={{ height: '1rem', width: '8rem', background: 'var(--gray-100)', borderRadius: '0.25rem' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !player) {
    return (
      <div className="player-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '1rem' }}>Player Not Found</h1>
          <p style={{ color: 'var(--gray-600)', marginBottom: '1.5rem' }}>{error || 'This player could not be found.'}</p>
          <button
            onClick={() => navigate(-1)}
            className="player-back"
            style={{ display: 'inline-flex', fontSize: '0.875rem', padding: '0.5rem 1rem', background: 'var(--primary-600)', color: 'white', borderRadius: '0.75rem', cursor: 'pointer' }}
          >
            <ChevronLeft /> <span style={{ marginLeft: '0.25rem' }}>Go Back</span>
          </button>
        </div>
      </div>
    )
  }

  const flag = FLAGS[(player.nationality || '').toLowerCase()] || ''

  // Iconic number
  const numberCounts = {}
  for (const g of careerGroups.filter(g => !g.isInternational)) {
    if (g.shirtNumber) numberCounts[g.shirtNumber] = (numberCounts[g.shirtNumber] || 0) + g.totalSeasons
  }
  const iconicNumber = Object.entries(numberCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null

  const clubGroups = careerGroups.filter(g => !g.isInternational)
  const intlGroups = careerGroups.filter(g => g.isInternational)
  const intlKitCount = intlGroups.reduce((sum, g) => sum + g.totalKits, 0)

  return (
    <div className="player-page">
      {/* Breadcrumb */}
      <div className="player-breadcrumb">
        <div className="player-breadcrumb-inner">
          <Link to="/">Home</Link>
          <span className="separator">/</span>
          <Link to="/jerseys">Kit Database</Link>
          <span className="separator">/</span>
          <span className="current">{player.name}</span>
        </div>
      </div>

      <div className="player-container">
        {/* Back */}
        <button onClick={() => navigate(-1)} className="player-back">
          <ChevronLeft /> Back
        </button>

        {/* Player Header */}
        <div className="player-card">
          <div className="player-header">
            <div className="player-header-top">
              <div className="player-header-left">
                <div className="player-avatar">
                  {(player.name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
                </div>
                <div>
                  <h1 className="player-name">{player.name}</h1>
                  <p className="player-subtitle">
                    {capitalize(player.position)}
                    {player.nationality && <> &bull; {flag && <>{flag} </>}{player.nationality}</>}
                  </p>
                </div>
              </div>
              <div className="player-kit-count">
                <div className="count">{totalJerseys}</div>
                <div className="label">kits in database</div>
              </div>
            </div>

            <div className="player-stats">
              <div className="player-stat">
                <div className="value">{clubCount}</div>
                <div className="label">Clubs</div>
              </div>
              <div className="player-stat">
                <div className="value">{totalClubSeasons}</div>
                <div className="label">Seasons</div>
              </div>
              <div className="player-stat">
                <div className="value">{iconicNumber || '—'}</div>
                <div className="label">Iconic #</div>
              </div>
            </div>
          </div>
        </div>

        {/* Club Career */}
        {(clubGroups.length > 0 || isAdmin) && (
          <div className="player-card">
            <div className="career-section">
              <div className="career-section-header">
                <div className="career-section-title">
                  <span className="emoji">🏟️</span> Club Career
                </div>
                {isAdmin && !showAddClub && (
                  <button
                    onClick={() => setShowAddClub(true)}
                    className="admin-add-career-btn"
                  >+ Add Club</button>
                )}
              </div>
              {isAdmin && showAddClub && (
                <AddCareerForm
                  playerId={id}
                  isInternational={false}
                  onSave={() => { setShowAddClub(false); refetch() }}
                  onCancel={() => setShowAddClub(false)}
                />
              )}
              <div>
                {clubGroups.map((group, i) => (
                  <CareerItem
                    key={`club-${i}`}
                    group={group}
                    isLast={i === clubGroups.length - 1}
                    defaultExpanded={group.totalKits > 0}
                    isInMainCollection={isInMainCollection}
                    isInWishlist={isInWishlist}
                    isAdmin={isAdmin}
                    onUpdate={refetch}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* International */}
        {(intlGroups.length > 0 || isAdmin) && (
          <div className="player-card">
            <div className="career-section">
              <div className="career-section-header">
                <div className="career-section-title">
                  <span className="emoji">🌍</span> International
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {intlKitCount > 0 && (
                    <span className="career-section-badge">
                      {intlKitCount} kit{intlKitCount > 1 ? 's' : ''}
                    </span>
                  )}
                  {isAdmin && !showAddIntl && (
                    <button
                      onClick={() => setShowAddIntl(true)}
                      className="admin-add-career-btn"
                    >+ Add National Team</button>
                  )}
                </div>
              </div>
              {isAdmin && showAddIntl && (
                <AddCareerForm
                  playerId={id}
                  isInternational={true}
                  onSave={() => { setShowAddIntl(false); refetch() }}
                  onCancel={() => setShowAddIntl(false)}
                />
              )}
              <div>
                {intlGroups.map((group, i) => (
                  <CareerItem
                    key={`intl-${i}`}
                    group={group}
                    isLast={i === intlGroups.length - 1}
                    defaultExpanded={group.totalKits > 0}
                    isInMainCollection={isInMainCollection}
                    isInWishlist={isInWishlist}
                    isAdmin={isAdmin}
                    onUpdate={refetch}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {careerGroups.length === 0 && (
          <div className="player-card" style={{ padding: '2.5rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--gray-400)' }}>No career data available for {player.name}.</p>
          </div>
        )}

        {/* CTA */}
        <div className="player-cta">
          <div>
            <h3>🎯 Create Collection Goal</h3>
            <p>Track all {player.name} jerseys</p>
          </div>
          <button className="player-cta-btn">
            Coming Soon
          </button>
        </div>

      </div>
    </div>
  )
}
