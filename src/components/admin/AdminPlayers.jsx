import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { useNavigate } from 'react-router-dom'
import { searchPlayer, fetchPlayerDetails, mapToPlayerRecord } from '../../utils/wikidata'
import WikidataPlayerPreview from './WikidataPlayerPreview'
import {
  ChevronLeftIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  TrashIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

const PAGE_SIZE = 25

export default function AdminPlayers() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [totalCount, setTotalCount] = useState(0)

  // Bulk import state
  const [showImport, setShowImport] = useState(false)
  const [importSearch, setImportSearch] = useState('')
  const [importResults, setImportResults] = useState([])
  const [importSearching, setImportSearching] = useState(false)
  const [selectedImport, setSelectedImport] = useState(null)
  const [importDetails, setImportDetails] = useState(null)
  const [importLoading, setImportLoading] = useState(false)
  const [importSaving, setImportSaving] = useState(false)

  // Unlinked jerseys
  const [unlinkedJerseys, setUnlinkedJerseys] = useState([])
  const [showUnlinked, setShowUnlinked] = useState(false)
  const [linkingStates, setLinkingStates] = useState({})

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) { setIsAdmin(false); return }
      const { data } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
      setIsAdmin(data?.is_admin || false)
    }
    checkAdmin()
  }, [user])

  useEffect(() => {
    if (isAdmin) {
      fetchPlayers()
      fetchUnlinked()
    }
  }, [isAdmin, page])

  // Debounced search
  useEffect(() => {
    if (!isAdmin) return
    const timer = setTimeout(() => { setPage(0); fetchPlayers() }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const fetchPlayers = async () => {
    setLoading(true)
    let query = supabase
      .from('players')
      .select('*, player_careers(team_name, is_international)', { count: 'exact' })
      .order('name', { ascending: true })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

    if (search.trim()) {
      query = query.or(`name.ilike.%${search.trim()}%,nationality.ilike.%${search.trim()}%`)
    }

    const { data, error, count } = await query
    if (!error) {
      setPlayers(data || [])
      setTotalCount(count || 0)
    }
    setLoading(false)
  }

  const fetchUnlinked = async () => {
    const { data } = await supabase
      .from('public_jerseys')
      .select('id, team_name, season, jersey_type, player_name, player_number')
      .not('player_name', 'is', null)
      .is('player_id', null)
      .order('created_at', { ascending: false })

    if (data) {
      setUnlinkedJerseys(data.filter(j => j.player_name && j.player_name.trim()))
    }
  }

  const handleDeletePlayer = async (player) => {
    if (!window.confirm(`Delete player "${player.name}"?\n\nThis will unlink all associated kits.`)) return
    const { error } = await supabase.from('players').delete().eq('id', player.id)
    if (error) alert('Error: ' + error.message)
    else await fetchPlayers()
  }

  // Wikidata import
  const handleImportSearch = async () => {
    if (!importSearch.trim()) return
    setImportSearching(true)
    setImportResults([])
    setSelectedImport(null)
    setImportDetails(null)

    const { data, error } = await searchPlayer(importSearch)
    if (!error && data) setImportResults(data)
    setImportSearching(false)
  }

  const handleSelectImport = async (result) => {
    setSelectedImport(result)
    setImportLoading(true)
    const { data, error } = await fetchPlayerDetails(result.wikidataId)
    if (!error && data) setImportDetails(data)
    setImportLoading(false)
  }

  const handleConfirmImport = async () => {
    if (!importDetails) return
    setImportSaving(true)

    try {
      const { player, careers } = mapToPlayerRecord(importDetails)

      // Check existing
      const { data: existing } = await supabase
        .from('players')
        .select('id')
        .eq('wikidata_id', player.wikidata_id)
        .maybeSingle()

      if (existing) {
        alert('Player already exists in database')
        setImportSaving(false)
        return
      }

      const { data: newPlayer, error: playerErr } = await supabase
        .from('players')
        .insert(player)
        .select('id')
        .single()

      if (playerErr) throw playerErr

      if (careers.length > 0) {
        await supabase.from('player_careers').insert(
          careers.map(c => ({ ...c, player_id: newPlayer.id }))
        )
      }

      // Link matching unlinked jerseys
      await supabase
        .from('public_jerseys')
        .update({ player_id: newPlayer.id })
        .ilike('player_name', player.name)
        .is('player_id', null)

      setShowImport(false)
      setImportSearch('')
      setImportResults([])
      setSelectedImport(null)
      setImportDetails(null)
      await fetchPlayers()
      await fetchUnlinked()
    } catch (err) {
      alert('Error importing: ' + err.message)
    }
    setImportSaving(false)
  }

  // Auto-link a single unlinked jersey
  const handleAutoLink = async (jersey) => {
    setLinkingStates(prev => ({ ...prev, [jersey.id]: 'searching' }))

    try {
      const { data: results } = await searchPlayer(jersey.player_name)
      if (!results || results.length === 0) {
        setLinkingStates(prev => ({ ...prev, [jersey.id]: 'no-match' }))
        return
      }

      const { data: details } = await fetchPlayerDetails(results[0].wikidataId)
      if (!details) {
        setLinkingStates(prev => ({ ...prev, [jersey.id]: 'no-match' }))
        return
      }

      const { player, careers } = mapToPlayerRecord(details)

      // Check existing
      const { data: existing } = await supabase
        .from('players')
        .select('id')
        .eq('wikidata_id', player.wikidata_id)
        .maybeSingle()

      let playerId
      if (existing) {
        playerId = existing.id
      } else {
        const { data: newPlayer, error: playerErr } = await supabase
          .from('players').insert(player).select('id').single()
        if (playerErr) throw playerErr
        playerId = newPlayer.id

        if (careers.length > 0) {
          await supabase.from('player_careers').insert(
            careers.map(c => ({ ...c, player_id: playerId }))
          )
        }
      }

      await supabase
        .from('public_jerseys')
        .update({ player_id: playerId })
        .eq('player_name', jersey.player_name)
        .is('player_id', null)

      setLinkingStates(prev => ({ ...prev, [jersey.id]: 'linked' }))
      await fetchUnlinked()
    } catch (err) {
      setLinkingStates(prev => ({ ...prev, [jersey.id]: 'error' }))
    }
  }

  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  if (!isAdmin) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600">Admin privileges required.</p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/admin')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#1F2937' }}>Players</h1>
          <p style={{ fontSize: '14px', color: '#6B7280' }}>{totalCount} players &middot; {unlinkedJerseys.length} unlinked kits</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setShowUnlinked(!showUnlinked); setShowImport(false) }}
            style={{
              padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '8px',
              backgroundColor: showUnlinked ? '#fef3c7' : 'white', fontSize: '14px', fontWeight: 500, cursor: 'pointer',
              color: '#374151'
            }}
          >
            Unlinked ({unlinkedJerseys.length})
          </button>
          <button
            onClick={() => { setShowImport(!showImport); setShowUnlinked(false) }}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 16px', backgroundColor: '#7C3AED', color: 'white',
              borderRadius: '8px', border: 'none', fontSize: '14px', fontWeight: 500, cursor: 'pointer'
            }}
          >
            <PlusIcon className="w-4 h-4" /> Import from Wikidata
          </button>
        </div>
      </div>

      {/* Wikidata Import Panel */}
      {showImport && (
        <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '20px', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1F2937', marginBottom: '12px' }}>Import Player from Wikidata</h3>
          <div className="flex gap-2 mb-4">
            <input
              value={importSearch}
              onChange={e => setImportSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleImportSearch()}
              placeholder="Search player name..."
              style={{ flex: 1, padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
            />
            <button onClick={handleImportSearch} disabled={importSearching} style={{
              padding: '8px 16px', backgroundColor: '#3b82f6', color: 'white',
              borderRadius: '8px', border: 'none', fontSize: '14px', cursor: 'pointer', opacity: importSearching ? 0.5 : 1
            }}>
              {importSearching ? 'Searching...' : 'Search'}
            </button>
          </div>

          {importResults.length > 0 && !selectedImport && (
            <div className="space-y-1.5" style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {importResults.map(r => (
                <button
                  key={r.wikidataId}
                  onClick={() => handleSelectImport(r)}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left', padding: '10px 12px',
                    border: '1px solid #e5e7eb', borderRadius: '8px', backgroundColor: 'white',
                    cursor: 'pointer', fontSize: '14px'
                  }}
                  className="hover:bg-blue-50 hover:border-blue-300 transition-colors"
                >
                  <span style={{ fontWeight: 500, color: '#1F2937' }}>{r.name}</span>
                  {r.description && <span style={{ color: '#6B7280', marginLeft: '8px', fontSize: '13px' }}>{r.description}</span>}
                </button>
              ))}
            </div>
          )}

          {importLoading && <p className="animate-pulse" style={{ fontSize: '14px', color: '#6B7280', padding: '12px 0' }}>Loading player details...</p>}

          {importDetails && !importLoading && (
            <div style={{ backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0', padding: '16px', marginTop: '8px' }}>
              <p style={{ fontWeight: 600, color: '#166534', marginBottom: '4px' }}>{importDetails.name}</p>
              <div style={{ fontSize: '13px', color: '#15803d' }}>
                {importDetails.position && <p>Position: {importDetails.position}</p>}
                {importDetails.nationality && <p>Nationality: {importDetails.nationality}</p>}
                {importDetails.dateOfBirth && <p>Born: {importDetails.dateOfBirth}</p>}
                {importDetails.careers && importDetails.careers.filter(c => !c.isInternational).length > 0 && (
                  <p>Clubs: {importDetails.careers.filter(c => !c.isInternational).map(c => c.teamName).join(' → ')}</p>
                )}
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={handleConfirmImport} disabled={importSaving} style={{
                  padding: '6px 16px', backgroundColor: '#16a34a', color: 'white',
                  borderRadius: '6px', border: 'none', fontSize: '13px', fontWeight: 500,
                  cursor: 'pointer', opacity: importSaving ? 0.5 : 1
                }}>{importSaving ? 'Importing...' : 'Import Player'}</button>
                <button onClick={() => { setSelectedImport(null); setImportDetails(null) }} style={{
                  padding: '6px 16px', border: '1px solid #d1d5db', borderRadius: '6px',
                  fontSize: '13px', backgroundColor: 'white', cursor: 'pointer'
                }}>Pick Different</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Unlinked Jerseys Panel */}
      {showUnlinked && (
        <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '20px', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1F2937', marginBottom: '12px' }}>
            Unlinked Kits ({unlinkedJerseys.length})
          </h3>
          {unlinkedJerseys.length === 0 ? (
            <div className="text-center py-6">
              <CheckCircleIcon className="w-10 h-10 text-green-400 mx-auto mb-2" />
              <p style={{ fontSize: '14px', color: '#6B7280' }}>All player kits are linked!</p>
            </div>
          ) : (
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {unlinkedJerseys.map(jersey => {
                const state = linkingStates[jersey.id]
                return (
                  <div key={jersey.id} className="flex items-center justify-between" style={{
                    padding: '10px 0', borderBottom: '1px solid #f3f4f6'
                  }}>
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: 500, color: '#1F2937' }}>
                        {jersey.player_name}
                        {jersey.player_number && <span style={{ color: '#9ca3af', marginLeft: '4px' }}>#{jersey.player_number}</span>}
                      </p>
                      <p style={{ fontSize: '12px', color: '#6B7280' }}>{jersey.team_name} &middot; {jersey.season} &middot; {jersey.jersey_type}</p>
                    </div>
                    <div>
                      {!state && (
                        <button onClick={() => handleAutoLink(jersey)} style={{
                          padding: '4px 12px', fontSize: '12px', fontWeight: 500, color: '#3b82f6',
                          backgroundColor: '#eff6ff', borderRadius: '6px', border: 'none', cursor: 'pointer'
                        }}>Auto-link</button>
                      )}
                      {state === 'searching' && <span className="animate-pulse" style={{ fontSize: '12px', color: '#3b82f6' }}>Searching...</span>}
                      {state === 'linked' && <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: 500 }}>Linked</span>}
                      {state === 'no-match' && <span style={{ fontSize: '12px', color: '#d97706', fontWeight: 500 }}>No match</span>}
                      {state === 'error' && <span style={{ fontSize: '12px', color: '#dc2626', fontWeight: 500 }}>Error</span>}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '16px' }}>
        <MagnifyingGlassIcon style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', width: '16px', height: '16px' }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search players by name or nationality..."
          style={{
            width: '100%', padding: '10px 12px 10px 36px',
            border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '14px', backgroundColor: 'white'
          }}
        />
      </div>

      {/* Players List */}
      {loading ? (
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-3" />
          <p style={{ fontSize: '14px', color: '#6B7280' }}>Loading players...</p>
        </div>
      ) : (
        <>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            {players.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '32px', color: '#6B7280', fontSize: '14px' }}>No players found</p>
            ) : (
              players.map((player, i) => {
                const clubs = (player.player_careers || []).filter(c => !c.is_international).map(c => c.team_name)
                const intl = (player.player_careers || []).filter(c => c.is_international).map(c => c.team_name)

                return (
                  <div
                    key={player.id}
                    className="flex items-center"
                    style={{ padding: '14px 20px', borderBottom: i < players.length - 1 ? '1px solid #f3f4f6' : 'none', gap: '16px' }}
                  >
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '50%',
                      background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontWeight: 700, fontSize: '14px', flexShrink: 0
                    }}>
                      {player.name.charAt(0)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <button
                        onClick={() => navigate(`/players/${player.id}`)}
                        style={{ fontWeight: 500, color: '#1F2937', fontSize: '15px', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }}
                        className="hover:text-purple-600"
                      >
                        {player.name}
                      </button>
                      <p style={{ fontSize: '12px', color: '#6B7280' }}>
                        {player.position || 'Unknown position'}
                        {player.nationality && ` · ${player.nationality}`}
                        {clubs.length > 0 && ` · ${clubs.slice(0, 3).join(', ')}${clubs.length > 3 ? '...' : ''}`}
                        {intl.length > 0 && ` · ${intl[0]}`}
                      </p>
                    </div>
                    {player.wikidata_id && (
                      <span style={{ fontSize: '11px', color: '#9ca3af', flexShrink: 0 }}>{player.wikidata_id}</span>
                    )}
                    <button onClick={() => handleDeletePlayer(player)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                )
              })
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between" style={{ marginTop: '16px', padding: '0 4px' }}>
              <p style={{ fontSize: '13px', color: '#6B7280' }}>
                Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, totalCount)} of {totalCount}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  style={{
                    padding: '6px 14px', border: '1px solid #d1d5db', borderRadius: '6px',
                    fontSize: '13px', backgroundColor: 'white', cursor: page === 0 ? 'default' : 'pointer',
                    opacity: page === 0 ? 0.5 : 1
                  }}
                >Previous</button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  style={{
                    padding: '6px 14px', border: '1px solid #d1d5db', borderRadius: '6px',
                    fontSize: '13px', backgroundColor: 'white', cursor: page >= totalPages - 1 ? 'default' : 'pointer',
                    opacity: page >= totalPages - 1 ? 0.5 : 1
                  }}
                >Next</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
