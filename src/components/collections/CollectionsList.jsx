import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  PlusIcon,
  LockClosedIcon,
  GlobeAltIcon,
  StarIcon,
  ExclamationTriangleIcon,
  Cog6ToothIcon,
  FolderPlusIcon,
} from '@heroicons/react/24/outline'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { supabase } from '../../lib/supabase'
import CreateCollectionModal from './CreateCollectionModal'
import ProfileSettingsModal from '../profile/ProfileSettingsModal'
import './CollectionsList.css'

const formatDate = (iso) => {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return ''
  }
}

export default function CollectionsList({ openProfileSettings = false, onProfileSettingsClose }) {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [customCollections, setCustomCollections] = useState([])
  const [showProfileSettings, setShowProfileSettings] = useState(openProfileSettings)
  const [allKitsCount, setAllKitsCount] = useState(0)
  const [allKitsThumbnails, setAllKitsThumbnails] = useState([])
  const [pendingDetailsCount, setPendingDetailsCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [filter, setFilter] = useState('all')
  const [allKitsPublic, setAllKitsPublic] = useState(true)

  useEffect(() => {
    if (user) {
      fetchCollections()
      fetchProfileSettings()
    } else {
      setCustomCollections([])
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (openProfileSettings) setShowProfileSettings(true)
  }, [openProfileSettings])

  const fetchProfileSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('all_kits_public')
        .eq('id', user.id)
        .single()

      if (error) throw error
      setAllKitsPublic(data?.all_kits_public !== false)
    } catch (err) {
      console.error('Error fetching profile settings:', err)
      setAllKitsPublic(true)
    }
  }

  const fetchCollections = async () => {
    setLoading(true)
    setError(null)

    try {
      const { count: totalCount, error: countError } = await supabase
        .from('user_jerseys')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)

      if (countError) throw countError
      setAllKitsCount(totalCount || 0)

      const { count: pendingCount, error: pendingError } = await supabase
        .from('user_jerseys')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('details_completed', false)

      if (pendingError) throw pendingError
      setPendingDetailsCount(pendingCount || 0)

      const { data: allJerseys, error: allJerseysError } = await supabase
        .from('user_jerseys')
        .select('public_jersey:public_jerseys(front_image_url, back_image_url)')
        .eq('user_id', user.id)
        .limit(10)

      if (allJerseysError) throw allJerseysError
      setAllKitsThumbnails(allJerseys || [])

      // Custom collections only — Wishlist and Liked Kits live in the sidebar.
      const { data: collectionsData, error: collectionsError } = await supabase
        .from('collections')
        .select('*')
        .eq('user_id', user.id)
        .not('name', 'in', '("Wishlist","Liked Kits")')
        .order('created_at', { ascending: false })

      if (collectionsError) throw collectionsError

      const collectionsWithDetails = await Promise.all(
        (collectionsData || []).map(async (collection) => {
          const { count } = await supabase
            .from('collection_jerseys')
            .select('id', { count: 'exact', head: true })
            .eq('collection_id', collection.id)

          const { data: thumbnails } = await supabase
            .from('collection_jerseys')
            .select(`
              user_jersey:user_jerseys(
                public_jersey:public_jerseys(front_image_url, back_image_url)
              )
            `)
            .eq('collection_id', collection.id)
            .limit(4)

          return { ...collection, jersey_count: count || 0, thumbnails: thumbnails || [] }
        })
      )

      setCustomCollections(collectionsWithDetails)
    } catch (err) {
      console.error('Error fetching collections:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSuccess = () => fetchCollections()

  const handleProfileSettingsClose = () => {
    setShowProfileSettings(false)
    if (onProfileSettingsClose) onProfileSettingsClose()
  }

  const filteredCustomCollections = customCollections.filter((c) => {
    if (filter === 'all') return true
    if (filter === 'public') return c.is_public
    if (filter === 'private') return !c.is_public
    return true
  })

  return (
    <div className="collections-page">
      <div className="collections-page__header">
        <div>
          <h1 className="collections-page__title">My Collections</h1>
          <p className="collections-page__subtitle">
            Organize your kits into custom collections by league, era, team, or any theme you like
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowProfileSettings(true)}
          className="collections-page__settings"
        >
          <Cog6ToothIcon style={{ width: 15, height: 15 }} />
          Profile Settings
        </button>
      </div>

      {error && <div className="collections-page__error">Error loading collections: {error}</div>}

      {/* All Kits hero */}
      {!loading && (
        <button
          type="button"
          className="all-kits-hero"
          onClick={() => navigate('/collection/all')}
        >
          <div className="all-kits-hero__bar" />
          <div className="all-kits-hero__body">
            <div className="all-kits-hero__top">
              <div className="all-kits-hero__title-row">
                <StarIcon className="all-kits-hero__star" />
                <h3 className="all-kits-hero__title">All Kits</h3>
              </div>
              <div className="all-kits-hero__badges">
                {pendingDetailsCount > 0 && (
                  <span className="collection-badge collection-badge--pending">
                    <ExclamationTriangleIcon className="collection-badge__icon" />
                    {pendingDetailsCount} Action{pendingDetailsCount !== 1 ? 's' : ''} Needed
                  </span>
                )}
                {allKitsPublic ? (
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
              </div>
            </div>

            {allKitsThumbnails.length > 0 ? (
              <div className="all-kits-hero__thumbnails">
                {allKitsThumbnails.map((item, idx) => {
                  const imageUrl =
                    item.public_jersey?.front_image_url ||
                    item.public_jersey?.back_image_url
                  return (
                    <div key={idx} className="all-kits-hero__thumb">
                      {imageUrl ? (
                        <img src={imageUrl} alt="" />
                      ) : (
                        <span className="all-kits-hero__thumb-empty">No image</span>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="all-kits-hero__empty-strip">
                Start adding kits to your collection
              </div>
            )}

            <div className="all-kits-hero__bottom">
              <p className="all-kits-hero__caption">Your complete collection of football kits</p>
              <span className="all-kits-hero__count">{allKitsCount}</span>
            </div>
          </div>
        </button>
      )}

      {/* Custom collections */}
      {!loading && (
        <section className="custom-collections">
          <div className="custom-collections__header">
            <div>
              <h2 className="custom-collections__heading">Custom Collections</h2>
              <p className="custom-collections__caption">
                Group your kits into themed sets — favorite teams, decades, players, anything goes
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="custom-collections__create"
            >
              <PlusIcon className="custom-collections__create-icon" />
              Create Collection
            </button>
          </div>

          {customCollections.length > 0 && (
            <div className="custom-collections__filters">
              {['all', 'public', 'private'].map((key) => {
                const labels = {
                  all: 'All',
                  public: 'Public',
                  private: 'Private',
                }
                const count = key === 'all'
                  ? customCollections.length
                  : key === 'public'
                    ? customCollections.filter((c) => c.is_public).length
                    : customCollections.filter((c) => !c.is_public).length
                const cls = filter === key
                  ? 'custom-collections__filter custom-collections__filter--active'
                  : 'custom-collections__filter'
                return (
                  <button
                    key={key}
                    type="button"
                    className={cls}
                    onClick={() => setFilter(key)}
                  >
                    {labels[key]} ({count})
                  </button>
                )
              })}
            </div>
          )}

          {filteredCustomCollections.length === 0 ? (
            <div className="custom-collections__empty">
              <div className="custom-collections__empty-icon">
                <FolderPlusIcon style={{ width: 28, height: 28 }} />
              </div>
              <h3 className="custom-collections__empty-title">
                {filter === 'all' ? 'No custom collections yet' : `No ${filter} collections`}
              </h3>
              <p className="custom-collections__empty-text">
                {filter === 'all'
                  ? 'Group your kits any way you like — by team, era, country, or a project you\'re working on.'
                  : `You don't have any ${filter} collections. Switch filter or create a new one.`}
              </p>
              {filter === 'all' && (
                <button
                  type="button"
                  onClick={() => setShowCreateModal(true)}
                  className="custom-collections__create"
                >
                  <PlusIcon className="custom-collections__create-icon" />
                  Create your first collection
                </button>
              )}
            </div>
          ) : (
            <div className="custom-collections__grid">
              {filteredCustomCollections.map((collection) => (
                <button
                  key={collection.id}
                  type="button"
                  className="collection-card"
                  onClick={() => navigate(`/collection/${collection.id}`)}
                >
                  {collection.thumbnails.length > 0 ? (
                    <div className="collection-card__thumbs">
                      {collection.thumbnails.slice(0, 4).map((item, idx) => {
                        const imageUrl =
                          item.user_jersey?.public_jersey?.front_image_url ||
                          item.user_jersey?.public_jersey?.back_image_url
                        return (
                          <div key={idx} className="collection-card__thumb">
                            {imageUrl ? (
                              <img src={imageUrl} alt="" />
                            ) : (
                              <span className="collection-card__thumb-empty">No image</span>
                            )}
                          </div>
                        )
                      })}
                      {[...Array(Math.max(0, 4 - collection.thumbnails.length))].map((_, idx) => (
                        <div key={`empty-${idx}`} className="collection-card__thumb-placeholder" />
                      ))}
                    </div>
                  ) : (
                    <div className="collection-card__empty-thumbs">No kits yet</div>
                  )}

                  <div className="collection-card__body">
                    <div className="collection-card__title-row">
                      <h3 className="collection-card__title">{collection.name}</h3>
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
                    </div>

                    {collection.description && (
                      <p className="collection-card__description">{collection.description}</p>
                    )}

                    <div className="collection-card__footer">
                      <span className="collection-card__count">
                        {collection.jersey_count} {collection.jersey_count === 1 ? 'kit' : 'kits'}
                      </span>
                      <span>{formatDate(collection.created_at)}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {loading && (
        <div className="custom-collections__skeleton">
          {[0, 1, 2].map((i) => (
            <div key={i} className="collections-skeleton-card" />
          ))}
        </div>
      )}

      <CreateCollectionModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />

      <ProfileSettingsModal
        isOpen={showProfileSettings}
        onClose={handleProfileSettingsClose}
      />
    </div>
  )
}
