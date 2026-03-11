import { Link } from 'react-router-dom'
import { HeartIcon, StarIcon, PlusIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid, StarIcon as StarIconSolid } from '@heroicons/react/24/solid'

export default function PlayerJerseyMiniCard({
  jersey,
  user,
  hasLiked,
  getLikeCount,
  toggleLike,
  isInMainCollection,
  isInWishlist,
  toggleWishlist,
  onOpenSelectCollection,
}) {
  const handleLike = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) {
      alert('Please sign in to like kits')
      return
    }
    const { error } = await toggleLike(jersey.id)
    if (error) alert(`Error: ${error}`)
  }

  const handleWant = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) {
      alert('Please sign in to add kits to your wishlist')
      return
    }
    const { error } = await toggleWishlist(jersey.id)
    if (error) alert(`Error: ${error}`)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-blue-300 transition-all duration-200 flex flex-col">
      {/* Thumbnail */}
      <Link
        to={`/jerseys/${jersey.id}`}
        className="h-32 overflow-hidden flex items-center justify-center bg-gray-50 group cursor-pointer transition-all duration-300 hover:bg-gray-100"
      >
        {jersey.front_image_url || jersey.back_image_url ? (
          <img
            src={jersey.front_image_url || jersey.back_image_url}
            alt={`${jersey.team_name} ${jersey.player_name || ''} kit`}
            className="max-w-full max-h-full object-contain transition-all duration-300 group-hover:scale-105"
            style={{ maxWidth: '120px', maxHeight: '120px' }}
            onError={(e) => { e.target.style.display = 'none' }}
          />
        ) : (
          <div className="text-xs text-gray-400">No Image</div>
        )}
      </Link>

      {/* Details */}
      <div className="p-2 flex-1 flex flex-col">
        <Link to={`/jerseys/${jersey.id}`} className="hover:underline">
          <p className="text-sm font-semibold text-gray-900 truncate">
            {jersey.player_name || 'Blank Kit'}
          </p>
        </Link>
        {jersey.player_number && (
          <p className="text-xs text-gray-500">#{jersey.player_number}</p>
        )}
        <p className="text-xs text-gray-400 mt-0.5">{jersey.season}</p>

        {/* Compact action buttons */}
        {user && (
          <div className="flex items-center gap-1 mt-auto pt-1.5">
            {/* Like */}
            <button
              onClick={handleLike}
              className="p-1 rounded hover:bg-gray-100 transition-colors"
              title={`Like${getLikeCount(jersey.id) > 0 ? ` (${getLikeCount(jersey.id)})` : ''}`}
            >
              {hasLiked(jersey.id) ? (
                <HeartIconSolid className="w-3.5 h-3.5 text-red-500" />
              ) : (
                <HeartIcon className="w-3.5 h-3.5 text-gray-400" />
              )}
            </button>

            {/* Add to Collection */}
            {isInMainCollection(jersey.id) ? (
              <div className="p-1" title="In Your Collection">
                <svg className="w-3.5 h-3.5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            ) : (
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onOpenSelectCollection(jersey)
                }}
                className="p-1 rounded hover:bg-green-50 transition-colors"
                title="Add to Collection"
              >
                <PlusIcon className="w-3.5 h-3.5 text-green-600" />
              </button>
            )}

            {/* Want */}
            {!isInMainCollection(jersey.id) && (
              <button
                onClick={handleWant}
                className="p-1 rounded hover:bg-yellow-50 transition-colors"
                title="Want"
              >
                {isInWishlist(jersey.id) ? (
                  <StarIconSolid className="w-3.5 h-3.5 text-amber-500" />
                ) : (
                  <StarIcon className="w-3.5 h-3.5 text-gray-400" />
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
