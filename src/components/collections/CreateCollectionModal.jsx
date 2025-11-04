import { useState } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext.jsx'

export default function CreateCollectionModal({ isOpen, onClose, onSuccess }) {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_public: false
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      setError('Collection name is required')
      return
    }

    if (formData.name.length > 100) {
      setError('Collection name must be 100 characters or less')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { data, error: insertError } = await supabase
        .from('collections')
        .insert({
          user_id: user.id,
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          is_public: formData.is_public,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (insertError) throw insertError

      // Reset form
      setFormData({ name: '', description: '', is_public: false })

      // Call success callback
      onSuccess?.(data)

      // Close modal
      onClose()
    } catch (err) {
      console.error('Error creating collection:', err)
      setError(err.message || 'Failed to create collection')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setFormData({ name: '', description: '', is_public: false })
      setError(null)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Create New Collection</h2>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Collection Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              maxLength={100}
              placeholder="e.g., Premier League Classics"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              disabled={loading}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.name.length}/100 characters
            </p>
          </div>

          {/* Description Field */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-gray-400">(optional)</span>
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              placeholder="Describe what this collection is about..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
              disabled={loading}
            />
          </div>

          {/* Public Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <label htmlFor="is_public" className="block text-sm font-medium text-gray-700">
                Make Public
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Allow others to view this collection
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={formData.is_public}
              onClick={() => setFormData({ ...formData, is_public: !formData.is_public })}
              disabled={loading}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                formData.is_public ? 'bg-green-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.is_public ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
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
              disabled={loading || !formData.name.trim()}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Collection'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
