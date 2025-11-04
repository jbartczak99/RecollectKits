import { useState, useEffect } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { supabase } from '../../lib/supabase'

export default function EditUserJerseyModal({ isOpen, onClose, userJersey, onSuccess }) {
  const [formData, setFormData] = useState({
    size: '',
    condition: 'new',
    notes: '',
    acquired_from: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Load user jersey data when modal opens
  useEffect(() => {
    if (userJersey) {
      setFormData({
        size: userJersey.size || '',
        condition: userJersey.condition || 'new',
        notes: userJersey.notes || '',
        acquired_from: userJersey.acquired_from || ''
      })
    }
  }, [userJersey])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data, error: updateError } = await supabase
        .from('user_jerseys')
        .update({
          size: formData.size || null,
          condition: formData.condition,
          notes: formData.notes || null,
          acquired_from: formData.acquired_from || null
        })
        .eq('id', userJersey.id)
        .select()
        .single()

      if (updateError) throw updateError

      // Call success callback
      onSuccess?.(data)

      // Close modal
      onClose()
    } catch (err) {
      console.error('Error updating jersey details:', err)
      setError(err.message || 'Failed to update jersey details')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setError(null)
      onClose()
    }
  }

  if (!isOpen || !userJersey) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Edit Jersey Details</h2>
            <p className="text-sm text-gray-500 mt-1">
              {userJersey.public_jersey?.team_name} - {userJersey.public_jersey?.season}
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
              <input
                type="text"
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                placeholder="e.g., M, L, XL"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled={loading}
              />
            </div>

            {/* Condition */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Purchased</label>
              <select
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled={loading}
              >
                <option value="new">New</option>
                <option value="used">Used</option>
              </select>
            </div>

            {/* Acquired From */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Acquired From</label>
              <input
                type="text"
                value={formData.acquired_from}
                onChange={(e) => setFormData({ ...formData, acquired_from: e.target.value })}
                placeholder="e.g., eBay, Local Shop, Gift"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled={loading}
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              placeholder="Any additional notes about this jersey..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              disabled={loading}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
