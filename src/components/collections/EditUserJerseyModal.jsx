import { useState, useEffect } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { supabase } from '../../lib/supabase'
import { notifyUserJerseysChanged } from '../../hooks/usePendingDetailsCount'

const backdropStyle = {
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999,
  padding: '16px',
}

const dialogStyle = {
  backgroundColor: 'white',
  borderRadius: '12px',
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  maxWidth: '640px',
  width: '100%',
  maxHeight: '90vh',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
}

const headerStyle = {
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  padding: '20px 24px',
  borderBottom: '1px solid #e5e7eb',
}

const closeBtnStyle = {
  background: 'transparent',
  border: 'none',
  padding: '4px',
  cursor: 'pointer',
  color: '#6b7280',
}

const formStyle = {
  padding: '20px 24px',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  overflowY: 'auto',
}

const labelStyle = {
  display: 'block',
  fontSize: '13px',
  fontWeight: 500,
  color: '#374151',
  marginBottom: '6px',
}

const inputStyle = {
  width: '100%',
  padding: '8px 12px',
  border: '1px solid #d1d5db',
  borderRadius: '8px',
  fontSize: '14px',
  fontFamily: 'inherit',
  outline: 'none',
  boxSizing: 'border-box',
}

const fitButtonRowStyle = {
  display: 'inline-flex',
  border: '1px solid #d1d5db',
  borderRadius: '8px',
  overflow: 'hidden',
}

const errorStyle = {
  background: '#fef2f2',
  border: '1px solid #fecaca',
  color: '#b91c1c',
  padding: '10px 12px',
  borderRadius: '8px',
  fontSize: '13px',
}

const footerStyle = {
  display: 'flex',
  gap: '12px',
  padding: '16px 24px',
  borderTop: '1px solid #e5e7eb',
}

const cancelBtnStyle = (loading) => ({
  flex: 1,
  padding: '10px 16px',
  border: '1px solid #d1d5db',
  backgroundColor: 'white',
  color: '#374151',
  borderRadius: '8px',
  cursor: loading ? 'not-allowed' : 'pointer',
  opacity: loading ? 0.5 : 1,
  fontSize: '14px',
  fontWeight: 500,
})

const saveBtnStyle = (loading) => ({
  flex: 1,
  padding: '10px 16px',
  border: 'none',
  backgroundColor: '#16a34a',
  color: 'white',
  borderRadius: '8px',
  cursor: loading ? 'not-allowed' : 'pointer',
  opacity: loading ? 0.5 : 1,
  fontSize: '14px',
  fontWeight: 500,
})

export default function EditUserJerseyModal({ isOpen, onClose, userJersey, onSuccess }) {
  const [formData, setFormData] = useState({
    jersey_fit: 'mens',
    size: '',
    condition: 'new',
    notes: '',
    acquired_from: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (userJersey) {
      setFormData({
        jersey_fit: userJersey.jersey_fit || 'mens',
        size: userJersey.size || '',
        condition: userJersey.condition || 'new',
        notes: userJersey.notes || '',
        acquired_from: userJersey.acquired_from || '',
      })
    }
  }, [userJersey])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const updateData = {
        jersey_fit: formData.jersey_fit || 'mens',
        size: formData.size || null,
        condition: formData.condition,
        notes: formData.notes || null,
        acquired_from: formData.acquired_from || null,
        details_completed: true,
      }

      const { data, error: updateError } = await supabase
        .from('user_jerseys')
        .update(updateData)
        .eq('id', userJersey.id)
        .select()
        .single()

      if (updateError) throw updateError
      notifyUserJerseysChanged()
      onSuccess?.(data)
      onClose()
    } catch (err) {
      console.error('Error updating jersey details:', err)
      setError(err.message || 'Failed to update jersey details')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setError(null)
      onClose()
    }
  }

  if (!isOpen || !userJersey) return null

  const fitOptions = [
    { value: 'mens', label: "Men's" },
    { value: 'womens', label: "Women's" },
    { value: 'youth', label: 'Youth' },
  ]

  return (
    <div style={backdropStyle} onClick={handleClose}>
      <div style={dialogStyle} onClick={(e) => e.stopPropagation()}>
        <div style={headerStyle}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: 0 }}>
              Edit Jersey Details
            </h2>
            <p style={{ fontSize: '13px', color: '#6b7280', margin: '4px 0 0' }}>
              {userJersey.public_jersey?.team_name} · {userJersey.public_jersey?.season}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            style={closeBtnStyle}
            aria-label="Close"
          >
            <XMarkIcon style={{ width: '20px', height: '20px' }} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={formStyle}>
          {error && <div style={errorStyle}>{error}</div>}

          <div>
            <label style={labelStyle}>Fit & Size</label>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'stretch', flexWrap: 'wrap' }}>
              <div style={fitButtonRowStyle}>
                {fitOptions.map((option, idx) => {
                  const active = formData.jersey_fit === option.value
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, jersey_fit: option.value })}
                      disabled={loading}
                      style={{
                        padding: '8px 14px',
                        fontSize: '14px',
                        fontWeight: 500,
                        border: 'none',
                        borderLeft: idx > 0 ? '1px solid #d1d5db' : 'none',
                        backgroundColor: active ? '#7C3AED' : 'white',
                        color: active ? 'white' : '#374151',
                        cursor: loading ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {option.label}
                    </button>
                  )
                })}
              </div>
              <input
                type="text"
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                placeholder="e.g., M, L, XL"
                style={{ ...inputStyle, flex: 1, minWidth: '120px' }}
                disabled={loading}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Purchased</label>
              <select
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                style={inputStyle}
                disabled={loading}
              >
                <option value="new">New</option>
                <option value="used">Used</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Acquired From</label>
              <input
                type="text"
                value={formData.acquired_from}
                onChange={(e) => setFormData({ ...formData, acquired_from: e.target.value })}
                placeholder="e.g., eBay, Local Shop, Gift"
                style={inputStyle}
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              placeholder="Any additional notes about this jersey..."
              style={{ ...inputStyle, resize: 'vertical', minHeight: '72px' }}
              disabled={loading}
            />
          </div>
        </form>

        <div style={footerStyle}>
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            style={cancelBtnStyle(loading)}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            style={saveBtnStyle(loading)}
          >
            {loading ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
