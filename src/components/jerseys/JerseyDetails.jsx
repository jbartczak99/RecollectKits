import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeftIcon, HeartIcon, StarIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid, StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { useUserJerseys, useJerseyLikes, useWishlist } from '../../hooks/useJerseys'
import { supabase } from '../../lib/supabase'

export default function JerseyDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [jersey, setJersey] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedImage, setSelectedImage] = useState(null)
  const { isInMainCollection, addToMainCollection } = useUserJerseys()
  const { hasLiked, getLikeCount, toggleLike } = useJerseyLikes(user?.id)
  const { isInWishlist, toggleWishlist } = useWishlist(user?.id)

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
                      {jersey.player_name}
                    </h2>
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
        </div>
      </div>
    </div>
  )
}