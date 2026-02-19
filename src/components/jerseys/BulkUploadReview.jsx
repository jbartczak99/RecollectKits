import { useState, useCallback, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
  XMarkIcon,
  ArrowLeftIcon,
  PlusIcon,
  PhotoIcon
} from '@heroicons/react/24/outline'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext.jsx'

const FREE_TIER_LIMIT = 15
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const ACCEPTED_EXTENSIONS = '.jpg, .jpeg, .png, .webp'
const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB

function validateImage(file) {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return `Invalid file type. Accepted: ${ACCEPTED_EXTENSIONS}`
  }
  if (file.size > MAX_IMAGE_SIZE) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1)
    return `File too large (${sizeMB}MB). Maximum size is 5MB.`
  }
  return null
}

const REQUIRED_FIELDS = ['team_name', 'season', 'kit_type', 'jersey_type']

const KIT_TYPE_OPTIONS = ['club', 'international']
const JERSEY_TYPE_OPTIONS = ['home', 'away', 'third', 'goalkeeper', 'special']
const COMPETITION_GENDER_OPTIONS = ['mens', 'womens']
const JERSEY_FIT_OPTIONS = ['mens', 'womens', 'youth']

const ALL_FIELDS = [
  { key: 'team_name', label: 'Team Name', required: true },
  { key: 'season', label: 'Season', required: true },
  { key: 'kit_type', label: 'Kit Type', required: true, type: 'select', options: KIT_TYPE_OPTIONS },
  { key: 'jersey_type', label: 'Jersey Type', required: true, type: 'select', options: JERSEY_TYPE_OPTIONS },
  { key: 'league', label: 'League' },
  { key: 'competition_gender', label: 'Competition', required: true, type: 'select', options: ['mens', 'womens'] },
  { key: 'jersey_fit', label: 'Jersey Fit', type: 'select', options: ['mens', 'womens', 'youth'] },
  { key: 'manufacturer', label: 'Manufacturer' },
  { key: 'player_name', label: 'Player Name' },
  { key: 'player_number', label: 'Player Number' },
  { key: 'primary_color', label: 'Primary Color' },
  { key: 'secondary_color', label: 'Secondary Color' },
  { key: 'main_sponsor', label: 'Main Sponsor' },
  { key: 'additional_sponsors', label: 'Additional Sponsors' },
  { key: 'description', label: 'Description', type: 'textarea' }
]

function validateRow(row) {
  const errors = []
  const warnings = []

  REQUIRED_FIELDS.forEach(field => {
    if (!row[field] || String(row[field]).trim() === '') {
      errors.push(`${field.replace(/_/g, ' ')} is required`)
    }
  })

  if (row.kit_type && !KIT_TYPE_OPTIONS.includes(row.kit_type.toLowerCase())) {
    errors.push(`kit_type must be one of: ${KIT_TYPE_OPTIONS.join(', ')}`)
  }

  if (row.jersey_type && !JERSEY_TYPE_OPTIONS.includes(row.jersey_type.toLowerCase())) {
    errors.push(`jersey_type must be one of: ${JERSEY_TYPE_OPTIONS.join(', ')}`)
  }

  if (row.competition_gender && !COMPETITION_GENDER_OPTIONS.includes(row.competition_gender.toLowerCase())) {
    errors.push(`competition_gender must be one of: ${COMPETITION_GENDER_OPTIONS.join(', ')}`)
  }

  if (row.jersey_fit && !JERSEY_FIT_OPTIONS.includes(row.jersey_fit.toLowerCase())) {
    warnings.push(`jersey_fit "${row.jersey_fit}" is not valid — will default to "mens"`)
  }

  if (!row._frontImage) {
    warnings.push('No front image attached')
  }

  return { errors, warnings }
}

