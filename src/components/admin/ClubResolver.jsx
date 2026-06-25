import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { searchClubWikidata, fetchClubWikidata, mapToClubRecord } from '../../utils/wikidata'
import countries from '../../data/countries'

// Admin tool: roll an unknown club into the clubs table. Search Wikidata →
// preview the canonical record → add (find-or-create, so re-adding is safe).
// Manual fallback for clubs Wikidata doesn't have. onResolved({ id, name }).

const input = { width: '100%', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }
const label = { display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }
const btn = (bg) => ({ padding: '8px 14px', backgroundColor: bg, color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 500, cursor: 'pointer' })

// Find-or-create: never duplicate a club (by wikidata_id, then name).
async function upsertClub(record) {
  if (record.wikidata_id) {
    const { data } = await supabase.from('clubs').select('id, name').eq('wikidata_id', record.wikidata_id).maybeSingle()
    if (data) return { club: data, created: false }
  }
  const { data: byName } = await supabase.from('clubs').select('id, name').eq('name', record.name).maybeSingle()
  if (byName) return { club: byName, created: false }
  const { data, error } = await supabase.from('clubs').insert(record).select('id, name').single()
  if (error) throw error
  return { club: data, created: true }
}

export default function ClubResolver({ prefill = '', onResolved, onCancel }) {
  const [query, setQuery] = useState(prefill)
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [searched, setSearched] = useState(false)
  const [preview, setPreview] = useState(null) // mapped club record
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState('')
  const [manual, setManual] = useState(null) // { name, country, league }

  useEffect(() => { if (prefill) runSearch(prefill) }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const runSearch = async (q) => {
    const term = (q ?? query).trim()
    if (!term) return
    setSearching(true); setError(''); setPreview(null); setManual(null)
    const { data, error: err } = await searchClubWikidata(term)
    if (err) setError(err)
    setResults(data || [])
    setSearching(false)
    setSearched(true)
  }

  const pick = async (candidate) => {
    setError(''); setPreview(null)
    const { data, error: err } = await fetchClubWikidata(candidate.wikidataId)
    if (err || !data) { setError(err || 'Could not load club details'); return }
    setPreview(mapToClubRecord(data))
  }

  const add = async (record) => {
    setAdding(true); setError('')
    try {
      const { club } = await upsertClub(record)
      onResolved?.(club)
    } catch (err) {
      setError(err.message || 'Failed to add club')
    } finally {
      setAdding(false)
    }
  }

  const submitManual = async () => {
    if (!manual.name.trim()) { setError('Club name is required'); return }
    await add({
      name: manual.name.trim(),
      short_name: null,
      aliases: [],
      country: manual.country || null,
      city: null,
      stadium_name: null,
      primary_league: manual.league || null,
      founded_year: null,
      wikidata_id: null,
      source: 'manual',
    })
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1F2937', margin: 0 }}>Add a club</h3>
        {onCancel && <button type="button" onClick={onCancel} style={{ ...btn('#6b7280') }}>Done</button>}
      </div>

      {error && <div style={{ padding: '8px 12px', background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: '8px', fontSize: '13px', marginBottom: '12px' }}>{error}</div>}

      {!manual && (
        <>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
            <input
              style={{ ...input, flex: 1 }}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && runSearch()}
              placeholder="Search Wikidata for a club, e.g. Borussia Dortmund"
            />
            <button type="button" onClick={() => runSearch()} disabled={searching} style={btn('#7C3AED')}>
              {searching ? 'Searching…' : 'Search'}
            </button>
          </div>

          {searched && !searching && results.length === 0 && !preview && (
            <p style={{ fontSize: '13px', color: '#6b7280' }}>No clubs found on Wikidata for that name.</p>
          )}

          {!preview && results.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
              {results.map((c) => (
                <div key={c.wikidataId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#1F2937' }}>
                      {c.name} {c.confirmed && <span style={{ fontSize: '11px', color: '#16a34a' }}>· club</span>}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>{c.description || c.wikidataId}</div>
                  </div>
                  <button type="button" onClick={() => pick(c)} style={btn('#16a34a')}>Use</button>
                </div>
              ))}
            </div>
          )}

          {preview && (
            <div style={{ border: '1px solid #7C3AED', borderRadius: '10px', padding: '14px', background: '#faf5ff', marginBottom: '12px' }}>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#1F2937' }}>{preview.name}</div>
              <div style={{ fontSize: '13px', color: '#6b7280', margin: '4px 0 10px' }}>
                {[preview.country, preview.city, preview.founded_year, preview.stadium_name].filter(Boolean).join(' · ')}
              </div>
              {preview.aliases.length > 0 && (
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '10px' }}>Aliases: {preview.aliases.join(', ')}</div>
              )}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="button" onClick={() => add(preview)} disabled={adding} style={btn('#16a34a')}>
                  {adding ? 'Adding…' : 'Add to catalog'}
                </button>
                <button type="button" onClick={() => setPreview(null)} style={btn('#6b7280')}>Back</button>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => setManual({ name: query, country: '', league: '' })}
            style={{ background: 'none', border: 'none', color: '#7C3AED', fontSize: '13px', fontWeight: 500, cursor: 'pointer', padding: 0 }}
          >
            Not on Wikidata? Add manually
          </button>
        </>
      )}

      {manual && (
        <div style={{ display: 'grid', gap: '12px' }}>
          <div>
            <label style={label}>Club name *</label>
            <input style={input} value={manual.name} onChange={(e) => setManual({ ...manual, name: e.target.value })} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={label}>Country</label>
              <select style={input} value={manual.country} onChange={(e) => setManual({ ...manual, country: e.target.value })}>
                <option value="">Select…</option>
                {countries.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={label}>League (optional)</label>
              <input style={input} value={manual.league} onChange={(e) => setManual({ ...manual, league: e.target.value })} placeholder="e.g. Bundesliga" />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" onClick={submitManual} disabled={adding} style={btn('#16a34a')}>{adding ? 'Adding…' : 'Add club'}</button>
            <button type="button" onClick={() => setManual(null)} style={btn('#6b7280')}>Back to search</button>
          </div>
        </div>
      )}
    </div>
  )
}
