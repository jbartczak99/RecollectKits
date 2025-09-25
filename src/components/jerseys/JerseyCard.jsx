import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext.jsx'
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
    <div className="card">
      {jersey.image_url && (
        <img
          src={jersey.image_url}
          alt={`${jersey.team_name} ${jersey.season_year}`}
          className="card-image"
        />
      )}
      
      <div className="card-body">
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
              <span className={`badge ml-1 ${
                jersey.rarity_level === 'ultra_rare' ? 'badge-purple' :
                jersey.rarity_level === 'rare' ? 'badge-red' :
                jersey.rarity_level === 'uncommon' ? 'badge-yellow' :
                'badge-gray'
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
              className={`btn btn-sm flex-1 ${
                collectionStatus === 'have'
                  ? 'btn-primary'
                  : 'btn-secondary'
              }`}
            >
              Have
            </button>
            <button
              onClick={() => addToCollection('want')}
              disabled={loading}
              className={`btn btn-sm flex-1 ${
                collectionStatus === 'want'
                  ? 'btn-primary'
                  : 'btn-secondary'
              }`}
            >
              Want
            </button>
          </div>
        )}
      </div>
    </div>
  )
}