// Individual image upload zone
function ImageUploadZone({ label, image, onUpload, onRemove }) {
  const inputRef = useRef(null)
  const [error, setError] = useState(null)

  const tryUpload = useCallback((file) => {
    const err = validateImage(file)
    if (err) {
      setError(err)
      setTimeout(() => setError(null), 4000)
      return
    }
    setError(null)
    onUpload(file)
  }, [onUpload])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    const file = e.dataTransfer?.files?.[0]
    if (file) tryUpload(file)
  }, [tryUpload])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
      <div
        style={{
          position: 'relative',
          border: error ? '2px dashed #FCA5A5' : image ? '1px solid #E5E7EB' : '2px dashed #D1D5DB',
          borderRadius: '10px',
          textAlign: 'center',
          cursor: 'pointer',
          backgroundColor: error ? '#FEF2F2' : image ? '#F9FAFB' : '#FAFAFA',
          width: '100%',
          height: '90px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          transition: 'border-color 0.2s ease, background-color 0.2s ease, transform 0.15s ease'
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => !image && inputRef.current?.click()}
        onMouseEnter={(e) => {
          if (!image && !error) {
            e.currentTarget.style.borderColor = '#7C3AED'
            e.currentTarget.style.backgroundColor = '#F5F3FF'
            e.currentTarget.style.transform = 'scale(1.02)'
          }
        }}
        onMouseLeave={(e) => {
          if (!image && !error) {
            e.currentTarget.style.borderColor = '#D1D5DB'
            e.currentTarget.style.backgroundColor = '#FAFAFA'
            e.currentTarget.style.transform = 'scale(1)'
          }
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) tryUpload(file)
            e.target.value = ''
          }}
        />
        {image ? (
          <div style={{ position: 'relative', padding: '6px', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img
              src={image.preview}
              alt={label}
              style={{ maxHeight: '76px', maxWidth: '100%', borderRadius: '6px', objectFit: 'contain' }}
            />
            <button
              onClick={(e) => { e.stopPropagation(); onRemove() }}
              style={{
                position: 'absolute', top: '4px', right: '4px',
                width: '22px', height: '22px', borderRadius: '50%',
                backgroundColor: '#EF4444', color: '#fff', border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', fontSize: '12px'
              }}
            >
              <XMarkIcon style={{ width: '12px', height: '12px' }} />
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <PhotoIcon style={{ width: '22px', height: '22px', color: error ? '#EF4444' : '#9CA3AF' }} />
            <span style={{ fontSize: '11px', color: error ? '#EF4444' : '#9CA3AF', fontWeight: 500 }}>{label}</span>
          </div>
        )}
      </div>
      {error && (
        <p style={{ fontSize: '10px', color: '#EF4444', marginTop: '4px', lineHeight: 1.3 }}>{error}</p>
      )}
    </div>
  )
}

