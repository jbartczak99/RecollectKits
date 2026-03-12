import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext.jsx'
import {
  ChevronDownIcon,
  ChevronUpIcon,
  EnvelopeIcon,
  UserIcon,
  LinkIcon,
  CalendarIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'contacted', label: 'Contacted', color: 'bg-blue-100 text-blue-800' },
  { value: 'approved', label: 'Approved', color: 'bg-green-100 text-green-800' },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-800' }
]

const TYPE_LABELS = {
  creator: 'Content Creator',
  shop: 'Shop/Retailer',
  club: 'Club/Organization',
  collector: 'Collector',
  retail: 'Retail Partner'
}

const TIER_LABELS = {
  free: 'Free',
  creator: '$25/week',
  shop: '$75/week',
  club: 'Partnership',
  retail: 'Partnership'
}

export default function PartnerApplications() {
  const { user, profile } = useAuth()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)
  const [savingNotes, setSavingNotes] = useState(null)

  const isAdmin = profile?.is_admin

  useEffect(() => {
    if (isAdmin) fetchApplications()
  }, [isAdmin])

  const fetchApplications = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('partner_applications')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error) setApplications(data || [])
    setLoading(false)
  }

  const updateStatus = async (id, newStatus) => {
    const { error } = await supabase
      .from('partner_applications')
      .update({ status: newStatus })
      .eq('id', id)

    if (!error) {
      setApplications(prev =>
        prev.map(app => app.id === id ? { ...app, status: newStatus } : app)
      )
    }
  }

  const saveNotes = async (id, notes) => {
    setSavingNotes(id)
    const { error } = await supabase
      .from('partner_applications')
      .update({ notes })
      .eq('id', id)

    if (!error) {
      setApplications(prev =>
        prev.map(app => app.id === id ? { ...app, notes } : app)
      )
    }
    setSavingNotes(null)
  }

  if (!isAdmin) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600">Admin privileges required.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mx-auto mb-4" />
        <p className="text-gray-600">Loading applications...</p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1
          style={{
            fontFamily: 'Darker Grotesque, sans-serif',
            fontSize: '32px',
            fontWeight: 800,
            color: '#1F2937',
            lineHeight: 1.2
          }}
        >
          Partner Applications
        </h1>
        <p className="text-gray-600 mt-1">{applications.length} total applications</p>
      </div>

      {applications.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No applications yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((app) => {
            const isExpanded = expandedId === app.id
            const statusOption = STATUS_OPTIONS.find(s => s.value === app.status) || STATUS_OPTIONS[0]

            return (
              <div
                key={app.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden transition-shadow hover:shadow-md"
              >
                {/* Row summary - clickable */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : app.id)}
                  className="w-full text-left p-4 md:p-5 flex items-center gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900">{app.name}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusOption.color}`}>
                        {statusOption.label}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {TYPE_LABELS[app.partner_type] || app.partner_type}
                      </span>
                      {app.tier && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          {TIER_LABELS[app.tier] || app.tier}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <EnvelopeIcon className="w-3.5 h-3.5" />
                        {app.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="w-3.5 h-3.5" />
                        {new Date(app.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  {isExpanded
                    ? <ChevronUpIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    : <ChevronDownIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  }
                </button>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="px-4 md:px-5 pb-5 border-t border-gray-100 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {/* Description */}
                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">About</h4>
                        <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">{app.description}</p>
                      </div>

                      {/* Meta info */}
                      <div className="space-y-3">
                        {app.username && (
                          <div>
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Username</h4>
                            <p className="text-gray-800 text-sm flex items-center gap-1">
                              <UserIcon className="w-3.5 h-3.5" />
                              {app.username}
                            </p>
                          </div>
                        )}
                        {app.links && (
                          <div>
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Links</h4>
                            <p className="text-gray-800 text-sm flex items-center gap-1">
                              <LinkIcon className="w-3.5 h-3.5" />
                              {app.links}
                            </p>
                          </div>
                        )}

                        {/* Status dropdown */}
                        <div>
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Status</h4>
                          <select
                            value={app.status}
                            onChange={(e) => updateStatus(app.id, e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                          >
                            {STATUS_OPTIONS.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Admin notes */}
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Admin Notes</h4>
                      <div className="flex gap-2">
                        <textarea
                          defaultValue={app.notes || ''}
                          placeholder="Internal notes..."
                          rows={2}
                          id={`notes-${app.id}`}
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none resize-none"
                        />
                        <button
                          onClick={() => {
                            const textarea = document.getElementById(`notes-${app.id}`)
                            saveNotes(app.id, textarea.value)
                          }}
                          disabled={savingNotes === app.id}
                          className="self-end px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                        >
                          {savingNotes === app.id ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
