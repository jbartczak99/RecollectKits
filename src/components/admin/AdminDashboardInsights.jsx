import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', color: '#b45309' },
  { value: 'reviewing', label: 'Reviewing', color: '#2563eb' },
  { value: 'planned', label: 'Planned', color: '#7c3aed' },
  { value: 'shipped', label: 'Shipped', color: '#16a34a' },
  { value: 'declined', label: 'Declined', color: '#6b7280' },
]

const STATUS_BY_VALUE = Object.fromEntries(STATUS_OPTIONS.map((s) => [s.value, s]))

export default function AdminDashboardInsights() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('pending')
  const [savingId, setSavingId] = useState(null)
  // Local edits before save: { [id]: { status, admin_notes } }
  const [drafts, setDrafts] = useState({})

  const fetchRequests = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: queryError } = await supabase
        .from('dashboard_insight_requests')
        .select(`
          id, user_id, content, status, admin_notes, created_at, updated_at,
          profile:profiles!user_id(username, full_name)
        `)
        .order('created_at', { ascending: false })
      if (queryError) throw queryError
      setRequests(data || [])
    } catch (err) {
      console.error('Failed to load insight requests', err)
      setError(err.message || 'Failed to load.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  const visible =
    filter === 'all' ? requests : requests.filter((r) => r.status === filter)

  const getDraft = (req) => ({
    status: drafts[req.id]?.status ?? req.status,
    admin_notes: drafts[req.id]?.admin_notes ?? req.admin_notes ?? '',
  })

  const isDirty = (req) => {
    const d = getDraft(req)
    return d.status !== req.status || d.admin_notes !== (req.admin_notes || '')
  }

  const updateDraft = (id, patch) => {
    setDrafts((prev) => ({
      ...prev,
      [id]: { ...prev[id], ...patch },
    }))
  }

  const handleSave = async (req) => {
    const draft = getDraft(req)
    setSavingId(req.id)
    try {
      const { error: updateError } = await supabase
        .from('dashboard_insight_requests')
        .update({
          status: draft.status,
          admin_notes: draft.admin_notes.trim() || null,
        })
        .eq('id', req.id)
      if (updateError) throw updateError
      setRequests((prev) =>
        prev.map((r) =>
          r.id === req.id
            ? { ...r, status: draft.status, admin_notes: draft.admin_notes.trim() || null }
            : r
        )
      )
      setDrafts((prev) => {
        const next = { ...prev }
        delete next[req.id]
        return next
      })
    } catch (err) {
      console.error('Failed to save insight request', err)
      alert('Failed to save: ' + (err.message || 'unknown error'))
    } finally {
      setSavingId(null)
    }
  }

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1F2937', margin: 0 }}>
          Dashboard insight requests ({visible.length})
        </h3>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {['all', ...STATUS_OPTIONS.map((s) => s.value)].map((key) => {
            const meta = STATUS_BY_VALUE[key]
            return (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '999px',
                  border: '1px solid',
                  borderColor: filter === key ? '#7c3aed' : '#e5e7eb',
                  background: filter === key ? '#f5f3ff' : 'white',
                  color: filter === key ? '#5b21b6' : '#374151',
                  fontSize: '12px',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {meta ? meta.label : 'All'}
              </button>
            )
          })}
        </div>
      </div>

      {loading ? (
        <p style={{ fontSize: '14px', color: '#6B7280', textAlign: 'center', padding: '16px 0' }}>
          Loading…
        </p>
      ) : error ? (
        <p style={{ fontSize: '14px', color: '#b91c1c' }}>{error}</p>
      ) : visible.length === 0 ? (
        <p style={{ fontSize: '14px', color: '#6B7280', textAlign: 'center', padding: '16px 0' }}>
          {filter === 'pending' ? 'No new ideas waiting.' : `No ${filter} requests.`}
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {visible.map((req) => {
            const draft = getDraft(req)
            const statusMeta = STATUS_BY_VALUE[draft.status] || STATUS_BY_VALUE.pending
            const author = req.profile?.full_name || req.profile?.username || 'Unknown user'
            const dirty = isDirty(req)
            return (
              <div
                key={req.id}
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '10px',
                  padding: '14px 16px',
                  background: '#fff',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '12px',
                    marginBottom: '8px',
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: '13px',
                        color: '#374151',
                        margin: 0,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      }}
                    >
                      {req.content}
                    </p>
                    <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '6px' }}>
                      {author} · {formatDate(req.created_at)}
                    </p>
                  </div>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '2px 10px',
                      borderRadius: '999px',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#fff',
                      backgroundColor: statusMeta.color,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      flexShrink: 0,
                    }}
                  >
                    {statusMeta.label}
                  </span>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '140px 1fr auto',
                    gap: '8px',
                    alignItems: 'center',
                  }}
                >
                  <select
                    value={draft.status}
                    onChange={(e) => updateDraft(req.id, { status: e.target.value })}
                    style={{
                      padding: '6px 8px',
                      borderRadius: '6px',
                      border: '1px solid #d1d5db',
                      fontSize: '13px',
                      background: '#fff',
                    }}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={draft.admin_notes}
                    onChange={(e) => updateDraft(req.id, { admin_notes: e.target.value })}
                    placeholder="Internal notes (optional)…"
                    style={{
                      padding: '6px 8px',
                      borderRadius: '6px',
                      border: '1px solid #d1d5db',
                      fontSize: '13px',
                      minWidth: 0,
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleSave(req)}
                    disabled={!dirty || savingId === req.id}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '6px',
                      border: 'none',
                      background: dirty ? '#7c3aed' : '#e5e7eb',
                      color: dirty ? '#fff' : '#9ca3af',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: dirty && savingId !== req.id ? 'pointer' : 'not-allowed',
                    }}
                  >
                    {savingId === req.id ? 'Saving…' : 'Save'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
