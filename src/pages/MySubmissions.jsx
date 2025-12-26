import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  PhotoIcon,
  InboxIcon
} from '@heroicons/react/24/outline'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext.jsx'

export default function MySubmissions() {
  const { user } = useAuth()
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeFilter, setActiveFilter] = useState('all')
  const [imageStates, setImageStates] = useState({}) // Track front/back for each submission

  useEffect(() => {
    if (user) {
      fetchSubmissions()
    }
  }, [user])

  const fetchSubmissions = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('jersey_submissions')
        .select('*')
        .eq('submitted_by', user.id)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      setSubmissions(data || [])
    } catch (err) {
      console.error('Error fetching submissions:', err)
      setError('Failed to load your submissions. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        icon: ClockIcon,
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        label: 'Pending'
      },
      approved: {
        icon: CheckCircleIcon,
        color: 'bg-green-100 text-green-800 border-green-200',
        label: 'Approved'
      },
      rejected: {
        icon: XCircleIcon,
        color: 'bg-red-100 text-red-800 border-red-200',
        label: 'Rejected'
      }
    }

    const config = statusConfig[status] || statusConfig.pending
    const Icon = config.icon

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold border ${config.color}`}>
        <Icon className="w-3.5 h-3.5" />
        {config.label}
      </span>
    )
  }

  const filteredSubmissions = submissions.filter(submission => {
    if (activeFilter === 'all') return true
    return submission.status === activeFilter
  })

  const filterCounts = {
    all: submissions.length,
    pending: submissions.filter(s => s.status === 'pending').length,
    approved: submissions.filter(s => s.status === 'approved').length,
    rejected: submissions.filter(s => s.status === 'rejected').length
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-8 text-center max-w-md">
          <InboxIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-4">You must be logged in to view your submissions.</p>
          <Link
            to="/login"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Log In
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your submissions...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-8 text-center max-w-md">
          <XCircleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchSubmissions}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Compact Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Submissions</h1>
              <p className="text-sm text-gray-600 mt-1">
                Track the status of your kit submissions
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
              <span className="font-medium">{submissions.length}</span>
              <span>Total Submission{submissions.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs - Redesigned */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 py-3 overflow-x-auto">
            {[
              { key: 'all', label: 'All', count: filterCounts.all },
              { key: 'pending', label: 'Pending', count: filterCounts.pending },
              { key: 'approved', label: 'Approved', count: filterCounts.approved },
              { key: 'rejected', label: 'Rejected', count: filterCounts.rejected }
            ].map(filter => (
              <button
                key={filter.key}
                onClick={() => setActiveFilter(filter.key)}
                className={`px-4 py-2 rounded-md font-medium transition-all whitespace-nowrap text-sm ${
                  activeFilter === filter.key
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {filter.label}
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${
                  activeFilter === filter.key
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}>
                  {filter.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredSubmissions.length === 0 ? (
          // Empty State - Minimal
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4">
                <InboxIcon className="text-gray-400" style={{ width: '32px', height: '32px' }} />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">
                {activeFilter === 'all'
                  ? 'No submissions yet'
                  : `No ${activeFilter} submissions`}
              </h3>
              <p className="text-sm text-gray-600 mb-5">
                {activeFilter === 'all'
                  ? "You haven't submitted any kits yet. Start contributing to the database!"
                  : `You don't have any ${activeFilter} submissions at the moment.`}
              </p>
              {activeFilter === 'all' && (
                <Link
                  to="/submit"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium text-sm"
                >
                  <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Submit a Kit
                </Link>
              )}
            </div>
          </div>
        ) : (
          // Submissions Grid - Card Format
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredSubmissions.map((submission) => (
              <div
                key={submission.id}
                className="card border-2 border-gray-200 hover:border-primary-300 transition-all duration-200 overflow-hidden max-w-md mx-auto w-full flex flex-col"
              >
                {/* Jersey Image */}
                {submission.front_image_url || submission.back_image_url ? (
                  <div className="h-64 overflow-hidden flex items-center justify-center bg-gray-50">
                    <img
                      src={(
                        submission.front_image_url && submission.back_image_url
                          ? (imageStates[submission.id] ? submission.back_image_url : submission.front_image_url)
                          : (submission.front_image_url || submission.back_image_url)
                      )}
                      alt={`${submission.team_name} ${submission.jersey_type} kit`}
                      className="max-w-full max-h-full object-contain"
                      style={{maxWidth: '250px', maxHeight: '280px'}}
                      onError={(e) => {
                        e.target.style.display = 'none'
                      }}
                    />
                  </div>
                ) : (
                  <div className="h-64 bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center">
                    <PhotoIcon className="w-16 h-16 text-gray-400" />
                  </div>
                )}

                {/* Front | Back toggle */}
                {submission.front_image_url && submission.back_image_url && (
                  <div className="px-4 py-2 text-center border-b border-gray-100">
                    <div className="flex items-center justify-center gap-2 text-sm">
                      <button
                        onClick={() => setImageStates(prev => ({...prev, [submission.id]: false}))}
                        className={`font-medium transition-colors duration-200 hover:bg-gray-100 px-2 py-1 rounded ${
                          !imageStates[submission.id]
                            ? 'text-blue-600'
                            : 'text-gray-400 hover:text-gray-600'
                        }`}
                      >
                        Front
                      </button>
                      <span className="text-gray-300">|</span>
                      <button
                        onClick={() => setImageStates(prev => ({...prev, [submission.id]: true}))}
                        className={`font-medium transition-colors duration-200 hover:bg-gray-100 px-2 py-1 rounded ${
                          imageStates[submission.id]
                            ? 'text-blue-600'
                            : 'text-gray-400 hover:text-gray-600'
                        }`}
                      >
                        Back
                      </button>
                    </div>
                  </div>
                )}

                {/* Jersey Details */}
                <div className="card-body flex-1 flex flex-col">
                  <div className="mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {submission.team_name || 'Unknown Team'}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {submission.season || 'Unknown Season'}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {submission.jersey_type && (
                        <span className="badge badge-blue capitalize">
                          {submission.jersey_type}
                        </span>
                      )}
                      {submission.brand && (
                        <span className="badge badge-gray">
                          {submission.brand}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Admin Notes */}
                  {submission.admin_notes && (
                    <div className="mb-3 p-2.5 bg-amber-50 rounded border border-amber-200">
                      <p className="text-xs font-semibold text-amber-900 mb-1">Admin Notes:</p>
                      <p className="text-xs text-amber-800">{submission.admin_notes}</p>
                    </div>
                  )}

                  {/* Status and Date */}
                  <div className="mt-auto pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      {getStatusBadge(submission.status)}
                      <span className="text-xs text-gray-500">
                        {formatDate(submission.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
