import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { useNavigate } from 'react-router-dom'
import {
  ChevronLeftIcon,
  PencilSquareIcon,
  MagnifyingGlassIcon,
  CheckIcon,
  XMarkIcon,
  PhotoIcon,
  TrashIcon,
  EyeIcon
} from '@heroicons/react/24/outline'

const PAGE_SIZE = 25

export default function AdminKits() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [kits, setKits] = useState([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [filterType, setFilterType] = useState('all')

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) { setIsAdmin(false); return }
      const { data } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
      setIsAdmin(data?.is_admin || false)
    }
    checkAdmin()
  }, [user])

  useEffect(() => {
    if (isAdmin) fetchKits()
  }, [isAdmin, page, filterType])

  const fetchKits = async () => {
    setLoading(true)

    let query = supabase
      .from('public_jerseys')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

    if (filterType !== 'all') {
      query = query.eq('jersey_type', filterType)
    }

    if (search.trim()) {
      query = query.or(`team_name.ilike.%${search.trim()}%,player_name.ilike.%${search.trim()}%,season.ilike.%${search.trim()}%`)
    }

    const { data, error, count } = await query

    if (!error) {
      setKits(data || [])
      setTotalCount(count || 0)
    }
    setLoading(false)
  }

  // Debounced search
  useEffect(() => {
    if (!isAdmin) return
    const timer = setTimeout(() => {
      setPage(0)
      fetchKits()
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const handleEditStart = (kit) => {
    setEditingId(kit.id)
    setEditForm({
      team_name: kit.team_name || '',
      season: kit.season || '',
      jersey_type: kit.jersey_type || '',
      manufacturer: kit.manufacturer || '',
      league: kit.league || '',
      player_name: kit.player_name || '',
      player_number: kit.player_number || '',
      primary_color: kit.primary_color || '',
      secondary_color: kit.secondary_color || '',
      main_sponsor: kit.main_sponsor || '',
      kit_type: kit.kit_type || 'club',
      competition_gender: kit.competition_gender || 'mens'
    })
  }

  const handleEditSave = async () => {
    setSaving(true)
    const { error } = await supabase
      .from('public_jerseys')
      .update({
        ...editForm,
        player_number: editForm.player_number ? parseInt(editForm.player_number, 10) : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', editingId)

    if (error) {
      alert('Error saving: ' + error.message)
    } else {
      setEditingId(null)
      await fetchKits()
    }
    setSaving(false)
  }

  const handleDelete = async (kit) => {
    if (!window.confirm(`Delete "${kit.team_name} ${kit.season} ${kit.jersey_type}"?\n\nThis cannot be undone.`)) return

    const { error } = await supabase.from('public_jerseys').delete().eq('id', kit.id)
    if (error) {
      alert('Error deleting: ' + error.message)
    } else {
      await fetchKits()
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
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/admin')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#1F2937' }}>Kits</h1>
          <p style={{ fontSize: '14px', color: '#6B7280' }}>{totalCount} kits in database</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex gap-3 mb-4" style={{ flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <MagnifyingGlassIcon style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', width: '16px', height: '16px' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search team, player, or season..."
            style={{
              width: '100%', padding: '10px 12px 10px 36px',
              border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '14px', backgroundColor: 'white'
            }}
          />
        </div>
        <select
          value={filterType}
          onChange={e => { setFilterType(e.target.value); setPage(0) }}
          style={{ padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '14px', backgroundColor: 'white' }}
        >
          <option value="all">All types</option>
          <option value="home">Home</option>
          <option value="away">Away</option>
          <option value="third">Third</option>
          <option value="gk">Goalkeeper</option>
        </select>
      </div>

      {/* Kits Table */}
      {loading ? (
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-3" />
          <p style={{ fontSize: '14px', color: '#6B7280' }}>Loading kits...</p>
        </div>
      ) : (
        <>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            {/* Table Header */}
            <div style={{
              display: 'grid', gridTemplateColumns: '56px 1.5fr 0.7fr 0.7fr 0.8fr 0.7fr 100px',
              gap: '8px', padding: '12px 16px', backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb',
              fontSize: '12px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em'
            }}>
              <span></span>
              <span>Team</span>
              <span>Season</span>
              <span>Type</span>
              <span>Player</span>
              <span>Manufacturer</span>
              <span>Actions</span>
            </div>

            {kits.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '32px', color: '#6B7280', fontSize: '14px' }}>No kits found</p>
            ) : (
              kits.map((kit) => (
                <div key={kit.id}>
                  {editingId === kit.id ? (
                    /* Edit row */
                    <div style={{ padding: '16px', borderBottom: '1px solid #f3f4f6', backgroundColor: '#faf5ff' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                        {[
                          { key: 'team_name', label: 'Team' },
                          { key: 'season', label: 'Season' },
                          { key: 'jersey_type', label: 'Type' },
                          { key: 'manufacturer', label: 'Manufacturer' },
                          { key: 'league', label: 'League' },
                          { key: 'player_name', label: 'Player' },
                          { key: 'player_number', label: 'Number' },
                          { key: 'main_sponsor', label: 'Sponsor' },
                          { key: 'primary_color', label: 'Primary Color' }
                        ].map(f => (
                          <div key={f.key}>
                            <label style={{ fontSize: '11px', fontWeight: 500, color: '#6B7280', display: 'block', marginBottom: '2px' }}>{f.label}</label>
                            <input
                              value={editForm[f.key]}
                              onChange={e => setEditForm({ ...editForm, [f.key]: e.target.value })}
                              style={{ width: '100%', padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px' }}
                            />
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setEditingId(null)} style={{
                          padding: '6px 14px', border: '1px solid #d1d5db', borderRadius: '6px',
                          fontSize: '13px', backgroundColor: 'white', cursor: 'pointer'
                        }}>Cancel</button>
                        <button onClick={handleEditSave} disabled={saving} style={{
                          padding: '6px 14px', backgroundColor: '#16a34a', color: 'white',
                          borderRadius: '6px', border: 'none', fontSize: '13px', fontWeight: 500,
                          cursor: 'pointer', opacity: saving ? 0.5 : 1
                        }}>Save</button>
                      </div>
                    </div>
                  ) : (
                    /* Display row */
                    <div style={{
                      display: 'grid', gridTemplateColumns: '56px 1.5fr 0.7fr 0.7fr 0.8fr 0.7fr 100px',
                      gap: '8px', padding: '12px 16px', borderBottom: '1px solid #f3f4f6',
                      alignItems: 'center', fontSize: '14px'
                    }}>
                      {kit.front_image_url ? (
                        <img
                          src={kit.front_image_url}
                          alt=""
                          style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '6px', border: '1px solid #e5e7eb' }}
                        />
                      ) : (
                        <div style={{ width: '40px', height: '40px', backgroundColor: '#f3f4f6', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <PhotoIcon className="w-5 h-5 text-gray-300" />
                        </div>
                      )}
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontWeight: 500, color: '#1F2937', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{kit.team_name}</p>
                        <p style={{ fontSize: '12px', color: '#9ca3af' }}>{kit.league || ''}</p>
                      </div>
                      <span style={{ color: '#374151' }}>{kit.season}</span>
                      <span style={{ color: '#374151', textTransform: 'capitalize' }}>{kit.jersey_type}</span>
                      <span style={{ color: kit.player_name ? '#374151' : '#d1d5db' }}>
                        {kit.player_name || '—'}
                        {kit.player_number ? ` #${kit.player_number}` : ''}
                      </span>
                      <span style={{ color: '#374151' }}>{kit.manufacturer || '—'}</span>
                      <div className="flex gap-1">
                        <button onClick={() => navigate(`/jerseys/${kit.id}`)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleEditStart(kit)} className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                          <PencilSquareIcon className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(kit)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
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
