import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeftIcon, HeartIcon, StarIcon, CheckCircleIcon, UsersIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid, StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { useUserJerseys, useJerseyLikes, useWishlist } from '../../hooks/useJerseys'
import { supabase, supabasePublic } from '../../lib/supabase'
import WikidataPlayerLinker from './WikidataPlayerLinker'
import { useKitSquad } from '../../hooks/useKitSquad'
import SquadImportPanel from './SquadImportPanel'
import { getFlag } from '../../utils/countryFlags'

export default function JerseyDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const [jersey, setJersey] = useState(null)
  const [relatedJerseys, setRelatedJerseys] = useState([])
  const [playerOtherKits, setPlayerOtherKits] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedImage, setSelectedImage] = useState(null)
  const [showAllPlayers, setShowAllPlayers] = useState(false)
  const [showAllPlayerKits, setShowAllPlayerKits] = useState(false)
  const [showAllSquad, setShowAllSquad] = useState(false)
  const [showMissingForm, setShowMissingForm] = useState(false)
  const [showSquadImport, setShowSquadImport] = useState(false)
  const { isInMainCollection, addToMainCollection } = useUserJerseys()
  const { hasLiked, getLikeCount, toggleLike } = useJerseyLikes(user?.id)
  const { isInWishlist, toggleWishlist } = useWishlist(user?.id)
  const { squad: squadData, loading: squadLoading, refetch: refetchSquad } = useKitSquad(
    jersey?.team_name, jersey?.season
  )

  useEffect(() => {
    const fetchJersey = async () => {
      setLoading(true)
      setError(null)

      try {
        const { data, error } = await supabasePublic
          .from('public_jerseys')
          .select('*')
          .eq('id', id)
          .single()

        if (error) throw error
        setJersey(data)

        // Set default selected image
        if (data?.front_image_url) {
          setSelectedImage(data.front_image_url)
        } else if (data?.back_image_url) {
          setSelectedImage(data.back_image_url)
        }

        // Fetch related jerseys (same team, season, type, gender) for "Players who wore this kit"
        if (data) {
          let query = supabasePublic
            .from('public_jerseys')
            .select('*')
            .eq('team_name', data.team_name)
            .eq('season', data.season)
            .eq('jersey_type', data.jersey_type)
            .neq('id', data.id)

          if (data.competition_gender) {
            query = query.eq('competition_gender', data.competition_gender)
          }

          const { data: related } = await query.order('player_name', { ascending: true })
          if (related) {
            setRelatedJerseys(related)
          }

          // Fetch other kits by the same player (only if this is a player-specific jersey)
          if (data.player_name && data.player_name.trim()) {
            const { data: otherKits } = await supabasePublic
              .from('public_jerseys')
              .select('*')
              .eq('player_name', data.player_name)
              .neq('id', data.id)
              .order('season', { ascending: false })

            if (otherKits) {
              setPlayerOtherKits(otherKits)
            }
          }
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchJersey()
    }
  }, [id])

  const handleHave = async (jerseyId) => {
    if (!user) {
      alert('Please sign in to add jerseys to your collection')
      return
    }

    const { error } = await addToMainCollection(jerseyId)
    if (error) {
      alert(`Error adding to collection: ${error}`)
    }
  }

  const handleLike = async (jerseyId) => {
    if (!user) {
      alert('Please sign in to like kits')
      return
    }

    const { error } = await toggleLike(jerseyId)
    if (error) {
      alert(`Error: ${error}`)
    }
  }

  const handleWant = async (jerseyId) => {
    if (!user) {
      alert('Please sign in to add kits to your wishlist')
      return
    }

    const { error } = await toggleWishlist(jerseyId)
    if (error) {
      alert(`Error: ${error}`)
    }
  }

  const handleBack = () => {
    navigate(-1) // Go back to previous page in browser history
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '120px 0' }}>
        <div
          className="animate-spin"
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            border: '3px solid #e5e7eb',
            borderBottomColor: '#16a34a',
          }}
        />
      </div>
    )
  }

  if (error || !jersey) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 16px' }}>
        <div style={{ textAlign: 'center', maxWidth: '420px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>Kit Not Found</h1>
          <p style={{ color: '#6b7280', margin: '0 0 20px', fontSize: '14px' }}>
            {error || 'This kit could not be found.'}
          </p>
          <button
            type="button"
            onClick={handleBack}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              backgroundColor: '#16a34a',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            <ArrowLeftIcon style={{ width: '16px', height: '16px' }} />
            Back to Kits
          </button>
        </div>
      </div>
    )
  }

  const hasImages = jersey.front_image_url || jersey.back_image_url
  const availableImages = []
  
  if (jersey.front_image_url) {
    availableImages.push({
      url: jersey.front_image_url,
      label: 'Front',
      alt: `${jersey.team_name} ${jersey.jersey_type} kit - Front`
    })
  }
  
  if (jersey.back_image_url) {
    availableImages.push({
      url: jersey.back_image_url,
      label: 'Back', 
      alt: `${jersey.team_name} ${jersey.jersey_type} kit - Back`
    })
  }

  const detailStyles = {
    page: { display: 'flex', flexDirection: 'column', gap: '20px' },
    breadcrumb: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      fontSize: '13px',
      color: '#6b7280',
      flexWrap: 'wrap',
    },
    breadcrumbLink: { color: '#6b7280', textDecoration: 'none' },
    breadcrumbSep: { color: '#d1d5db' },
    breadcrumbCurrent: { color: '#111827', fontWeight: 500 },
    backBtn: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '6px 0',
      background: 'transparent',
      border: 'none',
      color: '#374151',
      fontSize: '14px',
      fontWeight: 500,
      cursor: 'pointer',
      width: 'fit-content',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '24px',
    },
    card: {
      background: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
      overflow: 'hidden',
    },
    cardPad: { padding: '20px 24px' },
    mainImageWrap: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f9fafb',
      minHeight: '420px',
      padding: '24px',
    },
    mainImage: {
      maxWidth: '100%',
      maxHeight: '460px',
      objectFit: 'contain',
    },
    emptyImage: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '8px',
      color: '#9ca3af',
      fontSize: '14px',
      fontWeight: 500,
    },
    thumbRow: {
      display: 'flex',
      gap: '12px',
      justifyContent: 'center',
      padding: '12px 16px',
      borderTop: '1px solid #f3f4f6',
      background: '#ffffff',
    },
    thumbWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' },
    thumb: (active) => ({
      width: '72px',
      height: '72px',
      borderRadius: '8px',
      overflow: 'hidden',
      cursor: 'pointer',
      border: '2px solid',
      borderColor: active ? '#16a34a' : '#e5e7eb',
      transition: 'border-color 0.15s, transform 0.15s',
      background: '#f9fafb',
    }),
    thumbImg: { width: '100%', height: '100%', objectFit: 'cover' },
    thumbLabel: { fontSize: '11px', color: '#6b7280', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' },
    title: {
      margin: 0,
      fontSize: '26px',
      fontWeight: 700,
      color: '#111827',
      lineHeight: 1.2,
    },
    playerLine: {
      margin: '8px 0 0',
      fontSize: '16px',
      fontWeight: 600,
      color: '#16a34a',
    },
    playerNumber: { color: '#9ca3af', fontWeight: 400, fontSize: '14px', marginLeft: '6px' },
    headerDivider: { height: '1px', background: '#e5e7eb', margin: '20px 0' },
    sectionTitle: {
      margin: '0 0 12px',
      fontSize: '13px',
      fontWeight: 600,
      color: '#6b7280',
      textTransform: 'uppercase',
      letterSpacing: '0.04em',
    },
    specRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: '12px',
      padding: '10px 0',
      borderBottom: '1px solid #f3f4f6',
      fontSize: '14px',
    },
    specLabel: { color: '#6b7280', fontWeight: 500 },
    specValue: { color: '#111827', textAlign: 'right' },
    descriptionText: { margin: 0, fontSize: '14px', color: '#374151', lineHeight: 1.55 },
    sectionGap: { marginTop: '20px' },
    actionRow: { display: 'flex', gap: '8px' },
    actionBtn: ({ active, activeBg, activeBorder, activeColor }) => ({
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '4px',
      padding: '10px 12px',
      borderRadius: '8px',
      border: '1px solid',
      borderColor: active ? activeBorder : '#e5e7eb',
      backgroundColor: active ? activeBg : '#f9fafb',
      color: active ? activeColor : '#374151',
      fontSize: '13px',
      fontWeight: 500,
      cursor: 'pointer',
      transition: 'background-color 0.15s, border-color 0.15s, color 0.15s',
    }),
    signInPrompt: { textAlign: 'center', padding: '8px 0' },
    signInLink: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '8px 18px',
      backgroundColor: '#16a34a',
      color: 'white',
      borderRadius: '8px',
      textDecoration: 'none',
      fontSize: '14px',
      fontWeight: 500,
    },
  }

  const ownsKit = isInMainCollection(jersey.id)
  const likedKit = hasLiked(jersey.id)
  const wishedKit = isInWishlist(jersey.id)

  return (
    <div style={detailStyles.page}>
      <nav style={detailStyles.breadcrumb} aria-label="Breadcrumb">
        <Link to="/" style={detailStyles.breadcrumbLink}>Home</Link>
        <span style={detailStyles.breadcrumbSep}>/</span>
        <Link to="/jerseys" style={detailStyles.breadcrumbLink}>Kit Database</Link>
        <span style={detailStyles.breadcrumbSep}>/</span>
        <span style={detailStyles.breadcrumbCurrent}>{jersey?.team_name || 'Kit Details'}</span>
      </nav>

      <button type="button" onClick={handleBack} style={detailStyles.backBtn}>
        <ArrowLeftIcon style={{ width: '16px', height: '16px' }} />
        Back to Kits
      </button>

      <div
        style={{
          ...detailStyles.grid,
          gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
        }}
        className="kit-details-grid"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={detailStyles.card}>
            {selectedImage ? (
              <div style={detailStyles.mainImageWrap}>
                <img
                  src={selectedImage}
                  alt={`${jersey.team_name} ${jersey.jersey_type} kit`}
                  style={detailStyles.mainImage}
                  onError={(e) => { e.target.style.display = 'none' }}
                />
              </div>
            ) : (
              <div style={{ ...detailStyles.mainImageWrap, background: '#f3f4f6' }}>
                <div style={detailStyles.emptyImage}>
                  <span style={{ fontSize: '48px' }}>👕</span>
                  <span>No image available</span>
                </div>
              </div>
            )}

            {availableImages.length > 1 && (
              <div style={detailStyles.thumbRow}>
                {jersey.front_image_url && (
                  <div style={detailStyles.thumbWrap}>
                    <div
                      style={detailStyles.thumb(selectedImage === jersey.front_image_url)}
                      onClick={() => setSelectedImage(jersey.front_image_url)}
                    >
                      <img src={jersey.front_image_url} alt="Front" style={detailStyles.thumbImg} />
                    </div>
                    <span style={detailStyles.thumbLabel}>Front</span>
                  </div>
                )}
                {jersey.back_image_url && (
                  <div style={detailStyles.thumbWrap}>
                    <div
                      style={detailStyles.thumb(selectedImage === jersey.back_image_url)}
                      onClick={() => setSelectedImage(jersey.back_image_url)}
                    >
                      <img src={jersey.back_image_url} alt="Back" style={detailStyles.thumbImg} />
                    </div>
                    <span style={detailStyles.thumbLabel}>Back</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ ...detailStyles.card, ...detailStyles.cardPad }}>
            <h1 style={detailStyles.title}>
              {[
                jersey.season,
                jersey.team_name || 'Unknown Team',
                jersey.jersey_type ? jersey.jersey_type.charAt(0).toUpperCase() + jersey.jersey_type.slice(1) : null,
              ].filter(Boolean).join(' ')}
            </h1>

            {jersey.player_name && (
              <p style={detailStyles.playerLine}>
                {jersey.player_id ? (
                  <Link to={`/players/${jersey.player_id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                    {jersey.player_name}
                  </Link>
                ) : (
                  jersey.player_name
                )}
                {(jersey.player_number || jersey.jersey_number) && (
                  <span style={detailStyles.playerNumber}>
                    #{jersey.player_number || jersey.jersey_number}
                  </span>
                )}
              </p>
            )}

            {user && jersey.player_name && !jersey.player_id && (
              <div style={{ marginTop: '12px' }}>
                <WikidataPlayerLinker
                  jerseyId={jersey.id}
                  playerName={jersey.player_name}
                  onLinked={(playerId) => {
                    setJersey((prev) => ({ ...prev, player_id: playerId }))
                  }}
                />
              </div>
            )}

            <div style={detailStyles.headerDivider} />

            <h3 style={detailStyles.sectionTitle}>Specifications</h3>
            <div>
              {jersey.jersey_type && (
                <div style={detailStyles.specRow}>
                  <span style={detailStyles.specLabel}>Type</span>
                  <span style={detailStyles.specValue}>{jersey.jersey_type.charAt(0).toUpperCase() + jersey.jersey_type.slice(1)}</span>
                </div>
              )}
              {jersey.season && (
                <div style={detailStyles.specRow}>
                  <span style={detailStyles.specLabel}>Season</span>
                  <span style={detailStyles.specValue}>{jersey.season}</span>
                </div>
              )}
              {jersey.league && (
                <div style={detailStyles.specRow}>
                  <span style={detailStyles.specLabel}>League</span>
                  <span style={detailStyles.specValue}>{jersey.league}</span>
                </div>
              )}
              {jersey.manufacturer && (
                <div style={detailStyles.specRow}>
                  <span style={detailStyles.specLabel}>Manufacturer</span>
                  <span style={detailStyles.specValue}>{jersey.manufacturer}</span>
                </div>
              )}
              {(jersey.colors || jersey.primary_color || jersey.secondary_color) && (
                <div style={detailStyles.specRow}>
                  <span style={detailStyles.specLabel}>Colors</span>
                  <span style={detailStyles.specValue}>
                    {jersey.colors ||
                      [jersey.primary_color, jersey.secondary_color]
                        .filter((color) => color && color.trim())
                        .join(', ') ||
                      'Not specified'}
                  </span>
                </div>
              )}
            </div>

            {(jersey.main_sponsor || jersey.additional_sponsors) && (
              <div style={detailStyles.sectionGap}>
                <h3 style={detailStyles.sectionTitle}>Sponsors</h3>
                {jersey.main_sponsor && (
                  <div style={detailStyles.specRow}>
                    <span style={detailStyles.specLabel}>Main</span>
                    <span style={detailStyles.specValue}>{jersey.main_sponsor}</span>
                  </div>
                )}
                {jersey.additional_sponsors && (() => {
                  const list = String(jersey.additional_sponsors)
                    .split(/[\n\r,;|]+/)
                    .map((s) => s.trim())
                    .filter(Boolean)
                  if (list.length === 0) return null
                  return (
                    <div style={detailStyles.specRow}>
                      <span style={detailStyles.specLabel}>Additional</span>
                      <div style={{ ...detailStyles.specValue, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        {list.map((sponsor, i) => (
                          <span key={i}>{sponsor}</span>
                        ))}
                      </div>
                    </div>
                  )
                })()}
              </div>
            )}

            {jersey.description && (
              <div style={detailStyles.sectionGap}>
                <h3 style={detailStyles.sectionTitle}>Description</h3>
                <p style={detailStyles.descriptionText}>{jersey.description}</p>
              </div>
            )}
          </div>

          <div style={{ ...detailStyles.card, ...detailStyles.cardPad }}>
            {user ? (
              <div style={detailStyles.actionRow}>
                <button
                  type="button"
                  onClick={() => handleLike(jersey.id)}
                  style={detailStyles.actionBtn({
                    active: likedKit,
                    activeBg: '#fee2e2',
                    activeBorder: '#fecaca',
                    activeColor: '#dc2626',
                  })}
                >
                  {likedKit
                    ? <HeartIconSolid style={{ width: '20px', height: '20px' }} />
                    : <HeartIcon style={{ width: '20px', height: '20px' }} />}
                  <span>{getLikeCount(jersey.id) > 0 ? getLikeCount(jersey.id) : 'Like'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleHave(jersey.id)}
                  style={detailStyles.actionBtn({
                    active: ownsKit,
                    activeBg: '#dcfce7',
                    activeBorder: '#bbf7d0',
                    activeColor: '#15803d',
                  })}
                >
                  <CheckCircleIcon style={{ width: '20px', height: '20px' }} />
                  <span>{ownsKit ? 'Owned' : 'Have'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleWant(jersey.id)}
                  style={detailStyles.actionBtn({
                    active: wishedKit,
                    activeBg: '#fef3c7',
                    activeBorder: '#fde68a',
                    activeColor: '#b45309',
                  })}
                >
                  {wishedKit
                    ? <StarIconSolid style={{ width: '20px', height: '20px' }} />
                    : <StarIcon style={{ width: '20px', height: '20px' }} />}
                  <span>Want</span>
                </button>
              </div>
            ) : (
              <div style={detailStyles.signInPrompt}>
                <p style={{ margin: '0 0 12px', color: '#6b7280', fontSize: '14px' }}>
                  Sign in to add this kit to your collection
                </p>
                <Link to="/auth" style={detailStyles.signInLink}>Sign In</Link>
              </div>
            )}
          </div>
        </div>
      </div>

          {/* Squad - Players Who Appeared in This Kit */}
          {jersey.team_name && jersey.season && (
            <div className="mt-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <UsersIcon style={{ width: 20, height: 20, color: '#9ca3af' }} />
                    <h2 className="text-lg font-semibold text-gray-900">
                      Players to Wear This Kit
                    </h2>
                  </div>
                  <span className="text-sm text-gray-500">
                    {squadLoading ? 'Loading...' : `${squadData.length} players`}
                  </span>
                </div>

                {squadLoading ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                    <div style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                      Loading squad data...
                    </div>
                  </div>
                ) : squadData.length > 0 ? (
                  (() => {
                    const filtered = squadData.filter(p => !(jersey.player_name && p.name.toLowerCase() === jersey.player_name.toLowerCase()))
                    const visible = showAllSquad ? filtered : filtered.slice(0, 20)

                    return (
                      <>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.5rem' }}>
                          {visible.map((player) => {
                            const flag = getFlag(player.nationality)
                            const card = (
                              <div
                                style={{
                                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                                  padding: '0.5rem 0.375rem', borderRadius: '0.5rem',
                                  border: '1px solid',
                                  borderColor: player.inDb ? '#e5e7eb' : '#f3f4f6',
                                  background: player.inDb ? 'white' : '#fafafa',
                                  transition: 'all 0.2s',
                                  cursor: player.inDb ? 'pointer' : 'default',
                                  opacity: player.inDb ? 1 : 0.7,
                                  position: 'relative',
                                }}
                                onMouseEnter={e => { if (player.inDb) { e.currentTarget.style.borderColor = '#a78bfa'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(139,92,246,0.15)' } }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = player.inDb ? '#e5e7eb' : '#f3f4f6'; e.currentTarget.style.boxShadow = 'none' }}
                              >
                                {/* Jersey image placeholder / number circle */}
                                <div style={{
                                  width: 44, height: 44, borderRadius: '50%',
                                  background: player.inDb
                                    ? 'linear-gradient(135deg, #8b5cf6, #6d28d9)'
                                    : '#d1d5db',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  color: 'white', fontWeight: 700, fontSize: '0.85rem',
                                  marginBottom: '0.25rem',
                                }}>
                                  {player.shirtNumber ?? player.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
                                </div>
                                {/* Flag + Name */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', justifyContent: 'center', maxWidth: '100%' }}>
                                  {flag && (
                                    <span style={{ fontSize: '0.8rem', lineHeight: 1, flexShrink: 0 }}>{flag}</span>
                                  )}
                                  <p style={{
                                    fontSize: '0.7rem', fontWeight: 600,
                                    color: player.inDb ? '#111827' : '#6b7280',
                                    textAlign: 'center', lineHeight: 1.2,
                                    overflow: 'hidden', textOverflow: 'ellipsis',
                                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                                    margin: 0,
                                  }}>
                                    {player.name}
                                  </p>
                                </div>
                                {/* Position */}
                                {player.position && (
                                  <span style={{
                                    fontSize: '0.6rem', color: '#9ca3af', marginTop: '0.125rem',
                                    background: '#f3f4f6', padding: '0px 4px', borderRadius: '3px',
                                  }}>
                                    {player.position}
                                  </span>
                                )}
                                {/* Not in DB badge */}
                                {!player.inDb && (
                                  <span style={{
                                    fontSize: '0.55rem', color: '#d97706', marginTop: '0.125rem',
                                    background: '#fef3c7', padding: '1px 5px', borderRadius: '3px',
                                  }}>Not in DB</span>
                                )}
                              </div>
                            )

                            return player.inDb ? (
                              <Link
                                key={player.wikidataId || player.name}
                                to={`/players/${player.playerId}`}
                                style={{ textDecoration: 'none' }}
                              >
                                {card}
                              </Link>
                            ) : (
                              <div key={player.wikidataId || player.name}>
                                {card}
                              </div>
                            )
                          })}
                        </div>

                        {filtered.length > 20 && (
                          <button
                            onClick={() => setShowAllSquad(!showAllSquad)}
                            className="w-full mt-4 py-2.5 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
                          >
                            {showAllSquad
                              ? 'Show less'
                              : `Show all ${filtered.length} players`}
                          </button>
                        )}
                      </>
                    )
                  })()
                ) : (
                  <div style={{ textAlign: 'center', padding: '1.5rem', color: '#9ca3af', fontSize: '0.875rem' }}>
                    <p>No squad data available for this team and season yet.</p>
                  </div>
                )}

                {/* Admin: Manage Squad */}
                {profile?.is_admin && (
                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
                    {showSquadImport ? (
                      <SquadImportPanel
                        jersey={jersey}
                        onSaved={() => { setShowSquadImport(false); refetchSquad() }}
                        onCancel={() => setShowSquadImport(false)}
                      />
                    ) : (
                      <button
                        onClick={() => setShowSquadImport(true)}
                        style={{
                          fontSize: '0.8rem', color: '#16a34a', background: 'none',
                          border: '1px dashed #86efac', borderRadius: '0.5rem',
                          padding: '0.5rem 1rem', cursor: 'pointer', fontWeight: 600,
                          width: '100%',
                        }}
                      >
                        {squadData.length > 0 ? 'Edit Squad Data' : '+ Import Squad Data'}
                      </button>
                    )}
                  </div>
                )}

                {/* Someone Missing button */}
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #f3f4f6', textAlign: 'center' }}>
                  {showMissingForm ? (
                    <div style={{ background: '#f9fafb', borderRadius: '0.5rem', padding: '1rem', textAlign: 'left' }}>
                      <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                        Know a player who appeared in this kit?
                      </p>
                      <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.75rem' }}>
                        If a player is missing from this squad list, they may not have the correct team data on Wikidata.
                        You can help by updating their Wikidata entry, or submit a jersey with their name to add them to our database.
                      </p>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Link
                          to="/jerseys"
                          style={{
                            padding: '0.375rem 0.75rem', fontSize: '0.75rem', fontWeight: 600,
                            background: '#6b46c1', color: 'white', borderRadius: '0.375rem',
                            textDecoration: 'none', display: 'inline-block',
                          }}
                        >
                          Submit a Kit
                        </Link>
                        <button
                          onClick={() => setShowMissingForm(false)}
                          style={{
                            padding: '0.375rem 0.75rem', fontSize: '0.75rem',
                            background: '#e5e7eb', color: '#4b5563', border: 'none',
                            borderRadius: '0.375rem', cursor: 'pointer',
                          }}
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowMissingForm(true)}
                      style={{
                        fontSize: '0.8rem', color: '#6b46c1', background: 'none',
                        border: '1px dashed #c4b5fd', borderRadius: '0.5rem',
                        padding: '0.5rem 1rem', cursor: 'pointer', fontWeight: 500,
                      }}
                    >
                      Someone Missing?
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Other Versions of This Kit (same team/season/type in DB) */}
          {relatedJerseys.length > 0 && (
            <div className="mt-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Other Versions of This Kit
                    </h2>
                  </div>
                  <span className="text-sm text-gray-500">
                    {relatedJerseys.length} {relatedJerseys.length === 1 ? 'version' : 'versions'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {(showAllPlayers ? relatedJerseys : relatedJerseys.slice(0, 10)).map((rj) => (
                    <Link
                      key={rj.id}
                      to={`/jerseys/${rj.id}`}
                      className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-blue-300 hover:shadow-md transition-all duration-200 group"
                    >
                      <div className="h-32 overflow-hidden flex items-center justify-center bg-gray-50">
                        {rj.front_image_url || rj.back_image_url ? (
                          <img
                            src={rj.front_image_url || rj.back_image_url}
                            alt={`${rj.player_name || 'Blank'} kit`}
                            className="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-105"
                            style={{ maxWidth: '120px', maxHeight: '120px' }}
                            onError={(e) => { e.target.style.display = 'none' }}
                          />
                        ) : (
                          <div className="text-xs text-gray-400">No Image</div>
                        )}
                      </div>
                      <div className="p-2">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {rj.player_name || 'Blank Kit'}
                        </p>
                        {rj.player_number && (
                          <p className="text-xs text-gray-500">#{rj.player_number}</p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>

                {relatedJerseys.length > 10 && (
                  <button
                    onClick={() => setShowAllPlayers(!showAllPlayers)}
                    className="w-full mt-4 py-2.5 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
                  >
                    {showAllPlayers
                      ? 'Show less'
                      : `Show ${relatedJerseys.length - 10} more`}
                  </button>
                )}
              </div>
            </div>
          )}
          {/* More Kits by This Player */}
          {playerOtherKits.length > 0 && jersey.player_name && (
            <div className="mt-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {jersey.player_id ? (
                      <Link to={`/players/${jersey.player_id}`} className="text-gray-900 hover:text-green-600 hover:underline transition-colors">
                        More {jersey.player_name} Kits
                      </Link>
                    ) : (
                      <>More {jersey.player_name} Kits</>
                    )}
                  </h2>
                  <span className="text-sm text-gray-500">
                    {playerOtherKits.length} {playerOtherKits.length === 1 ? 'kit' : 'kits'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {(showAllPlayerKits ? playerOtherKits : playerOtherKits.slice(0, 10)).map((pk) => (
                    <Link
                      key={pk.id}
                      to={`/jerseys/${pk.id}`}
                      className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-blue-300 hover:shadow-md transition-all duration-200 group"
                    >
                      {/* Thumbnail */}
                      <div className="h-32 overflow-hidden flex items-center justify-center bg-gray-50">
                        {pk.front_image_url || pk.back_image_url ? (
                          <img
                            src={pk.front_image_url || pk.back_image_url}
                            alt={`${pk.team_name} ${pk.season} kit`}
                            className="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-105"
                            style={{ maxWidth: '120px', maxHeight: '120px' }}
                            onError={(e) => { e.target.style.display = 'none' }}
                          />
                        ) : (
                          <div className="text-xs text-gray-400">No Image</div>
                        )}
                      </div>

                      {/* Kit Info */}
                      <div className="p-2">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {pk.team_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {pk.season} {pk.jersey_type ? `• ${pk.jersey_type.charAt(0).toUpperCase() + pk.jersey_type.slice(1)}` : ''}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Show More / Show Less */}
                {playerOtherKits.length > 10 && (
                  <button
                    onClick={() => setShowAllPlayerKits(!showAllPlayerKits)}
                    className="w-full mt-4 py-2.5 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
                  >
                    {showAllPlayerKits
                      ? 'Show less'
                      : `Show ${playerOtherKits.length - 10} more kits`}
                  </button>
                )}
              </div>
            </div>
          )}
    </div>
  )
}