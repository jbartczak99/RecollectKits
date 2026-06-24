import { useMemo, useRef, useState, useEffect } from 'react'
import { generateSeasonOptions, normalizeSeason, filterSeasons } from '../../lib/seasons.js'

// Type-to-filter season picker. Suggests canonical options (single year +
// split season) so collections stay uniform, but still accepts free text
// for rare vintage seasons — normalized on blur (2025-26 → 2025/26).

const inputStyle = {
  width: '100%', padding: '10px 14px', border: '1px solid #d1d5db',
  borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
}

const dropdownStyle = {
  position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px',
  background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px',
  boxShadow: '0 8px 24px rgba(0,0,0,0.08)', maxHeight: '220px', overflowY: 'auto', zIndex: 20,
}

export default function SeasonTypeahead({ value, onChange, placeholder = 'e.g. 2025/26 or 2014' }) {
  const [focused, setFocused] = useState(false)
  const wrapperRef = useRef(null)
  const options = useMemo(() => generateSeasonOptions(), [])
  const matches = useMemo(() => filterSeasons(options, value, 12), [options, value])

  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setFocused(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      <input
        type="text"
        value={value}
        onChange={(e) => { onChange(e.target.value); setFocused(true) }}
        onFocus={() => setFocused(true)}
        onBlur={() => onChange(normalizeSeason(value))}
        placeholder={placeholder}
        autoComplete="off"
        inputMode="numeric"
        style={inputStyle}
      />
      {focused && matches.length > 0 && (
        <div style={dropdownStyle}>
          {matches.map((s, i) => (
            <div
              key={s}
              onMouseDown={(e) => { e.preventDefault(); onChange(s); setFocused(false) }}
              style={{
                padding: '9px 14px', cursor: 'pointer', fontSize: '14px',
                borderBottom: i === matches.length - 1 ? 'none' : '1px solid #f3f4f6',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#f9fafb')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              {s}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
