import { useState, useEffect } from 'react'
import { XMarkIcon, TrashIcon } from '@heroicons/react/24/outline'
import { supabase } from '../../lib/supabase'

export default function EditCollectionModal({ isOpen, onClose, collection, onSuccess, onDelete }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_public: false
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Load collection data when modal opens
  useEffect(() => {
    if (collection) {
      setFormData({
        name: collection.name || '',
        description: collection.description || '',
        is_public: collection.is_public || false
      })
    }
  }, [collection])

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
      const { data, error: updateError } = await supabase
        .from('collections')
        .update({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          is_public: formData.is_public
        })
        .eq('id', collection.id)
        .select()
        .single()

      if (updateError) throw updateError

      // Call success callback
      onSuccess?.(data)

      // Close modal
      onClose()
    } catch (err) {
      console.error('Error updating collection:', err)
      setError(err.message || 'Failed to update collection')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    setError(null)

    try {
      // First delete all user_jerseys in this collection
      const { error: deleteJerseysError } = await supabase
        .from('user_jerseys')
        .delete()
        .eq('collection_id', collection.id)

      if (deleteJerseysError) throw deleteJerseysError

      // Then delete the collection
      const { error: deleteCollectionError } = await supabase
        .from('collections')
        .delete()
        .eq('id', collection.id)

      if (deleteCollectionError) throw deleteCollectionError

      // Call delete callback
      onDelete?.(collection.id)

      // Close modal
      onClose()
    } catch (err) {
      console.error('Error deleting collection:', err)
      setError(err.message || 'Failed to delete collection')
    } finally {
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  const handleClose = () => {
    if (!loading && !deleting) {
      setError(null)
      setShowDeleteConfirm(false)
      onClose()
    }
  }

  if (!isOpen || !collection) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Edit Collection</h2>
          <button
            onClick={handleClose}
            disabled={loading || deleting}
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
            <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-1">
              Collection Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="edit-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              maxLength={100}
              placeholder="e.g., Premier League Classics"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              disabled={loading || deleting}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.name.length}/100 characters
            </p>
          </div>

          {/* Description Field */}
          <div>
            <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-gray-400">(optional)</span>
            </label>
            <textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              placeholder="Describe what this collection is about..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
              disabled={loading || deleting}
            />
          </div>

          {/* Public Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <label htmlFor="edit-is_public" className="block text-sm font-medium text-gray-700">
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
              disabled={loading || deleting}
              style={{
                position: 'relative',
                display: 'inline-flex',
                height: '24px',
                width: '44px',
                alignItems: 'center',
                borderRadius: '12px',
                backgroundColor: formData.is_public ? '#16a34a' : '#d1d5db',
                transition: 'background-color 0.2s',
                cursor: (loading || deleting) ? 'not-allowed' : 'pointer',
                border: 'none',
                padding: 0,
                flexShrink: 0
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  height: '18px',
                  width: '18px',
                  borderRadius: '50%',
                  backgroundColor: 'white',
                  transition: 'transform 0.2s',
                  transform: formData.is_public ? 'translateX(23px)' : 'translateX(3px)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                }}
              />
            </button>
          </div>

          {/* Delete Confirmation */}
          {showDeleteConfirm && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <p className="text-sm text-red-800 mb-3">
                Are you sure you want to delete this collection? This will remove all jerseys from this collection. This action cannot be undone.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                  className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm disabled:opacity-50"
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3 pt-4">
            {/* Update/Cancel Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading || deleting}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || deleting || !formData.name.trim()}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Updating...' : 'Update Collection'}
              </button>
            </div>

            {/* Delete Button */}
            {!showDeleteConfirm && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={loading || deleting}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <TrashIcon className="h-4 w-4" />
                Delete Collection
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
