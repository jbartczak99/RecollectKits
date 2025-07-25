import { ArrowTopRightOnSquareIcon, UserIcon, ClockIcon } from '@heroicons/react/24/outline'

export default function SpotCard({ spot }) {
  const formatPrice = (price, currency) => {
    if (!price) return null
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(price)
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-4">
        {spot.jerseys && (
          <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-md">
            {spot.jerseys.image_url && (
              <img
                src={spot.jerseys.image_url}
                alt={`${spot.jerseys.team_name} ${spot.jerseys.season_year}`}
                className="w-16 h-16 object-cover rounded"
              />
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">
                {spot.jerseys.team_name}
              </h3>
              <p className="text-sm text-gray-600">
                {spot.jerseys.season_year} • {spot.jerseys.jersey_type}
              </p>
            </div>
          </div>
        )}

        {spot.description && (
          <p className="text-gray-700 mb-4">{spot.description}</p>
        )}

        <div className="space-y-2 mb-4">
          {spot.price && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Price:</span>
              <span className="font-semibold text-green-600">
                {formatPrice(spot.price, spot.currency)}
              </span>
            </div>
          )}
          
          {spot.condition && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Condition:</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                spot.condition === 'mint' ? 'bg-green-100 text-green-800' :
                spot.condition === 'excellent' ? 'bg-blue-100 text-blue-800' :
                spot.condition === 'good' ? 'bg-yellow-100 text-yellow-800' :
                spot.condition === 'fair' ? 'bg-orange-100 text-orange-800' :
                spot.condition === 'poor' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {spot.condition}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-2">
            <UserIcon className="h-4 w-4" />
            <span>Spotted by {spot.profiles?.username || 'Unknown'}</span>
          </div>
          <div className="flex items-center gap-2">
            <ClockIcon className="h-4 w-4" />
            <span>{new Date(spot.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        <a
          href={spot.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
        >
          <span>View Listing</span>
          <ArrowTopRightOnSquareIcon className="h-4 w-4" />
        </a>

        {spot.verified && (
          <div className="mt-2 text-center">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              ✓ Verified
            </span>
          </div>
        )}
      </div>
    </div>
  )
}