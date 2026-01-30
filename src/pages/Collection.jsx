import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { PlusIcon, LockClosedIcon, GlobeAltIcon, StarIcon, ExclamationTriangleIcon, Cog6ToothIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../contexts/AuthContext.jsx'
import { supabase } from '../lib/supabase'
import CreateCollectionModal from '../components/collections/CreateCollectionModal'
import ProfileSettingsModal from '../components/profile/ProfileSettingsModal'

export default function Collection() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const [collections, setCollections] = useState([])
  const [showProfileSettings, setShowProfileSettings] = useState(false)
  const [allKitsCount, setAllKitsCount] = useState(0)
  const [allKitsThumbnails, setAllKitsThumbnails] = useState([])
  const [pendingDetailsCount, setPendingDetailsCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [filter, setFilter] = useState('all') // 'all', 'public', 'private'
  const [allKitsPublic, setAllKitsPublic] = useState(true) // Default public

  useEffect(() => {
    if (user) {
      fetchCollections()
      fetchProfileSettings()
    } else {
      setCollections([])
      setLoading(false)
    }
  }, [user])

  // Handle ?settings=profile query param
  useEffect(() => {
    if (searchParams.get('settings') === 'profile') {
      setShowProfileSettings(true)
      // Clear the query param
      setSearchParams({})
    }
  }, [searchParams, setSearchParams])

  // Fetch profile settings for All Kits visibility
  const fetchProfileSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('all_kits_public')
        .eq('id', user.id)
        .single()

      if (error) throw error
      // Default to true if not set
      setAllKitsPublic(data?.all_kits_public !== false)
    } catch (err) {
      console.error('Error fetching profile settings:', err)
      // Default to public if error
      setAllKitsPublic(true)
    }
  }

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

      // Fetch pending details count
      const { count: pendingCount, error: pendingError } = await supabase
        .from('user_jerseys')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('details_completed', false)

      if (pendingError) throw pendingError
      setPendingDetailsCount(pendingCount || 0)

      // Get jerseys for main collection horizontal gallery
      const { data: allJerseys, error: allJerseysError } = await supabase
        .from('user_jerseys')
        .select('public_jersey:public_jerseys(front_image_url, back_image_url)')
        .eq('user_id', user.id)
        .limit(10)

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
          // Special handling for "Liked Kits" - fetch from jersey_likes
          if (collection.name === 'Liked Kits') {
            // Get liked jersey count
            const { count, error: countError } = await supabase
              .from('jersey_likes')
              .select('id', { count: 'exact', head: true })
              .eq('user_id', user.id)

            // Get first 10 liked jerseys for thumbnails
            const { data: likesData, error: likesError } = await supabase
              .from('jersey_likes')
              .select('jersey_id')
              .eq('user_id', user.id)
              .order('created_at', { ascending: false })
              .limit(10)

            let thumbnails = []
            if (likesData && likesData.length > 0) {
              const jerseyIds = likesData.map(item => item.jersey_id)
              const { data: jerseysData } = await supabase
                .from('public_jerseys')
                .select('id, front_image_url, back_image_url')
                .in('id', jerseyIds)

              // Transform to match expected structure (user_jersey.public_jersey)
              thumbnails = jerseyIds.map(id => {
                const jersey = jerseysData?.find(j => j.id === id)
                return { user_jersey: { public_jersey: jersey } }
              }).filter(item => item.user_jersey?.public_jersey)
            }

            return {
              ...collection,
              jersey_count: count || 0,
              thumbnails: thumbnails
            }
          }

          // Special handling for "Wishlist" - fetch from user_wishlist
          if (collection.name === 'Wishlist') {
            // Get wishlist jersey count
            const { count, error: countError } = await supabase
              .from('user_wishlist')
              .select('id', { count: 'exact', head: true })
              .eq('user_id', user.id)

            // Get first 10 wishlist jerseys for thumbnails
            const { data: wishlistData, error: wishlistError } = await supabase
              .from('user_wishlist')
              .select('public_jersey_id')
              .eq('user_id', user.id)
              .order('created_at', { ascending: false })
              .limit(10)

            let thumbnails = []
            if (wishlistData && wishlistData.length > 0) {
              const jerseyIds = wishlistData.map(item => item.public_jersey_id)
              const { data: jerseysData } = await supabase
                .from('public_jerseys')
                .select('id, front_image_url, back_image_url')
                .in('id', jerseyIds)

              // Transform to match expected structure (user_jersey.public_jersey)
              thumbnails = jerseyIds.map(id => {
                const jersey = jerseysData?.find(j => j.id === id)
                return { user_jersey: { public_jersey: jersey } }
              }).filter(item => item.user_jersey?.public_jersey)
            }

            return {
              ...collection,
              jersey_count: count || 0,
              thumbnails: thumbnails
            }
          }

          // Regular collection handling via collection_jerseys junction table
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

  // Separate system collections from custom collections
  const systemCollections = collections.filter(
    c => c.name === 'Liked Kits' || c.name === 'Wishlist'
  )
  const customCollections = collections.filter(
    c => c.name !== 'Liked Kits' && c.name !== 'Wishlist'
  )

  const filteredCustomCollections = customCollections.filter((collection) => {
    if (filter === 'all') return true
    if (filter === 'public') return collection.is_public
    if (filter === 'private') return !collection.is_public
    return true
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Collections</h1>
          <p className="text-gray-600 mt-1">
            Organize your jerseys into custom collections
          </p>
        </div>
        <button
          onClick={() => setShowProfileSettings(true)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', border: '1px solid #d1d5db', borderRadius: '8px', backgroundColor: 'white', color: '#374151', fontSize: '13px', fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}
        >
          <Cog6ToothIcon style={{ width: '15px', height: '15px' }} />
          Profile Settings
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          Error loading collections: {error}
        </div>
      )}


      {/* Main Collection - All Kits */}
      {!loading && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-lg shadow-lg overflow-hidden" style={{width: '100%'}}>
          <button
            onClick={() => navigate('/collection/all')}
            className="w-full text-left hover:bg-white/50 transition-all"
            style={{width: '100%'}}
          >
            {/* Title Header */}
            <div className="px-6 pt-5 pb-3">
              <div className="flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
                <div className="flex items-center gap-2 flex-shrink-0">
                  <StarIcon className="h-6 w-6 text-green-600 flex-shrink-0" />
                  <h3 className="text-2xl font-bold text-gray-900" style={{whiteSpace: 'nowrap'}}>
                    All Kits
                  </h3>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {pendingDetailsCount > 0 && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full">
                      <ExclamationTriangleIcon className="h-3 w-3" />
                      {pendingDetailsCount} Action{pendingDetailsCount !== 1 ? 's' : ''} Needed
                    </span>
                  )}
                  {/* Visibility Badge (display only) */}
                  {allKitsPublic ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                      <GlobeAltIcon className="h-3 w-3" />
                      Public
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                      <LockClosedIcon className="h-3 w-3" />
                      Private
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Horizontal Thumbnail Gallery */}
            {allKitsThumbnails.length > 0 ? (
              <div className="flex items-center gap-3 px-4 py-3 bg-white/50 overflow-x-auto" style={{minHeight: '110px', width: '100%'}}>
                {allKitsThumbnails.map((item, idx) => {
                  const imageUrl =
                    item.public_jersey?.front_image_url ||
                    item.public_jersey?.back_image_url

                  return (
                    <div
                      key={idx}
                      className="bg-white rounded-lg shadow-sm flex-shrink-0 flex items-center justify-center"
                      style={{width: '90px', height: '100px', overflow: 'hidden'}}
                    >
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt="Jersey"
                          className="object-contain p-2"
                          style={{
                            maxWidth: '100%',
                            maxHeight: '100%'
                          }}
                        />
                      ) : (
                        <div className="text-gray-300 text-xs">No Image</div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="mx-4 mb-3 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg flex items-center justify-center" style={{height: '100px'}}>
                <span className="text-gray-400 text-sm">Start adding kits to your collection</span>
              </div>
            )}

            {/* Collection Info */}
            <div className="px-6 pb-5 pt-3 flex items-center justify-between">
              <p className="text-gray-600">
                Your complete collection of all football kits
              </p>
              <span className="text-2xl font-bold text-green-600">
                {allKitsCount}
              </span>
            </div>
          </button>
        </div>
      )}

      {/* System Collections - Liked Kits and Wishlist */}
      {!loading && systemCollections.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {systemCollections.map((collection) => {
            const isLikedKits = collection.name === 'Liked Kits'
            const isWishlist = collection.name === 'Wishlist'

            return (
              <button
                key={collection.id}
                onClick={() => navigate(`/collection/${collection.id}`)}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow text-left border border-gray-200"
              >
                {/* Title Header */}
                <div className="px-4 pt-4 pb-2 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {collection.name}
                  </h3>
                  {/* Visibility Badge (display only) */}
                  {isLikedKits && (
                    collection.is_public ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        <GlobeAltIcon className="h-3 w-3" />
                        Public
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                        <LockClosedIcon className="h-3 w-3" />
                        Private
                      </span>
                    )
                  )}
                  {/* Wishlist is always private */}
                  {isWishlist && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                      <LockClosedIcon className="h-3 w-3" />
                      Private
                    </span>
                  )}
                </div>

                {/* Thumbnail Gallery */}
                {collection.thumbnails && collection.thumbnails.length > 0 ? (
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 overflow-x-auto" style={{minHeight: '80px'}}>
                    {collection.thumbnails.slice(0, 6).map((item, idx) => {
                      const imageUrl =
                        item.user_jersey?.public_jersey?.front_image_url ||
                        item.user_jersey?.public_jersey?.back_image_url

                      return (
                        <div
                          key={idx}
                          className="bg-white rounded shadow-sm flex-shrink-0 flex items-center justify-center"
                          style={{width: '60px', height: '70px', overflow: 'hidden'}}
                        >
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt="Jersey"
                              className="object-contain p-1"
                              style={{ maxWidth: '100%', maxHeight: '100%' }}
                            />
                          ) : (
                            <div className="text-gray-300 text-xs">No Image</div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="mx-3 mb-2 bg-gradient-to-br from-gray-100 to-gray-200 rounded flex items-center justify-center" style={{height: '70px'}}>
                    <span className="text-gray-400 text-sm">No kits yet</span>
                  </div>
                )}

                {/* Description & Count */}
                <div className="px-4 pb-4 pt-2 flex items-center justify-between">
                  <p className="text-sm text-gray-500">{collection.description}</p>
                  <span className="text-xl font-bold text-gray-700">
                    {collection.jersey_count}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Custom Collections Header */}
      {!loading && (
        <div className="mt-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Custom Collections</h2>
              <p className="text-gray-600 mt-1">
                Organize your kits into custom collections by league, era, team, or any way you like
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              style={{padding: '8px 12px'}}
            >
              <PlusIcon style={{width: '16px', height: '16px', minWidth: '16px', minHeight: '16px'}} />
              Create Collection
            </button>
          </div>

          {/* Filter Buttons */}
          {customCollections.length > 0 && (
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All ({customCollections.length})
              </button>
              <button
                onClick={() => setFilter('public')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'public'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Public ({customCollections.filter(c => c.is_public).length})
              </button>
              <button
                onClick={() => setFilter('private')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'private'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Private ({customCollections.filter(c => !c.is_public).length})
              </button>
            </div>
          )}
        </div>
      )}

      {/* Custom Collections Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
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
      ) : filteredCustomCollections.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border-2 border-dashed border-gray-300 py-8">
          <div className="text-center">
            <div className="mx-auto text-gray-400 mb-4" style={{width: '32px', height: '32px'}}>
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No custom collections yet</h3>
            <p className="text-gray-500 mb-4">
              {filter === 'all'
                ? 'Create collections to organize your kits by league, era, or theme'
                : `You don't have any ${filter} collections`}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomCollections.map((collection) => (
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
                  {/* Hide date for system collections (Liked Kits, Wishlist) */}
                  {collection.name !== 'Liked Kits' && collection.name !== 'Wishlist' && (
                    <span className="text-xs">
                      {new Date(collection.created_at).toLocaleDateString()}
                    </span>
                  )}
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

      {/* Profile Settings Modal */}
      <ProfileSettingsModal
        isOpen={showProfileSettings}
        onClose={() => setShowProfileSettings(false)}
      />
    </div>
  )
}