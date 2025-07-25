import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth.jsx'
import { TrophyIcon, UserIcon } from '@heroicons/react/24/outline'

export default function BountyCard({ bounty, onFulfill }) {
  const { user } = useAuth()
  const [fulfilling, setFulfilling] = useState(false)

  const handleFulfill = async () => {
    if (!user || bounty.created_by === user.id) return
    
    setFulfilling(true)
    try {
      await onFulfill(bounty.id)
    } finally {
      setFulfilling(false)
    }
  }

  const isOwner = user && bounty.created_by === user.id
  const canFulfill = user && !isOwner && bounty.status === 'active'

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-400">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {bounty.title}
          </h3>
          
          {bounty.jerseys && (
            <div className="flex items-center gap-3 mb-3 p-3 bg-gray-50 rounded-md">
              {bounty.jerseys.image_url && (
                <img
                  src={bounty.jerseys.image_url}
                  alt={`${bounty.jerseys.team_name} ${bounty.jerseys.season_year}`}
                  className="w-12 h-12 object-cover rounded"
                />
              )}
              <div>
                <p className="font-medium text-gray-900">
                  {bounty.jerseys.team_name}
                </p>
                <p className="text-sm text-gray-600">
                  {bounty.jerseys.season_year} • {bounty.jerseys.jersey_type}
                </p>
              </div>
            </div>
          )}
          
          <p className="text-gray-700 mb-4">{bounty.description}</p>
        </div>
        
        <div className="flex items-center gap-2 text-yellow-600 ml-4">
          <TrophyIcon className="h-5 w-5" />
          <span className="font-semibold">{bounty.reward_points} pts</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <UserIcon className="h-4 w-4" />
          <span>Posted by {bounty.profiles?.username || 'Unknown'}</span>
          <span>•</span>
          <span>{new Date(bounty.created_at).toLocaleDateString()}</span>
        </div>

        {canFulfill && (
          <button
            onClick={handleFulfill}
            disabled={fulfilling}
            className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            {fulfilling ? 'Fulfilling...' : 'Fulfill Bounty'}
          </button>
        )}

        {isOwner && (
          <span className="text-sm text-gray-500 italic">Your bounty</span>
        )}
      </div>
    </div>
  )
}