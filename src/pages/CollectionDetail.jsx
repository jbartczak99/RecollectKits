import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  PencilIcon,
  PlusIcon,
  TrashIcon,
  ArrowLeftIcon,
  LockClosedIcon,
  GlobeAltIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '../contexts/AuthContext.jsx'
import { supabase } from '../lib/supabase'
import EditCollectionModal from '../components/collections/EditCollectionModal'
import AddJerseyToCollectionModal from '../components/collections/AddJerseyToCollectionModal'
import EditUserJerseyModal from '../components/collections/EditUserJerseyModal'

export default function CollectionDetail() {
  const { collectionId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [collection, setCollection] = useState(null)
  const [jerseys, setJerseys] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAddJerseyModal, setShowAddJerseyModal] = useState(false)
  const [showEditJerseyModal, setShowEditJerseyModal] = useState(false)
  const [selectedUserJersey, setSelectedUserJersey] = useState(null)
  const [deletingJerseyId, setDeletingJerseyId] = useState(null)
  const [imageStates, setImageStates] = useState({}) // Track front/back image toggle
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletingCollection, setDeletingCollection] = useState(false)

  const isMainCollection = collectionId === 'all'
  const isLikedKitsCollection = collection?.name === 'Liked Kits'
  const isWishlistCollection = collection?.name === 'Wishlist'

  useEffect(() => {
    if (collectionId && user) {
      fetchCollectionDetails()
    }
  }, [collectionId, user])

  const fetchCollectionDetails = async () => {
    setLoading(true)
    setError(null)

    try {
      if (isMainCollection) {
        // Fetch the all_kits_public setting from profiles
        const { data: profileData } = await supabase
          .from('profiles')
          .select('all_kits_public')
          .eq('id', user.id)
          .single()

        // Fetch all user jerseys (main collection)
        setCollection({
          id: 'all',
          name: 'All Kits',
          description: 'Your complete collection of football kits',
          is_public: profileData?.all_kits_public !== false, // Default to true
          user_id: user.id
        })

        const { data: jerseysData, error: jerseysError } = await supabase
          .from('user_jerseys')
          .select(`
            *,
            public_jersey:public_jerseys(*)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (jerseysError) throw jerseysError
        setJerseys(jerseysData || [])
      } else {
        // Fetch custom collection
        const { data: collectionData, error: collectionError } = await supabase
          .from('collections')
          .select('*')
          .eq('id', collectionId)
          .single()

        if (collectionError) throw collectionError

        // Check if user is the owner
        if (collectionData.user_id !== user?.id) {
          setError('You do not have permission to view this collection')
          setLoading(false)
          return
        }

        setCollection(collectionData)

        // Special handling for "Liked Kits" - fetch directly from jersey_likes
        if (collectionData.name === 'Liked Kits') {
          // First get the liked jersey IDs
          const { data: likesData, error: likesError } = await supabase
            .from('jersey_likes')
            .select('jersey_id, created_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

          if (likesError) throw likesError

          if (likesData && likesData.length > 0) {
            // Then fetch the jersey details for those IDs
            const jerseyIds = likesData.map(item => item.jersey_id)
            const { data: jerseysData, error: jerseysError } = await supabase
              .from('public_jerseys')
              .select('*')
              .in('id', jerseyIds)

            if (jerseysError) throw jerseysError

            // Create a map of jersey_id to created_at (liked date)
            const likedDates = likesData.reduce((acc, item) => {
              acc[item.jersey_id] = item.created_at
              return acc
            }, {})

            // Transform to match expected structure, maintaining liked order
            const likedJerseys = jerseyIds.map(jerseyId => {
              const jersey = jerseysData?.find(j => j.id === jerseyId)
              return {
                id: jerseyId,
                public_jersey_id: jerseyId,
                public_jersey: jersey,
                added_to_collection_at: likedDates[jerseyId]
              }
            }).filter(item => item.public_jersey) // Filter out any missing jerseys

            setJerseys(likedJerseys)
          } else {
            setJerseys([])
          }
        } else if (collectionData.name === 'Wishlist') {
          // Special handling for "Wishlist" - fetch directly from user_wishlist
          const { data: wishlistData, error: wishlistError } = await supabase
            .from('user_wishlist')
            .select('public_jersey_id, created_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

          if (wishlistError) throw wishlistError

          if (wishlistData && wishlistData.length > 0) {
            // Then fetch the jersey details for those IDs
            const jerseyIds = wishlistData.map(item => item.public_jersey_id)
            const { data: jerseysData, error: jerseysError } = await supabase
              .from('public_jerseys')
              .select('*')
              .in('id', jerseyIds)

            if (jerseysError) throw jerseysError

            // Create a map of jersey_id to created_at (added to wishlist date)
            const wishlistDates = wishlistData.reduce((acc, item) => {
              acc[item.public_jersey_id] = item.created_at
              return acc
            }, {})

            // Transform to match expected structure, maintaining order
            const wishlistJerseys = jerseyIds.map(jerseyId => {
              const jersey = jerseysData?.find(j => j.id === jerseyId)
              return {
                id: jerseyId,
                public_jersey_id: jerseyId,
                public_jersey: jersey,
                added_to_collection_at: wishlistDates[jerseyId]
              }
            }).filter(item => item.public_jersey) // Filter out any missing jerseys

            setJerseys(wishlistJerseys)
          } else {
            setJerseys([])
          }
        } else {
          // Fetch jerseys in this custom collection via junction table
          const { data: jerseysData, error: jerseysError } = await supabase
            .from('collection_jerseys')
            .select(`
              created_at,
              user_jersey:user_jerseys(
                *,
                public_jersey:public_jerseys(*)
              )
            `)
            .eq('collection_id', collectionId)
            .order('created_at', { ascending: false })

          if (jerseysError) throw jerseysError

          // Flatten the nested structure and include the collection_jerseys.created_at as added_to_collection_at
          const flatJerseys = (jerseysData || []).map(item => ({
            ...item.user_jersey,
            added_to_collection_at: item.created_at
          }))
          setJerseys(flatJerseys)
        }
      }
    } catch (err) {
      console.error('Error fetching collection details:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEditSuccess = (updatedCollection) => {
    setCollection(updatedCollection)
  }

  const handleDeleteCollection = async () => {
    setDeletingCollection(true)

    try {
      // First delete all collection_jerseys links for this collection
      const { error: deleteLinksError } = await supabase
        .from('collection_jerseys')
        .delete()
        .eq('collection_id', collection.id)

      if (deleteLinksError) throw deleteLinksError

      // Then delete the collection itself
      const { error: deleteCollectionError } = await supabase
        .from('collections')
        .delete()
        .eq('id', collection.id)

      if (deleteCollectionError) throw deleteCollectionError

      // Navigate back to collections overview
      navigate('/collection')
    } catch (err) {
      console.error('Error deleting collection:', err)
      alert('Failed to delete collection: ' + err.message)
      setDeletingCollection(false)
      setShowDeleteConfirm(false)
    }
  }

  // Toggle visibility for All Kits (updates profiles table)
  const toggleAllKitsVisibility = async () => {
    const newValue = !collection.is_public

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ all_kits_public: newValue })
        .eq('id', user.id)

      if (error) throw error
      setCollection(prev => ({ ...prev, is_public: newValue }))
    } catch (err) {
      console.error('Error updating All Kits visibility:', err)
      alert('Failed to update visibility setting')
    }
  }

  // Toggle visibility for collections (Liked Kits and custom collections - updates collections table)
  const toggleCollectionVisibility = async () => {
    const newValue = !collection.is_public

    try {
      const { error } = await supabase
        .from('collections')
        .update({ is_public: newValue })
        .eq('id', collection.id)

      if (error) throw error
      setCollection(prev => ({ ...prev, is_public: newValue }))
    } catch (err) {
      console.error('Error updating collection visibility:', err)
      alert('Failed to update visibility setting')
    }
  }

  const handleAddJerseySuccess = () => {
    // Refresh the jersey list
    fetchCollectionDetails()
  }

  const handleEditJersey = (userJersey) => {
    setSelectedUserJersey(userJersey)
    setShowEditJerseyModal(true)
  }

  const handleEditJerseySuccess = () => {
    // Refresh the jersey list
    fetchCollectionDetails()
  }

  const handleRemoveJersey = async (userJerseyId, skipConfirm = false) => {
    // For system collections (Liked Kits, Wishlist), confirmation is handled in the button
    if (!skipConfirm && !isLikedKitsCollection && !isWishlistCollection) {
      if (!confirm('Are you sure you want to remove this jersey from your collection?')) {
        return
      }
    }

    setDeletingJerseyId(userJerseyId)

    try {
      const { error: deleteError } = await supabase
        .from('user_jerseys')
        .delete()
        .eq('id', userJerseyId)

      if (deleteError) throw deleteError

      // Update local state
      setJerseys(jerseys.filter(j => j.id !== userJerseyId))
    } catch (err) {
      console.error('Error removing jersey:', err)
      alert('Failed to remove jersey: ' + err.message)
    } finally {
      setDeletingJerseyId(null)
    }
  }

  // Handle removing from system collections (Liked Kits, Wishlist)
  // This unlikes/unwishlists the jersey but does NOT remove from All Kits (user_jerseys)
  // Liking and owning a kit are independent actions
  const handleRemoveFromSystemCollection = async (userJersey) => {
    const publicJerseyId = userJersey.public_jersey_id || userJersey.public_jersey?.id

    if (!publicJerseyId) {
      alert('Unable to find jersey ID')
      return
    }

    setDeletingJerseyId(userJersey.id)

    try {
      if (collection?.name === 'Liked Kits') {
        // Remove from jersey_likes table only (unlike)
        // Liked Kits doesn't use user_jerseys or collection_jerseys
        const { error: unlikeError } = await supabase
          .from('jersey_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('jersey_id', publicJerseyId)

        if (unlikeError) throw unlikeError
      } else if (collection?.name === 'Wishlist') {
        // Remove from user_wishlist table only
        // Wishlist doesn't use user_jerseys or collection_jerseys
        const { error: unwishlistError } = await supabase
          .from('user_wishlist')
          .delete()
          .eq('user_id', user.id)
          .eq('public_jersey_id', publicJerseyId)

        if (unwishlistError) throw unwishlistError
      }

      // Update local state
      setJerseys(jerseys.filter(j => j.id !== userJersey.id))
    } catch (err) {
      console.error('Error removing from system collection:', err)
      alert('Failed to remove kit: ' + err.message)
    } finally {
      setDeletingJerseyId(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
              <div className="h-32 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => navigate('/collection')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          Back to Collections
        </button>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      </div>
    )
  }

  if (!collection) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Collection not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate('/collection')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          Back to Collections
        </button>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{collection.name}</h1>
              {/* Visibility Badge - Clickable for All Kits, Liked Kits, and Custom Collections */}
              {isWishlistCollection ? (
                // Wishlist is always private - no toggle
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                  <LockClosedIcon className="h-3 w-3" />
                  Private
                </span>
              ) : (
                // All Kits, Liked Kits, and Custom collections - clickable toggle
                <button
                  onClick={isMainCollection ? toggleAllKitsVisibility : toggleCollectionVisibility}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  title={collection.is_public ? 'Click to make private' : 'Click to make public'}
                >
                  {collection.is_public ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                      <GlobeAltIcon className="h-3 w-3" />
                      Public
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                      <LockClosedIcon className="h-3 w-3" />
                      Private
                    </span>
                  )}
                </button>
              )}
            </div>

            {collection.description && (
              <p className="text-gray-600 mb-2">{collection.description}</p>
            )}

            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>{jerseys.length} {jerseys.length === 1 ? 'jersey' : 'jerseys'}</span>
              <span>•</span>
              <span>Created {new Date(collection.created_at).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Action Buttons - Hide for system collections (Liked Kits, Wishlist) */}
          <div className="flex gap-2 flex-wrap">
            {!isMainCollection && !isLikedKitsCollection && !isWishlistCollection && (
              <button
                onClick={() => setShowEditModal(true)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <PencilIcon className="h-4 w-4" />
                Edit
              </button>
            )}
            {!isMainCollection && !isLikedKitsCollection && !isWishlistCollection && (
              <button
                onClick={() => setShowAddJerseyModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <PlusIcon className="h-5 w-5" />
                Add Jerseys
              </button>
            )}
            {!isMainCollection && !isLikedKitsCollection && !isWishlistCollection && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                <TrashIcon className="h-4 w-4" />
                Delete
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Action Needed Banner */}
      {isMainCollection && jerseys.filter(j => j.details_completed === false).length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
          <ExclamationTriangleIcon className="h-6 w-6 text-amber-600 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-amber-900">Action Needed</h3>
            <p className="text-sm text-amber-800">
              {jerseys.filter(j => j.details_completed === false).length} kit{jerseys.filter(j => j.details_completed === false).length !== 1 ? 's' : ''} need{jerseys.filter(j => j.details_completed === false).length === 1 ? 's' : ''} details completed. Click "Complete Details" on the highlighted kits below.
            </p>
          </div>
        </div>
      )}

      {/* Collection Statistics */}
      {jerseys.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Total Jerseys */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-500 mb-1">Total Kits</p>
            <p className="text-2xl font-bold text-gray-900">{jerseys.length}</p>
          </div>

          {/* Purchase Status Breakdown - Hide for Liked Kits and Wishlist */}
          {!isLikedKitsCollection && !isWishlistCollection && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <p className="text-sm text-gray-500 mb-2">Purchase Status</p>
              <div className="space-y-1">
                {['new', 'used'].map(condition => {
                  const count = jerseys.filter(j => j.condition === condition).length
                  if (count === 0) return null
                  return (
                    <div key={condition} className="flex items-center justify-between text-xs">
                      <span className="capitalize text-gray-600">{condition}</span>
                      <span className="font-medium text-gray-900">{count}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Jerseys Grid */}
      {jerseys.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border-2 border-dashed border-gray-300 py-12">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No jerseys yet</h3>
            <p className="text-gray-500 mb-6">Start building your collection by adding jerseys</p>
            <button
              onClick={() => setShowAddJerseyModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <PlusIcon className="h-5 w-5" />
              Add Your First Jersey
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {jerseys.map((userJersey) => {
            const jersey = userJersey.public_jersey
            const needsDetails = userJersey.details_completed === false
            const hasUserDetails = userJersey.jersey_fit || userJersey.size || userJersey.condition || userJersey.acquired_from || userJersey.notes
            const fitLabels = { mens: "Men's", womens: "Women's", youth: 'Youth' }
            const fitDisplay = userJersey.jersey_fit ? fitLabels[userJersey.jersey_fit] || null : null
            const fitSizeDisplay = fitDisplay && userJersey.size
              ? `${fitDisplay} ${userJersey.size}`
              : fitDisplay || userJersey.size || null
            // Check for system collections inline to ensure current state is used
            const isSystemCollection = collection?.name === 'Liked Kits' || collection?.name === 'Wishlist'

            return (
              <div
                key={userJersey.id}
                className={`bg-white rounded-xl shadow-md border-2 transition-all duration-200 overflow-hidden flex flex-col ${
                  needsDetails ? 'border-amber-400 ring-2 ring-amber-200' : 'border-gray-200 hover:border-green-300'
                }`}
              >
                {/* Action Needed Badge */}
                {needsDetails && (
                  <div className="bg-amber-100 border-b border-amber-200 px-4 py-2 flex items-center gap-2">
                    <ExclamationTriangleIcon className="h-4 w-4 text-amber-600" />
                    <span className="text-sm font-medium text-amber-800">Action Needed</span>
                  </div>
                )}

                {/* Jersey Image - Clickable with hover effects */}
                {jersey?.front_image_url || jersey?.back_image_url ? (
                  <Link
                    to={`/jerseys/${jersey.id}`}
                    className="h-64 overflow-hidden flex items-center justify-center bg-gray-50 group cursor-pointer transition-all duration-300 hover:bg-gray-100"
                  >
                    <img
                      src={
                        jersey.front_image_url && jersey.back_image_url
                          ? (imageStates[userJersey.id] ? jersey.back_image_url : jersey.front_image_url)
                          : (jersey.front_image_url || jersey.back_image_url)
                      }
                      alt={`${jersey.team_name} ${jersey.jersey_type} kit`}
                      className="max-w-full max-h-full object-contain transition-all duration-300 group-hover:scale-105"
                      style={{ maxWidth: '250px', maxHeight: '280px' }}
                    />
                  </Link>
                ) : (
                  <Link
                    to={`/jerseys/${jersey?.id}`}
                    className="h-64 bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center group cursor-pointer"
                  >
                    <div className="text-lg font-medium text-gray-500">No Image Available</div>
                  </Link>
                )}

                {/* Front | Back toggle */}
                {jersey?.front_image_url && jersey?.back_image_url && (
                  <div className="px-4 py-2 text-center border-b border-gray-100">
                    <div className="flex items-center justify-center gap-2 text-sm">
                      <button
                        onClick={() => setImageStates(prev => ({ ...prev, [userJersey.id]: false }))}
                        className={`font-medium transition-colors duration-200 hover:bg-gray-100 px-2 py-1 rounded ${
                          !imageStates[userJersey.id] ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
                        }`}
                      >
                        Front
                      </button>
                      <span className="text-gray-300">|</span>
                      <button
                        onClick={() => setImageStates(prev => ({ ...prev, [userJersey.id]: true }))}
                        className={`font-medium transition-colors duration-200 hover:bg-gray-100 px-2 py-1 rounded ${
                          imageStates[userJersey.id] ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
                        }`}
                      >
                        Back
                      </button>
                    </div>
                  </div>
                )}

                {/* Jersey Details */}
                <div className="p-4 flex-1 flex flex-col">
                  {/* Team & Season */}
                  <div className="mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {jersey?.team_name || 'Unknown Team'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {jersey?.player_name && (
                        <span className="font-medium">{jersey.player_name} • </span>
                      )}
                      {jersey?.season || 'Unknown Season'}
                    </p>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {jersey?.kit_type && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        jersey.kit_type === 'international'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {jersey.kit_type === 'international' ? 'International' : 'Club'}
                      </span>
                    )}
                    {jersey?.jersey_type && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 capitalize">
                        {jersey.jersey_type}
                      </span>
                    )}
                    {jersey?.manufacturer && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        {jersey.manufacturer}
                      </span>
                    )}
                  </div>

                  {/* Date added for Liked Kits and Wishlist collections */}
                  {isSystemCollection && userJersey.added_to_collection_at && (
                    <div className="text-xs text-gray-500 mb-3">
                      {collection?.name === 'Liked Kits' ? 'Liked on ' : 'Added to wishlist on '}
                      {new Date(userJersey.added_to_collection_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  )}

                  {/* User's Kit Details Section - Hide for Liked Kits and Wishlist since users may not own them */}
                  {hasUserDetails && !isSystemCollection && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                      <h4 className="text-xs font-semibold text-green-800 uppercase tracking-wide mb-2">My Kit Details</h4>
                      <div className="grid grid-cols-2 gap-1 text-sm">
                        {fitSizeDisplay && (
                          <div>
                            <span className="text-gray-600">Fit/Size:</span> <span className="font-medium text-gray-800">{fitSizeDisplay}</span>
                          </div>
                        )}
                        {userJersey.condition && (
                          <div>
                            <span className="text-gray-600">Purchased:</span> <span className="font-medium text-gray-800 capitalize">{userJersey.condition}</span>
                          </div>
                        )}
                        {userJersey.acquired_from && (
                          <div className="col-span-2">
                            <span className="text-gray-600">From:</span> <span className="font-medium text-gray-800">{userJersey.acquired_from}</span>
                          </div>
                        )}
                      </div>
                      {userJersey.notes && (
                        <div className="mt-2 pt-2 border-t border-green-200">
                          <p className="text-xs text-gray-600 italic">"{userJersey.notes}"</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Buttons - pushed to bottom */}
                  <div className="mt-auto">
                    {/* For Liked Kits and Wishlist - just show trash icon */}
                    {isSystemCollection ? (
                      <button
                        onClick={() => {
                          const confirmMsg = collection?.name === 'Liked Kits'
                            ? 'Are you sure you want to remove this kit from your Liked Kits?'
                            : 'Are you sure you want to remove this kit from your Wishlist?'
                          if (confirm(confirmMsg)) {
                            handleRemoveFromSystemCollection(userJersey)
                          }
                        }}
                        disabled={deletingJerseyId === userJersey.id}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 text-sm font-medium"
                      >
                        <TrashIcon className="h-4 w-4" />
                        {deletingJerseyId === userJersey.id ? 'Removing...' : 'Remove Kit'}
                      </button>
                    ) : (
                      /* For regular collections - show full buttons */
                      <div className="space-y-2">
                        <button
                          onClick={() => handleEditJersey(userJersey)}
                          className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                            needsDetails
                              ? 'bg-amber-500 text-white hover:bg-amber-600'
                              : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {needsDetails ? (
                            <>
                              <ExclamationTriangleIcon className="h-4 w-4" />
                              Complete Details
                            </>
                          ) : (
                            <>
                              <PencilIcon className="h-4 w-4" />
                              Edit Details
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleRemoveJersey(userJersey.id)}
                          disabled={deletingJerseyId === userJersey.id}
                          className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 text-sm"
                        >
                          <TrashIcon className="h-4 w-4" />
                          {deletingJerseyId === userJersey.id ? 'Removing...' : 'Remove'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modals - Only show for custom collections */}
      {!isMainCollection && (
        <>
          <EditCollectionModal
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            collection={collection}
            onSuccess={handleEditSuccess}
            onDelete={handleDeleteCollection}
          />

          <AddJerseyToCollectionModal
            isOpen={showAddJerseyModal}
            onClose={() => setShowAddJerseyModal(false)}
            collection={collection}
            onSuccess={handleAddJerseySuccess}
          />
        </>
      )}

      <EditUserJerseyModal
        isOpen={showEditJerseyModal}
        onClose={() => {
          setShowEditJerseyModal(false)
          setSelectedUserJersey(null)
        }}
        userJersey={selectedUserJersey}
        onSuccess={handleEditJerseySuccess}
      />

      {/* Delete Collection Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px'
          }}
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              maxWidth: '400px',
              width: '100%',
              padding: '24px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{
                flexShrink: 0,
                width: '40px',
                height: '40px',
                backgroundColor: '#fee2e2',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <TrashIcon style={{ height: '20px', width: '20px', color: '#dc2626' }} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827', margin: 0 }}>Delete Collection</h3>
            </div>

            <p style={{ color: '#4b5563', marginBottom: '8px' }}>
              Are you sure you want to delete <span style={{ fontWeight: 600 }}>"{collection?.name}"</span>?
            </p>
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px' }}>
              This will remove the collection and all its organization. Your kits will remain in your All Kits collection. This action cannot be undone.
            </p>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deletingCollection}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  border: '1px solid #d1d5db',
                  backgroundColor: 'white',
                  color: '#374151',
                  borderRadius: '8px',
                  cursor: deletingCollection ? 'not-allowed' : 'pointer',
                  opacity: deletingCollection ? 0.5 : 1,
                  fontSize: '14px',
                  fontWeight: 500
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCollection}
                disabled={deletingCollection}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  border: 'none',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  borderRadius: '8px',
                  cursor: deletingCollection ? 'not-allowed' : 'pointer',
                  opacity: deletingCollection ? 0.5 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  fontWeight: 500
                }}
              >
                {deletingCollection ? (
                  'Deleting...'
                ) : (
                  <>
                    <TrashIcon style={{ height: '16px', width: '16px' }} />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
