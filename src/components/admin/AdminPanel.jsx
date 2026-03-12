import { useState, useEffect } from 'react'
import {
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarIcon,
  UserIcon,
  PhotoIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  PencilSquareIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext.jsx'
import WikidataPlayerPreview from './WikidataPlayerPreview'
import PartnerApplications from './PartnerApplications'
import { searchPlayer, fetchPlayerDetails, mapToPlayerRecord } from '../../utils/wikidata'
import './AdminPanel.css'

export default function AdminPanel() {
  const { user, getPendingAccounts, approveAccount, rejectAccount } = useAuth()
  const [submissions, setSubmissions] = useState([])
  const [pendingAccounts, setPendingAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [accountsLoading, setAccountsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedSubmission, setSelectedSubmission] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [modalAction, setModalAction] = useState(null) // 'approve' or 'reject'
  const [adminNotes, setAdminNotes] = useState('')
  const [processingAction, setProcessingAction] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedSubmissionDetails, setSelectedSubmissionDetails] = useState(null)
  const [partnerAppCount, setPartnerAppCount] = useState(0)
  const [dashStats, setDashStats] = useState({ kits: 0, users: 0, countries: 0, kitsWeek: 0, usersWeek: 0 })
  const [recentActivity, setRecentActivity] = useState([])
  const [expandedQueue, setExpandedQueue] = useState(null) // 'submissions' | 'accounts' | 'partners' | 'players'

  // Check if user is admin by querying profiles table
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        console.log('No user, setting isAdmin to false')
        setIsAdmin(false)
        return
      }

      console.log('Checking admin status for user:', user.email)

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('is_admin, approval_status')
          .eq('id', user.id)
          .single()

        console.log('Admin status query result:', { data, error })

        if (error) {
          console.error('Error checking admin status:', error)
          setIsAdmin(false)
          return
        }

        const isAdminUser = data?.is_admin || false
        console.log('Setting isAdmin to:', isAdminUser)
        setIsAdmin(isAdminUser)
      } catch (err) {
        console.error('Error checking admin status:', err)
        setIsAdmin(false)
      }
    }

    checkAdminStatus()
  }, [user])

  // Fetch pending submissions
  const fetchSubmissions = async () => {
    try {
      setError(null)
      console.log('Fetching submissions...')
      const { data, error: fetchError } = await supabase
        .from('jersey_submissions')
        .select(`
          *,
          profiles:submitted_by (
            id,
            username,
            full_name
          )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (fetchError) {
        console.error('Fetch error:', fetchError)
        throw fetchError
      }

      console.log('Fetched submissions:', data?.length || 0)
      setSubmissions(data || [])
    } catch (err) {
      console.error('Error fetching submissions:', err)
      setError('Failed to load submissions. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fetchPartnerAppCount = async () => {
    const { count } = await supabase
      .from('partner_applications')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending')
    setPartnerAppCount(count || 0)
  }

  const fetchDashStats = async () => {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const [kits, kitsWeek, users, usersWeek, countriesResult] = await Promise.all([
      supabase.from('public_jerseys').select('id', { count: 'exact', head: true }),
      supabase.from('public_jerseys').select('id', { count: 'exact', head: true }).gte('created_at', weekAgo),
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', weekAgo),
      supabase.from('profiles').select('country').not('country', 'is', null)
    ])
    const unique = new Set((countriesResult.data || []).map(p => p.country).filter(Boolean))
    setDashStats({
      kits: kits.count || 0,
      users: users.count || 0,
      countries: unique.size,
      kitsWeek: kitsWeek.count || 0,
      usersWeek: usersWeek.count || 0
    })
  }

  const fetchRecentActivity = async () => {
    const weekAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const [signups, kitSubmissions, partnerApps] = await Promise.all([
      supabase.from('profiles').select('username, created_at').gte('created_at', weekAgo).order('created_at', { ascending: false }).limit(5),
      supabase.from('jersey_submissions').select('team_name, season, created_at, profiles:submitted_by(username)').gte('created_at', weekAgo).order('created_at', { ascending: false }).limit(5),
      supabase.from('partner_applications').select('name, partner_type, created_at').gte('created_at', weekAgo).order('created_at', { ascending: false }).limit(5)
    ])
    const items = []
    for (const u of (signups.data || [])) {
      items.push({ time: u.created_at, text: `${u.username} signed up`, type: 'signup' })
    }
    for (const s of (kitSubmissions.data || [])) {
      items.push({ time: s.created_at, text: `${s.profiles?.username || 'Unknown'} submitted ${s.team_name} ${s.season}`, type: 'submission' })
    }
    for (const p of (partnerApps.data || [])) {
      items.push({ time: p.created_at, text: `${p.name} applied as ${p.partner_type}`, type: 'partner' })
    }
    items.sort((a, b) => new Date(b.time) - new Date(a.time))
    setRecentActivity(items.slice(0, 10))
  }

  useEffect(() => {
    if (isAdmin) {
      fetchSubmissions()
      fetchPartnerAppCount()
      fetchPendingAccounts()
      fetchDashStats()
      fetchRecentActivity()
    }
  }, [isAdmin])

  // Fetch pending accounts
  const fetchPendingAccounts = async () => {
    try {
      setAccountsLoading(true)
      setError(null)
      const { data, error: fetchError } = await getPendingAccounts()

      if (fetchError) throw fetchError

      setPendingAccounts(data || [])
    } catch (err) {
      console.error('Error fetching pending accounts:', err)
      setError('Failed to load pending accounts. Please try again.')
    } finally {
      setAccountsLoading(false)
    }
  }

  // Real-time subscription for submissions
  useEffect(() => {
    if (!isAdmin) return

    const channel = supabase
      .channel('jersey_submissions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'jersey_submissions',
          filter: 'status=eq.pending'
        },
        (payload) => {
          console.log('Submissions changed:', payload)
          fetchSubmissions() // Refetch when changes occur
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [isAdmin])

  const handleAction = async (submission, action) => {
    if (action === 'approve') {
      // Show confirmation dialog for approve action
      const confirmed = window.confirm(
        `Are you sure you want to approve this submission?\n\n` +
        `Team: ${submission.team_name}\n` +
        `Season: ${submission.season}\n` +
        `Type: ${submission.jersey_type}\n\n` +
        `This will add the kit to the main database and cannot be undone.`
      )

      if (!confirmed) {
        return // User cancelled, do nothing
      }
    }

    setSelectedSubmission(submission)
    setModalAction(action)
    setAdminNotes('')
    setShowModal(true)
  }

  const handleShowDetails = (submission) => {
    setSelectedSubmissionDetails(submission)
    setShowDetailsModal(true)
  }

  // Helper: find or create a player record via Wikidata
  async function findOrCreatePlayer(playerName) {
    try {
      // Search Wikidata
      const { data: results } = await searchPlayer(playerName)
      if (!results || results.length === 0) return null

      const topResult = results[0]

      // Check if player already exists by wikidata_id
      const { data: existing } = await supabase
        .from('players')
        .select('id')
        .eq('wikidata_id', topResult.wikidataId)
        .maybeSingle()

      if (existing) return existing.id

      // Fetch full details
      const { data: details } = await fetchPlayerDetails(topResult.wikidataId)
      if (!details) return null

      const { player, careers } = mapToPlayerRecord(details)

      // Insert player
      const { data: newPlayer, error: playerError } = await supabase
        .from('players')
        .insert(player)
        .select('id')
        .single()

      if (playerError) {
        console.error('Error creating player:', playerError)
        return null
      }

      // Insert careers
      if (careers.length > 0) {
        const careerRows = careers.map(c => ({ ...c, player_id: newPlayer.id }))
        await supabase.from('player_careers').insert(careerRows)
      }

      return newPlayer.id
    } catch (err) {
      console.error('Error in findOrCreatePlayer:', err)
      return null
    }
  }

  const handleAccountAction = async (account, action, notes = '') => {
    setProcessingAction(true)
    try {
      if (action === 'approve') {
        console.log('Approving account in admin panel:', account.username)
        const { error } = await approveAccount(account.id, notes)
        if (error) throw error
        console.log('Account approved, refreshing list...')
      } else if (action === 'reject') {
        console.log('Rejecting account in admin panel:', account.username)
        const { error } = await rejectAccount(account.id, notes)
        if (error) throw error
        console.log('Account rejected, refreshing list...')
      }

      await fetchPendingAccounts()
      console.log('Pending accounts list refreshed')

      // Show success message
      alert(`Account ${action}d successfully! ${account.username} has been ${action}d.`)

    } catch (err) {
      console.error(`Error ${action}ing account:`, err)
      alert(`Error ${action}ing account: ${err.message}`)
    } finally {
      setProcessingAction(false)
    }
  }

  const processAction = async () => {
    if (!selectedSubmission || !modalAction) return

    setProcessingAction(true)
    try {
      if (modalAction === 'approve') {
        // Update submission to approved status
        const { error: updateError } = await supabase
          .from('jersey_submissions')
          .update({
            status: 'approved',
            admin_notes: adminNotes || null,
            reviewed_at: new Date().toISOString(),
            reviewed_by: user.id
          })
          .eq('id', selectedSubmission.id)

        if (updateError) throw updateError

        // Copy to public_jerseys table
        const jerseyData = {
          team_name: selectedSubmission.team_name,
          season: selectedSubmission.season,
          jersey_type: selectedSubmission.jersey_type,
          manufacturer: selectedSubmission.brand,
          league: selectedSubmission.league,
          kit_type: selectedSubmission.kit_type,
          front_image_url: selectedSubmission.front_image_url,
          back_image_url: selectedSubmission.back_image_url,
          primary_color: selectedSubmission.primary_color,
          secondary_color: selectedSubmission.secondary_color,
          description: selectedSubmission.description,
          created_by: selectedSubmission.submitted_by,
          player_name: selectedSubmission.player_name || null,
          player_number: selectedSubmission.jersey_number || null,
          competition_gender: selectedSubmission.competition_gender || null,
          main_sponsor: selectedSubmission.main_sponsor || null,
          additional_sponsors: selectedSubmission.additional_sponsors || null,
        }

        // Auto-link player if submission has a player name
        if (selectedSubmission.player_name && selectedSubmission.player_name.trim()) {
          const playerId = await findOrCreatePlayer(selectedSubmission.player_name)
          if (playerId) {
            jerseyData.player_id = playerId
          }
        }

        const { data: newJersey, error: insertError } = await supabase
          .from('public_jerseys')
          .insert(jerseyData)
          .select()
          .single()

        if (insertError) throw insertError

        // Add to submitter's "All Kits" collection with details_completed: false
        // User will need to fill in size, condition, etc.
        if (newJersey && selectedSubmission.submitted_by) {
          await supabase
            .from('user_jerseys')
            .insert({
              user_id: selectedSubmission.submitted_by,
              public_jersey_id: newJersey.id,
              details_completed: false,
              created_at: new Date().toISOString()
            })
        }

      } else if (modalAction === 'reject') {
        // For reject: delete the submission from the database
        console.log('Deleting submission:', selectedSubmission.id)

        const { data, error: deleteError, count } = await supabase
          .from('jersey_submissions')
          .delete()
          .eq('id', selectedSubmission.id)
          .select()

        console.log('Delete response:', { data, error: deleteError, count, rowsAffected: data?.length })

        if (deleteError) {
          console.error('Delete error:', deleteError)
          throw deleteError
        }

        // Check if any rows were actually deleted
        if (!data || data.length === 0) {
          console.error('Delete returned no error but no rows were deleted - likely RLS policy blocking')
          throw new Error('Failed to delete submission. You may not have permission to delete this record.')
        }

        console.log('Submission deleted successfully:', data)
      }

      // Close modal and clear state first
      setShowModal(false)
      setSelectedSubmission(null)
      setModalAction(null)
      setAdminNotes('')

      // Then refresh submissions list
      console.log('Refreshing submissions list...')
      await fetchSubmissions()
      console.log('Submissions list refreshed')

    } catch (err) {
      console.error('Error processing action:', err)
      alert(`Error ${modalAction}ing submission: ${err.message}`)

      // Still close the modal even if there was an error
      setShowModal(false)
      setSelectedSubmission(null)
      setModalAction(null)
      setAdminNotes('')
    } finally {
      setProcessingAction(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const ImageToggle = ({ submission }) => {
    const [showBack, setShowBack] = useState(false)

    const frontImage = submission.front_image_url
    const backImage = submission.back_image_url
    const currentImage = showBack ? backImage : frontImage

    return (
      <div className="relative flex-shrink-0">
        {currentImage ? (
          <div className="relative group">
            <img
              src={currentImage}
              alt={showBack ? 'Back view' : 'Front view'}
              className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-lg border-2 border-gray-200 bg-gray-50"
              style={{
                maxWidth: '6rem',
                maxHeight: '6rem',
                objectFit: 'contain'
              }}
            />
            {backImage && (
              <button
                onClick={() => setShowBack(!showBack)}
                className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center"
                title={showBack ? 'Show Front' : 'Show Back'}
              >
                <span className="opacity-0 group-hover:opacity-100 text-white text-xs font-medium">
                  {showBack ? 'Front' : 'Back'}
                </span>
              </button>
            )}
            <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white text-xs rounded-full px-2 py-0.5 font-medium shadow-sm">
              {showBack ? 'B' : 'F'}
            </div>
          </div>
        ) : (
          <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
            <PhotoIcon className="w-8 h-8 text-gray-400" />
          </div>
        )}
      </div>
    )
  }

  const SubmissionDetailsModal = ({ submission, onClose }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [isEditMode, setIsEditMode] = useState(false)
    const [editedData, setEditedData] = useState({})
    const [isSaving, setIsSaving] = useState(false)

    // Initialize edited data when entering edit mode
    const initializeEditData = () => {
      setEditedData({
        team_name: submission.team_name || '',
        season: submission.season || '',
        jersey_type: submission.jersey_type || '',
        kit_type: submission.kit_type || '',
        league: submission.league || '',
        brand: submission.brand || '',
        player_name: submission.player_name || '',
        jersey_number: submission.jersey_number || '',
        primary_color: submission.primary_color || '',
        secondary_color: submission.secondary_color || '',
        main_sponsor: submission.main_sponsor || '',
        additional_sponsors: submission.additional_sponsors || '',
        description: submission.description || ''
      })
    }

    const handleEditToggle = () => {
      if (!isEditMode) {
        initializeEditData()
      }
      setIsEditMode(!isEditMode)
    }

    const handleInputChange = (field, value) => {
      setEditedData(prev => ({
        ...prev,
        [field]: value
      }))
    }

    if (!submission) return null

    // Collect all images
    const allImages = [
      submission.front_image_url,
      submission.back_image_url,
      ...(submission.additional_image_urls || [])
    ].filter(Boolean)

    const nextImage = () => {
      setCurrentImageIndex((prev) => (prev + 1) % allImages.length)
    }

    const prevImage = () => {
      setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length)
    }

    const formatFieldValue = (value) => {
      return value && value.toString().trim() ? value : 'N/A'
    }

    const handleSaveChanges = async () => {
      setIsSaving(true)
      try {
        const { error } = await supabase
          .from('jersey_submissions')
          .update({
            ...editedData,
            updated_at: new Date().toISOString(),
            updated_by: user.id
          })
          .eq('id', submission.id)

        if (error) throw error

        // Update the local submission object
        Object.assign(submission, editedData)
        setIsEditMode(false)

        // Optionally refresh the parent component
        // You might want to add a callback prop to refresh the submissions list

      } catch (err) {
        console.error('Error saving changes:', err)
        alert(`Error saving changes: ${err.message}`)
      } finally {
        setIsSaving(false)
      }
    }

    const handleApproveWithChanges = async () => {
      // Show confirmation dialog
      const confirmed = window.confirm(
        `Are you sure you want to save changes and approve this submission?\n\n` +
        `Team: ${editedData.team_name}\n` +
        `Season: ${editedData.season}\n` +
        `Type: ${editedData.jersey_type}\n\n` +
        `This will save your changes and add the kit to the main database. This cannot be undone.`
      )

      if (!confirmed) {
        return // User cancelled
      }

      setIsSaving(true)
      try {
        // First save the changes
        const { error: updateError } = await supabase
          .from('jersey_submissions')
          .update({
            ...editedData,
            status: 'approved',
            reviewed_at: new Date().toISOString(),
            reviewed_by: user.id,
            updated_at: new Date().toISOString(),
            updated_by: user.id
          })
          .eq('id', submission.id)

        if (updateError) throw updateError

        // Then copy to public_jerseys table with edited data
        const jerseyData = {
          team_name: editedData.team_name,
          season: editedData.season,
          jersey_type: editedData.jersey_type,
          manufacturer: editedData.brand,
          league: editedData.league,
          kit_type: editedData.kit_type || submission.kit_type,
          front_image_url: submission.front_image_url,
          back_image_url: submission.back_image_url,
          primary_color: editedData.primary_color,
          secondary_color: editedData.secondary_color,
          description: editedData.description,
          created_by: submission.submitted_by,
          player_name: editedData.player_name || null,
          player_number: editedData.jersey_number || null,
          competition_gender: submission.competition_gender || null,
          main_sponsor: editedData.main_sponsor || null,
          additional_sponsors: editedData.additional_sponsors || null,
        }

        // Auto-link player if submission has a player name
        const playerName = editedData.player_name || submission.player_name
        if (playerName && playerName.trim()) {
          const playerId = await findOrCreatePlayer(playerName)
          if (playerId) {
            jerseyData.player_id = playerId
          }
        }

        const { data: newJersey, error: insertError } = await supabase
          .from('public_jerseys')
          .insert(jerseyData)
          .select()
          .single()

        if (insertError) throw insertError

        // Add to submitter's "All Kits" collection with details_completed: false
        // User will need to fill in size, condition, etc.
        if (newJersey && submission.submitted_by) {
          await supabase
            .from('user_jerseys')
            .insert({
              user_id: submission.submitted_by,
              public_jersey_id: newJersey.id,
              details_completed: false,
              created_at: new Date().toISOString()
            })
        }

        // Close modal first
        onClose()

        // Refresh parent component submissions list
        await fetchSubmissions()

      } catch (err) {
        console.error('Error approving with changes:', err)
        alert(`Error approving with changes: ${err.message}`)
      } finally {
        setIsSaving(false)
      }
    }

    return (
      <div className="submission-details-modal" onClick={onClose}>
        <div className="submission-details-content" onClick={(e) => e.stopPropagation()}>
          <div className="flex flex-col h-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 rounded-t-lg flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">{submission.team_name}</h2>
                <p className="text-blue-100 text-sm">Submission Details</p>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors p-2 rounded-full hover:bg-white hover:bg-opacity-20 flex items-center justify-center"
                style={{ minWidth: '40px', minHeight: '40px' }}
              >
                <XCircleIcon className="w-8 h-8" />
              </button>
            </div>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Image Gallery */}
            {allImages.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Kit Images ({allImages.length})</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  {/* Image with External Navigation */}
                  <div className="flex items-center justify-center gap-2">
                    {/* Left Arrow */}
                    {allImages.length > 1 && (
                      <button
                        onClick={prevImage}
                        className="bg-white text-gray-700 rounded-full p-3 hover:bg-gray-100 transition-all shadow-lg border flex-shrink-0 flex items-center justify-center"
                        style={{ minWidth: '48px', minHeight: '48px' }}
                      >
                        <ChevronLeftIcon className="w-6 h-6" style={{ color: '#374151' }} />
                      </button>
                    )}

                    {/* Image Container */}
                    <div className="bg-white rounded-lg border flex items-center justify-center flex-1" style={{ height: '300px' }}>
                      <img
                        src={allImages[currentImageIndex]}
                        alt={`Kit image ${currentImageIndex + 1}`}
                        className="max-w-full max-h-full object-contain"
                        style={{ maxHeight: '280px' }}
                      />
                    </div>

                    {/* Right Arrow */}
                    {allImages.length > 1 && (
                      <button
                        onClick={nextImage}
                        className="bg-white text-gray-700 rounded-full p-3 hover:bg-gray-100 transition-all shadow-lg border flex-shrink-0 flex items-center justify-center"
                        style={{ minWidth: '48px', minHeight: '48px' }}
                      >
                        <ChevronRightIcon className="w-6 h-6" style={{ color: '#374151' }} />
                      </button>
                    )}
                  </div>

                  {/* Navigation Controls */}
                  <div className="mt-4">
                    {/* Navigation Dots */}
                    {allImages.length > 1 && (
                      <div className="flex justify-center space-x-2 mb-3">
                        {allImages.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`w-2 h-2 rounded-full transition-all ${
                              currentImageIndex === index
                                ? 'bg-blue-600'
                                : 'bg-gray-300 hover:bg-gray-400'
                            }`}
                          />
                        ))}
                      </div>
                    )}

                    {/* Counter */}
                    <div className="text-center text-sm text-gray-600">
                      <span className="font-medium">
                        {currentImageIndex + 1}/{allImages.length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Submission Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">Basic Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">Team/Country:</span>
                    {isEditMode ? (
                      <input
                        type="text"
                        value={editedData.team_name}
                        onChange={(e) => handleInputChange('team_name', e.target.value)}
                        className="px-2 py-1 border rounded text-sm max-w-xs"
                      />
                    ) : (
                      <span className="text-gray-900">{formatFieldValue(submission.team_name)}</span>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">Season:</span>
                    {isEditMode ? (
                      <input
                        type="text"
                        value={editedData.season}
                        onChange={(e) => handleInputChange('season', e.target.value)}
                        className="px-2 py-1 border rounded text-sm max-w-xs"
                      />
                    ) : (
                      <span className="text-gray-900">{formatFieldValue(submission.season)}</span>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">Jersey Type:</span>
                    {isEditMode ? (
                      <select
                        value={editedData.jersey_type}
                        onChange={(e) => handleInputChange('jersey_type', e.target.value)}
                        className="px-2 py-1 border rounded text-sm max-w-xs"
                      >
                        <option value="">Select type</option>
                        <option value="home">Home</option>
                        <option value="away">Away</option>
                        <option value="third">Third</option>
                        <option value="goalkeeper">Goalkeeper</option>
                        <option value="training">Training</option>
                      </select>
                    ) : (
                      <span className="text-gray-900 capitalize">{formatFieldValue(submission.jersey_type)}</span>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">Kit Type:</span>
                    {isEditMode ? (
                      <select
                        value={editedData.kit_type}
                        onChange={(e) => handleInputChange('kit_type', e.target.value)}
                        className="px-2 py-1 border rounded text-sm max-w-xs"
                      >
                        <option value="">Select type</option>
                        <option value="club">Club</option>
                        <option value="international">International</option>
                      </select>
                    ) : (
                      <span className="text-gray-900 capitalize">{formatFieldValue(submission.kit_type)}</span>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">League/Competition:</span>
                    {isEditMode ? (
                      <input
                        type="text"
                        value={editedData.league}
                        onChange={(e) => handleInputChange('league', e.target.value)}
                        className="px-2 py-1 border rounded text-sm max-w-xs"
                      />
                    ) : (
                      <span className="text-gray-900">{formatFieldValue(submission.league)}</span>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">Manufacturer:</span>
                    {isEditMode ? (
                      <input
                        type="text"
                        value={editedData.brand}
                        onChange={(e) => handleInputChange('brand', e.target.value)}
                        className="px-2 py-1 border rounded text-sm max-w-xs"
                      />
                    ) : (
                      <span className="text-gray-900">{formatFieldValue(submission.brand)}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Player & Style Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">Player & Style Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">Player Name:</span>
                    {isEditMode ? (
                      <input
                        type="text"
                        value={editedData.player_name}
                        onChange={(e) => handleInputChange('player_name', e.target.value)}
                        className="px-2 py-1 border rounded text-sm max-w-xs"
                      />
                    ) : (
                      <span className="text-gray-900">{formatFieldValue(submission.player_name)}</span>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">Jersey Number:</span>
                    {isEditMode ? (
                      <input
                        type="number"
                        value={editedData.jersey_number}
                        onChange={(e) => handleInputChange('jersey_number', e.target.value)}
                        className="px-2 py-1 border rounded text-sm max-w-xs"
                        min="1"
                        max="99"
                      />
                    ) : (
                      <span className="text-gray-900">{formatFieldValue(submission.jersey_number)}</span>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">Primary Color:</span>
                    {isEditMode ? (
                      <input
                        type="text"
                        value={editedData.primary_color}
                        onChange={(e) => handleInputChange('primary_color', e.target.value)}
                        className="px-2 py-1 border rounded text-sm max-w-xs"
                      />
                    ) : (
                      <span className="text-gray-900">{formatFieldValue(submission.primary_color)}</span>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">Secondary Color:</span>
                    {isEditMode ? (
                      <input
                        type="text"
                        value={editedData.secondary_color}
                        onChange={(e) => handleInputChange('secondary_color', e.target.value)}
                        className="px-2 py-1 border rounded text-sm max-w-xs"
                      />
                    ) : (
                      <span className="text-gray-900">{formatFieldValue(submission.secondary_color)}</span>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">Main Sponsor:</span>
                    {isEditMode ? (
                      <input
                        type="text"
                        value={editedData.main_sponsor}
                        onChange={(e) => handleInputChange('main_sponsor', e.target.value)}
                        className="px-2 py-1 border rounded text-sm max-w-xs"
                      />
                    ) : (
                      <span className="text-gray-900">{formatFieldValue(submission.main_sponsor)}</span>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">Additional Sponsors:</span>
                    {isEditMode ? (
                      <input
                        type="text"
                        value={editedData.additional_sponsors}
                        onChange={(e) => handleInputChange('additional_sponsors', e.target.value)}
                        className="px-2 py-1 border rounded text-sm max-w-xs"
                      />
                    ) : (
                      <span className="text-gray-900">{formatFieldValue(submission.additional_sponsors)}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Wikidata Player Preview */}
            {submission.player_name && submission.player_name.trim() && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                  Player Profile (Wikidata)
                </h3>
                <WikidataPlayerPreview
                  playerName={isEditMode ? editedData.player_name : submission.player_name}
                />
              </div>
            )}

            {/* Description */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">Description</h3>
              {isEditMode ? (
                <textarea
                  value={editedData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  placeholder="Enter description..."
                />
              ) : (
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                  {formatFieldValue(submission.description)}
                </p>
              )}
            </div>

            {/* Submission Metadata */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">Submission Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    submission.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    submission.status === 'approved' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {submission.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Submitted By:</span>
                  <span className="text-gray-900">{submission.profiles?.username || 'Unknown'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Submission Date:</span>
                  <span className="text-gray-900">{formatDate(submission.created_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Submission ID:</span>
                  <span className="text-gray-900 font-mono text-xs">{submission.id}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions - Fixed at bottom */}
          <div className="bg-gray-50 px-6 py-3 rounded-b-lg flex justify-between items-center border-t flex-shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors text-sm"
            >
              Close
            </button>

            <div className="flex gap-2">
              {isEditMode ? (
                // Edit Mode Buttons
                <>
                  <button
                    onClick={() => setIsEditMode(false)}
                    className="px-4 py-2 text-gray-700 bg-white border rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveChanges}
                    disabled={isSaving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={handleApproveWithChanges}
                    disabled={isSaving}
                    className="action-button action-button-approve disabled:opacity-50"
                  >
                    <CheckCircleIcon className="w-4 h-4" />
                    {isSaving ? 'Processing...' : 'Save & Approve'}
                  </button>
                </>
              ) : (
                // View Mode Buttons
                <>
                  <button
                    onClick={handleEditToggle}
                    className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
                    style={{ backgroundColor: '#ea580c' }}
                  >
                    <span className="text-white font-bold">✏️</span>
                    Edit
                  </button>
                  <button
                    onClick={async () => {
                      const confirmed = window.confirm(
                        `Are you sure you want to approve this submission?\n\n` +
                        `Team: ${submission.team_name}\n` +
                        `Season: ${submission.season}\n` +
                        `Type: ${submission.jersey_type}\n\n` +
                        `This will add the kit to the main database and cannot be undone.`
                      )

                      if (confirmed) {
                        onClose()
                        handleAction(submission, 'approve')
                      }
                    }}
                    className="action-button action-button-approve"
                  >
                    <CheckCircleIcon className="w-4 h-4" />
                    Approve
                  </button>
                  <button
                    onClick={async () => {
                      const confirmed = window.confirm(
                        `Are you sure you want to reject this submission?\n\n` +
                        `Team: ${submission.team_name}\n` +
                        `Season: ${submission.season}\n` +
                        `Type: ${submission.jersey_type}\n\n` +
                        `This will permanently delete the submission.`
                      )

                      if (confirmed) {
                        onClose()
                        handleAction(submission, 'reject')
                      }
                    }}
                    className="action-button action-button-reject"
                  >
                    <XCircleIcon className="w-4 h-4" />
                    Reject
                  </button>
                </>
              )}
            </div>
          </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-8 text-center max-w-md">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You must be logged in to access the admin panel.</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-8 text-center max-w-md">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Admin Access Required</h2>
          <p className="text-gray-600">You don't have permission to access the admin panel.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading submissions...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-8 text-center max-w-md">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
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

  // Bulk Player Linker component
  function BulkPlayerLinker() {
    const [unlinkedJerseys, setUnlinkedJerseys] = useState([])
    const [loadingUnlinked, setLoadingUnlinked] = useState(false)
    const [jerseyStates, setJerseyStates] = useState({})
    // jerseyStates[jerseyId] = { status, searchResults, selectedDetails, error }

    const fetchUnlinked = async () => {
      setLoadingUnlinked(true)
      let { data, error: queryError } = await supabase
        .from('public_jerseys')
        .select('*')
        .order('created_at', { ascending: false })

      if (queryError) {
        console.error('Error fetching jerseys for player linking:', queryError)
      }

      if (data) {
        const unlinked = data.filter(j =>
          j.player_name && j.player_name.trim() !== '' && !j.player_id
        )
        setUnlinkedJerseys(unlinked)
      }
      setLoadingUnlinked(false)
    }

    useEffect(() => { fetchUnlinked() }, [])

    const updateJerseyState = (jerseyId, updates) => {
      setJerseyStates(prev => ({
        ...prev,
        [jerseyId]: { ...(prev[jerseyId] || {}), ...updates }
      }))
    }

    const handleSearch = async (jersey) => {
      updateJerseyState(jersey.id, { status: 'searching', error: null })

      const { data, error: searchError } = await searchPlayer(jersey.player_name)
      if (searchError) {
        updateJerseyState(jersey.id, { status: 'error', error: searchError })
        return
      }
      if (!data || data.length === 0) {
        updateJerseyState(jersey.id, { status: 'no-results' })
        return
      }

      updateJerseyState(jersey.id, { status: 'picking', searchResults: data })
    }

    const handlePickPlayer = async (jersey, result) => {
      updateJerseyState(jersey.id, { status: 'loading-details' })

      const { data: details, error: fetchError } = await fetchPlayerDetails(result.wikidataId)
      if (fetchError) {
        updateJerseyState(jersey.id, { status: 'error', error: fetchError })
        return
      }

      updateJerseyState(jersey.id, { status: 'confirming', selectedDetails: details })
    }

    const handleConfirmLink = async (jersey) => {
      const state = jerseyStates[jersey.id]
      if (!state?.selectedDetails) return

      updateJerseyState(jersey.id, { status: 'linking' })

      try {
        const { player, careers } = mapToPlayerRecord(state.selectedDetails)

        // Check if player already exists
        const { data: existing } = await supabase
          .from('players')
          .select('id')
          .eq('wikidata_id', player.wikidata_id)
          .maybeSingle()

        let playerId
        if (existing) {
          playerId = existing.id
        } else {
          const { data: newPlayer, error: playerError } = await supabase
            .from('players')
            .insert(player)
            .select('id')
            .single()

          if (playerError) throw playerError
          playerId = newPlayer.id

          if (careers.length > 0) {
            await supabase.from('player_careers').insert(
              careers.map(c => ({ ...c, player_id: playerId }))
            )
          }
        }

        // Link this jersey and others with same player_name
        await supabase
          .from('public_jerseys')
          .update({ player_id: playerId })
          .eq('player_name', jersey.player_name)
          .is('player_id', null)

        updateJerseyState(jersey.id, { status: 'done' })
      } catch (err) {
        updateJerseyState(jersey.id, { status: 'error', error: err.message })
      }
    }

    const handleSkip = (jerseyId) => {
      updateJerseyState(jerseyId, { status: 'skipped' })
    }

    const renderJerseyRow = (jersey) => {
      const state = jerseyStates[jersey.id] || {}
      const { status } = state

      return (
        <div key={jersey.id} className="py-4 px-3 border-b border-gray-100 last:border-0">
          {/* Jersey info header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">
                {jersey.player_name}
                {jersey.player_number && <span className="text-gray-400" style={{ marginLeft: '4px' }}>#{jersey.player_number}</span>}
              </p>
              <p className="text-xs text-gray-500">
                {jersey.team_name} &middot; {jersey.season} &middot; {jersey.jersey_type}
              </p>
            </div>

            {/* Action area */}
            <div className="flex-shrink-0">
              {!status && (
                <button
                  onClick={() => handleSearch(jersey)}
                  className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  Search Wikidata
                </button>
              )}
              {status === 'searching' && <span className="text-xs text-blue-600 animate-pulse">Searching...</span>}
              {status === 'loading-details' && <span className="text-xs text-blue-600 animate-pulse">Loading details...</span>}
              {status === 'linking' && <span className="text-xs text-blue-600 animate-pulse">Linking...</span>}
              {status === 'done' && <span className="text-xs text-green-600 font-medium">Linked</span>}
              {status === 'skipped' && <span className="text-xs text-gray-400 font-medium">Skipped</span>}
              {status === 'no-results' && (
                <span className="text-xs text-amber-600 font-medium">No Wikidata match</span>
              )}
              {status === 'error' && (
                <div className="text-right">
                  <span className="text-xs text-red-600 font-medium">Error</span>
                  <button onClick={() => handleSearch(jersey)} className="text-xs text-blue-600 ml-2">Retry</button>
                </div>
              )}
            </div>
          </div>

          {/* Search results - pick a player */}
          {status === 'picking' && state.searchResults && (
            <div className="mt-2 bg-gray-50 rounded-lg p-3">
              <p className="text-xs font-medium text-gray-700 mb-2">Select the correct player:</p>
              <div className="space-y-1.5">
                {state.searchResults.map((r) => (
                  <button
                    key={r.wikidataId}
                    onClick={() => handlePickPlayer(jersey, r)}
                    className="w-full text-left px-3 py-2 bg-white rounded-md border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                  >
                    <p className="text-sm font-medium text-gray-900">{r.name}</p>
                    {r.description && <p className="text-xs text-gray-500">{r.description}</p>}
                  </button>
                ))}
              </div>
              <button onClick={() => handleSkip(jersey.id)} className="mt-2 text-xs text-gray-500 hover:text-gray-700">
                Skip this jersey
              </button>
            </div>
          )}

          {/* Confirm player details */}
          {status === 'confirming' && state.selectedDetails && (
            <div className="mt-2 bg-green-50 rounded-lg p-3 border border-green-200">
              <div className="text-sm mb-2">
                <p className="font-semibold text-green-800">{state.selectedDetails.name}</p>
                <div className="text-xs text-green-700 space-y-0.5 mt-1">
                  {state.selectedDetails.position && <p>Position: {state.selectedDetails.position}</p>}
                  {state.selectedDetails.nationality && <p>Nationality: {state.selectedDetails.nationality}</p>}
                  {state.selectedDetails.dateOfBirth && <p>Born: {state.selectedDetails.dateOfBirth}</p>}
                  {state.selectedDetails.careers.filter(c => !c.isInternational).length > 0 && (
                    <p>Club: {state.selectedDetails.careers.filter(c => !c.isInternational).map(c => c.teamName).join(' → ')}</p>
                  )}
                  {state.selectedDetails.careers.filter(c => c.isInternational).length > 0 && (
                    <p>International: {state.selectedDetails.careers.filter(c => c.isInternational).map(c => c.teamName).join(', ')}</p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleConfirmLink(jersey)}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                >
                  Confirm & Link
                </button>
                <button
                  onClick={() => updateJerseyState(jersey.id, { status: 'picking', selectedDetails: null })}
                  className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Pick Different
                </button>
                <button onClick={() => handleSkip(jersey.id)} className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700">
                  Skip
                </button>
              </div>
            </div>
          )}
        </div>
      )
    }

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Bulk Player Linking</h2>
              <p className="text-sm text-gray-500">
                Search Wikidata for each player, review the match, then confirm to link.
              </p>
            </div>
            <button
              onClick={fetchUnlinked}
              disabled={loadingUnlinked}
              className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
            >
              Refresh
            </button>
          </div>

          {loadingUnlinked ? (
            <div className="text-center py-8 text-gray-500">Loading unlinked jerseys...</div>
          ) : unlinkedJerseys.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircleIcon className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">All player jerseys are linked!</p>
            </div>
          ) : (
            <div className="max-h-[600px] overflow-y-auto">
              {unlinkedJerseys.map(renderJerseyRow)}
            </div>
          )}
        </div>
      </div>
    )
  }

  const totalPending = submissions.length + pendingAccounts.length + partnerAppCount

  const refreshAll = () => {
    fetchSubmissions()
    fetchPendingAccounts()
    fetchPartnerAppCount()
    fetchDashStats()
    fetchRecentActivity()
  }

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins} min ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs} hr ago`
    return `${Math.floor(hrs / 24)}d ago`
  }

  // Render submission row for the expandable queue
  const renderSubmissionRow = (submission) => (
    <div key={submission.id} className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className="flex-shrink-0">
        <ImageToggle submission={submission} />
      </div>
      <div className="flex-1 min-w-0">
        <button onClick={() => handleShowDetails(submission)} className="font-medium text-gray-900 text-sm hover:text-blue-600 text-left">
          {submission.team_name}
        </button>
        <p className="text-xs text-gray-500">{submission.season} &middot; {submission.jersey_type} &middot; by {submission.profiles?.username || 'Unknown'}</p>
      </div>
      <div className="flex gap-1.5 flex-shrink-0">
        <button onClick={() => handleAction(submission, 'approve')} className="action-button action-button-approve" style={{ minWidth: 'auto', padding: '6px 12px', fontSize: '13px' }}>
          <CheckCircleIcon className="w-3.5 h-3.5" /> Approve
        </button>
        <button onClick={() => handleAction(submission, 'reject')} className="action-button action-button-reject" style={{ minWidth: 'auto', padding: '6px 12px', fontSize: '13px' }}>
          <XCircleIcon className="w-3.5 h-3.5" /> Reject
        </button>
      </div>
    </div>
  )

  const renderAccountRow = (account) => (
    <div key={account.id} className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className="flex-shrink-0">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
          {(account.full_name || account.username || 'U').charAt(0).toUpperCase()}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 text-sm">{account.full_name || account.username}</p>
        <p className="text-xs text-gray-500">{account.email} &middot; @{account.username}</p>
      </div>
      {account.approval_status === 'pending' && (
        <div className="flex gap-1.5 flex-shrink-0">
          <button
            onClick={() => { const n = prompt('Optional notes:'); if (n !== null) handleAccountAction(account, 'approve', n) }}
            disabled={processingAction}
            className="action-button action-button-approve" style={{ minWidth: 'auto', padding: '6px 12px', fontSize: '13px' }}
          >
            <CheckCircleIcon className="w-3.5 h-3.5" /> Approve
          </button>
          <button
            onClick={() => { const n = prompt('Reason (required):'); if (n && n.trim()) handleAccountAction(account, 'reject', n); else if (n !== null) alert('Reason required.') }}
            disabled={processingAction}
            className="action-button action-button-reject" style={{ minWidth: 'auto', padding: '6px 12px', fontSize: '13px' }}
          >
            <XCircleIcon className="w-3.5 h-3.5" /> Reject
          </button>
        </div>
      )}
    </div>
  )

  const pendingQueues = [
    { key: 'submissions', label: 'Kit submissions', count: submissions.length },
    { key: 'accounts', label: 'Account reviews', count: pendingAccounts.length },
    { key: 'partners', label: 'Partner applications', count: partnerAppCount },
    { key: 'players', label: 'Player link requests', count: 0 }
  ]

  const quickActions = [
    { label: 'Add kit to database', href: '/jerseys' },
    { label: 'Bulk import players', action: () => setExpandedQueue(expandedQueue === 'players' ? null : 'players') },
    { label: 'Add team / season', href: '/jerseys' },
    { label: 'Feature a collection', action: () => alert('Coming soon') }
  ]

  return (
    <div className="admin-panel" style={{ backgroundColor: '#FAF9F6' }}>
      <div className="admin-container" style={{ paddingTop: '32px', paddingBottom: '48px' }}>
        {/* ===== Header ===== */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#1F2937', lineHeight: 1.2 }}>Admin panel</h1>
            <div className="flex items-center gap-2 mt-1">
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e' }} />
              <span style={{ fontSize: '14px', color: '#6B7280' }}>System active</span>
            </div>
          </div>
          <button
            onClick={refreshAll}
            style={{
              padding: '8px 20px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              backgroundColor: 'white',
              fontSize: '14px',
              fontWeight: 500,
              color: '#374151',
              cursor: 'pointer'
            }}
          >
            Refresh
          </button>
        </div>

        {/* ===== Stats Row ===== */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '1px',
            backgroundColor: '#e5e7eb',
            borderRadius: '12px',
            overflow: 'hidden',
            marginBottom: '24px'
          }}
        >
          {[
            { label: 'Kits', value: dashStats.kits, growth: dashStats.kitsWeek, color: '#1F2937' },
            { label: 'Users', value: dashStats.users, growth: dashStats.usersWeek, color: '#1F2937' },
            { label: 'Countries', value: dashStats.countries, growth: null, color: '#1F2937' },
            { label: 'Pending', value: totalPending, growth: null, color: totalPending > 0 ? '#b45309' : '#1F2937' },
            { label: 'Partner apps', value: partnerAppCount, growth: null, color: partnerAppCount > 0 ? '#7C3AED' : '#1F2937' }
          ].map((s) => (
            <div key={s.label} style={{ backgroundColor: '#FAF5EF', padding: '20px', textAlign: 'center' }}>
              <p style={{ fontSize: '13px', color: '#6B7280', fontWeight: 500, marginBottom: '4px' }}>{s.label}</p>
              <p style={{ fontSize: '32px', fontWeight: 700, color: s.color, lineHeight: 1.2 }}>{s.value.toLocaleString()}</p>
              {s.growth > 0 && (
                <p style={{ fontSize: '13px', color: '#16a34a', marginTop: '4px' }}>+{s.growth} this week</p>
              )}
            </div>
          ))}
        </div>

        {/* ===== Pending Actions + Quick Actions (side by side in one card) ===== */}
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            marginBottom: '24px',
            overflow: 'hidden'
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
            {/* Pending Actions */}
            <div style={{ padding: '24px', borderRight: '1px solid #e5e7eb' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1F2937', marginBottom: '16px' }}>Pending actions</h2>
              <div>
                {pendingQueues.map((q) => (
                  <button
                    key={q.key}
                    onClick={() => setExpandedQueue(expandedQueue === q.key ? null : q.key)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '14px 0',
                      borderBottom: '1px solid #f3f4f6',
                      background: 'none',
                      border: 'none',
                      borderBottom: '1px solid #f3f4f6',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <span style={{ fontSize: '15px', color: '#374151' }}>{q.label}</span>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        fontSize: '13px',
                        fontWeight: 700,
                        color: 'white',
                        backgroundColor: q.count > 0 ? '#b45309' : '#9ca3af'
                      }}
                    >
                      {q.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ padding: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1F2937', marginBottom: '16px' }}>Quick actions</h2>
              <div>
                {quickActions.map((a, i) => {
                  const Tag = a.href ? 'a' : 'button'
                  const props = a.href ? { href: a.href } : { onClick: a.action }
                  return (
                    <Tag
                      key={i}
                      {...props}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        width: '100%',
                        padding: '14px 16px',
                        borderBottom: '1px solid #f3f4f6',
                        background: 'none',
                        border: 'none',
                        borderBottom: '1px solid #f3f4f6',
                        cursor: 'pointer',
                        textAlign: 'left',
                        textDecoration: 'none',
                        fontSize: '15px',
                        color: '#374151'
                      }}
                    >
                      <span style={{ color: '#7C3AED', fontWeight: 600 }}>+</span>
                      <span>{a.label}</span>
                    </Tag>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ===== Expanded Queue (shows below the card when a pending item is clicked) ===== */}
        {expandedQueue === 'submissions' && (
          <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '24px', padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1F2937', marginBottom: '12px' }}>Kit Submissions ({submissions.length})</h3>
            {submissions.length === 0 ? (
              <p style={{ fontSize: '14px', color: '#6B7280', textAlign: 'center', padding: '16px 0' }}>All caught up!</p>
            ) : (
              submissions.map(renderSubmissionRow)
            )}
          </div>
        )}
        {expandedQueue === 'accounts' && (
          <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '24px', padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1F2937', marginBottom: '12px' }}>Account Reviews ({pendingAccounts.length})</h3>
            {accountsLoading ? (
              <p style={{ fontSize: '14px', color: '#6B7280', textAlign: 'center', padding: '16px 0' }} className="animate-pulse">Loading...</p>
            ) : pendingAccounts.length === 0 ? (
              <p style={{ fontSize: '14px', color: '#6B7280', textAlign: 'center', padding: '16px 0' }}>All accounts reviewed!</p>
            ) : (
              pendingAccounts.map(renderAccountRow)
            )}
          </div>
        )}
        {expandedQueue === 'partners' && (
          <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '24px', padding: '16px' }}>
            <PartnerApplications />
          </div>
        )}
        {expandedQueue === 'players' && (
          <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '24px', padding: '16px' }}>
            <BulkPlayerLinker />
          </div>
        )}

        {/* ===== Recent Activity ===== */}
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            padding: '24px',
            marginBottom: '32px'
          }}
        >
          <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1F2937' }}>Recent activity</h2>
            <span style={{ fontSize: '14px', color: '#7C3AED', cursor: 'pointer' }}>View all &rarr;</span>
          </div>
          {recentActivity.length === 0 ? (
            <p style={{ fontSize: '14px', color: '#6B7280', textAlign: 'center', padding: '16px 0' }}>No recent activity</p>
          ) : (
            <div>
              {recentActivity.map((item, i) => (
                <div
                  key={i}
                  className="flex items-baseline"
                  style={{
                    padding: '12px 0',
                    borderBottom: i < recentActivity.length - 1 ? '1px solid #f3f4f6' : 'none',
                    gap: '24px'
                  }}
                >
                  <span style={{ fontSize: '13px', color: '#9ca3af', whiteSpace: 'nowrap', minWidth: '80px' }}>{timeAgo(item.time)}</span>
                  <span style={{ fontSize: '14px', color: '#374151' }}>{item.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ===== Content Management ===== */}
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1F2937', marginBottom: '16px' }}>Content management</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            {[
              { label: 'Teams', sub: 'Manage teams', href: '/admin/teams', icon: '🌐' },
              { label: 'Kits', sub: 'Browse database', href: '/admin/kits', icon: '👕' },
              { label: 'Players', sub: 'Roster management', href: '/admin/players', icon: '👤' },
              { label: 'Users', sub: 'Manage accounts', href: '/admin/users', icon: '👥' }
            ].map((card) => (
              <a
                key={card.label}
                href={card.href}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '24px 16px',
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  textDecoration: 'none',
                  textAlign: 'center',
                  transition: 'box-shadow 0.2s',
                  cursor: 'pointer'
                }}
                className="hover:shadow-md"
              >
                <span style={{ fontSize: '28px', marginBottom: '8px' }}>{card.icon}</span>
                <span style={{ fontSize: '15px', fontWeight: 600, color: '#1F2937' }}>{card.label}</span>
                <span style={{ fontSize: '13px', color: '#6B7280', marginTop: '2px' }}>{card.sub}</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Action Modal */}
      {showModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center mb-4">
                {modalAction === 'approve' ? (
                  <CheckCircleIcon className="w-8 h-8 text-green-600 mr-3" />
                ) : (
                  <XCircleIcon className="w-8 h-8 text-red-600 mr-3" />
                )}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {modalAction === 'approve' ? 'Approve' : 'Reject'} Submission
                  </h3>
                  <p className="text-sm text-gray-600">
                    {selectedSubmission.team_name} - {selectedSubmission.season}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="admin-notes" className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Notes (Optional)
                </label>
                <textarea
                  id="admin-notes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={modalAction === 'approve' ? 'Optional feedback for the submitter...' : 'Reason for rejection...'}
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowModal(false)}
                  disabled={processingAction}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={processAction}
                  disabled={processingAction}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 ${
                    modalAction === 'approve'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {processingAction ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    `${modalAction === 'approve' ? 'Approve' : 'Reject'} Submission`
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submission Details Modal */}
      {showDetailsModal && selectedSubmissionDetails && (
        <SubmissionDetailsModal
          submission={selectedSubmissionDetails}
          onClose={() => {
            setShowDetailsModal(false)
            setSelectedSubmissionDetails(null)
          }}
        />
      )}
    </div>
  )
}