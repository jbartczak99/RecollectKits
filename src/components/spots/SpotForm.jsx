import { useState } from 'react'
import { useJerseys } from '../../hooks/useJerseys'
import { useSpots } from '../../hooks/useSpots'

export default function SpotForm({ onSuccess, onCancel }) {
  const { jerseys } = useJerseys()
  const { createSpot } = useSpots()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    jersey_id: '',
    source_url: '',
    price: '',
    currency: 'USD',
    condition: '',
    description: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!formData.jersey_id || !formData.source_url) {
      setError('Jersey and source URL are required')
      setLoading(false)
      return
    }

    // Validate URL
    try {
      new URL(formData.source_url)
    } catch {
      setError('Please enter a valid URL')
      setLoading(false)
      return
    }

    const { data, error } = await createSpot({
      ...formData,
      price: formData.price ? parseFloat(formData.price) : null
    })
    
    if (error) {
      setError(error)
      setLoading(false)
    } else {
      onSuccess?.(data)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Report Jersey Spot</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="jersey_id" className="block text-sm font-medium text-gray-700 mb-1">
            Jersey *
          </label>
          <select
            id="jersey_id"
            name="jersey_id"
            value={formData.jersey_id}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Select a jersey</option>
            {jerseys.map((jersey) => (
              <option key={jersey.id} value={jersey.id}>
                {jersey.team_name} - {jersey.season_year} ({jersey.jersey_type})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="source_url" className="block text-sm font-medium text-gray-700 mb-1">
            Source URL *
          </label>
          <input
            type="url"
            id="source_url"
            name="source_url"
            value={formData.source_url}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="https://ebay.com/item/123456"
          />
          <p className="text-sm text-gray-500 mt-1">
            Link to where this jersey can be found
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
              Price (Optional)
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              step="0.01"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="99.99"
            />
          </div>

          <div>
            <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
              Currency
            </label>
            <select
              id="currency"
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="CAD">CAD</option>
              <option value="AUD">AUD</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-1">
            Condition (Optional)
          </label>
          <select
            id="condition"
            name="condition"
            value={formData.condition}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Select condition</option>
            <option value="mint">Mint</option>
            <option value="excellent">Excellent</option>
            <option value="good">Good</option>
            <option value="fair">Fair</option>
            <option value="poor">Poor</option>
          </select>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description (Optional)
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Additional details about this listing..."
          />
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Reporting Spot...' : 'Report Spot'}
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