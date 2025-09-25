import { useState } from 'react'
import { PlusIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useSpots } from '../hooks/useSpots'
import SpottingFeed from '../components/spots/SpottingFeed'
import SpotForm from '../components/spots/SpotForm'

export default function Spots() {
  const { user } = useAuth()
  const { spots, loading, error } = useSpots()
  const [showForm, setShowForm] = useState(false)

  const handleFormSuccess = () => {
    setShowForm(false)
    // The useSpots hook will automatically refetch
    window.location.reload() // Simple reload for MVP
  }

  if (showForm) {
    return (
      <SpotForm
        onSuccess={handleFormSuccess}
        onCancel={() => setShowForm(false)}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Jersey Spotting</h1>
          <p className="text-gray-600 mt-1">
            Discover jerseys available for purchase across the web
          </p>
        </div>
        
        {user && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            Report Spot
          </button>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-blue-800">Community Spotting</h3>
            <p className="text-blue-700 text-sm mt-1">
              Help fellow collectors by reporting jersey listings you find online.
            </p>
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {spots.length} Spotted
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error loading spots: {error}
        </div>
      )}

      <SpottingFeed spots={spots} loading={loading} />
    </div>
  )
}