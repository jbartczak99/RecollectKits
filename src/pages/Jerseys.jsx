import { useState } from 'react'
import { Link } from 'react-router-dom'
import { HeartIcon } from '@heroicons/react/24/outline'
import { StarIcon } from '@heroicons/react/24/outline'
import { ArrowPathIcon } from '@heroicons/react/24/outline'
import { EyeIcon } from '@heroicons/react/24/outline'
import { FireIcon } from '@heroicons/react/24/outline'
import { PlusIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import { FireIcon as FireIconSolid } from '@heroicons/react/24/solid'
import { useAuth } from '../hooks/useAuth.jsx'
import { usePublicJerseys, useUserCollections } from '../hooks/useJerseys'
import JerseySearch from '../components/jerseys/JerseySearch'
import KitSubmissionWizard from '../components/jerseys/KitSubmissionWizard'

export default function Jerseys() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [filters, setFilters] = useState({})
  const [imageStates, setImageStates] = useState({}) // Track which image is showing for each jersey
  const { jerseys, loading, error, addPublicJersey } = usePublicJerseys(searchTerm, filters)
  const { addToCollection, isInCollection } = useUserCollections()

  const handleFormSuccess = () => {
    setShowForm(false)
    // The usePublicJerseys hook will automatically update local state
  }

  const handleAddToCollection = async (jerseyId, type) => {
    if (!user) {
      alert('Please sign in to add kits to your collection')
      return
    }
    
    const { error } = await addToCollection(jerseyId, type)
    if (error) {
      alert(`Error adding to collection: ${error}`)
    }
  }

  const toggleJerseyImage = (jerseyId) => {
    setImageStates(prev => ({
      ...prev,
      [jerseyId]: !prev[jerseyId] // false = front, true = back
    }))
  }

  if (showForm) {
    return (
      <KitSubmissionWizard
        onCancel={() => setShowForm(false)}
      />
    )
  }

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

      <div className="space-y-4">
        {/* Search Bar - Centered and Wide */}
        <JerseySearch
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by team name..."
        />
        
        {/* Button and Results Counter Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex justify-center sm:justify-start">
            {user && (
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
            )}
          </div>
          
          <div className="text-sm text-gray-500 text-center sm:text-right">
            {loading ? 'Loading...' : `${jerseys.length} kits found`}
          </div>
        </div>
      </div>

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

      {/* Jersey Grid */}
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
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {jersey.team_name || 'Unknown Team'}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {jersey.player_name && (
                      <span className="font-medium">{jersey.player_name} • </span>
                    )}
                    {jersey.season || 'Unknown Season'}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-3">
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
                </div>
                
                {/* Collection Buttons */}
                {user && (
                  <div className="mt-auto flex gap-2">
                    <button
                      onClick={() => handleAddToCollection(jersey.id, 'like')}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isInCollection(jersey.id, 'like')
                          ? 'bg-blue-100 text-blue-700 border border-blue-200'
                          : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-blue-50 hover:text-blue-600'
                      }`}
                    >
                      {isInCollection(jersey.id, 'like') ? (
                        <FireIconSolid className="h-4 w-4" />
                      ) : (
                        <FireIcon className="h-4 w-4" />
                      )}
                      Like
                    </button>

                    <button
                      onClick={() => handleAddToCollection(jersey.id, 'have')}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isInCollection(jersey.id, 'have')
                          ? 'bg-green-100 text-green-700 border border-green-200'
                          : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-green-50 hover:text-green-600'
                      }`}
                    >
                      {isInCollection(jersey.id, 'have') ? (
                        <HeartIconSolid className="h-4 w-4" />
                      ) : (
                        <HeartIcon className="h-4 w-4" />
                      )}
                      Have
                    </button>
                    
                    <button
                      onClick={() => handleAddToCollection(jersey.id, 'want')}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isInCollection(jersey.id, 'want')
                          ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                          : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-yellow-50 hover:text-yellow-600'
                      }`}
                    >
                      {isInCollection(jersey.id, 'want') ? (
                        <StarIconSolid className="h-4 w-4" />
                      ) : (
                        <StarIcon className="h-4 w-4" />
                      )}
                      Want
                    </button>
                  </div>
                )}
                
                {!user && (
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-2">Sign in to add to collection</p>
                    <button className="w-full px-3 py-2 bg-gray-100 text-gray-400 rounded-lg text-sm cursor-not-allowed">
                      Add to Collection
                    </button>
                  </div>
                )}
              </div>
              
            </div>
            )
          })}
        </div>
      )}
    </div>
  )
}