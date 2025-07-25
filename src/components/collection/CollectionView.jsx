import { useState } from 'react'
import { TrashIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

export default function CollectionView({ collection, loading, onRemove, onStatusChange }) {
  const [filter, setFilter] = useState('all')

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
            <div className="w-full h-32 bg-gray-200"></div>
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              <div className="flex gap-2">
                <div className="h-6 bg-gray-200 rounded w-16"></div>
                <div className="h-6 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const filteredCollection = collection.filter(item => {
    if (filter === 'all') return true
    return item.status === filter
  })

  if (collection.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg mb-2">No jerseys in your collection</div>
        <p className="text-gray-400">Start adding jerseys to build your collection!</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All ({collection.length})
        </button>
        <button
          onClick={() => setFilter('have')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            filter === 'have'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Have ({collection.filter(item => item.status === 'have').length})
        </button>
        <button
          onClick={() => setFilter('want')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            filter === 'want'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Want ({collection.filter(item => item.status === 'want').length})
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCollection.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            {item.jerseys.image_url && (
              <img
                src={item.jerseys.image_url}
                alt={`${item.jerseys.team_name} ${item.jerseys.season_year}`}
                className="w-full h-32 object-cover"
              />
            )}
            
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {item.jerseys.team_name}
              </h3>
              
              <div className="space-y-1 text-sm text-gray-600 mb-4">
                <p><span className="font-medium">Season:</span> {item.jerseys.season_year}</p>
                <p><span className="font-medium">Type:</span> {item.jerseys.jersey_type}</p>
                {item.jerseys.manufacturer && (
                  <p><span className="font-medium">Brand:</span> {item.jerseys.manufacturer}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  item.status === 'have'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {item.status === 'have' ? 'Have' : 'Want'}
                </span>

                <div className="flex gap-1">
                  <button
                    onClick={() => onStatusChange?.(item.id, item.status === 'have' ? 'want' : 'have')}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Toggle status"
                  >
                    <ArrowPathIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onRemove?.(item.id)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    title="Remove from collection"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {item.notes && (
                <p className="mt-3 text-sm text-gray-600 italic">{item.notes}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}