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
  ShieldCheckIcon
} from '@heroicons/react/24/outline'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext.jsx'
import './AdminPanel.css'

export default function AdminPanel() {
  const { user, getPendingAccounts, approveAccount, rejectAccount } = useAuth()
  const [activeTab, setActiveTab] = useState('submissions')
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

  useEffect(() => {
    if (isAdmin) {
      fetchSubmissions()
      if (activeTab === 'accounts') {
        fetchPendingAccounts()
      }
    }
  }, [isAdmin, activeTab])

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
          created_by: selectedSubmission.submitted_by
        }

        const { error: insertError } = await supabase
          .from('public_jerseys')
          .insert(jerseyData)

        if (insertError) throw insertError

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
          created_by: submission.submitted_by
        }

        const { error: insertError } = await supabase
          .from('public_jerseys')
          .insert(jerseyData)

        if (insertError) throw insertError

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

  return (
    <div className="admin-panel">
      {/* Header */}
      <div className="admin-header mb-6 bg-blue-50">
        <div className="admin-container py-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-md">
                  <ShieldCheckIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>System Active</span>
                  </div>
                </div>
              </div>
              <p className="text-gray-600 mb-4 text-lg">
                {activeTab === 'submissions' ? 'Review and manage kit submissions' : 'Review and manage user accounts'}
              </p>
            </div>

            {/* Clickable Column Cards */}
            <div className="flex gap-4">
              {/* Kit Submissions Column */}
              <button
                onClick={() => setActiveTab('submissions')}
                className={`rounded-xl border-2 transition-all hover:shadow-lg ${
                  activeTab === 'submissions'
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-blue-300'
                }`}
              >
                <div className="p-5 text-center min-w-[130px]">
                  <h3 className="font-semibold text-sm mb-4 mt-2">Kit Submissions</h3>
                  <div className="flex items-center justify-center space-x-2 text-xs text-gray-500 mb-2">
                    <ClockIcon className="w-4 h-4" />
                    <span>{submissions.length} pending</span>
                  </div>
                  {submissions.length > 0 && (
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      activeTab === 'submissions' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {submissions.length}
                    </div>
                  )}
                </div>
              </button>

              {/* Account Reviews Column */}
              <button
                onClick={() => setActiveTab('accounts')}
                className={`rounded-xl border-2 transition-all hover:shadow-lg ${
                  activeTab === 'accounts'
                    ? 'border-amber-500 bg-amber-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-amber-300'
                }`}
              >
                <div className="p-5 text-center min-w-[130px]">
                  <h3 className="font-semibold text-sm mb-4 mt-2">Account Reviews</h3>
                  <div className="flex items-center justify-center space-x-2 text-xs text-gray-500 mb-2">
                    <ClockIcon className="w-4 h-4" />
                    <span>{pendingAccounts.length} pending</span>
                  </div>
                  {pendingAccounts.length > 0 && (
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      activeTab === 'accounts' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {pendingAccounts.length}
                    </div>
                  )}
                </div>
              </button>

              {/* Refresh Button */}
              <button
                onClick={activeTab === 'submissions' ? fetchSubmissions : fetchPendingAccounts}
                className="px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors shadow-md hover:shadow-lg self-start"
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span className="font-medium">Refresh</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-container py-8">
        {activeTab === 'submissions' ? (
          submissions.length === 0 ? (
            // Empty state for submissions
            <div className="text-center py-12">
              <CheckCircleIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
              <p className="text-gray-600">No pending submissions to review.</p>
            </div>
          ) : (
            // Submissions grid/list
            <div className="space-y-4">
              {submissions.map((submission) => (
                <div
                  key={submission.id}
                  className="submission-card"
                >
                  <div className="p-4 md:p-6">
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      {/* Image */}
                      <div className="flex-shrink-0">
                        <ImageToggle submission={submission} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                          <div className="space-y-3 flex-1">
                            {/* Team/Title - Clickable */}
                            <button
                              onClick={() => handleShowDetails(submission)}
                              className="text-lg font-semibold text-gray-900 leading-tight hover:text-blue-600 transition-colors text-left cursor-pointer"
                            >
                              {submission.team_name}
                            </button>

                            {/* Details Grid */}
                            <div className="submission-details-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-2 text-sm">
                              <div className="submission-details-item text-gray-600">
                                <span className="font-medium text-gray-700">Season:</span>
                                <span>{submission.season}</span>
                              </div>
                              <div className="submission-details-item text-gray-600">
                                <span className="font-medium text-gray-700">Type:</span>
                                <span className="capitalize">{submission.jersey_type}</span>
                              </div>
                              <div className="submission-details-item text-gray-600">
                                <span className="font-medium text-gray-700">League:</span>
                                <span>{submission.league || 'N/A'}</span>
                              </div>
                              <div className="submission-details-item text-gray-600">
                                <span className="font-medium text-gray-700">Kit Type:</span>
                                <span className="capitalize">{submission.kit_type}</span>
                              </div>
                            </div>

                            {/* Player info if available */}
                            {submission.player_name && (
                              <div className="submission-info text-sm text-gray-600">
                                <UserIcon className="w-4 h-4 text-gray-400" />
                                <span className="font-medium">{submission.player_name}</span>
                                {submission.jersey_number && (
                                  <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                                    #{submission.jersey_number}
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Submission info */}
                            <div className="submission-info text-sm text-gray-500">
                              <CalendarIcon className="w-4 h-4" />
                              <span>Submitted {formatDate(submission.created_at)}</span>
                              <span>•</span>
                              <span>by {submission.profiles?.username || 'Unknown'}</span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-row lg:flex-col gap-2 lg:ml-4 flex-shrink-0">
                            <button
                              onClick={() => handleAction(submission, 'approve')}
                              className="action-button action-button-approve"
                            >
                              <CheckCircleIcon className="w-4 h-4" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleAction(submission, 'reject')}
                              className="action-button action-button-reject"
                            >
                              <XCircleIcon className="w-4 h-4" />
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          // Account Reviews Tab
          accountsLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading pending accounts...</p>
            </div>
          ) : pendingAccounts.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircleIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">All accounts reviewed!</h3>
              <p className="text-gray-600">No pending account requests to review.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingAccounts.map((account) => (
                <div
                  key={account.id}
                  className="submission-card"
                >
                  <div className="p-4 md:p-6">
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                          {(account.full_name || account.username || account.email || 'U').charAt(0).toUpperCase()}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                          <div className="space-y-3 flex-1">
                            {/* Name/Title */}
                            <h3 className="text-lg font-semibold text-gray-900 leading-tight">
                              {account.full_name || account.username || 'Unknown'}
                            </h3>

                            {/* Details Grid */}
                            <div className="submission-details-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-2 text-sm">
                              <div className="submission-details-item text-gray-600">
                                <span className="font-medium text-gray-700">Email:</span>
                                <span>{account.email}</span>
                              </div>
                              <div className="submission-details-item text-gray-600">
                                <span className="font-medium text-gray-700">Username:</span>
                                <span>@{account.username}</span>
                              </div>
                              <div className="submission-details-item text-gray-600">
                                <span className="font-medium text-gray-700">Status:</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  account.approval_status === 'pending'
                                    ? 'bg-amber-100 text-amber-800'
                                    : account.approval_status === 'approved'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {account.approval_status}
                                </span>
                              </div>
                            </div>

                            {/* Admin Notes if available */}
                            {account.admin_notes && (
                              <div className="submission-info text-sm text-gray-600">
                                <span className="font-medium">Admin Notes:</span>
                                <span>{account.admin_notes}</span>
                                {account.approved_by_username && account.approved_at && (
                                  <span className="text-xs text-gray-500">
                                    By {account.approved_by_username} on {formatDate(account.approved_at)}
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Request info */}
                            <div className="submission-info text-sm text-gray-500">
                              <CalendarIcon className="w-4 h-4" />
                              <span>Requested {formatDate(account.requested_at)}</span>
                            </div>
                          </div>

                          {/* Actions */}
                          {account.approval_status === 'pending' && (
                            <div className="flex flex-row lg:flex-col gap-2 lg:ml-4 flex-shrink-0">
                              <button
                                onClick={() => {
                                  const notes = prompt('Optional approval notes:')
                                  if (notes !== null) { // User didn't cancel
                                    handleAccountAction(account, 'approve', notes)
                                  }
                                }}
                                disabled={processingAction}
                                className="action-button action-button-approve"
                              >
                                <CheckCircleIcon className="w-4 h-4" />
                                Approve
                              </button>
                              <button
                                onClick={() => {
                                  const notes = prompt('Reason for rejection (required):')
                                  if (notes && notes.trim()) {
                                    handleAccountAction(account, 'reject', notes)
                                  } else if (notes !== null) {
                                    alert('Please provide a reason for rejection.')
                                  }
                                }}
                                disabled={processingAction}
                                className="action-button action-button-reject"
                              >
                                <XCircleIcon className="w-4 h-4" />
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
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