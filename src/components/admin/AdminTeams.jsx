import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { useNavigate } from 'react-router-dom'
import {
  ChevronLeftIcon,
  PencilSquareIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  CheckIcon
} from '@heroicons/react/24/outline'

export default function AdminTeams() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [search, setSearch] = useState('')
  const [editingTeam, setEditingTeam] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [addForm, setAddForm] = useState({ team_name: '', league: '', kit_type: 'club' })
  const [addError, setAddError] = useState('')

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) { setIsAdmin(false); return }
      const { data } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
      setIsAdmin(data?.is_admin || false)
    }
    checkAdmin()
  }, [user])

  useEffect(() => {
    if (isAdmin) fetchTeams()
  }, [isAdmin])

  const fetchTeams = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('public_jerseys')
      .select('team_name, league, kit_type')

    if (!error && data) {
      // Aggregate unique teams with kit counts
      const teamMap = {}
      data.forEach(j => {
        const key = j.team_name
        if (!teamMap[key]) {
          teamMap[key] = { team_name: j.team_name, league: j.league || '', kit_type: j.kit_type || 'club', kitCount: 0 }
        }
        teamMap[key].kitCount++
      })
      const sorted = Object.values(teamMap).sort((a, b) => a.team_name.localeCompare(b.team_name))
      setTeams(sorted)
    }
    setLoading(false)
  }

  const handleEditStart = (team) => {
    setEditingTeam(team.team_name)
    setEditForm({ team_name: team.team_name, league: team.league, kit_type: team.kit_type })
  }

  const handleEditSave = async () => {
    if (!editForm.team_name.trim()) return
    setSaving(true)

    // Update all jerseys with the old team name
    const updates = {}
    if (editForm.team_name !== editingTeam) updates.team_name = editForm.team_name
    if (editForm.league !== undefined) updates.league = editForm.league
    if (editForm.kit_type !== undefined) updates.kit_type = editForm.kit_type

    if (Object.keys(updates).length > 0) {
      const { error } = await supabase
        .from('public_jerseys')
        .update(updates)
        .eq('team_name', editingTeam)

      if (error) {
        alert('Error updating team: ' + error.message)
      } else {
        await fetchTeams()
      }
    }

    setEditingTeam(null)
    setSaving(false)
  }

  const handleAddTeam = async () => {
    setAddError('')
    if (!addForm.team_name.trim()) { setAddError('Team name required'); return }

    // Check if team already exists
    const exists = teams.some(t => t.team_name.toLowerCase() === addForm.team_name.trim().toLowerCase())
    if (exists) { setAddError('Team already exists'); return }

    setSaving(true)
    // Create a placeholder jersey entry for this team
    const { error } = await supabase.from('public_jerseys').insert({
      team_name: addForm.team_name.trim(),
      league: addForm.league.trim() || null,
      kit_type: addForm.kit_type,
      season: 'TBD',
      jersey_type: 'home',
      created_by: user.id
    })

    if (error) {
      setAddError('Error adding team: ' + error.message)
    } else {
      setAddForm({ team_name: '', league: '', kit_type: 'club' })
      setShowAddForm(false)
      await fetchTeams()
    }
    setSaving(false)
  }

  const filtered = teams.filter(t =>
    t.team_name.toLowerCase().includes(search.toLowerCase()) ||
    (t.league && t.league.toLowerCase().includes(search.toLowerCase()))
  )

  if (!isAdmin) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600">Admin privileges required.</p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/admin')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#1F2937' }}>Teams</h1>
          <p style={{ fontSize: '14px', color: '#6B7280' }}>{teams.length} teams in database</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '8px 16px', backgroundColor: '#7C3AED', color: 'white',
            borderRadius: '8px', border: 'none', fontSize: '14px', fontWeight: 500, cursor: 'pointer'
          }}
        >
          <PlusIcon className="w-4 h-4" /> Add Team
        </button>
      </div>

      {/* Add Team Form */}
      {showAddForm && (
        <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '20px', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1F2937', marginBottom: '12px' }}>New Team</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '12px', alignItems: 'end' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 500, color: '#6B7280', display: 'block', marginBottom: '4px' }}>Team Name *</label>
              <input
                value={addForm.team_name}
                onChange={e => setAddForm({ ...addForm, team_name: e.target.value })}
                placeholder="e.g. Manchester United"
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 500, color: '#6B7280', display: 'block', marginBottom: '4px' }}>League</label>
              <input
                value={addForm.league}
                onChange={e => setAddForm({ ...addForm, league: e.target.value })}
                placeholder="e.g. Premier League"
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
              />
            </div>
            <div className="flex gap-2">
              <select
                value={addForm.kit_type}
                onChange={e => setAddForm({ ...addForm, kit_type: e.target.value })}
                style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
              >
                <option value="club">Club</option>
                <option value="international">International</option>
              </select>
              <button onClick={handleAddTeam} disabled={saving} style={{
                padding: '8px 16px', backgroundColor: '#16a34a', color: 'white',
                borderRadius: '8px', border: 'none', fontSize: '14px', fontWeight: 500, cursor: 'pointer', opacity: saving ? 0.5 : 1
              }}>Save</button>
            </div>
          </div>
          {addError && <p style={{ color: '#dc2626', fontSize: '13px', marginTop: '8px' }}>{addError}</p>}
        </div>
      )}

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '16px' }}>
        <MagnifyingGlassIcon style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', width: '16px', height: '16px' }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search teams or leagues..."
          style={{
            width: '100%', padding: '10px 12px 10px 36px',
            border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '14px',
            backgroundColor: 'white'
          }}
        />
      </div>

      {/* Teams List */}
      {loading ? (
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-3" />
          <p style={{ fontSize: '14px', color: '#6B7280' }}>Loading teams...</p>
        </div>
      ) : (
        <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          {filtered.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '32px', color: '#6B7280', fontSize: '14px' }}>
              {search ? 'No teams match your search' : 'No teams in database'}
            </p>
          ) : (
            filtered.map((team, i) => (
              <div
                key={team.team_name}
                style={{
                  display: 'flex', alignItems: 'center', padding: '14px 20px',
                  borderBottom: i < filtered.length - 1 ? '1px solid #f3f4f6' : 'none',
                  gap: '16px'
                }}
              >
                {editingTeam === team.team_name ? (
                  <>
                    <div style={{ flex: 1, display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        value={editForm.team_name}
                        onChange={e => setEditForm({ ...editForm, team_name: e.target.value })}
                        style={{ flex: 1, padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                      />
                      <input
                        value={editForm.league}
                        onChange={e => setEditForm({ ...editForm, league: e.target.value })}
                        placeholder="League"
                        style={{ width: '180px', padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                      />
                      <select
                        value={editForm.kit_type}
                        onChange={e => setEditForm({ ...editForm, kit_type: e.target.value })}
                        style={{ padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                      >
                        <option value="club">Club</option>
                        <option value="international">International</option>
                      </select>
                    </div>
                    <div className="flex gap-1.5">
                      <button onClick={handleEditSave} disabled={saving} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg">
                        <CheckIcon className="w-4 h-4" />
                      </button>
                      <button onClick={() => setEditingTeam(null)} className="p-1.5 text-gray-400 hover:bg-gray-50 rounded-lg">
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '15px', fontWeight: 500, color: '#1F2937' }}>{team.team_name}</p>
                      <p style={{ fontSize: '13px', color: '#6B7280' }}>
                        {team.league || 'No league'} &middot; {team.kit_type === 'international' ? 'International' : 'Club'} &middot; {team.kitCount} kit{team.kitCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <button onClick={() => handleEditStart(team)} className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                      <PencilSquareIcon className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
