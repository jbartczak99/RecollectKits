import { useState } from 'react'
import { ArrowLeftIcon, ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { supabase } from '../../lib/supabase'
import { submitUncatalogedKit } from '../../lib/uncataloged.js'
import { compressImage } from '../../lib/photoUtils'
import { trackKitAdded } from '../../lib/analytics'
import ClubTypeahead from './ClubTypeahead'

// Slim not-found wizard (Docs/CATALOG_FIRST_DESIGN.md decision 5).
// Required: team, season, kit type. Photo encouraged, everything else
// optional — the kit lands in the collection instantly (pending catalog
// review); admin canonicalizes details at approval, and the existing
// details flag/notify loop chases size & condition.

const TYPE_OPTIONS = [
  ['home', 'Home'], ['away', 'Away'], ['third', 'Third'], ['fourth', 'Fourth'],
  ['goalkeeper', 'Goalkeeper'], ['special', 'Special'], ['training', 'Training'],
]

const inputStyle = {
  width: '100%', padding: '10px 14px', border: '1px solid #d1d5db',
  borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
}
const labelStyle = { display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }
const fieldStyle = { marginBottom: '14px' }

export default function QuickAddKit({ prefillTeam = '', onAdded, onCancel }) {
  const { user } = useAuth()
  const [teamName, setTeamName] = useState(prefillTeam)
  const [season, setSeason] = useState('')
  const [jerseyType, setJerseyType] = useState('home')
  const [kitType, setKitType] = useState('club')
  const [photo, setPhoto] = useState(null)
  const [showExtras, setShowExtras] = useState(false)
  const [extras, setExtras] = useState({
    competitionGender: 'mens', league: '', brand: '', primaryColor: '',
    secondaryColor: '', mainSponsor: '', playerName: '', description: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const setExtra = (key) => (e) => setExtras((prev) => ({ ...prev, [key]: e.target.value }))

  const uploadPhoto = async () => {
    if (!photo) return null
    // Same path convention as the full wizard: first folder segment is
    // auth.uid() so the storage DELETE policy applies to the uploader.
    const processed = await compressImage(photo)
    const filePath = `${user.id}/kit-submissions/${Date.now()}_front.${processed.name.split('.').pop()}`
    const { error: uploadError } = await supabase.storage
      .from('jersey-images')
      .upload(filePath, processed)
    if (uploadError) throw new Error(`Photo upload failed: ${uploadError.message}`)
    const { data: { publicUrl } } = supabase.storage.from('jersey-images').getPublicUrl(filePath)
    return publicUrl
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!teamName.trim() || !season.trim()) {
      setError('Team and season are required.')
      return
    }

    setSubmitting(true)
    try {
      const frontImageUrl = await uploadPhoto()
      const result = await submitUncatalogedKit(supabase, {
        teamName,
        season,
        jerseyType,
        kitType,
        competitionGender: extras.competitionGender,
        league: extras.league,
        brand: extras.brand,
        frontImageUrl,
        primaryColor: extras.primaryColor,
        secondaryColor: extras.secondaryColor,
        mainSponsor: extras.mainSponsor,
        playerName: extras.playerName,
        description: extras.description,
      })

      if (!result.ok) {
        setError(result.message || 'Something went wrong. Please try again.')
        return
      }

      const { count } = await supabase
        .from('user_jerseys')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
      trackKitAdded(count || 1)
      onAdded()
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ maxWidth: '560px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Back"
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '36px', height: '36px', backgroundColor: 'white',
            border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer',
          }}
        >
          <ArrowLeftIcon style={{ width: '18px', height: '18px', color: '#374151' }} />
        </button>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: 0 }}>
            Add your kit
          </h1>
          <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
            It lands in your collection right away — we'll review it for the catalog behind the scenes.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px' }}>
        {error && (
          <div style={{
            padding: '10px 14px', backgroundColor: '#fef2f2', border: '1px solid #fecaca',
            borderRadius: '6px', marginBottom: '14px', fontSize: '13px', color: '#dc2626',
          }}>
            {error}
          </div>
        )}

        <div style={fieldStyle}>
          <label style={labelStyle}>Club or national team *</label>
          <ClubTypeahead
            value={null}
            clubName={teamName}
            onSelect={({ name }) => setTeamName(name || '')}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ ...fieldStyle, flex: 1 }}>
            <label style={labelStyle}>Season *</label>
            <input
              type="text"
              value={season}
              onChange={(e) => setSeason(e.target.value)}
              placeholder="e.g. 2024/25 or 2014"
              required
              style={inputStyle}
            />
          </div>
          <div style={{ ...fieldStyle, flex: 1 }}>
            <label style={labelStyle}>Kit *</label>
            <select value={jerseyType} onChange={(e) => setJerseyType(e.target.value)} style={inputStyle}>
              {TYPE_OPTIONS.map(([v, label]) => <option key={v} value={v}>{label}</option>)}
            </select>
          </div>
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Club or international?</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[['club', 'Club'], ['international', 'International']].map(([v, label]) => (
              <button
                key={v}
                type="button"
                onClick={() => setKitType(v)}
                style={{
                  flex: 1, padding: '8px', borderRadius: '8px', fontSize: '13px',
                  fontWeight: 500, cursor: 'pointer',
                  border: kitType === v ? '1px solid #16a34a' : '1px solid #d1d5db',
                  backgroundColor: kitType === v ? '#f0fdf4' : 'white',
                  color: kitType === v ? '#16a34a' : '#6b7280',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Photo (optional, but it helps a lot)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setPhoto(e.target.files?.[0] || null)}
            style={{ fontSize: '13px' }}
          />
        </div>

        <button
          type="button"
          onClick={() => setShowExtras((s) => !s)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            background: 'none', border: 'none', padding: 0, marginBottom: '14px',
            fontSize: '13px', fontWeight: 500, color: '#16a34a', cursor: 'pointer',
          }}
        >
          {showExtras
            ? <ChevronDownIcon style={{ width: '14px', height: '14px' }} />
            : <ChevronRightIcon style={{ width: '14px', height: '14px' }} />}
          Add more details (optional)
        </button>

        {showExtras && (
          <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '14px' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ ...fieldStyle, flex: 1 }}>
                <label style={labelStyle}>Competition</label>
                <select value={extras.competitionGender} onChange={setExtra('competitionGender')} style={inputStyle}>
                  <option value="mens">Men's</option>
                  <option value="womens">Women's</option>
                </select>
              </div>
              <div style={{ ...fieldStyle, flex: 1 }}>
                <label style={labelStyle}>League</label>
                <input type="text" value={extras.league} onChange={setExtra('league')} style={inputStyle} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ ...fieldStyle, flex: 1 }}>
                <label style={labelStyle}>Brand</label>
                <input type="text" value={extras.brand} onChange={setExtra('brand')} placeholder="Nike, adidas…" style={inputStyle} />
              </div>
              <div style={{ ...fieldStyle, flex: 1 }}>
                <label style={labelStyle}>Main sponsor</label>
                <input type="text" value={extras.mainSponsor} onChange={setExtra('mainSponsor')} style={inputStyle} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ ...fieldStyle, flex: 1 }}>
                <label style={labelStyle}>Primary color</label>
                <input type="text" value={extras.primaryColor} onChange={setExtra('primaryColor')} style={inputStyle} />
              </div>
              <div style={{ ...fieldStyle, flex: 1 }}>
                <label style={labelStyle}>Secondary color</label>
                <input type="text" value={extras.secondaryColor} onChange={setExtra('secondaryColor')} style={inputStyle} />
              </div>
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Player name (if printed)</label>
              <input type="text" value={extras.playerName} onChange={setExtra('playerName')} style={inputStyle} />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Anything else we should know?</label>
              <textarea value={extras.description} onChange={setExtra('description')} rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          style={{
            width: '100%', padding: '12px', backgroundColor: submitting ? '#86efac' : '#16a34a',
            color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px',
            fontWeight: 600, cursor: submitting ? 'default' : 'pointer',
          }}
        >
          {submitting ? 'Adding…' : 'Add to my collection'}
        </button>
      </form>
    </div>
  )
}
