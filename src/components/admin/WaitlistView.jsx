import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { summarizeWaitlist, INTEREST_LABELS } from '../../lib/waitlist.js'

// Admin waitlist view — reads waitlist_signups directly (admin-read RLS).
// Lets the founder watch signups and pick beta invitees without logging
// into Resend or Supabase.

const fmtDate = (iso) => {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const statBox = { backgroundColor: '#FAF5EF', padding: '16px 20px', borderRadius: '10px', textAlign: 'center', flex: 1 }
const chip = { display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '999px', fontSize: '13px', backgroundColor: '#f3f4f6', color: '#374151' }

export default function WaitlistView() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchRows = async () => {
    setLoading(true)
    setError('')
    const { data, error: err } = await supabase
      .from('waitlist_signups')
      .select('email, first_name, interest, created_at')
      .order('created_at', { ascending: false })
    if (err) setError(err.message)
    setRows(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchRows() }, [])

  const { total, thisWeek, byInterest } = summarizeWaitlist(rows)

  if (loading) {
    return <p style={{ fontSize: '14px', color: '#6B7280', textAlign: 'center', padding: '16px 0' }}>Loading waitlist…</p>
  }
  if (error) {
    return <p style={{ fontSize: '14px', color: '#dc2626', padding: '8px 0' }}>Couldn’t load waitlist: {error}</p>
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1F2937', margin: 0 }}>Waitlist signups</h3>
        <button
          type="button"
          onClick={fetchRows}
          style={{ padding: '6px 14px', border: '1px solid #d1d5db', borderRadius: '8px', backgroundColor: 'white', fontSize: '13px', fontWeight: 500, color: '#374151', cursor: 'pointer' }}
        >
          Refresh
        </button>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
        <div style={statBox}>
          <p style={{ fontSize: '13px', color: '#6B7280', margin: '0 0 4px' }}>Total</p>
          <p style={{ fontSize: '28px', fontWeight: 700, color: '#1F2937', margin: 0 }}>{total.toLocaleString()}</p>
        </div>
        <div style={statBox}>
          <p style={{ fontSize: '13px', color: '#6B7280', margin: '0 0 4px' }}>This week</p>
          <p style={{ fontSize: '28px', fontWeight: 700, color: thisWeek > 0 ? '#16a34a' : '#1F2937', margin: 0 }}>{thisWeek}</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
        {Object.entries(INTEREST_LABELS).map(([key, label]) => (
          <span key={key} style={chip}>{label}: <strong>{byInterest[key]}</strong></span>
        ))}
        {byInterest.unknown > 0 && <span style={chip}>Unspecified: <strong>{byInterest.unknown}</strong></span>}
      </div>

      {rows.length === 0 ? (
        <p style={{ fontSize: '14px', color: '#6B7280', textAlign: 'center', padding: '16px 0' }}>No signups yet.</p>
      ) : (
        <div style={{ maxHeight: '420px', overflowY: 'auto', border: '1px solid #f3f4f6', borderRadius: '8px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ position: 'sticky', top: 0, backgroundColor: '#FAF9F6' }}>
                <th style={{ textAlign: 'left', padding: '10px 14px', color: '#6B7280', fontWeight: 600 }}>Name</th>
                <th style={{ textAlign: 'left', padding: '10px 14px', color: '#6B7280', fontWeight: 600 }}>Email</th>
                <th style={{ textAlign: 'left', padding: '10px 14px', color: '#6B7280', fontWeight: 600 }}>Interest</th>
                <th style={{ textAlign: 'left', padding: '10px 14px', color: '#6B7280', fontWeight: 600 }}>Joined</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={`${r.email}-${i}`} style={{ borderTop: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '10px 14px', color: '#1F2937' }}>{r.first_name || '—'}</td>
                  <td style={{ padding: '10px 14px', color: '#374151' }}>{r.email}</td>
                  <td style={{ padding: '10px 14px', color: '#374151' }}>{INTEREST_LABELS[r.interest] || '—'}</td>
                  <td style={{ padding: '10px 14px', color: '#6B7280' }}>{fmtDate(r.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
