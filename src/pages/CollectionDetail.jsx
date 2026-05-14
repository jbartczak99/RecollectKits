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
import './CollectionDetail.css'

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
  const isOwner = collection?.user_id === user?.id

  useEffect(() => {
    if (collectionId) {
      fetchCollectionDetails()
    }
  }, [collectionId, user])

  const fetchCollectionDetails = async () => {
    setLoading(true)
    setError(null)

    try {
      if (isMainCollection) {
        if (!user) {
          setError('Please sign in to view this collection')
          setLoading(false)
          return
        }
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

        // Check if user is the owner or collection is public
        const isOwner = collectionData.user_id === user?.id
        if (!isOwner && !collectionData.is_public) {
          setError('You do not have permission to view this collection')
          setLoading(false)
          return
        }

        setCollection(collectionData)
        const ownerId = collectionData.user_id

        // Special handling for "Liked Kits" - fetch directly from jersey_likes
        if (collectionData.name === 'Liked Kits') {
          // First get the liked jersey IDs
          const { data: likesData, error: likesError } = await supabase
            .from('jersey_likes')
            .select('jersey_id, created_at')
            .eq('user_id', ownerId)
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
            .eq('user_id', ownerId)
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
      <div className="collection-detail">
        <div className="cd-skeleton__header" />
        <div className="cd-skeleton">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="cd-skeleton__card" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="collection-detail">
        <button
          type="button"
          onClick={() => navigate('/collection')}
          className="collection-detail__back"
        >
          <ArrowLeftIcon className="collection-detail__back-icon" />
          Back to Collections
        </button>
        <div className="collection-detail__error">{error}</div>
      </div>
    )
  }

  if (!collection) {
    return <div className="collection-detail__not-found">Collection not found</div>
  }

  const isSystem = isLikedKitsCollection || isWishlistCollection
  const showCustomActions = isOwner && !isMainCollection && !isSystem
  const purchaseBreakdown = !isSystem
    ? ['new', 'used'].map((condition) => ({
        condition,
        count: jerseys.filter((j) => j.condition === condition).length,
      })).filter((b) => b.count > 0)
    : []

  return (
    <div className="collection-detail">
      <button
        type="button"
        onClick={() => navigate('/collection?view=collections')}
        className="collection-detail__back"
      >
        <ArrowLeftIcon className="collection-detail__back-icon" />
        Back to Collections
      </button>

      {/* Header */}
      <header className="collection-detail__header">
        <div className={`collection-detail__header-bar${isSystem ? ' collection-detail__header-bar--system' : ''}`} />
        <div className="collection-detail__header-body">
          <div className="collection-detail__header-row">
            <div>
              <div className="collection-detail__title-row">
                <h1 className="collection-detail__title">{collection.name}</h1>
                {isWishlistCollection ? (
                  <span className="collection-badge collection-badge--private">
                    <LockClosedIcon className="collection-badge__icon" />
                    Private
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={isMainCollection ? toggleAllKitsVisibility : toggleCollectionVisibility}
                    className="collection-detail__visibility"
                    title={collection.is_public ? 'Click to make private' : 'Click to make public'}
                  >
                    {collection.is_public ? (
                      <span className="collection-badge collection-badge--public">
                        <GlobeAltIcon className="collection-badge__icon" />
                        Public
                      </span>
                    ) : (
                      <span className="collection-badge collection-badge--private">
                        <LockClosedIcon className="collection-badge__icon" />
                        Private
                      </span>
                    )}
                  </button>
                )}
              </div>

              {collection.description && (
                <p className="collection-detail__description">{collection.description}</p>
              )}

              <div className="collection-detail__meta">
                <span>{jerseys.length} {jerseys.length === 1 ? 'kit' : 'kits'}</span>
                {collection.created_at && (
                  <>
                    <span className="collection-detail__meta-dot" />
                    <span>Created {new Date(collection.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </>
                )}
              </div>
            </div>

            {showCustomActions && (
              <div className="collection-detail__actions">
                <button type="button" onClick={() => setShowEditModal(true)} className="cd-action cd-action--secondary">
                  <PencilIcon className="cd-action__icon" />
                  Edit
                </button>
                <button type="button" onClick={() => setShowAddJerseyModal(true)} className="cd-action cd-action--primary">
                  <PlusIcon className="cd-action__icon" />
                  Add Kits
                </button>
                <button type="button" onClick={() => setShowDeleteConfirm(true)} className="cd-action cd-action--danger">
                  <TrashIcon className="cd-action__icon" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Stats */}
      {jerseys.length > 0 && (
        <div className="collection-detail__stats">
          <div className="cd-stat cd-stat--green">
            <div className="cd-stat__bar" />
            <div className="cd-stat__body">
              <p className="cd-stat__label">Total Kits</p>
              <p className="cd-stat__value">{jerseys.length}</p>
            </div>
          </div>

          {!isSystem && purchaseBreakdown.length > 0 && (
            <div className="cd-stat cd-stat--blue">
              <div className="cd-stat__bar" />
              <div className="cd-stat__body">
                <p className="cd-stat__label">Purchase Status</p>
                <div className="cd-stat__breakdown">
                  {purchaseBreakdown.map(({ condition, count }) => (
                    <div key={condition} className="cd-stat__breakdown-row">
                      <span className="cd-stat__breakdown-label">{condition}</span>
                      <span className="cd-stat__breakdown-value">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {jerseys.length === 0 ? (
        <div className="cd-empty">
          <div className="cd-empty__icon">
            <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <h3 className="cd-empty__title">
            {isLikedKitsCollection
              ? 'No liked kits yet'
              : isWishlistCollection
                ? 'Your wishlist is empty'
                : 'No kits yet'}
          </h3>
          <p className="cd-empty__text">
            {isLikedKitsCollection
              ? 'Like a kit from anywhere on the site to save it here.'
              : isWishlistCollection
                ? 'Add kits you want to acquire — we\'ll keep them in one place.'
                : 'Start building this collection by adding kits.'}
          </p>
          {isOwner && !isSystem && (
            <button
              type="button"
              onClick={() => setShowAddJerseyModal(true)}
              className="cd-action cd-action--primary"
            >
              <PlusIcon className="cd-action__icon" />
              Add your first kit
            </button>
          )}
        </div>
      ) : (
        <div className="cd-grid">
          {jerseys.map((userJersey) => {
            const jersey = userJersey.public_jersey
            const needsDetails = userJersey.details_completed === false
            const hasUserDetails = userJersey.jersey_fit || userJersey.size || userJersey.condition || userJersey.acquired_from || userJersey.notes
            const fitLabels = { mens: "Men's", womens: "Women's", youth: 'Youth' }
            const fitDisplay = userJersey.jersey_fit ? fitLabels[userJersey.jersey_fit] || null : null
            const fitSizeDisplay = fitDisplay && userJersey.size
              ? `${fitDisplay} ${userJersey.size}`
              : fitDisplay || userJersey.size || null
            const isSystemCollection = collection?.name === 'Liked Kits' || collection?.name === 'Wishlist'
            const hasBothImages = jersey?.front_image_url && jersey?.back_image_url
            const cardClassName = needsDetails ? 'cd-card cd-card--attention' : 'cd-card'

            return (
              <div key={userJersey.id} className={cardClassName}>
                {jersey?.front_image_url || jersey?.back_image_url ? (
                  <Link to={`/jerseys/${jersey.id}`} className="cd-card__image">
                    <img
                      src={
                        hasBothImages
                          ? (imageStates[userJersey.id] ? jersey.back_image_url : jersey.front_image_url)
                          : (jersey.front_image_url || jersey.back_image_url)
                      }
                      alt={`${jersey.team_name || ''} ${jersey.jersey_type || ''} kit`}
                    />
                  </Link>
                ) : (
                  <Link to={`/jerseys/${jersey?.id}`} className="cd-card__image cd-card__image--empty">
                    No image available
                  </Link>
                )}

                {hasBothImages && (
                  <div className="cd-card__toggle">
                    <button
                      type="button"
                      onClick={() => setImageStates((prev) => ({ ...prev, [userJersey.id]: false }))}
                      className={`cd-card__toggle-btn${!imageStates[userJersey.id] ? ' cd-card__toggle-btn--active' : ''}`}
                    >
                      Front
                    </button>
                    <span className="cd-card__toggle-divider">|</span>
                    <button
                      type="button"
                      onClick={() => setImageStates((prev) => ({ ...prev, [userJersey.id]: true }))}
                      className={`cd-card__toggle-btn${imageStates[userJersey.id] ? ' cd-card__toggle-btn--active' : ''}`}
                    >
                      Back
                    </button>
                  </div>
                )}

                <div className="cd-card__body">
                  <h3 className="cd-card__title">{jersey?.team_name || 'Unknown Team'}</h3>
                  <p className="cd-card__sub">
                    {jersey?.player_name && (
                      <span className="cd-card__sub-player">{jersey.player_name} • </span>
                    )}
                    {jersey?.season || 'Unknown Season'}
                  </p>

                  <div className="cd-badges">
                    {jersey?.kit_type && (
                      <span className={`cd-pill ${jersey.kit_type === 'international' ? 'cd-pill--purple' : 'cd-pill--green'}`}>
                        {jersey.kit_type === 'international' ? 'International' : 'Club'}
                      </span>
                    )}
                    {jersey?.jersey_type && <span className="cd-pill cd-pill--blue">{jersey.jersey_type}</span>}
                    {jersey?.manufacturer && <span className="cd-pill cd-pill--gray">{jersey.manufacturer}</span>}
                  </div>

                  {isSystemCollection && userJersey.added_to_collection_at && (
                    <p className="cd-card__added">
                      {collection?.name === 'Liked Kits' ? 'Liked on ' : 'Added on '}
                      {new Date(userJersey.added_to_collection_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  )}

                  {hasUserDetails && !isSystemCollection && (
                    <div className="cd-card__details">
                      <h4 className="cd-card__details-title">My Kit Details</h4>
                      <div className="cd-card__details-grid">
                        {fitSizeDisplay && (
                          <div className="cd-card__details-row">
                            <span className="cd-card__details-label">Fit/Size: </span>
                            <span className="cd-card__details-value">{fitSizeDisplay}</span>
                          </div>
                        )}
                        {userJersey.condition && (
                          <div className="cd-card__details-row">
                            <span className="cd-card__details-label">Purchased: </span>
                            <span className="cd-card__details-value" style={{ textTransform: 'capitalize' }}>{userJersey.condition}</span>
                          </div>
                        )}
                        {userJersey.acquired_from && (
                          <div className="cd-card__details-row cd-card__details-row--full">
                            <span className="cd-card__details-label">From: </span>
                            <span className="cd-card__details-value">{userJersey.acquired_from}</span>
                          </div>
                        )}
                      </div>
                      {userJersey.notes && (
                        <p className="cd-card__details-note">"{userJersey.notes}"</p>
                      )}
                    </div>
                  )}

                  {isOwner && (
                    <div className="cd-card__actions">
                      {isSystemCollection ? (
                        <button
                          type="button"
                          onClick={() => {
                            const confirmMsg = collection?.name === 'Liked Kits'
                              ? 'Are you sure you want to remove this kit from your Liked Kits?'
                              : 'Are you sure you want to remove this kit from your Wishlist?'
                            if (confirm(confirmMsg)) {
                              handleRemoveFromSystemCollection(userJersey)
                            }
                          }}
                          disabled={deletingJerseyId === userJersey.id}
                          className="cd-card-btn cd-card-btn--danger"
                        >
                          <TrashIcon className="cd-card-btn__icon" />
                          {deletingJerseyId === userJersey.id ? 'Removing…' : 'Remove kit'}
                        </button>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => handleEditJersey(userJersey)}
                            className={`cd-card-btn ${needsDetails ? 'cd-card-btn--warning' : 'cd-card-btn--secondary'}`}
                          >
                            {needsDetails ? (
                              <>
                                <ExclamationTriangleIcon className="cd-card-btn__icon" />
                                Complete details
                              </>
                            ) : (
                              <>
                                <PencilIcon className="cd-card-btn__icon" />
                                Edit details
                              </>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveJersey(userJersey.id)}
                            disabled={deletingJerseyId === userJersey.id}
                            className="cd-card-btn cd-card-btn--danger-outline"
                          >
                            <TrashIcon className="cd-card-btn__icon" />
                            {deletingJerseyId === userJersey.id ? 'Removing…' : 'Remove'}
                          </button>
                        </>
                      )}
                    </div>
                  )}
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
