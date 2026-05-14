import { useEffect, useMemo, useRef, useState } from 'react'
import { MagnifyingGlassIcon, XMarkIcon, PlusCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext.jsx'
import countries from '../../data/countries'

const COUNTRY_OPTIONS = Array.from(
  new Set([...countries, 'England', 'Scotland', 'Wales', 'Northern Ireland'])
).sort((a, b) => a.localeCompare(b))

const inputStyle = {
  width: '100%',
  padding: '12px 16px 12px 40px',
  border: '1px solid #d1d5db',
  borderRadius: '8px',
  fontSize: '15px',
  outline: 'none',
  background: '#ffffff',
}

const focusStyle = { borderColor: '#7C3AED', boxShadow: '0 0 0 3px rgba(124,58,237,0.15)' }

const dropdownStyle = {
  position: 'absolute',
  top: '100%',
  left: 0,
  right: 0,
  marginTop: '4px',
  background: '#ffffff',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
  maxHeight: '260px',
  overflowY: 'auto',
  zIndex: 20,
}

const optionStyle = {
  padding: '10px 14px',
  cursor: 'pointer',
  borderBottom: '1px solid #f3f4f6',
  fontSize: '14px',
}

const selectedCardStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '12px',
  padding: '12px 16px',
  background: '#f3e8ff',
  border: '1px solid #7C3AED',
  borderRadius: '8px',
}

