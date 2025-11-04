import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  PencilIcon,
  PlusIcon,
  TrashIcon,
  ArrowLeftIcon,
  LockClosedIcon,
  GlobeAltIcon
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

  const isMainCollection = collectionId === 'all'

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
        // Fetch all user jerseys (main collection)
        setCollection({
          id: 'all',
          name: 'All Kits',
          description: 'Your complete collection of football kits',
          is_public: false,
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

        // Fetch jerseys in this custom collection via junction table
        const { data: jerseysData, error: jerseysError } = await supabase
          .from('collection_jerseys')
          .select(`
            user_jersey:user_jerseys(
              *,
              public_jersey:public_jerseys(*)
            )
          `)
          .eq('collection_id', collectionId)
          .order('created_at', { ascending: false })

        if (jerseysError) throw jerseysError

        // Flatten the nested structure
        const flatJerseys = (jerseysData || []).map(item => item.user_jersey)
        setJerseys(flatJerseys)
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

  const handleDeleteCollection = () => {
    // Navigate back to collections overview after deletion
    navigate('/collection')
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

  const handleRemoveJersey = async (userJerseyId) => {
    if (!confirm('Are you sure you want to remove this jersey from your collection?')) {
      return
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

          {/* Action Buttons */}
          <div className="flex gap-2">
            {!isMainCollection && (
              <button
                onClick={() => setShowEditModal(true)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <PencilIcon className="h-4 w-4" />
                Edit
              </button>
            )}
            {!isMainCollection && (
              <button
                onClick={() => setShowAddJerseyModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <PlusIcon className="h-5 w-5" />
                Add Jerseys
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Collection Statistics */}
      {jerseys.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Total Jerseys */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-500 mb-1">Total Kits</p>
            <p className="text-2xl font-bold text-gray-900">{jerseys.length}</p>
          </div>

          {/* Purchase Status Breakdown */}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jerseys.map((userJersey) => {
            const jersey = userJersey.public_jersey

            return (
              <div key={userJersey.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Jersey Image */}
                {(jersey?.front_image_url || jersey?.back_image_url) && (
                  <div className="h-48 bg-gray-50 flex items-center justify-center">
                    <img
                      src={jersey.front_image_url || jersey.back_image_url}
                      alt={jersey.team_name}
                      className="max-h-full max-w-full object-contain p-4"
                    />
                  </div>
                )}

                {/* Jersey Details */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {jersey?.team_name || 'Unknown Team'}
                  </h3>

                  <div className="space-y-1 text-sm text-gray-600 mb-4">
                    <p>
                      <span className="font-medium">Season:</span> {jersey?.season || 'N/A'}
                    </p>
                    <p>
                      <span className="font-medium">Type:</span> {jersey?.jersey_type || 'N/A'}
                    </p>
                    {jersey?.manufacturer && (
                      <p>
                        <span className="font-medium">Brand:</span> {jersey.manufacturer}
                      </p>
                    )}
                    {userJersey.size && (
                      <p>
                        <span className="font-medium">Size:</span> {userJersey.size}
                      </p>
                    )}
                    {userJersey.condition && (
                      <p>
                        <span className="font-medium">Purchased:</span>{' '}
                        <span className="capitalize">{userJersey.condition}</span>
                      </p>
                    )}
                    {userJersey.acquired_from && (
                      <p>
                        <span className="font-medium">Acquired From:</span> {userJersey.acquired_from}
                      </p>
                    )}
                  </div>

                  {userJersey.notes && (
                    <p className="text-sm text-gray-600 italic bg-gray-50 p-3 rounded mb-4">
                      "{userJersey.notes}"
                    </p>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <button
                      onClick={() => handleEditJersey(userJersey)}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <PencilIcon className="h-4 w-4" />
                      Edit Details
                    </button>
                    <button
                      onClick={() => handleRemoveJersey(userJersey.id)}
                      disabled={deletingJerseyId === userJersey.id}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      <TrashIcon className="h-4 w-4" />
                      {deletingJerseyId === userJersey.id ? 'Removing...' : 'Remove from Collection'}
                    </button>
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
    </div>
  )
}
