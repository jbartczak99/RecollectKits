import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlusIcon, LockClosedIcon, GlobeAltIcon, StarIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../contexts/AuthContext.jsx'
import { supabase } from '../lib/supabase'
import CreateCollectionModal from '../components/collections/CreateCollectionModal'

export default function Collection() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [collections, setCollections] = useState([])
  const [allKitsCount, setAllKitsCount] = useState(0)
  const [allKitsThumbnails, setAllKitsThumbnails] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [filter, setFilter] = useState('all') // 'all', 'public', 'private'

  useEffect(() => {
    if (user) {
      fetchCollections()
    } else {
      setCollections([])
      setLoading(false)
    }
  }, [user])

  const fetchCollections = async () => {
    setLoading(true)
    setError(null)

    try {
      // Fetch ALL user jerseys count (main collection)
      const { count: totalCount, error: countError } = await supabase
        .from('user_jerseys')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)

      if (countError) throw countError
      setAllKitsCount(totalCount || 0)

      // Get first 4 jerseys for main collection thumbnails
      const { data: allJerseys, error: allJerseysError } = await supabase
        .from('user_jerseys')
        .select('public_jersey:public_jerseys(front_image_url, back_image_url)')
        .eq('user_id', user.id)
        .limit(4)

      if (allJerseysError) throw allJerseysError
      setAllKitsThumbnails(allJerseys || [])

      // Fetch custom collections for the user
      const { data: collectionsData, error: collectionsError } = await supabase
        .from('collections')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (collectionsError) throw collectionsError

      // For each custom collection, get the jersey count and first 4 jerseys for thumbnails
      const collectionsWithDetails = await Promise.all(
        (collectionsData || []).map(async (collection) => {
          // Get jersey count via collection_jerseys junction table
          const { count, error: countError } = await supabase
            .from('collection_jerseys')
            .select('id', { count: 'exact', head: true })
            .eq('collection_id', collection.id)

          // Get first 4 jerseys for thumbnails via junction table
          const { data: thumbnails, error: thumbError } = await supabase
            .from('collection_jerseys')
            .select(`
              user_jersey:user_jerseys(
                public_jersey:public_jerseys(front_image_url, back_image_url)
              )
            `)
            .eq('collection_id', collection.id)
            .limit(4)

          return {
            ...collection,
            jersey_count: count || 0,
            thumbnails: thumbnails || []
          }
        })
      )

      setCollections(collectionsWithDetails)
    } catch (err) {
      console.error('Error fetching collections:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSuccess = (newCollection) => {
    // Refresh collections
    fetchCollections()
  }

  const filteredCollections = collections.filter((collection) => {
    if (filter === 'all') return true
    if (filter === 'public') return collection.is_public
    if (filter === 'private') return !collection.is_public
    return true
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Collections</h1>
          <p className="text-gray-600 mt-1">
            Organize your jerseys into custom collections
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
          style={{padding: '8px 12px'}}
        >
          <PlusIcon style={{width: '16px', height: '16px', minWidth: '16px', minHeight: '16px'}} />
          Create New Collection
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          Error loading collections: {error}
        </div>
      )}

      {/* Filter Buttons */}
      {collections.length > 0 && (
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({collections.length})
          </button>
          <button
            onClick={() => setFilter('public')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'public'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Public ({collections.filter(c => c.is_public).length})
          </button>
          <button
            onClick={() => setFilter('private')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'private'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Private ({collections.filter(c => !c.is_public).length})
          </button>
        </div>
      )}

      {/* Main Collection - All Kits */}
      {!loading && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-lg shadow-lg overflow-hidden">
          <button
            onClick={() => navigate('/collection/all')}
            className="w-full text-left hover:bg-white/50 transition-all"
          >
            {/* Thumbnail Grid */}
            {allKitsThumbnails.length > 0 ? (
              <div className="grid grid-cols-2 gap-1 p-2 bg-white/50" style={{height: '112px'}}>
                {allKitsThumbnails.slice(0, 4).map((item, idx) => {
                  const imageUrl =
                    item.public_jersey?.front_image_url ||
                    item.public_jersey?.back_image_url

                  return (
                    <div
                      key={idx}
                      className="bg-white rounded flex items-center justify-center"
                      style={{overflow: 'hidden'}}
                    >
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt="Jersey"
                          style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            width: 'auto',
                            height: 'auto',
                            objectFit: 'contain',
                            padding: '4px'
                          }}
                        />
                      ) : (
                        <div className="text-gray-300 text-xs">No Image</div>
                      )}
                    </div>
                  )
                })}
                {/* Fill empty slots if less than 4 jerseys */}
                {[...Array(Math.max(0, 4 - allKitsThumbnails.length))].map((_, idx) => (
                  <div key={`empty-${idx}`} className="bg-gray-100 rounded"></div>
                ))}
              </div>
            ) : (
              <div className="bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center" style={{height: '112px'}}>
                <span className="text-gray-400 text-sm">Start adding kits to your collection</span>
              </div>
            )}

            {/* Collection Info */}
            <div className="p-6">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <StarIcon className="h-6 w-6 text-green-600" />
                  <h3 className="text-2xl font-bold text-gray-900">
                    All Kits
                  </h3>
                </div>
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-600 text-white text-sm font-medium rounded-full flex-shrink-0">
                  Main Collection
                </span>
              </div>

              <p className="text-gray-600 mb-3">
                Your complete collection of all football kits
              </p>

              <div className="flex items-center text-lg font-semibold text-green-600">
                {allKitsCount} {allKitsCount === 1 ? 'kit' : 'kits'} in your collection
              </div>
            </div>
          </button>
        </div>
      )}

      {/* Custom Collections Header */}
      {!loading && collections.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Custom Collections</h2>
          <p className="text-gray-600 mb-4">
            Organize your kits into custom collections by league, era, team, or any way you like
          </p>
        </div>
      )}

      {/* Custom Collections Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-4 w-2/3"></div>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="h-20 bg-gray-200 rounded"></div>
                ))}
              </div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : filteredCollections.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border-2 border-dashed border-gray-300 py-12">
          <div className="text-center">
            <div className="mx-auto text-gray-400 mb-4" style={{width: '32px', height: '32px'}}>
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No collections yet</h3>
            <p className="text-gray-500 mb-6">
              {filter === 'all'
                ? 'Create your first collection to start organizing your jerseys'
                : `You don't have any ${filter} collections`}
            </p>
            {filter === 'all' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <PlusIcon className="h-5 w-5" />
                Create Your First Collection
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCollections.map((collection) => (
            <button
              key={collection.id}
              onClick={() => navigate(`/collection/${collection.id}`)}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow text-left"
            >
              {/* Thumbnail Grid */}
              {collection.thumbnails.length > 0 ? (
                <div className="grid grid-cols-2 gap-1 p-2 bg-gray-50" style={{height: '112px'}}>
                  {collection.thumbnails.slice(0, 4).map((item, idx) => {
                    const imageUrl =
                      item.user_jersey?.public_jersey?.front_image_url ||
                      item.user_jersey?.public_jersey?.back_image_url

                    return (
                      <div
                        key={idx}
                        className="bg-white rounded flex items-center justify-center"
                        style={{overflow: 'hidden'}}
                      >
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt="Jersey"
                            style={{
                              maxWidth: '100%',
                              maxHeight: '100%',
                              width: 'auto',
                              height: 'auto',
                              objectFit: 'contain',
                              padding: '4px'
                            }}
                          />
                        ) : (
                          <div className="text-gray-300 text-xs">No Image</div>
                        )}
                      </div>
                    )
                  })}
                  {/* Fill empty slots if less than 4 jerseys */}
                  {[...Array(Math.max(0, 4 - collection.thumbnails.length))].map((_, idx) => (
                    <div key={`empty-${idx}`} className="bg-gray-100 rounded"></div>
                  ))}
                </div>
              ) : (
                <div className="bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center" style={{height: '112px'}}>
                  <span className="text-gray-400 text-sm">No jerseys yet</span>
                </div>
              )}

              {/* Collection Info */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                    {collection.name}
                  </h3>
                  {collection.is_public ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded flex-shrink-0">
                      <GlobeAltIcon className="h-3 w-3" />
                      Public
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded flex-shrink-0">
                      <LockClosedIcon className="h-3 w-3" />
                      Private
                    </span>
                  )}
                </div>

                {collection.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {collection.description}
                  </p>
                )}

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>
                    {collection.jersey_count} {collection.jersey_count === 1 ? 'jersey' : 'jerseys'}
                  </span>
                  <span className="text-xs">
                    {new Date(collection.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Create Collection Modal */}
      <CreateCollectionModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  )
}