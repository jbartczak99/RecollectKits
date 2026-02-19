import { useState, useMemo, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { HeartIcon } from '@heroicons/react/24/outline'
import { StarIcon } from '@heroicons/react/24/outline'
import { ArrowPathIcon } from '@heroicons/react/24/outline'
import { EyeIcon } from '@heroicons/react/24/outline'
import { FireIcon } from '@heroicons/react/24/outline'
import { PlusIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import { FireIcon as FireIconSolid } from '@heroicons/react/24/solid'
import { useAuth } from '../contexts/AuthContext.jsx'
import { usePublicJerseys, useUserJerseys, useJerseyLikes, useWishlist } from '../hooks/useJerseys'
import JerseySearch from '../components/jerseys/JerseySearch'
import KitSubmissionWizard from '../components/jerseys/KitSubmissionWizard'
import SelectCollectionModal from '../components/collections/SelectCollectionModal'

const JERSEY_TYPES = ['home', 'away', 'third', 'special']

export default function Jerseys() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [filters, setFilters] = useState({})
  const [imageStates, setImageStates] = useState({}) // Track which image is showing for each jersey
  const [showSelectCollectionModal, setShowSelectCollectionModal] = useState(false)
  const [selectedJerseyForCollection, setSelectedJerseyForCollection] = useState(null)

  // URL search params for shareable filter links
  const [searchParams, setSearchParams] = useSearchParams()

  // Filter states
  const [selectedLeagues, setSelectedLeagues] = useState([])
  const [selectedManufacturers, setSelectedManufacturers] = useState([])
  const [selectedTypes, setSelectedTypes] = useState([])
  const [selectedSeason, setSelectedSeason] = useState('')
  const [selectedGender, setSelectedGender] = useState(() => {
    const param = searchParams.get('gender')
    return param === 'mens' || param === 'womens' ? param : ''
  })

  const handleGenderChange = useCallback((value) => {
    setSelectedGender(value)
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      if (value) {
        next.set('gender', value)
      } else {
        next.delete('gender')
      }
      return next
    }, { replace: true })
  }, [setSearchParams])

  const { jerseys: allJerseys, loading, error, addPublicJersey } = usePublicJerseys(searchTerm, filters)
  const { isInMainCollection, addToMainCollection, refetch: refetchUserJerseys } = useUserJerseys()
  const { hasLiked, getLikeCount, toggleLike } = useJerseyLikes(user?.id)
  const { isInWishlist, toggleWishlist } = useWishlist(user?.id)

  // Extract unique filter options from jerseys
  const filterOptions = useMemo(() => {
    const leagues = [...new Set(allJerseys.map(j => j.league).filter(Boolean))].sort()
    const manufacturers = [...new Set(allJerseys.map(j => j.manufacturer).filter(Boolean))].sort()
    const seasons = [...new Set(allJerseys.map(j => j.season).filter(Boolean))].sort().reverse()
    return { leagues, manufacturers, seasons }
  }, [allJerseys])

  // Apply client-side filtering
  const jerseys = useMemo(() => {
    let filtered = [...allJerseys]

    // League filter
    if (selectedLeagues.length > 0) {
      filtered = filtered.filter(j => selectedLeagues.includes(j.league))
    }

    // Manufacturer filter
    if (selectedManufacturers.length > 0) {
      filtered = filtered.filter(j => selectedManufacturers.includes(j.manufacturer))
    }

    // Type filter
    if (selectedTypes.length > 0) {
      filtered = filtered.filter(j => selectedTypes.includes(j.jersey_type))
    }

    // Season filter
    if (selectedSeason) {
      filtered = filtered.filter(j => j.season === selectedSeason)
    }

    // Competition gender filter
    if (selectedGender) {
      filtered = filtered.filter(j => j.competition_gender === selectedGender)
    }

    return filtered
  }, [allJerseys, selectedLeagues, selectedManufacturers, selectedTypes, selectedSeason, selectedGender])

  const handleFormSuccess = () => {
    setShowForm(false)
    // The usePublicJerseys hook will automatically update local state
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

  const toggleJerseyImage = (jerseyId) => {
    setImageStates(prev => ({
      ...prev,
      [jerseyId]: !prev[jerseyId] // false = front, true = back
    }))
  }

  const handleOpenSelectCollection = (jersey) => {
    setSelectedJerseyForCollection(jersey)
    setShowSelectCollectionModal(true)
  }

  const handleCollectionSuccess = () => {
    // Refetch user jerseys to update the UI
    refetchUserJerseys()
    console.log('Jersey added to collection successfully')
  }

  if (showForm) {
    return (
      <KitSubmissionWizard
        onCancel={() => setShowForm(false)}
      />
    )
  }

  const clearAllFilters = () => {
    setSelectedLeagues([])
    setSelectedManufacturers([])
    setSelectedTypes([])
    setSelectedSeason('')
    handleGenderChange('')
  }

  const activeFilterCount = selectedLeagues.length + selectedManufacturers.length + selectedTypes.length + (selectedSeason ? 1 : 0) + (selectedGender ? 1 : 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kit Database</h1>
          <p className="text-gray-600 mt-1">
            Discover and collect football kits from around the world
          </p>
          <p className="text-sm text-blue-600 mt-2 font-medium">
            💡 Click on kit images to view full details
          </p>
        </div>

      </div>

      {/* Search Bar with Counter */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <JerseySearch
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search by team name..."
          />
        </div>
        <div className="text-sm text-gray-500 whitespace-nowrap">
          {loading ? 'Loading...' : `${jerseys.length} ${jerseys.length === 1 ? 'kit' : 'kits'} found`}
        </div>
      </div>

      {/* Add New Kit Button */}
      {user && (
        <div>
          <button
            onClick={() => setShowForm(true)}
            style={{
              width: '140px',
              height: '36px',
              backgroundColor: '#3b82f6',
              color: 'white',
              borderRadius: '6px',
              border: 'none',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
          >
            Add New Kit
          </button>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 text-red-700 p-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Error loading kits: {error}
          </div>
        </div>
      )}

      {/* Competition Gender Pills */}
      <div className="flex items-center gap-2">
        {[
          { value: '', label: 'All' },
          { value: 'mens', label: "Men's" },
          { value: 'womens', label: "Women's" }
        ].map((option) => (
          <button
            key={option.value}
            onClick={() => handleGenderChange(option.value)}
            style={selectedGender === option.value
              ? { backgroundColor: '#7C3AED', color: 'white', border: '1px solid #7C3AED' }
              : { backgroundColor: 'white', color: '#374151', border: '1px solid #d1d5db' }
            }
            className="px-4 py-2 text-sm font-medium rounded-full transition-all hover:opacity-90"
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-semibold text-gray-700">Filters:</span>

          {/* League Filter */}
          <select
            value={selectedLeagues[0] || ''}
            onChange={(e) => {
              if (e.target.value) {
                setSelectedLeagues([e.target.value])
              } else {
                setSelectedLeagues([])
              }
            }}
            className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white min-w-[140px]"
          >
            <option value="">All Leagues</option>
            {filterOptions.leagues.map(league => (
              <option key={league} value={league}>{league}</option>
            ))}
          </select>

          {/* Manufacturer Filter */}
          <select
            value={selectedManufacturers[0] || ''}
            onChange={(e) => {
              if (e.target.value) {
                setSelectedManufacturers([e.target.value])
              } else {
                setSelectedManufacturers([])
              }
            }}
            className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white min-w-[140px]"
          >
            <option value="">All Manufacturers</option>
            {filterOptions.manufacturers.map(manufacturer => (
              <option key={manufacturer} value={manufacturer}>{manufacturer}</option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            value={selectedTypes[0] || ''}
            onChange={(e) => {
              if (e.target.value) {
                setSelectedTypes([e.target.value])
              } else {
                setSelectedTypes([])
              }
            }}
            className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white min-w-[120px]"
          >
            <option value="">All Types</option>
            {JERSEY_TYPES.map(type => (
              <option key={type} value={type} className="capitalize">{type.charAt(0).toUpperCase() + type.slice(1)}</option>
            ))}
          </select>

          {/* Season Filter */}
          <select
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white min-w-[120px]"
          >
            <option value="">All Seasons</option>
            {filterOptions.seasons.map(season => (
              <option key={season} value={season}>{season}</option>
            ))}
          </select>

          {/* Clear Filters Button */}
          {activeFilterCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="px-3 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md font-medium transition-colors"
            >
              Clear all ({activeFilterCount})
            </button>
          )}
        </div>
      </div>

      {/* Jersey Grid */}
      <div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-md p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-4 w-3/4"></div>
                  <div className="flex gap-2">
                    <div className="h-8 bg-gray-200 rounded flex-1"></div>
                    <div className="h-8 bg-gray-200 rounded flex-1"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : jerseys.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-6" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No kits found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? `No kits match "${searchTerm}"` : 'No kits in the database yet.'}
              </p>
              {user && (
                <div className="mt-6">
                  <button
                    onClick={() => setShowForm(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                  >
                    <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                    Add the first kit
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {jerseys.map((jersey) => {
                // Destructure to exclude sponsor fields that might be causing rendering issues
                const { main_sponsor, additional_sponsors, ...cleanJersey } = jersey
                return (
                  <div key={jersey.id} className="card border-2 border-gray-200 hover:border-primary-300 transition-all duration-200 overflow-hidden max-w-md mx-auto w-full flex flex-col">

                    {/* Jersey Images - Clickable with hover effects */}
                    {jersey.front_image_url || jersey.back_image_url ? (
                      <Link
                        to={`/jerseys/${jersey.id}`}
                        className="h-64 overflow-hidden flex items-center justify-center bg-gray-50 group cursor-pointer transition-all duration-300 hover:bg-gray-100"
                      >
                        <img
                          src={(
                            jersey.front_image_url && jersey.back_image_url
                              ? (imageStates[jersey.id] ? jersey.back_image_url : jersey.front_image_url)
                              : (jersey.front_image_url || jersey.back_image_url)
                          )}
                          alt={`${jersey.team_name} ${jersey.jersey_type} kit`}
                          className="max-w-full max-h-full object-contain transition-all duration-300 group-hover:scale-105 group-hover:opacity-90"
                          style={{maxWidth: '250px', maxHeight: '280px'}}
                          onError={(e) => {
                            e.target.style.display = 'none'
                          }}
                        />
                      </Link>
                    ) : (
                      <Link
                        to={`/jerseys/${jersey.id}`}
                        className="h-64 bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center overflow-hidden group cursor-pointer transition-all duration-300 hover:from-green-200 hover:to-blue-200"
                      >
                        <div className="text-lg font-medium text-gray-500 group-hover:text-gray-600 transition-colors duration-300">
                          No Image Available
                        </div>
                      </Link>
                    )}

                    {/* Front | Back toggle - only show for jerseys with both images */}
                    {jersey.front_image_url && jersey.back_image_url && (
                      <div className="px-4 py-2 text-center border-b border-gray-100">
                        <div className="flex items-center justify-center gap-2 text-sm">
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              setImageStates(prev => ({...prev, [jersey.id]: false}))
                            }}
                            className={`font-medium transition-colors duration-200 hover:bg-gray-100 px-2 py-1 rounded ${
                              !imageStates[jersey.id]
                                ? 'text-blue-600'
                                : 'text-gray-400 hover:text-gray-600'
                            }`}
                          >
                            Front
                          </button>
                          <span className="text-gray-300">|</span>
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              setImageStates(prev => ({...prev, [jersey.id]: true}))
                            }}
                            className={`font-medium transition-colors duration-200 hover:bg-gray-100 px-2 py-1 rounded ${
                              imageStates[jersey.id]
                                ? 'text-blue-600'
                                : 'text-gray-400 hover:text-gray-600'
                            }`}
                          >
                            Back
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Jersey Details */}
                    <div className="card-body flex-1 flex flex-col">
                      {/* Header with Team Name and Action Buttons */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {jersey.team_name || 'Unknown Team'}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {jersey.player_name && (
                              <span className="font-medium">{jersey.player_name} • </span>
                            )}
                            {jersey.season || 'Unknown Season'}
                          </p>
                        </div>

                        {/* Compact Action Buttons - Fixed width slots */}
                        {/* Order: Like, Add to Collection, Want */}
                        {user && (
                          <div style={{display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0}}>
                            {/* Like Button - Always visible */}
                            <button
                              onClick={() => handleLike(jersey.id)}
                              style={{
                                width: '36px',
                                height: '36px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '8px',
                                border: '1px solid',
                                borderColor: hasLiked(jersey.id) ? '#fecaca' : '#e5e7eb',
                                backgroundColor: hasLiked(jersey.id) ? '#fee2e2' : '#f3f4f6',
                                color: hasLiked(jersey.id) ? '#dc2626' : '#6b7280',
                                cursor: 'pointer'
                              }}
                              title={`Like${getLikeCount(jersey.id) > 0 ? ` (${getLikeCount(jersey.id)})` : ''}`}
                            >
                              {hasLiked(jersey.id) ? (
                                <HeartIconSolid style={{width: '16px', height: '16px'}} />
                              ) : (
                                <HeartIcon style={{width: '16px', height: '16px'}} />
                              )}
                            </button>

                            {/* Add to Collection Button */}
                            {isInMainCollection(jersey.id) ? (
                              <div
                                style={{
                                  width: '36px',
                                  height: '36px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  borderRadius: '8px',
                                  border: '1px solid #bbf7d0',
                                  backgroundColor: '#dcfce7',
                                  color: '#16a34a'
                                }}
                                title="In Your Collection"
                              >
                                <svg style={{width: '16px', height: '16px'}} fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleOpenSelectCollection(jersey)
                                }}
                                style={{
                                  width: '36px',
                                  height: '36px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  borderRadius: '8px',
                                  border: 'none',
                                  backgroundColor: '#16a34a',
                                  color: 'white',
                                  cursor: 'pointer'
                                }}
                                title="Add to Collection"
                              >
                                <PlusIcon style={{width: '16px', height: '16px'}} />
                              </button>
                            )}

                            {/* Want Button - Hidden if in collection, but space preserved */}
                            <div style={{width: '36px', height: '36px'}}>
                              {!isInMainCollection(jersey.id) && (
                                <button
                                  onClick={() => handleWant(jersey.id)}
                                  style={{
                                    width: '36px',
                                    height: '36px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: '8px',
                                    border: '1px solid',
                                    borderColor: isInWishlist(jersey.id) ? '#fde68a' : '#e5e7eb',
                                    backgroundColor: isInWishlist(jersey.id) ? '#fef3c7' : '#f3f4f6',
                                    color: isInWishlist(jersey.id) ? '#d97706' : '#6b7280',
                                    cursor: 'pointer'
                                  }}
                                  title="Want"
                                >
                                  {isInWishlist(jersey.id) ? (
                                    <StarIconSolid style={{width: '16px', height: '16px'}} />
                                  ) : (
                                    <StarIcon style={{width: '16px', height: '16px'}} />
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Badges */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {jersey.kit_type && (
                          <span className={`badge ${jersey.kit_type === 'international' ? 'badge-purple' : 'badge-green'}`}>
                            {jersey.kit_type === 'international' ? 'International' : 'Club'}
                          </span>
                        )}
                        {jersey.jersey_type && (
                          <span className="badge badge-blue">
                            {jersey.jersey_type}
                          </span>
                        )}
                        {jersey.manufacturer && (
                          <span className="badge badge-gray">
                            {jersey.manufacturer}
                          </span>
                        )}
                      </div>

                      {/* Sign in prompt for non-logged in users */}
                      {!user && (
                        <div className="mt-auto text-center">
                          <p className="text-xs text-gray-500">Sign in to interact</p>
                        </div>
                      )}
                    </div>

                  </div>
                )
              })}
            </div>
          )}
      </div>

      {/* Select Collection Modal */}
      <SelectCollectionModal
        isOpen={showSelectCollectionModal}
        onClose={() => {
          setShowSelectCollectionModal(false)
          setSelectedJerseyForCollection(null)
        }}
        jersey={selectedJerseyForCollection}
        onSuccess={handleCollectionSuccess}
      />
    </div>
  )
}
