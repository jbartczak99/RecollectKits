import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { searchTeamEntity, fetchSquadForSeason } from '../../utils/wikidata'

// Known column header patterns for auto-detection
const COL_PATTERNS = {
  number: /^(no\.?|#|number|shirt|squad.?no|kit)$/i,
  position: /^(pos\.?|position|role)$/i,
  name: /^(player|name|player.?name|full.?name)$/i,
  nationality: /^(nat\.?|nationality|country|nation)$/i,
}

function detectColumnType(header) {
  const h = header.trim()
  for (const [type, pattern] of Object.entries(COL_PATTERNS)) {
    if (pattern.test(h)) return type
  }
  return null
}

/**
 * Parse tab-separated paste data into rows + auto-detect column mapping.
 * Returns { headers, rows, mapping } where mapping is { name: colIndex, number: colIndex, position: colIndex }
 */
function parsePastedTable(text) {
  const lines = text.split('\n').map(l => l.trimEnd()).filter(l => l.trim())
  if (lines.length === 0) return { headers: [], rows: [], mapping: {} }

  // Split all lines by tab
  const allRows = lines.map(line => line.split('\t').map(c => c.trim()))
  const colCount = Math.max(...allRows.map(r => r.length))

  // Try to detect if first row is a header
  const firstRow = allRows[0]
  const detectedTypes = firstRow.map(h => detectColumnType(h))
  const hasHeader = detectedTypes.some(t => t !== null)

  const headers = hasHeader
    ? firstRow.map((h, i) => ({ label: h, type: detectedTypes[i] }))
    : firstRow.map((_, i) => ({ label: `Col ${i + 1}`, type: null }))

  const dataRows = hasHeader ? allRows.slice(1) : allRows

  // Build initial mapping from detected headers
  const mapping = {}
  headers.forEach((h, i) => {
    if (h.type && !mapping[h.type]) mapping[h.type] = i
  })

  // If no header detection, try heuristic on first data row
  if (!hasHeader && dataRows.length > 0) {
    const sample = dataRows[0]
    sample.forEach((cell, i) => {
      if (!isNaN(parseInt(cell, 10)) && parseInt(cell, 10) <= 99 && !mapping.number) {
        mapping.number = i
      } else if (/^(GK|DF|MF|FW|RB|LB|CB|CM|AM|ST|LW|RW|CDM|CAM|CF|LM|RM|RWB|LWB|DM|WF|SS)$/i.test(cell) && !mapping.position) {
        mapping.position = i
      } else if (/^[A-Z]{2,3}$/i.test(cell) && cell.length <= 3 && !mapping.nationality) {
        mapping.nationality = i
      }
    })
    // The remaining unassigned column with the longest text is likely the name
    if (!mapping.name) {
      let bestIdx = -1, bestLen = 0
      sample.forEach((cell, i) => {
        if (i !== mapping.number && i !== mapping.position && i !== mapping.nationality) {
          if (cell.length > bestLen) { bestLen = cell.length; bestIdx = i }
        }
      })
      if (bestIdx >= 0) mapping.name = bestIdx
    }
  }

  return { headers, rows: dataRows, mapping, colCount }
}

function parseSeasonYear(season) {
  if (!season) return null
  const match = season.match(/^(\d{4})/)
  return match ? parseInt(match[1], 10) : null
}

export default function SquadImportPanel({ jersey, onSaved, onCancel }) {
  const [activeTab, setActiveTab] = useState('excel') // 'excel' | 'csv' | 'wikidata'

  // Excel paste state
  const [pasteText, setPasteText] = useState('')
  const [parsedData, setParsedData] = useState(null) // { headers, rows, mapping, colCount }
  const [colMapping, setColMapping] = useState({}) // { name: idx, number: idx, position: idx }
  const [selectedRows, setSelectedRows] = useState(new Set())

  // CSV state
  const [csvText, setCsvText] = useState('')
  const [csvPreview, setCsvPreview] = useState([])

  // Wikidata state
  const [wdFetching, setWdFetching] = useState(false)
  const [wdSuggestions, setWdSuggestions] = useState([])
  const [selectedWd, setSelectedWd] = useState(new Set())

  // Shared
  const [saving, setSaving] = useState(false)

  // ── Excel paste handlers ──

  const handleParse = () => {
    const result = parsePastedTable(pasteText)
    setParsedData(result)
    setColMapping(result.mapping)
    setSelectedRows(new Set(result.rows.map((_, i) => i)))
  }

  const handleMappingChange = (field, colIdx) => {
    setColMapping(prev => ({ ...prev, [field]: colIdx === '' ? undefined : parseInt(colIdx, 10) }))
  }

  const getMappedPlayers = () => {
    if (!parsedData) return []
    return parsedData.rows
      .map((row, i) => {
        if (!selectedRows.has(i)) return null
        const name = colMapping.name !== undefined ? row[colMapping.name] : null
        const numStr = colMapping.number !== undefined ? row[colMapping.number] : null
        const pos = colMapping.position !== undefined ? row[colMapping.position] : null
        const nat = colMapping.nationality !== undefined ? row[colMapping.nationality] : null
        if (!name || !name.trim()) return null
        // Clean name: remove footnote markers like [1], (c), etc.
        const cleanName = name.replace(/\s*\[.*?\]\s*/g, '').replace(/\s*\(.*?\)\s*/g, '').trim()
        if (!cleanName) return null
        const num = numStr ? parseInt(numStr, 10) : null
        return { name: cleanName, number: isNaN(num) ? null : num, position: pos || null, nationality: nat || null }
      })
      .filter(Boolean)
  }

  const handleExcelSave = async () => {
    const players = getMappedPlayers()
    if (players.length === 0) return
    await saveToSquad(players)
  }

  // ── CSV handlers ──

  const handleCsvPreview = () => {
    if (!csvText.trim()) return setCsvPreview([])
    const lines = csvText.split('\n').map(l => l.trim()).filter(Boolean)
    const parsed = lines.map(line => {
      if (/^(name|player)/i.test(line)) return null
      const parts = line.split(/[,\t]/).map(p => p.trim())
      const name = parts[0] || ''
      const number = parts[1] ? parseInt(parts[1], 10) : null
      const position = parts[2] || null
      if (!name) return null
      return { name, number: isNaN(number) ? null : number, position }
    }).filter(Boolean)
    setCsvPreview(parsed)
  }

  const handleCsvSave = async () => {
    if (csvPreview.length === 0) return
    await saveToSquad(csvPreview)
  }

  // ── Wikidata handlers ──

  const handleFetchWikidata = async () => {
    if (!jersey) return
    setWdFetching(true)
    setWdSuggestions([])
    setSelectedWd(new Set())
    try {
      const team = await searchTeamEntity(jersey.team_name)
      if (!team) {
        alert(`Could not find "${jersey.team_name}" on Wikidata`)
        return
      }
      const startYear = parseSeasonYear(jersey.season)
      if (!startYear) {
        alert('Could not parse season year')
        return
      }
      const players = await fetchSquadForSeason(team.id, startYear)
      setWdSuggestions(players)
      setSelectedWd(new Set(players.map((_, i) => i)))
    } catch (err) {
      alert(`Wikidata fetch error: ${err.message}`)
    } finally {
      setWdFetching(false)
    }
  }

  const handleWdSave = async () => {
    const players = wdSuggestions
      .filter((_, i) => selectedWd.has(i))
      .map(p => ({ name: p.name, number: p.shirtNumber, position: null }))
    if (players.length === 0) return
    await saveToSquad(players)
  }

  // ── Shared save ──

  const saveToSquad = async (players) => {
    setSaving(true)
    try {
      const rows = players.map(p => ({
        team_name: jersey.team_name,
        season: jersey.season,
        player_name: p.name,
        shirt_number: p.number,
        position: p.position,
        nationality: p.nationality || null,
      }))
      const { error } = await supabase
        .from('team_squads')
        .upsert(rows, { onConflict: 'team_name,season,player_name' })
      if (error) throw error
      onSaved()
    } catch (err) {
      alert(`Error saving squad: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  const tabStyle = (tab) => ({
    padding: '0.375rem 0.75rem', fontSize: '0.75rem', fontWeight: 600,
    background: activeTab === tab ? '#166534' : '#f0fdf4',
    color: activeTab === tab ? 'white' : '#166534',
    border: '1px solid #bbf7d0', borderBottom: activeTab === tab ? '1px solid #166534' : '1px solid #bbf7d0',
    borderRadius: '0.375rem 0.375rem 0 0',
    cursor: 'pointer',
  })

  const mappedPlayers = parsedData ? getMappedPlayers() : []

  return (
    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '0.5rem', padding: '1rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#166534' }}>
          Import Squad — {jersey.team_name} {jersey.season}
        </h3>
        <button
          onClick={onCancel}
          style={{ fontSize: '0.75rem', color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          Cancel
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '-1px' }}>
        <button style={tabStyle('excel')} onClick={() => setActiveTab('excel')}>
          Paste from Excel / Wikipedia
        </button>
        <button style={tabStyle('csv')} onClick={() => setActiveTab('csv')}>
          Manual CSV
        </button>
        <button style={tabStyle('wikidata')} onClick={() => setActiveTab('wikidata')}>
          Wikidata
        </button>
      </div>

      <div style={{ border: '1px solid #bbf7d0', borderRadius: '0 0.375rem 0.375rem 0.375rem', padding: '0.75rem', background: 'white' }}>

        {/* ═══ Excel / Wikipedia Tab ═══ */}
        {activeTab === 'excel' && (
          <div>
            <p style={{ fontSize: '0.75rem', color: '#4b5563', marginBottom: '0.5rem' }}>
              Copy a squad table from Wikipedia, a club website, or Excel and paste it below.
              The system will auto-detect columns — you can adjust the mapping if needed.
            </p>
            <textarea
              value={pasteText}
              onChange={(e) => { setPasteText(e.target.value); setParsedData(null) }}
              placeholder={"1\tGK\tWAL\tAndy Fisher\n2\tDF\tENG\tJoshua Key\n3\tDF\tENG\tKyle Naughton\n4\tMF\tCRO\tLuka Ivanušec\n..."}
              style={{
                width: '100%', minHeight: '100px', padding: '0.5rem',
                fontSize: '0.75rem', fontFamily: 'monospace',
                border: '1px solid #d1d5db', borderRadius: '0.375rem',
                resize: 'vertical', boxSizing: 'border-box',
              }}
            />
            <button
              onClick={handleParse}
              disabled={!pasteText.trim()}
              style={{
                marginTop: '0.5rem', padding: '0.375rem 0.75rem', fontSize: '0.75rem', fontWeight: 600,
                background: !pasteText.trim() ? '#d1d5db' : '#2563eb', color: 'white',
                border: 'none', borderRadius: '0.375rem',
                cursor: !pasteText.trim() ? 'not-allowed' : 'pointer',
              }}
            >
              Parse
            </button>

            {/* Column mapping + preview */}
            {parsedData && parsedData.rows.length > 0 && (
              <div style={{ marginTop: '0.75rem' }}>
                {/* Column mapping dropdowns */}
                <div style={{
                  display: 'flex', gap: '0.75rem', flexWrap: 'wrap',
                  padding: '0.5rem', background: '#f9fafb', borderRadius: '0.375rem',
                  border: '1px solid #e5e7eb', marginBottom: '0.5rem',
                }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#374151', alignSelf: 'center' }}>
                    Column mapping:
                  </span>
                  {['name', 'number', 'position', 'nationality'].map(field => (
                    <label key={field} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem' }}>
                      <span style={{ color: '#6b7280', textTransform: 'capitalize' }}>{field}:</span>
                      <select
                        value={colMapping[field] ?? ''}
                        onChange={(e) => handleMappingChange(field, e.target.value)}
                        style={{
                          fontSize: '0.7rem', padding: '0.125rem 0.25rem',
                          border: '1px solid #d1d5db', borderRadius: '0.25rem',
                          background: colMapping[field] !== undefined ? '#dbeafe' : 'white',
                        }}
                      >
                        <option value="">— skip —</option>
                        {parsedData.headers.map((h, i) => (
                          <option key={i} value={i}>{h.label || `Col ${i + 1}`}</option>
                        ))}
                      </select>
                    </label>
                  ))}
                </div>

                {/* Select all / Deselect all */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
                  <span style={{ fontSize: '0.7rem', color: '#374151' }}>
                    {selectedRows.size} of {parsedData.rows.length} rows selected
                    {colMapping.name !== undefined && ` — ${mappedPlayers.length} valid players`}
                  </span>
                  <div style={{ display: 'flex', gap: '0.375rem' }}>
                    <button
                      onClick={() => setSelectedRows(new Set(parsedData.rows.map((_, i) => i)))}
                      style={{ fontSize: '0.65rem', color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      Select all
                    </button>
                    <button
                      onClick={() => setSelectedRows(new Set())}
                      style={{ fontSize: '0.65rem', color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      Deselect all
                    </button>
                  </div>
                </div>

                {/* Preview table */}
                <div style={{ maxHeight: '280px', overflow: 'auto', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}>
                  <table style={{ width: '100%', fontSize: '0.7rem', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f9fafb', position: 'sticky', top: 0, zIndex: 1 }}>
                        <th style={{ padding: '0.375rem 0.375rem', borderBottom: '1px solid #e5e7eb', width: '30px' }}></th>
                        {parsedData.headers.map((h, i) => (
                          <th
                            key={i}
                            style={{
                              padding: '0.375rem 0.5rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb',
                              background: i === colMapping.name ? '#dbeafe'
                                : i === colMapping.number ? '#fef3c7'
                                : i === colMapping.position ? '#dcfce7'
                                : i === colMapping.nationality ? '#fce7f3'
                                : '#f9fafb',
                            }}
                          >
                            {h.label || `Col ${i + 1}`}
                            {i === colMapping.name && <span style={{ color: '#2563eb', marginLeft: '0.25rem' }}>(Name)</span>}
                            {i === colMapping.number && <span style={{ color: '#d97706', marginLeft: '0.25rem' }}>(#)</span>}
                            {i === colMapping.position && <span style={{ color: '#16a34a', marginLeft: '0.25rem' }}>(Pos)</span>}
                            {i === colMapping.nationality && <span style={{ color: '#be185d', marginLeft: '0.25rem' }}>(Nat)</span>}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {parsedData.rows.map((row, i) => (
                        <tr
                          key={i}
                          onClick={() => {
                            setSelectedRows(prev => {
                              const next = new Set(prev)
                              if (next.has(i)) next.delete(i)
                              else next.add(i)
                              return next
                            })
                          }}
                          style={{
                            borderBottom: '1px solid #f3f4f6', cursor: 'pointer',
                            background: selectedRows.has(i) ? '#f0f9ff' : 'white',
                            opacity: selectedRows.has(i) ? 1 : 0.5,
                          }}
                        >
                          <td style={{ padding: '0.25rem 0.375rem', textAlign: 'center' }}>
                            <input
                              type="checkbox"
                              checked={selectedRows.has(i)}
                              onChange={() => {}}
                              style={{ accentColor: '#2563eb', pointerEvents: 'none' }}
                            />
                          </td>
                          {row.map((cell, j) => (
                            <td
                              key={j}
                              style={{
                                padding: '0.25rem 0.5rem',
                                fontWeight: j === colMapping.name ? 600 : 400,
                                background: j === colMapping.name ? '#eff6ff'
                                  : j === colMapping.number ? '#fffbeb'
                                  : j === colMapping.position ? '#f0fdf4'
                                  : j === colMapping.nationality ? '#fdf2f8'
                                  : 'transparent',
                              }}
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Import button */}
                {colMapping.name !== undefined && (
                  <button
                    onClick={handleExcelSave}
                    disabled={saving || mappedPlayers.length === 0}
                    style={{
                      marginTop: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.8rem', fontWeight: 700,
                      background: saving || mappedPlayers.length === 0 ? '#9ca3af' : '#16a34a', color: 'white',
                      border: 'none', borderRadius: '0.375rem',
                      cursor: saving || mappedPlayers.length === 0 ? 'not-allowed' : 'pointer',
                      width: '100%',
                    }}
                  >
                    {saving ? 'Saving...' : `Import ${mappedPlayers.length} Players`}
                  </button>
                )}
                {colMapping.name === undefined && (
                  <p style={{ marginTop: '0.5rem', fontSize: '0.7rem', color: '#dc2626', fontWeight: 500 }}>
                    Please select which column contains the player name.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* ═══ Manual CSV Tab ═══ */}
        {activeTab === 'csv' && (
          <div>
            <p style={{ fontSize: '0.75rem', color: '#4b5563', marginBottom: '0.5rem' }}>
              Type or paste one player per line: <strong>Name, Number, Position</strong> (number and position optional)
            </p>
            <textarea
              value={csvText}
              onChange={(e) => { setCsvText(e.target.value); setCsvPreview([]) }}
              placeholder={"Andy Fisher, 1, GK\nJoshua Key, 2, DF\nKyle Naughton, 3, DF\nLuka Ivanušec, 4, MF"}
              style={{
                width: '100%', minHeight: '120px', padding: '0.5rem',
                fontSize: '0.8rem', fontFamily: 'monospace',
                border: '1px solid #d1d5db', borderRadius: '0.375rem',
                resize: 'vertical', boxSizing: 'border-box',
              }}
            />
            <button
              onClick={handleCsvPreview}
              disabled={!csvText.trim()}
              style={{
                marginTop: '0.5rem', padding: '0.375rem 0.75rem', fontSize: '0.75rem', fontWeight: 600,
                background: !csvText.trim() ? '#d1d5db' : '#2563eb', color: 'white',
                border: 'none', borderRadius: '0.375rem',
                cursor: !csvText.trim() ? 'not-allowed' : 'pointer',
              }}
            >
              Preview
            </button>

            {csvPreview.length > 0 && (
              <div style={{ marginTop: '0.75rem' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#166534', marginBottom: '0.375rem' }}>
                  Preview: {csvPreview.length} players
                </p>
                <div style={{ maxHeight: '200px', overflow: 'auto', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}>
                  <table style={{ width: '100%', fontSize: '0.75rem', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f9fafb', position: 'sticky', top: 0 }}>
                        <th style={{ padding: '0.375rem 0.5rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Name</th>
                        <th style={{ padding: '0.375rem 0.5rem', textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>#</th>
                        <th style={{ padding: '0.375rem 0.5rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Pos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {csvPreview.map((p, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                          <td style={{ padding: '0.25rem 0.5rem' }}>{p.name}</td>
                          <td style={{ padding: '0.25rem 0.5rem', textAlign: 'center' }}>{p.number ?? '—'}</td>
                          <td style={{ padding: '0.25rem 0.5rem' }}>{p.position ?? '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button
                  onClick={handleCsvSave}
                  disabled={saving}
                  style={{
                    marginTop: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.8rem', fontWeight: 700,
                    background: saving ? '#9ca3af' : '#16a34a', color: 'white',
                    border: 'none', borderRadius: '0.375rem',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    width: '100%',
                  }}
                >
                  {saving ? 'Saving...' : `Save ${csvPreview.length} Players`}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ═══ Wikidata Tab ═══ */}
        {activeTab === 'wikidata' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
              <p style={{ fontSize: '0.75rem', color: '#4b5563' }}>
                Pull player data from Wikidata as a starting point. Coverage varies by club.
              </p>
              <button
                onClick={handleFetchWikidata}
                disabled={wdFetching}
                style={{
                  padding: '0.25rem 0.625rem', fontSize: '0.7rem', fontWeight: 600, flexShrink: 0,
                  background: wdFetching ? '#93c5fd' : '#3b82f6', color: 'white',
                  border: 'none', borderRadius: '0.25rem', cursor: wdFetching ? 'not-allowed' : 'pointer',
                  marginLeft: '0.5rem',
                }}
              >
                {wdFetching ? 'Fetching...' : 'Fetch from Wikidata'}
              </button>
            </div>

            {wdSuggestions.length > 0 && (
              <div style={{ marginTop: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
                  <span style={{ fontSize: '0.7rem', color: '#374151' }}>
                    {selectedWd.size} of {wdSuggestions.length} selected
                  </span>
                  <div style={{ display: 'flex', gap: '0.375rem' }}>
                    <button
                      onClick={() => setSelectedWd(new Set(wdSuggestions.map((_, i) => i)))}
                      style={{ fontSize: '0.65rem', color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      Select all
                    </button>
                    <button
                      onClick={() => setSelectedWd(new Set())}
                      style={{ fontSize: '0.65rem', color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      Deselect all
                    </button>
                  </div>
                </div>
                <div style={{ maxHeight: '220px', overflow: 'auto', border: '1px solid #d1d5db', borderRadius: '0.375rem', background: 'white' }}>
                  {wdSuggestions.map((p, i) => (
                    <label
                      key={p.wikidataId || i}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.25rem 0.5rem', fontSize: '0.75rem',
                        borderBottom: i < wdSuggestions.length - 1 ? '1px solid #f3f4f6' : 'none',
                        cursor: 'pointer',
                        background: selectedWd.has(i) ? '#f0f9ff' : 'white',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedWd.has(i)}
                        onChange={() => {
                          setSelectedWd(prev => {
                            const next = new Set(prev)
                            if (next.has(i)) next.delete(i)
                            else next.add(i)
                            return next
                          })
                        }}
                        style={{ accentColor: '#2563eb' }}
                      />
                      <span style={{ flex: 1 }}>{p.name}</span>
                      <span style={{ color: '#9ca3af', minWidth: '2rem', textAlign: 'center' }}>
                        {p.shirtNumber ?? '—'}
                      </span>
                    </label>
                  ))}
                </div>
                <button
                  onClick={handleWdSave}
                  disabled={saving || selectedWd.size === 0}
                  style={{
                    marginTop: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.8rem', fontWeight: 700,
                    background: saving || selectedWd.size === 0 ? '#9ca3af' : '#16a34a', color: 'white',
                    border: 'none', borderRadius: '0.375rem',
                    cursor: saving || selectedWd.size === 0 ? 'not-allowed' : 'pointer',
                    width: '100%',
                  }}
                >
                  {saving ? 'Saving...' : `Import ${selectedWd.size} Players`}
                </button>
              </div>
            )}

            {!wdFetching && wdSuggestions.length === 0 && (
              <p style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '0.5rem' }}>
                Click "Fetch from Wikidata" to search for squad data.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
