import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeftIcon, HeartIcon, StarIcon, CheckCircleIcon, UsersIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid, StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { useUserJerseys, useJerseyLikes, useWishlist } from '../../hooks/useJerseys'
import { supabase } from '../../lib/supabase'
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
        const { data, error } = await supabase
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
          let query = supabase
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
            const { data: otherKits } = await supabase
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (error || !jersey) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Jersey Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'This jersey could not be found.'}</p>
          <button
            onClick={handleBack}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Jerseys
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Breadcrumbs */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
            <Link to="/" className="hover:text-gray-700 transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link to="/jerseys" className="hover:text-gray-700 transition-colors">
              Kit Database
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">
              {jersey?.team_name || 'Kit Details'}
            </span>
          </nav>
          <button
            onClick={handleBack}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Kits
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Left Column - Images */}
            <div className="space-y-6">
              {/* Main Image with Gallery directly below */}
              <div className="space-y-1">
                {/* Main Image */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  {selectedImage ? (
                    <div className="flex items-center justify-center bg-gray-50 p-6" style={{minHeight: '400px', maxHeight: '500px'}}>
                      <img
                        src={selectedImage}
                        alt={`${jersey.team_name} ${jersey.jersey_type} kit`}
                        className="max-w-full max-h-full object-contain"
                        style={{maxWidth: '400px', maxHeight: '500px'}}
                        onError={(e) => {
                          e.target.style.display = 'none'
                        }}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center bg-gradient-to-br from-green-100 to-blue-100" style={{minHeight: '400px'}}>
                      <div className="text-center">
                        <div className="text-6xl mb-4">👕</div>
                        <div className="text-lg font-medium text-gray-500">
                          No Image Available
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Gallery Area */}
                <div className="flex justify-center">
                  <div
                    className="bg-white rounded-lg shadow-md overflow-hidden"
                    style={{
                      maxWidth: '400px',
                      width: '100%'
                    }}
                  >
                    <div
                      className="bg-gray-50 p-4"
                      style={{
                        minHeight: '120px'
                      }}
                    >
                      <div className="flex gap-4 justify-center items-center h-full">
                        {/* Front Jersey Thumbnail */}
                        {jersey.front_image_url && (
                          <div className="flex flex-col items-center">
                            <div
                              className={`border-2 rounded-lg overflow-hidden cursor-pointer transition-all duration-200 hover:scale-105 ${
                                selectedImage === jersey.front_image_url
                                  ? 'border-blue-300 shadow-lg'
                                  : 'border-white hover:border-gray-200'
                              }`}
                              style={{width: '80px', height: '80px', cursor: 'pointer'}}
                              onClick={() => setSelectedImage(jersey.front_image_url)}
                            >
                              <img
                                src={jersey.front_image_url}
                                alt="Front jersey"
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover'
                                }}
                              />
                            </div>
                            <span className="text-gray-700 text-sm mt-1 font-medium">Front</span>
                          </div>
                        )}

                        {/* Back Jersey Thumbnail */}
                        {jersey.back_image_url && (
                          <div className="flex flex-col items-center">
                            <div
                              className={`border-2 rounded-lg overflow-hidden cursor-pointer transition-all duration-200 hover:scale-105 ${
                                selectedImage === jersey.back_image_url
                                  ? 'border-blue-300 shadow-lg'
                                  : 'border-white hover:border-gray-200'
                              }`}
                              style={{width: '80px', height: '80px', cursor: 'pointer'}}
                              onClick={() => setSelectedImage(jersey.back_image_url)}
                            >
                              <img
                                src={jersey.back_image_url}
                                alt="Back jersey"
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover'
                                }}
                              />
                            </div>
                            <span className="text-gray-700 text-sm mt-1 font-medium">Back</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column - Jersey Information */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                
                {/* Header Section */}
                <div className="border-b border-gray-200 pb-6 mb-6">
                  <h1 className="text-3xl font-bold text-gray-900 mb-3">
                    {[
                      jersey.season,
                      jersey.team_name || 'Unknown Team', 
                      jersey.jersey_type ? jersey.jersey_type.charAt(0).toUpperCase() + jersey.jersey_type.slice(1) : null
                    ].filter(Boolean).join(' ')}
                  </h1>
                  {jersey.player_name && (
                    <h2 className="text-xl font-semibold text-green-600">
                      {jersey.player_id ? (
                        <Link to={`/players/${jersey.player_id}`} className="hover:underline">
                          {jersey.player_name}
                        </Link>
                      ) : (
                        jersey.player_name
                      )}
                      {(jersey.player_number || jersey.jersey_number) && (
                        <span className="text-gray-500 font-normal text-lg" style={{ marginLeft: '8px' }}>
                          #{jersey.player_number || jersey.jersey_number}
                        </span>
                      )}
                    </h2>
                  )}

                  {/* Link Player Profile (shown for authenticated users when player_name exists but no player_id) */}
                  {user && jersey.player_name && !jersey.player_id && (
                    <div className="mt-3">
                      <WikidataPlayerLinker
                        jerseyId={jersey.id}
                        playerName={jersey.player_name}
                        onLinked={(playerId) => {
                          setJersey(prev => ({ ...prev, player_id: playerId }))
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Jersey Specifications */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-2">
                      Specifications
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                      {jersey.jersey_type && (
                        <div className="flex justify-between items-center py-2 border-b border-gray-50">
                          <span className="font-medium text-gray-600">Type</span>
                          <span className="text-gray-900">{jersey.jersey_type.charAt(0).toUpperCase() + jersey.jersey_type.slice(1)}</span>
                        </div>
                      )}
                      
                      {jersey.season && (
                        <div className="flex justify-between items-center py-2 border-b border-gray-50">
                          <span className="font-medium text-gray-600">Season</span>
                          <span className="text-gray-900">{jersey.season}</span>
                        </div>
                      )}
                      
                      {jersey.league && (
                        <div className="flex justify-between items-center py-2 border-b border-gray-50">
                          <span className="font-medium text-gray-600">League</span>
                          <span className="text-gray-900">{jersey.league}</span>
                        </div>
                      )}
                      
                      {jersey.manufacturer && (
                        <div className="flex justify-between items-center py-2 border-b border-gray-50">
                          <span className="font-medium text-gray-600">Manufacturer</span>
                          <span className="text-gray-900">{jersey.manufacturer}</span>
                        </div>
                      )}
                      
                      {(jersey.colors || jersey.primary_color || jersey.secondary_color) && (
                        <div className="flex justify-between items-start py-2 border-b border-gray-50">
                          <span className="font-medium text-gray-600">Colors</span>
                          <span className="text-gray-900 text-right">
                            {jersey.colors || 
                             [jersey.primary_color, jersey.secondary_color]
                               .filter(color => color && color.trim())
                               .join(', ') || 
                             'Not specified'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Sponsors */}
                  {(jersey.main_sponsor || jersey.additional_sponsors) && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-2">
                        Sponsors
                      </h3>
                      <div className="grid grid-cols-1 gap-3">
                        {jersey.main_sponsor && (
                          <div className="flex justify-between items-center py-2 border-b border-gray-50">
                            <span className="font-medium text-gray-600">Main Sponsor</span>
                            <span className="text-gray-900">{jersey.main_sponsor}</span>
                          </div>
                        )}
                        {jersey.additional_sponsors && (
                          <div className="flex justify-between items-start py-2 border-b border-gray-50">
                            <span className="font-medium text-gray-600">Additional</span>
                            <span className="text-gray-900 text-right">{jersey.additional_sponsors}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  {jersey.description && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-2">
                        Description
                      </h3>
                      <p className="text-gray-700 leading-relaxed">{jersey.description}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="bg-white rounded-lg shadow-md p-4">
                {user ? (
                  <div className="flex gap-2 max-w-xs">
                    <button
                      onClick={() => handleLike(jersey.id)}
                      className={`flex-1 flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                        hasLiked(jersey.id)
                          ? 'bg-red-100 text-red-700 border border-red-200'
                          : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600'
                      }`}
                    >
                      {hasLiked(jersey.id) ? (
                        <HeartIconSolid style={{width: '20px', height: '20px'}} />
                      ) : (
                        <HeartIcon style={{width: '20px', height: '20px'}} />
                      )}
                      <span style={{fontSize: '12px'}}>{getLikeCount(jersey.id) > 0 ? getLikeCount(jersey.id) : 'Like'}</span>
                    </button>

                    <button
                      onClick={() => handleHave(jersey.id)}
                      className={`flex-1 flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                        isInMainCollection(jersey.id)
                          ? 'bg-green-100 text-green-700 border border-green-200'
                          : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-green-50 hover:border-green-200 hover:text-green-600'
                      }`}
                    >
                      <CheckCircleIcon style={{width: '20px', height: '20px'}} />
                      <span style={{fontSize: '12px'}}>Have</span>
                    </button>

                    <button
                      onClick={() => handleWant(jersey.id)}
                      className={`flex-1 flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                        isInWishlist(jersey.id)
                          ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                          : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-yellow-50 hover:border-yellow-200 hover:text-yellow-600'
                      }`}
                    >
                      {isInWishlist(jersey.id) ? (
                        <StarIconSolid style={{width: '20px', height: '20px'}} />
                      ) : (
                        <StarIcon style={{width: '20px', height: '20px'}} />
                      )}
                      <span style={{fontSize: '12px'}}>Want</span>
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-gray-600 mb-4">Sign in to add kits to your collection</p>
                    <Link
                      to="/auth"
                      className="inline-flex items-center px-6 py-3 border border-transparent font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 transition-colors shadow-sm"
                    >
                      Sign In
                    </Link>
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
      </div>
    </div>
  )
}