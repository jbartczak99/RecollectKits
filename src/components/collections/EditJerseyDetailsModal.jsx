import { useState, useEffect } from 'react'
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

export default function EditJerseyDetailsModal({ isOpen, onClose, jersey, userJersey, onSave }) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [details, setDetails] = useState({
    size: '',
    condition: 'new',
    acquired_from: '',
    notes: ''
  })

  // Reset form when modal opens with existing data
  useEffect(() => {
    if (isOpen && userJersey) {
      setDetails({
        size: userJersey.size || '',
        condition: userJersey.condition || 'new',
        acquired_from: userJersey.acquired_from || '',
        notes: userJersey.notes || ''
      })
      setError(null)
    }
  }, [isOpen, userJersey])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const result = await onSave(jersey.id, details)
      if (result?.error) {
        setError(result.error)
      } else {
        onClose()
      }
    } catch (err) {
      setError(err.message || 'Failed to save details')
    } finally {
      setSaving(false)
    }
  }

  const handleClose = () => {
    if (!saving) {
      onClose()
    }
  }

  if (!isOpen || !jersey) return null

  const isActionNeeded = userJersey && userJersey.details_completed === false

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {isActionNeeded ? 'Complete Kit Details' : 'Edit Kit Details'}
            </h2>
            <p className="text-sm text-gray-500">
              {jersey.team_name} - {jersey.season}
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={saving}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {isActionNeeded && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
              <ExclamationTriangleIcon className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">
                Please complete the details for this kit that was recently added to your collection.
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {/* Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
              <input
                type="text"
                value={details.size}
                onChange={(e) => setDetails({ ...details, size: e.target.value })}
                placeholder="e.g., M, L, XL"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              />
            </div>

            {/* Condition */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Purchased</label>
              <select
                value={details.condition}
                onChange={(e) => setDetails({ ...details, condition: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              >
                <option value="new">New</option>
                <option value="used">Used</option>
              </select>
            </div>
          </div>

          {/* Acquired From */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Acquired From</label>
            <input
              type="text"
              value={details.acquired_from}
              onChange={(e) => setDetails({ ...details, acquired_from: e.target.value })}
              placeholder="e.g., eBay, Local Shop, Gift"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={details.notes}
              onChange={(e) => setDetails({ ...details, notes: e.target.value })}
              rows={3}
              placeholder="Any additional notes about this jersey..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none text-sm"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={saving}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 text-sm font-medium"
            >
              {isActionNeeded ? 'Skip for Now' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 text-sm font-medium"
            >
              {saving ? 'Saving...' : 'Save Details'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
