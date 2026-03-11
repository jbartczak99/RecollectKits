import { useState } from 'react'
import { Link } from 'react-router-dom'
import { HeartIcon, StarIcon, PlusIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid, StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import PlayerJerseyMiniCard from './PlayerJerseyMiniCard'

export default function KitGroupCard({
  group,
  user,
  imageStates,
  setImageStates,
  hasLiked,
  getLikeCount,
  toggleLike,
  isInMainCollection,
  isInWishlist,
  toggleWishlist,
  onOpenSelectCollection,
}) {
  const [expanded, setExpanded] = useState(false)
  const jersey = group.representative

  const handleLike = async () => {
    if (!user) {
      alert('Please sign in to like kits')
      return
    }
    const { error } = await toggleLike(jersey.id)
    if (error) alert(`Error: ${error}`)
  }

  const handleWant = async () => {
    if (!user) {
      alert('Please sign in to add kits to your wishlist')
      return
    }
    const { error } = await toggleWishlist(jersey.id)
    if (error) alert(`Error: ${error}`)
  }

  // Show player name on the main card only if no blank kit exists
  const showPlayerName = !group.hasBlankKit && jersey.player_name

  return (
    <div className="card border-2 border-gray-200 hover:border-primary-300 transition-all duration-200 overflow-hidden max-w-md mx-auto w-full flex flex-col">

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
            style={{ maxWidth: '250px', maxHeight: '280px' }}
            onError={(e) => { e.target.style.display = 'none' }}
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
                setImageStates(prev => ({ ...prev, [jersey.id]: false }))
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
                setImageStates(prev => ({ ...prev, [jersey.id]: true }))
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
              {showPlayerName && (
                <span className="font-medium">{jersey.player_name} &bull; </span>
              )}
              {jersey.season || 'Unknown Season'}
            </p>
          </div>

          {/* Compact Action Buttons */}
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
              {/* Like Button */}
              <button
                onClick={handleLike}
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
                  cursor: 'pointer',
                }}
                title={`Like${getLikeCount(jersey.id) > 0 ? ` (${getLikeCount(jersey.id)})` : ''}`}
              >
                {hasLiked(jersey.id) ? (
                  <HeartIconSolid style={{ width: '16px', height: '16px' }} />
                ) : (
                  <HeartIcon style={{ width: '16px', height: '16px' }} />
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
                    color: '#16a34a',
                  }}
                  title="In Your Collection"
                >
                  <svg style={{ width: '16px', height: '16px' }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onOpenSelectCollection(jersey)
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
                    cursor: 'pointer',
                  }}
                  title="Add to Collection"
                >
                  <PlusIcon style={{ width: '16px', height: '16px' }} />
                </button>
              )}

              {/* Want Button */}
              <div style={{ width: '36px', height: '36px' }}>
                {!isInMainCollection(jersey.id) && (
                  <button
                    onClick={handleWant}
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
                      cursor: 'pointer',
                    }}
                    title="Want"
                  >
                    {isInWishlist(jersey.id) ? (
                      <StarIconSolid style={{ width: '16px', height: '16px' }} />
                    ) : (
                      <StarIcon style={{ width: '16px', height: '16px' }} />
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

      {/* Expandable Player Versions */}
      {group.playerJerseys.length > 0 && (
        <div className="border-t border-gray-100">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full px-4 py-2.5 flex items-center justify-between text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <span className="font-medium">
              {group.playerJerseys.length} player {group.playerJerseys.length === 1 ? 'version' : 'versions'}
            </span>
            <ChevronDownIcon
              className={`w-4 h-4 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
            />
          </button>

          {expanded && (
            <div className="px-3 pb-3">
              <div className="grid grid-cols-2 gap-2">
                {group.playerJerseys.map((pj) => (
                  <PlayerJerseyMiniCard
                    key={pj.id}
                    jersey={pj}
                    user={user}
                    hasLiked={hasLiked}
                    getLikeCount={getLikeCount}
                    toggleLike={toggleLike}
                    isInMainCollection={isInMainCollection}
                    isInWishlist={isInWishlist}
                    toggleWishlist={toggleWishlist}
                    onOpenSelectCollection={onOpenSelectCollection}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
