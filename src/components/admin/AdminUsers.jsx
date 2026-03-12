import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { useNavigate } from 'react-router-dom'
import {
  ChevronLeftIcon,
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

const PAGE_SIZE = 25

const STATUS_COLORS = {
  approved: { bg: '#dcfce7', text: '#166534' },
  pending: { bg: '#fef3c7', text: '#92400e' },
  rejected: { bg: '#fee2e2', text: '#991b1b' }
}

export default function AdminUsers() {
  const { user, approveAccount, rejectAccount } = useAuth()
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [filterStatus, setFilterStatus] = useState('all')
  const [processing, setProcessing] = useState(null)

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) { setIsAdmin(false); return }
      const { data } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
      setIsAdmin(data?.is_admin || false)
    }
    checkAdmin()
  }, [user])

  useEffect(() => {
    if (isAdmin) fetchUsers()
  }, [isAdmin, page, filterStatus])

  // Debounced search
  useEffect(() => {
    if (!isAdmin) return
    const timer = setTimeout(() => { setPage(0); fetchUsers() }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const fetchUsers = async () => {
    setLoading(true)
    let query = supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

    if (filterStatus !== 'all') {
      query = query.eq('approval_status', filterStatus)
    }

    if (search.trim()) {
      query = query.or(`username.ilike.%${search.trim()}%,full_name.ilike.%${search.trim()}%,email.ilike.%${search.trim()}%`)
    }

    const { data, error, count } = await query
    if (!error) {
      setUsers(data || [])
      setTotalCount(count || 0)
    }
    setLoading(false)
  }

  const handleToggleAdmin = async (profile) => {
    const newVal = !profile.is_admin
    if (profile.id === user.id) {
      if (!window.confirm('Are you sure you want to remove your own admin access?')) return
    }
    if (newVal && !window.confirm(`Grant admin access to ${profile.username}?`)) return

    const { error } = await supabase
      .from('profiles')
      .update({ is_admin: newVal })
      .eq('id', profile.id)

    if (error) alert('Error: ' + error.message)
    else await fetchUsers()
  }

  const handleApprove = async (profile) => {
    setProcessing(profile.id)
    const notes = prompt('Optional notes:')
    if (notes === null) { setProcessing(null); return }
    const { error } = await approveAccount(profile.id, notes)
    if (error) alert('Error: ' + error.message)
    else await fetchUsers()
    setProcessing(null)
  }

  const handleReject = async (profile) => {
    setProcessing(profile.id)
    const reason = prompt('Reason for rejection (required):')
    if (!reason || !reason.trim()) { setProcessing(null); return }
    const { error } = await rejectAccount(profile.id, reason)
    if (error) alert('Error: ' + error.message)
    else await fetchUsers()
    setProcessing(null)
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
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#1F2937' }}>Users</h1>
          <p style={{ fontSize: '14px', color: '#6B7280' }}>{totalCount} users</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex gap-3 mb-4" style={{ flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <MagnifyingGlassIcon style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', width: '16px', height: '16px' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search username, name, or email..."
            style={{
              width: '100%', padding: '10px 12px 10px 36px',
              border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '14px', backgroundColor: 'white'
            }}
          />
        </div>
        <select
          value={filterStatus}
          onChange={e => { setFilterStatus(e.target.value); setPage(0) }}
          style={{ padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '14px', backgroundColor: 'white' }}
        >
          <option value="all">All statuses</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-3" />
          <p style={{ fontSize: '14px', color: '#6B7280' }}>Loading users...</p>
        </div>
      ) : (
        <>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            {/* Table Header */}
            <div style={{
              display: 'grid', gridTemplateColumns: '40px 1.2fr 1fr 0.7fr 0.5fr 120px',
              gap: '8px', padding: '12px 16px', backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb',
              fontSize: '12px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em'
            }}>
              <span></span>
              <span>User</span>
              <span>Email</span>
              <span>Status</span>
              <span>Role</span>
              <span>Actions</span>
            </div>

            {users.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '32px', color: '#6B7280', fontSize: '14px' }}>No users found</p>
            ) : (
              users.map((profile) => {
                const status = profile.approval_status || 'pending'
                const colors = STATUS_COLORS[status] || STATUS_COLORS.pending
                const isCurrentUser = profile.id === user.id

                return (
                  <div
                    key={profile.id}
                    style={{
                      display: 'grid', gridTemplateColumns: '40px 1.2fr 1fr 0.7fr 0.5fr 120px',
                      gap: '8px', padding: '12px 16px', borderBottom: '1px solid #f3f4f6',
                      alignItems: 'center', fontSize: '14px'
                    }}
                  >
                    {/* Avatar */}
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '50%',
                      background: profile.is_admin
                        ? 'linear-gradient(135deg, #7c3aed, #c084fc)'
                        : 'linear-gradient(135deg, #6366f1, #93c5fd)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontWeight: 700, fontSize: '13px'
                    }}>
                      {(profile.full_name || profile.username || 'U').charAt(0).toUpperCase()}
                    </div>

                    {/* Name */}
                    <div style={{ minWidth: 0 }}>
                      <button
                        onClick={() => navigate(`/${profile.username}`)}
                        style={{ fontWeight: 500, color: '#1F2937', fontSize: '14px', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }}
                        className="hover:text-purple-600"
                      >
                        {profile.full_name || profile.username}
                        {isCurrentUser && <span style={{ color: '#9ca3af', marginLeft: '4px', fontSize: '12px' }}>(you)</span>}
                      </button>
                      <p style={{ fontSize: '12px', color: '#9ca3af' }}>@{profile.username}</p>
                    </div>

                    {/* Email */}
                    <span style={{ color: '#6B7280', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {profile.email || '—'}
                    </span>

                    {/* Status */}
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      padding: '3px 10px', borderRadius: '9999px', fontSize: '12px', fontWeight: 500,
                      backgroundColor: colors.bg, color: colors.text, width: 'fit-content'
                    }}>
                      {status === 'approved' && <CheckCircleIcon className="w-3 h-3" />}
                      {status === 'pending' && <ClockIcon className="w-3 h-3" />}
                      {status === 'rejected' && <XCircleIcon className="w-3 h-3" />}
                      {status}
                    </span>

                    {/* Role */}
                    <span>
                      {profile.is_admin && (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '3px',
                          padding: '3px 8px', borderRadius: '9999px', fontSize: '11px', fontWeight: 600,
                          backgroundColor: '#f3e8ff', color: '#7c3aed'
                        }}>
                          <ShieldCheckIcon className="w-3 h-3" /> Admin
                        </span>
                      )}
                    </span>

                    {/* Actions */}
                    <div className="flex gap-1">
                      {status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(profile)}
                            disabled={processing === profile.id}
                            style={{
                              padding: '4px 8px', fontSize: '12px', fontWeight: 500,
                              backgroundColor: '#dcfce7', color: '#166534', borderRadius: '6px',
                              border: 'none', cursor: 'pointer', opacity: processing === profile.id ? 0.5 : 1
                            }}
                          >Approve</button>
                          <button
                            onClick={() => handleReject(profile)}
                            disabled={processing === profile.id}
                            style={{
                              padding: '4px 8px', fontSize: '12px', fontWeight: 500,
                              backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '6px',
                              border: 'none', cursor: 'pointer', opacity: processing === profile.id ? 0.5 : 1
                            }}
                          >Reject</button>
                        </>
                      )}
                      <button
                        onClick={() => handleToggleAdmin(profile)}
                        title={profile.is_admin ? 'Remove admin' : 'Make admin'}
                        style={{
                          padding: '4px 8px', fontSize: '12px', fontWeight: 500,
                          backgroundColor: profile.is_admin ? '#f3e8ff' : '#f3f4f6',
                          color: profile.is_admin ? '#7c3aed' : '#6B7280',
                          borderRadius: '6px', border: 'none', cursor: 'pointer'
                        }}
                      >
                        <ShieldCheckIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
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