// Hook for responsive detection
function useIsMobile(breakpoint = 640) {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < breakpoint : false
  )

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`)
    const handler = (e) => setIsMobile(e.matches)
    mql.addEventListener('change', handler)
    setIsMobile(mql.matches)
    return () => mql.removeEventListener('change', handler)
  }, [breakpoint])

  return isMobile
}

// Inline edit form for a row
function RowEditForm({ row, onSave, onCancel }) {
  const [editData, setEditData] = useState({ ...row })
  const isMobile = useIsMobile()

  const handleChange = (key, value) => {
    setEditData(prev => ({ ...prev, [key]: value }))
  }

  const inputStyle = {
    width: '100%', padding: '8px 12px',
    border: '1px solid #D1D5DB', borderRadius: '8px',
    fontSize: '13px', outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s'
  }

  return (
    <div style={{
      padding: '20px', backgroundColor: '#F9FAFB', borderTop: '1px solid #E5E7EB',
      animation: 'slideDown 0.25s ease-out'
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px' }}>
        {ALL_FIELDS.map(field => (
          <div key={field.key} style={field.type === 'textarea' ? { gridColumn: 'span 2' } : {}}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#6B7280', marginBottom: '4px' }}>
              {field.label}{field.required ? ' *' : ''}
            </label>
            {field.type === 'select' ? (
              <select
                value={editData[field.key] || ''}
                onChange={(e) => handleChange(field.key, e.target.value)}
                style={inputStyle}
                onFocus={(e) => { e.target.style.borderColor = '#7C3AED'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.1)' }}
                onBlur={(e) => { e.target.style.borderColor = '#D1D5DB'; e.target.style.boxShadow = 'none' }}
              >
                <option value="">Select...</option>
                {field.options.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : field.type === 'textarea' ? (
              <textarea
                value={editData[field.key] || ''}
                onChange={(e) => handleChange(field.key, e.target.value)}
                rows={2}
                style={{ ...inputStyle, resize: 'vertical' }}
                onFocus={(e) => { e.target.style.borderColor = '#7C3AED'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.1)' }}
                onBlur={(e) => { e.target.style.borderColor = '#D1D5DB'; e.target.style.boxShadow = 'none' }}
              />
            ) : (
              <input
                type="text"
                value={editData[field.key] || ''}
                onChange={(e) => handleChange(field.key, e.target.value)}
                style={inputStyle}
                onFocus={(e) => { e.target.style.borderColor = '#7C3AED'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.1)' }}
                onBlur={(e) => { e.target.style.borderColor = '#D1D5DB'; e.target.style.boxShadow = 'none' }}
              />
            )}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
        <button
          onClick={onCancel}
          style={{
            padding: '8px 18px', fontSize: '13px', fontWeight: 600,
            backgroundColor: '#F3F4F6', color: '#4B5563', borderRadius: '8px',
            border: 'none', cursor: 'pointer'
          }}
        >
          Cancel
        </button>
        <button
          onClick={() => onSave(editData)}
          style={{
            padding: '8px 18px', fontSize: '13px', fontWeight: 600,
            backgroundColor: '#7C3AED', color: '#fff', borderRadius: '8px',
            border: 'none', cursor: 'pointer'
          }}
        >
          Save Changes
        </button>
      </div>
    </div>
  )
}

// Single jersey row card
function JerseyRow({ row, index, onUpdate, onDelete, onImageUpload, onImageRemove }) {
  const [editing, setEditing] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const isMobile = useIsMobile()
  const { errors, warnings } = validateRow(row)
  const hasErrors = errors.length > 0
  const hasWarnings = warnings.length > 0

  const handleSave = (editData) => {
    editData._frontImage = row._frontImage
    editData._backImage = row._backImage
    editData._id = row._id
    onUpdate(index, editData)
    setEditing(false)
  }

  const playerDisplay = row.player_name
    ? `${row.player_name}${row.player_number ? ` #${row.player_number}` : ''}`
    : 'No player'

  const accentColor = hasErrors ? '#EF4444' : hasWarnings ? '#F59E0B' : '#E5E7EB'

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: '#fff',
        borderRadius: '12px',
        border: '1px solid #E5E7EB',
        borderLeft: `4px solid ${accentColor}`,
        overflow: 'hidden',
        boxShadow: isHovered ? '0 4px 16px rgba(0,0,0,0.1)' : '0 1px 3px rgba(0,0,0,0.06)',
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'box-shadow 0.2s ease, transform 0.2s ease'
      }}
    >
      <div style={{ padding: isMobile ? '16px' : '20px' }}>
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '14px' : '20px' }}>
          {/* Image upload area */}
          <div style={{
            flexShrink: 0, display: 'flex',
            flexDirection: isMobile ? 'row' : 'column',
            gap: '8px',
            width: isMobile ? '100%' : '120px'
          }}>
            <ImageUploadZone
              label="Front Image"
              image={row._frontImage}
              onUpload={(file) => onImageUpload(index, 'front', file)}
              onRemove={() => onImageRemove(index, 'front')}
            />
            <ImageUploadZone
              label="Back Image"
              image={row._backImage}
              onUpload={(file) => onImageUpload(index, 'back', file)}
              onRemove={() => onImageRemove(index, 'back')}
            />
          </div>

          {/* Jersey details */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Line 1: team | season | jersey_type */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 700, color: '#111827', fontSize: '16px' }}>
                {row.team_name || '—'}
              </span>
              <span style={{ color: '#D1D5DB' }}>|</span>
              <span style={{ color: '#374151', fontSize: '15px' }}>
                {row.season || '—'}
              </span>
              <span
                style={{
                  display: 'inline-block', padding: '2px 10px',
                  borderRadius: '9999px', fontSize: '12px', fontWeight: 600,
                  backgroundColor: '#F5F3FF', color: '#7C3AED',
                  textTransform: 'capitalize'
                }}
              >
                {row.jersey_type || '—'}
              </span>
              <span
                style={{
                  display: 'inline-block', padding: '2px 10px',
                  borderRadius: '9999px', fontSize: '11px', fontWeight: 500,
                  backgroundColor: '#F3F4F6', color: '#6B7280',
                  textTransform: 'capitalize'
                }}
              >
                {row.kit_type || '—'}
              </span>
            </div>

            {/* Line 2: player */}
            <p style={{ color: '#4B5563', marginTop: '6px', fontSize: '14px' }}>
              {playerDisplay}
            </p>

            {/* Line 3: league | manufacturer */}
            <p style={{ color: '#6B7280', marginTop: '3px', fontSize: '13px' }}>
              {[row.league, row.manufacturer].filter(Boolean).join(' \u00B7 ') || '—'}
            </p>

            {/* Line 4: colors | sponsor */}
            {(row.primary_color || row.main_sponsor) && (
              <p style={{ color: '#9CA3AF', marginTop: '3px', fontSize: '13px' }}>
                {[
                  row.primary_color && `${row.primary_color}${row.secondary_color ? ` / ${row.secondary_color}` : ''}`,
                  row.main_sponsor && `Sponsor: ${row.main_sponsor}`
                ].filter(Boolean).join(' \u00B7 ')}
              </p>
            )}

            {/* Line 5: description */}
            {row.description && (
              <p
                style={{
                  color: '#9CA3AF', marginTop: '6px', fontSize: '12px',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  fontStyle: 'italic'
                }}
                title={row.description}
              >
                {row.description}
              </p>
            )}

            {/* Validation messages */}
            {hasErrors && (
              <div style={{ marginTop: '10px', display: 'flex', alignItems: 'flex-start', gap: '6px', padding: '8px 10px', backgroundColor: '#FEF2F2', borderRadius: '8px' }}>
                <ExclamationCircleIcon style={{ width: '16px', height: '16px', color: '#EF4444', flexShrink: 0, marginTop: '1px' }} />
                <p style={{ color: '#DC2626', fontSize: '12px', lineHeight: 1.4 }}>{errors.join('; ')}</p>
              </div>
            )}
            {hasWarnings && !hasErrors && (
              <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ExclamationTriangleIcon style={{ width: '14px', height: '14px', color: '#F59E0B', flexShrink: 0 }} />
                <p style={{ color: '#D97706', fontSize: '12px' }}>{warnings.join('; ')}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{ flexShrink: 0, display: 'flex', flexDirection: isMobile ? 'row' : 'column', gap: '6px' }}>
            <button
              onClick={() => setEditing(!editing)}
              style={{
                width: '36px', height: '36px', borderRadius: '8px',
                border: '1px solid #E5E7EB', backgroundColor: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#6B7280',
                transition: 'all 0.15s'
              }}
              title="Edit"
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F5F3FF'; e.currentTarget.style.borderColor = '#DDD6FE'; e.currentTarget.style.color = '#7C3AED' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.color = '#6B7280' }}
            >
              <PencilIcon style={{ width: '16px', height: '16px' }} />
            </button>
            {showDeleteConfirm ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', animation: 'fadeIn 0.2s ease-out' }}>
                <button
                  onClick={() => { onDelete(index); setShowDeleteConfirm(false) }}
                  style={{
                    padding: '6px 10px', fontSize: '11px', fontWeight: 600,
                    backgroundColor: '#EF4444', color: '#fff', borderRadius: '6px',
                    border: 'none', cursor: 'pointer'
                  }}
                >
                  Delete
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  style={{
                    padding: '6px 10px', fontSize: '11px', fontWeight: 600,
                    backgroundColor: '#F3F4F6', color: '#6B7280', borderRadius: '6px',
                    border: 'none', cursor: 'pointer'
                  }}
                >
                  Keep
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                style={{
                  width: '36px', height: '36px', borderRadius: '8px',
                  border: '1px solid #E5E7EB', backgroundColor: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: '#6B7280',
                  transition: 'all 0.15s'
                }}
                title="Delete"
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#FEF2F2'; e.currentTarget.style.borderColor = '#FECACA'; e.currentTarget.style.color = '#EF4444' }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.color = '#6B7280' }}
              >
                <TrashIcon style={{ width: '16px', height: '16px' }} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Inline edit form */}
      {editing && (
        <RowEditForm
          row={row}
          onSave={handleSave}
          onCancel={() => setEditing(false)}
        />
      )}
    </div>
  )
}

// Tier limit modal
function TierLimitModal({ currentCount, newCount, limit, onReupload, onClose }) {
  const navigate = useNavigate()

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '16px', backgroundColor: 'rgba(0,0,0,0.5)',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{
        backgroundColor: '#fff', borderRadius: '16px',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
        maxWidth: '420px', width: '100%', padding: '28px',
        animation: 'fadeIn 0.25s ease-out'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '50%',
            backgroundColor: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <ExclamationCircleIcon style={{ width: '24px', height: '24px', color: '#EF4444' }} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827' }}>Collection Limit Reached</h3>
        </div>

        <p style={{ color: '#6B7280', fontSize: '15px', marginBottom: '8px', lineHeight: 1.5 }}>
          Your Free plan allows up to <strong>{limit} kit submissions</strong>.
        </p>
        <p style={{ color: '#6B7280', fontSize: '15px', marginBottom: '20px', lineHeight: 1.5 }}>
          You currently have <strong>{currentCount}</strong> submission{currentCount !== 1 ? 's' : ''} and
          are trying to add <strong>{newCount}</strong> more ({currentCount + newCount} total).
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            onClick={onReupload}
            style={{
              width: '100%', padding: '12px', backgroundColor: '#F3F4F6',
              color: '#374151', borderRadius: '10px', fontWeight: 600,
              fontSize: '14px', border: 'none', cursor: 'pointer'
            }}
          >
            Re-upload with fewer rows
          </button>
          <button
            onClick={() => navigate('/pricing')}
            style={{
              width: '100%', padding: '12px', backgroundColor: '#7C3AED',
              color: '#fff', borderRadius: '10px', fontWeight: 600,
              fontSize: '14px', border: 'none', cursor: 'pointer'
            }}
          >
            Upgrade to Pro
          </button>
          <button
            onClick={onClose}
            style={{
              width: '100%', padding: '8px', backgroundColor: 'transparent',
              color: '#9CA3AF', fontSize: '13px', border: 'none', cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default function BulkUploadReview({ initialData, onBack }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const isMobile = useIsMobile()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitProgress, setSubmitProgress] = useState({ current: 0, total: 0 })
  const [showTierModal, setShowTierModal] = useState(false)
  const [existingCount, setExistingCount] = useState(0)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  // Initialize rows with internal IDs and image slots
  const [rows, setRows] = useState(() =>
    initialData.map((row, i) => ({
      ...row,
      _id: `row-${i}-${Date.now()}`,
      _frontImage: null,
      _backImage: null
    }))
  )

  // Check tier limit on mount
  useState(() => {
    async function checkLimit() {
      if (!user) return
      const { count } = await supabase
        .from('jersey_submissions')
        .select('*', { count: 'exact', head: true })
        .eq('submitted_by', user.id)

      setExistingCount(count || 0)
      if ((count || 0) + initialData.length > FREE_TIER_LIMIT) {
        setShowTierModal(true)
      }
    }
    checkLimit()
  })

  const updateRow = useCallback((index, updatedRow) => {
    setRows(prev => prev.map((r, i) => i === index ? updatedRow : r))
  }, [])

  const deleteRow = useCallback((index) => {
    setRows(prev => prev.filter((_, i) => i !== index))
  }, [])

  const handleImageUpload = useCallback((index, type, file) => {
    const err = validateImage(file)
    if (err) return // ImageUploadZone handles its own error display

    const reader = new FileReader()
    reader.onload = (e) => {
      setRows(prev => prev.map((row, i) => {
        if (i !== index) return row
        const imageKey = type === 'front' ? '_frontImage' : '_backImage'
        return {
          ...row,
          [imageKey]: { file, preview: e.target.result }
        }
      }))
    }
    reader.readAsDataURL(file)
  }, [])

  const handleImageRemove = useCallback((index, type) => {
    setRows(prev => prev.map((row, i) => {
      if (i !== index) return row
      const imageKey = type === 'front' ? '_frontImage' : '_backImage'
      return { ...row, [imageKey]: null }
    }))
  }, [])

  // Calculate summary stats
  const errorCount = rows.filter(r => validateRow(r).errors.length > 0).length
  const readyCount = rows.length - errorCount
  const missingImageCount = rows.filter(r => !r._frontImage).length

  // Matches the wizard's uploadImage in KitSubmissionWizard.jsx
  const uploadImage = async (imageFile, type) => {
    if (!imageFile) return null

    try {
      const fileExt = imageFile.name.split('.').pop()
      const timestamp = new Date().getTime()
      const fileName = `${user.id}_${timestamp}_${type}_${Math.random().toString(36).slice(2, 8)}.${fileExt}`
      const filePath = `kit-submissions/${fileName}`

      const { data, error } = await supabase.storage
        .from('jersey-images')
        .upload(filePath, imageFile)

      if (error) throw error

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('jersey-images')
        .getPublicUrl(filePath)

      return publicUrl
    } catch (error) {
      console.error(`Error uploading ${type} image:`, error)
      throw new Error(`Failed to upload ${type} image: ${error.message}`)
    }
  }

  const handleSubmitAll = async () => {
    if (errorCount > 0 || rows.length === 0) return

    if (existingCount + rows.length > FREE_TIER_LIMIT) {
      setShowTierModal(true)
      return
    }

    setIsSubmitting(true)
    setSubmitProgress({ current: 0, total: rows.length })
    let successCount = 0

    try {
      if (!user) {
        throw new Error('You must be logged in to submit kits')
      }

      // Submit each row individually, matching the wizard's submission process
      for (let idx = 0; idx < rows.length; idx++) {
        const row = rows[idx]
        setSubmitProgress({ current: idx + 1, total: rows.length })

        // Upload images to Supabase storage first
        const frontImageUrl = row._frontImage ? await uploadImage(row._frontImage.file, 'front') : null
        const backImageUrl = row._backImage ? await uploadImage(row._backImage.file, 'back') : null

        // Normalize form data to match updated jersey_submissions table schema
        const submissionData = {
          // User info
          submitted_by: user.id,
          status: 'pending',

          // Kit type and basic info
          kit_type: (row.kit_type || '').toLowerCase(),
          jersey_type: (row.jersey_type || '').toLowerCase(),
          season: row.season,

          // Team/Country (unified field)
          team_name: row.team_name,

          // League/Competition (unified field)
          league: row.league || null,
          competition_gender: (row.competition_gender || 'mens').toLowerCase(),
          jersey_fit: JERSEY_FIT_OPTIONS.includes((row.jersey_fit || '').toLowerCase())
            ? row.jersey_fit.toLowerCase()
            : 'mens',

          // Player info
          player_name: row.player_name || null,
          jersey_number: row.player_number ? String(row.player_number) : null,

          // Kit details
          brand: row.manufacturer || null,
          primary_color: row.primary_color || null,
          secondary_color: row.secondary_color || null,
          main_sponsor: row.main_sponsor || null,
          additional_sponsors: row.additional_sponsors || null,
          description: row.description || null,

          // Separate image fields to match public_jerseys structure
          front_image_url: frontImageUrl,
          back_image_url: backImageUrl,
          additional_image_urls: null,

          // Tags - could include kit type and other metadata
          tags: [row.kit_type, row.jersey_type].filter(Boolean),

          // Metadata
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        // Submit to jersey_submissions table
        const { data, error } = await supabase
          .from('jersey_submissions')
          .insert(submissionData)
          .select()
          .single()

        if (error) throw error

        console.log('Kit submitted successfully:', data)
        successCount++
      }

      alert(`${successCount} kit${successCount !== 1 ? 's' : ''} submitted successfully! They will be reviewed by our team and you'll be notified once they're approved.`)
      navigate('/jerseys')
    } catch (error) {
      console.error('Submission error:', error)
      if (successCount > 0) {
        alert(`${successCount} kit${successCount !== 1 ? 's' : ''} submitted successfully, but an error occurred: ${error.message}`)
        navigate('/jerseys')
      } else {
        alert(`Error submitting kit: ${error.message}`)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const canSubmit = errorCount === 0 && rows.length > 0 && !isSubmitting

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Animation keyframes */}
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; max-height: 0; transform: translateY(-8px); }
          to { opacity: 1; max-height: 600px; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.97); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes fadeInRow {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Sticky Header */}
      <div
        style={{
          position: 'sticky', top: 0, zIndex: 10,
          borderRadius: '12px', overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          marginBottom: '24px'
        }}
      >
        <div style={{
          background: 'linear-gradient(-45deg, #7C3AED, #5B21B6, #4C1D95, #3730A3, #312E81)',
          padding: '24px 28px',
          position: 'relative', overflow: 'hidden'
        }}>
          {/* Decorative circles */}
          <div style={{
            position: 'absolute', top: '-20px', right: '-20px',
            width: '100px', height: '100px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.07)'
          }} />
          <div style={{
            position: 'absolute', bottom: '-15px', left: '60px',
            width: '60px', height: '60px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)'
          }} />

          <div style={{
            display: 'flex', alignItems: isMobile ? 'stretch' : 'center',
            justifyContent: 'space-between', position: 'relative',
            flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '14px' : '0'
          }}>
            <div>
              <h1 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
                Review Your Kits
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.85)', marginTop: '4px', fontSize: '15px' }}>
                {rows.length} kit{rows.length !== 1 ? 's' : ''} ready for review
              </p>
            </div>
            <button
              onClick={handleSubmitAll}
              disabled={!canSubmit}
              style={{
                padding: '12px 24px',
                backgroundColor: canSubmit ? '#fff' : 'rgba(255,255,255,0.3)',
                color: canSubmit ? '#205A40' : 'rgba(255,255,255,0.6)',
                borderRadius: '10px', fontWeight: 700, fontSize: '15px',
                border: 'none', cursor: canSubmit ? 'pointer' : 'not-allowed',
                boxShadow: canSubmit ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              {isSubmitting ? `Uploading ${submitProgress.current} of ${submitProgress.total}...` : 'Submit All'}
            </button>
          </div>

          {/* Progress bar */}
          {isSubmitting && (
            <div style={{ marginTop: '16px' }}>
              <div style={{
                width: '100%', height: '6px', borderRadius: '3px',
                backgroundColor: 'rgba(255,255,255,0.2)', overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%', borderRadius: '3px',
                  backgroundColor: '#fff',
                  width: `${submitProgress.total > 0 ? (submitProgress.current / submitProgress.total) * 100 : 0}%`,
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Entry List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {rows.map((row, index) => (
          <div key={row._id} style={{ animation: `fadeInRow 0.3s ease-out ${index * 0.05}s both` }}>
          <JerseyRow
            row={row}
            index={index}
            onUpdate={updateRow}
            onDelete={deleteRow}
            onImageUpload={handleImageUpload}
            onImageRemove={handleImageRemove}
          />
          </div>
        ))}
      </div>

      {rows.length === 0 && (
        <div style={{
          backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB',
          padding: '60px 20px', textAlign: 'center'
        }}>
          <p style={{ color: '#6B7280', fontSize: '15px' }}>All rows have been removed.</p>
          <button
            onClick={onBack}
            style={{
              marginTop: '16px', padding: '10px 24px',
              backgroundColor: '#F3F4F6', color: '#374151',
              borderRadius: '8px', fontWeight: 600, fontSize: '14px',
              border: 'none', cursor: 'pointer'
            }}
          >
            Upload a new file
          </button>
        </div>
      )}

      {/* Bottom Summary */}
      {rows.length > 0 && (
        <div style={{
          marginTop: '24px', backgroundColor: '#fff',
          borderRadius: '12px', border: '1px solid #E5E7EB',
          padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
        }}>
          {/* Stats row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#205A40', fontSize: '14px', fontWeight: 600 }}>
              <CheckCircleIcon style={{ width: '18px', height: '18px' }} />
              {readyCount} ready
            </span>
            {missingImageCount > 0 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#D97706', fontSize: '14px' }}>
                <ExclamationTriangleIcon style={{ width: '18px', height: '18px' }} />
                {missingImageCount} missing images (optional)
              </span>
            )}
            {errorCount > 0 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#DC2626', fontSize: '14px', fontWeight: 600 }}>
                <ExclamationCircleIcon style={{ width: '18px', height: '18px' }} />
                {errorCount} error{errorCount !== 1 ? 's' : ''} to fix
              </span>
            )}
          </div>

          {errorCount > 0 && (
            <p style={{ color: '#DC2626', fontSize: '13px', marginBottom: '16px' }}>
              Fix all errors before submitting.
            </p>
          )}

          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'center',
            paddingTop: '16px', borderTop: '1px solid #F3F4F6',
            flexDirection: isMobile ? 'column-reverse' : 'row', gap: isMobile ? '12px' : '0'
          }}>
            {showCancelConfirm ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '13px', color: '#6B7280' }}>Discard all entries?</span>
                <button
                  onClick={() => { setShowCancelConfirm(false); onBack() }}
                  style={{
                    padding: '6px 14px', fontSize: '13px', fontWeight: 600,
                    backgroundColor: '#EF4444', color: '#fff', borderRadius: '8px',
                    border: 'none', cursor: 'pointer'
                  }}
                >
                  Yes, discard
                </button>
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  style={{
                    padding: '6px 14px', fontSize: '13px', fontWeight: 600,
                    backgroundColor: '#F3F4F6', color: '#374151', borderRadius: '8px',
                    border: 'none', cursor: 'pointer'
                  }}
                >
                  Keep editing
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowCancelConfirm(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '10px 20px', backgroundColor: '#F3F4F6',
                  color: '#4B5563', borderRadius: '10px', fontWeight: 600,
                  fontSize: '14px', border: 'none', cursor: 'pointer'
                }}
              >
                <ArrowLeftIcon style={{ width: '16px', height: '16px' }} />
                Cancel
              </button>
            )}
            <button
              onClick={handleSubmitAll}
              disabled={!canSubmit}
              style={{
                padding: '12px 28px', borderRadius: '10px',
                fontWeight: 700, fontSize: '15px',
                color: '#fff', border: 'none',
                background: canSubmit ? 'linear-gradient(135deg, #205A40, #7C3AED)' : '#D1D5DB',
                boxShadow: canSubmit ? '0 4px 14px -3px rgba(124,58,237,0.4)' : 'none',
                cursor: canSubmit ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s'
              }}
            >
              {isSubmitting ? `Uploading ${submitProgress.current} of ${submitProgress.total}...` : `Submit All (${readyCount})`}
            </button>
          </div>
        </div>
      )}

      {/* Tier Limit Modal */}
      {showTierModal && (
        <TierLimitModal
          currentCount={existingCount}
          newCount={rows.length}
          limit={FREE_TIER_LIMIT}
          onReupload={() => { setShowTierModal(false); onBack() }}
          onClose={() => setShowTierModal(false)}
        />
      )}
    </div>
  )
}
