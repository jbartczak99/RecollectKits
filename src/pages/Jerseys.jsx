import { useState } from 'react'
import { PlusIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../hooks/useAuth.jsx'
import { useJerseys } from '../hooks/useJerseys'
import JerseyGrid from '../components/jerseys/JerseyGrid'
import JerseySearch from '../components/jerseys/JerseySearch'
import JerseyForm from '../components/jerseys/JerseyForm'

export default function Jerseys() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const { jerseys, loading, error } = useJerseys(searchTerm)

  const handleFormSuccess = () => {
    setShowForm(false)
    // The useJerseys hook will automatically refetch
    window.location.reload() // Simple reload for MVP
  }

  if (showForm) {
    return (
      <JerseyForm
        onSuccess={handleFormSuccess}
        onCancel={() => setShowForm(false)}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Jersey Database</h1>
          <p className="text-gray-600 mt-1">
            Discover and collect football jerseys from around the world
          </p>
        </div>
        
        {user && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            Add Jersey
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <JerseySearch
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by team name..."
        />
        
        <div className="text-sm text-gray-500">
          {loading ? 'Loading...' : `${jerseys.length} jerseys found`}
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error loading jerseys: {error}
        </div>
      )}

      <JerseyGrid
        jerseys={jerseys}
        loading={loading}
        onCollectionUpdate={() => {
          // Handle collection updates if needed
        }}
      />
    </div>
  )
}