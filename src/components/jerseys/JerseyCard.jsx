import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth.jsx'
import { supabase } from '../../lib/supabase'

export default function JerseyCard({ jersey, onCollectionUpdate }) {
  const { user } = useAuth()
  const [collectionStatus, setCollectionStatus] = useState(null)
  const [loading, setLoading] = useState(false)

  const addToCollection = async (status) => {
    if (!user) return
    
    setLoading(true)
    try {
      const { error } = await supabase
        .from('user_collections')
        .upsert({
          user_id: user.id,
          jersey_id: jersey.id,
          status: status
        })

      if (error) throw error
      setCollectionStatus(status)
      onCollectionUpdate?.()
    } catch (err) {
      console.error('Error updating collection:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {jersey.image_url && (
        <img
          src={jersey.image_url}
          alt={`${jersey.team_name} ${jersey.season_year}`}
          className="w-full h-48 object-cover"
        />
      )}
      
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {jersey.team_name}
        </h3>
        
        <div className="space-y-1 text-sm text-gray-600 mb-4">
          <p><span className="font-medium">Season:</span> {jersey.season_year}</p>
          <p><span className="font-medium">Type:</span> {jersey.jersey_type}</p>
          {jersey.manufacturer && (
            <p><span className="font-medium">Brand:</span> {jersey.manufacturer}</p>
          )}
          {jersey.rarity_level && (
            <p><span className="font-medium">Rarity:</span> 
              <span className={`ml-1 px-2 py-1 rounded text-xs ${
                jersey.rarity_level === 'ultra_rare' ? 'bg-purple-100 text-purple-800' :
                jersey.rarity_level === 'rare' ? 'bg-red-100 text-red-800' :
                jersey.rarity_level === 'uncommon' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {jersey.rarity_level.replace('_', ' ')}
              </span>
            </p>
          )}
        </div>

        {jersey.description && (
          <p className="text-sm text-gray-700 mb-4">{jersey.description}</p>
        )}

        {user && (
          <div className="flex gap-2">
            <button
              onClick={() => addToCollection('have')}
              disabled={loading}
              className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors ${
                collectionStatus === 'have'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-green-100 hover:text-green-700'
              } disabled:opacity-50`}
            >
              Have
            </button>
            <button
              onClick={() => addToCollection('want')}
              disabled={loading}
              className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors ${
                collectionStatus === 'want'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-700'
              } disabled:opacity-50`}
            >
              Want
            </button>
          </div>
        )}
      </div>
    </div>
  )
}