export default function ClubTypeahead({ value, clubName, onSelect }) {
  const { user } = useAuth()
  const [clubs, setClubs] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const [mode, setMode] = useState('search') // 'search' | 'suggest' | 'submittedSuggestion'
  const [suggestion, setSuggestion] = useState({ name: '', country: '', league: '' })
  const [submittingSuggestion, setSubmittingSuggestion] = useState(false)
  const [suggestionError, setSuggestionError] = useState('')
  const wrapperRef = useRef(null)

  // Load clubs once.
  useEffect(() => {
    let cancelled = false
    supabase
      .from('clubs')
      .select('id, name, short_name, country, primary_league, aliases')
      .order('name', { ascending: true })
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) {
          console.error('[ClubTypeahead] failed to load clubs:', error)
        }
        setClubs(data || [])
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Close dropdown on outside click.
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setFocused(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return clubs.slice(0, 12)
    return clubs
      .filter((c) => {
        if (c.name.toLowerCase().includes(q)) return true
        if (c.short_name && c.short_name.toLowerCase().includes(q)) return true
        return (c.aliases || []).some((a) => a.toLowerCase().includes(q))
      })
      .slice(0, 12)
  }, [clubs, query])

  const selected = useMemo(() => {
    if (!value) return null
    return clubs.find((c) => c.id === value) || (clubName ? { id: value, name: clubName } : null)
  }, [value, clubName, clubs])

  const handlePick = (club) => {
    onSelect({ id: club.id, name: club.name, source: 'clubs' })
    setQuery('')
    setFocused(false)
  }

  const handleClear = () => {
    onSelect({ id: null, name: '', source: null })
    setQuery('')
    setFocused(true)
  }

  const openSuggestion = () => {
    setSuggestion({
      name: query.trim() || '',
      country: '',
      league: '',
    })
    setSuggestionError('')
    setMode('suggest')
    setFocused(false)
  }

  const cancelSuggestion = () => {
    setMode('search')
    setSuggestion({ name: '', country: '', league: '' })
    setSuggestionError('')
  }

  const submitSuggestion = async (e) => {
    e?.preventDefault?.()
    setSuggestionError('')
    const name = suggestion.name.trim()
    if (!name) {
      setSuggestionError('Club name is required')
      return
    }
    if (!suggestion.country) {
      setSuggestionError('Country is required')
      return
    }

    setSubmittingSuggestion(true)
    try {
      const { error } = await supabase.from('club_suggestions').insert({
        suggested_name: name,
        suggested_country: suggestion.country,
        suggested_league: suggestion.league || null,
        suggested_by: user?.id || null,
        status: 'pending',
      })
      if (error) throw error
      // Use the suggested name as the kit's display name; no canonical club
      // link yet — admin promotes the suggestion later.
      onSelect({ id: null, name, source: 'suggestion' })
      setMode('submittedSuggestion')
    } catch (err) {
      console.error('[ClubTypeahead] suggestion failed:', err)
      setSuggestionError(err.message || 'Failed to send suggestion')
    } finally {
      setSubmittingSuggestion(false)
    }
  }

  // ---------- Render ----------

  if (selected) {
    return (
      <div style={selectedCardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <CheckCircleIcon style={{ width: '20px', height: '20px', color: '#7C3AED', flexShrink: 0 }} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 600, color: '#1F2937', fontSize: '15px' }}>
              {selected.name}
            </div>
            {selected.country && (
              <div style={{ fontSize: '12px', color: '#6B7280' }}>
                {[selected.country, selected.primary_league].filter(Boolean).join(' · ')}
              </div>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={handleClear}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: '#6B7280',
            padding: '4px',
            display: 'inline-flex',
          }}
          aria-label="Change club"
        >
          <XMarkIcon style={{ width: '18px', height: '18px' }} />
        </button>
      </div>
    )
  }

  if (mode === 'submittedSuggestion') {
    return (
      <div style={{ ...selectedCardStyle, background: '#ecfdf5', borderColor: '#10b981' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <CheckCircleIcon style={{ width: '20px', height: '20px', color: '#10b981', flexShrink: 0 }} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 600, color: '#065f46', fontSize: '15px' }}>
              Suggestion submitted: {suggestion.name}
            </div>
            <div style={{ fontSize: '12px', color: '#047857' }}>
              An admin will review and add this club. Your kit will be submitted using the name above.
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            cancelSuggestion()
            onSelect({ id: null, name: '', source: null })
          }}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: '#047857',
            padding: '4px',
            display: 'inline-flex',
          }}
          aria-label="Start over"
        >
          <XMarkIcon style={{ width: '18px', height: '18px' }} />
        </button>
      </div>
    )
  }

  if (mode === 'suggest') {
    return (
      <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px', background: '#fafafa' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#1F2937' }}>
            Suggest a new club
          </h4>
          <button
            type="button"
            onClick={cancelSuggestion}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#6B7280', padding: '4px', display: 'inline-flex' }}
            aria-label="Cancel"
          >
            <XMarkIcon style={{ width: '18px', height: '18px' }} />
          </button>
        </div>
        <div style={{ display: 'grid', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
              Club name *
            </label>
            <input
              type="text"
              value={suggestion.name}
              onChange={(e) => setSuggestion((s) => ({ ...s, name: e.target.value }))}
              placeholder="e.g. AFC Sunderland"
              style={{ ...inputStyle, paddingLeft: '14px' }}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                Country *
              </label>
              <select
                value={suggestion.country}
                onChange={(e) => setSuggestion((s) => ({ ...s, country: e.target.value }))}
                style={{ ...inputStyle, paddingLeft: '14px' }}
              >
                <option value="">Select…</option>
                {COUNTRY_OPTIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                League (optional)
              </label>
              <input
                type="text"
                value={suggestion.league}
                onChange={(e) => setSuggestion((s) => ({ ...s, league: e.target.value }))}
                placeholder="e.g. Championship"
                style={{ ...inputStyle, paddingLeft: '14px' }}
              />
            </div>
          </div>
          {suggestionError && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '8px 12px', borderRadius: '8px', fontSize: '13px' }}>
              {suggestionError}
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button
              type="button"
              onClick={cancelSuggestion}
              disabled={submittingSuggestion}
              style={{ padding: '8px 14px', border: '1px solid #d1d5db', background: '#ffffff', color: '#374151', borderRadius: '8px', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={submitSuggestion}
              disabled={submittingSuggestion}
              style={{ padding: '8px 14px', background: '#7C3AED', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', opacity: submittingSuggestion ? 0.6 : 1 }}
            >
              {submittingSuggestion ? 'Sending…' : 'Submit suggestion'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Default: search mode
  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      <div style={{ position: 'relative' }}>
        <MagnifyingGlassIcon
          style={{
            position: 'absolute',
            left: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '16px',
            height: '16px',
            color: '#9ca3af',
            pointerEvents: 'none',
          }}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setFocused(true)
          }}
          onFocus={() => setFocused(true)}
          placeholder={loading ? 'Loading clubs…' : 'Search clubs (e.g. Manchester United)'}
          style={{
            ...inputStyle,
            ...(focused ? focusStyle : {}),
          }}
          autoComplete="off"
          disabled={loading}
        />
      </div>

      {focused && !loading && (
        <div style={dropdownStyle}>
          {filtered.length === 0 ? (
            <div style={{ padding: '20px 16px', textAlign: 'center', color: '#6B7280', fontSize: '14px' }}>
              <p style={{ margin: 0 }}>No clubs match "{query}".</p>
              <button
                type="button"
                onClick={openSuggestion}
                style={{
                  marginTop: '10px',
                  background: 'transparent',
                  border: 'none',
                  color: '#7C3AED',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '14px',
                }}
              >
                <PlusCircleIcon style={{ width: '16px', height: '16px' }} />
                Suggest a new club
              </button>
            </div>
          ) : (
            <>
              {filtered.map((club, i) => (
                <div
                  key={club.id}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    handlePick(club)
                  }}
                  style={{
                    ...optionStyle,
                    borderBottom: i === filtered.length - 1 ? 'none' : optionStyle.borderBottom,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#f9fafb')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{ fontWeight: 500, color: '#1F2937' }}>{club.name}</div>
                  <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>
                    {[club.country, club.primary_league].filter(Boolean).join(' · ')}
                  </div>
                </div>
              ))}
              <div
                onMouseDown={(e) => {
                  e.preventDefault()
                  openSuggestion()
                }}
                style={{
                  padding: '10px 14px',
                  cursor: 'pointer',
                  background: '#f9fafb',
                  borderTop: '1px solid #e5e7eb',
                  fontSize: '13px',
                  color: '#7C3AED',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <PlusCircleIcon style={{ width: '16px', height: '16px' }} />
                Can't find your club? Suggest a new one
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
