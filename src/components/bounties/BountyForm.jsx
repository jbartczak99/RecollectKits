import { useState, useEffect } from 'react'
import { useJerseys } from '../../hooks/useJerseys'
import { useBounties } from '../../hooks/useBounties'

export default function BountyForm({ onSuccess, onCancel }) {
  const { jerseys } = useJerseys()
  const { createBounty } = useBounties()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    jersey_id: '',
    reward_points: 10
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!formData.title.trim() || !formData.description.trim()) {
      setError('Title and description are required')
      setLoading(false)
      return
    }

    const { data, error } = await createBounty({
      ...formData,
      jersey_id: formData.jersey_id || null
    })
    
    if (error) {
      setError(error)
      setLoading(false)
    } else {
      onSuccess?.(data)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: name === 'reward_points' ? parseInt(value) || 10 : value
    })
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Bounty</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Looking for Arsenal 1991 away jersey photos"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Describe what you're looking for in detail..."
          />
        </div>

        <div>
          <label htmlFor="jersey_id" className="block text-sm font-medium text-gray-700 mb-1">
            Related Jersey (Optional)
          </label>
          <select
            id="jersey_id"
            name="jersey_id"
            value={formData.jersey_id}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Select a jersey (optional)</option>
            {jerseys.map((jersey) => (
              <option key={jersey.id} value={jersey.id}>
                {jersey.team_name} - {jersey.season_year} ({jersey.jersey_type})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="reward_points" className="block text-sm font-medium text-gray-700 mb-1">
            Reward Points
          </label>
          <input
            type="number"
            id="reward_points"
            name="reward_points"
            value={formData.reward_points}
            onChange={handleChange}
            min={5}
            max={100}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <p className="text-sm text-gray-500 mt-1">
            Points to award for fulfilling this bounty (5-100)
          </p>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-yellow-500 text-white py-2 px-4 rounded-md hover:bg-yellow-600 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Creating Bounty...' : 'Create Bounty'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}