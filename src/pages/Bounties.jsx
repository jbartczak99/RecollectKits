import { useState } from 'react'
import { PlusIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../hooks/useAuth.jsx'
import { useBounties } from '../hooks/useBounties'
import BountyBoard from '../components/bounties/BountyBoard'
import BountyForm from '../components/bounties/BountyForm'

export default function Bounties() {
  const { user } = useAuth()
  const { bounties, loading, error, fulfillBounty } = useBounties()
  const [showForm, setShowForm] = useState(false)

  const handleFormSuccess = () => {
    setShowForm(false)
    // The useBounties hook will automatically refetch
    window.location.reload() // Simple reload for MVP
  }

  const handleFulfill = async (bountyId) => {
    const { error } = await fulfillBounty(bountyId)
    if (error) {
      alert('Error fulfilling bounty: ' + error)
    }
  }

  if (showForm) {
    return (
      <BountyForm
        onSuccess={handleFormSuccess}
        onCancel={() => setShowForm(false)}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bounty Board</h1>
          <p className="text-gray-600 mt-1">
            Help the community by fulfilling bounties for missing jerseys and information
          </p>
        </div>
        
        {user && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            Create Bounty
          </button>
        )}
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-yellow-800">How Bounties Work</h3>
            <p className="text-yellow-700 text-sm mt-1">
              Create bounties for jerseys or information you need. Community members can fulfill them to earn points.
            </p>
          </div>
          <div className="text-2xl font-bold text-yellow-600">
            {bounties.length} Active
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error loading bounties: {error}
        </div>
      )}

      <BountyBoard
        bounties={bounties}
        loading={loading}
        onFulfill={handleFulfill}
      />
    </div>
  )
}