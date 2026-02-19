import { useState, useEffect } from 'react'
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/outline'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext.jsx'

export default function SelectCollectionModal({ isOpen, onClose, jersey, onSuccess }) {
  const { user } = useAuth()
  const [collections, setCollections] = useState([])
  const [loading, setLoading] = useState(false)
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState(null)

  const [step, setStep] = useState(1) // 1 = jersey details, 2 = select collections
  const [selectedCollections, setSelectedCollections] = useState([])
  const [jerseyDetails, setJerseyDetails] = useState({
    jersey_fit: 'mens',
    size: '',
    condition: 'new',
    notes: '',
    acquired_from: ''
  })

  useEffect(() => {
    if (isOpen && user) {
      fetchCollections()
      // Reset state when modal opens
      setStep(1)
      setSelectedCollections([])
      setError(null)
    }
  }, [isOpen, user])

  const fetchCollections = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('collections')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      // Filter out system collections (Liked Kits, Wishlist) - those are managed by interaction buttons only
      const userCollections = (data || []).filter(
        c => c.name !== 'Liked Kits' && c.name !== 'Wishlist'
      )
      setCollections(userCollections)
    } catch (err) {
      console.error('Error fetching collections:', err)
      setError(err.message)
    }
  }

  const handleNextStep = (e) => {
    e.preventDefault()
    setStep(2)
  }

  const toggleCollection = (collectionId) => {
    setSelectedCollections(prev =>
      prev.includes(collectionId)
        ? prev.filter(id => id !== collectionId)
        : [...prev, collectionId]
    )
  }

  const handleAddToCollection = async () => {
    setAdding(true)
    setError(null)

    try {
      // Check if jersey already exists in user's main collection
      const { data: existing } = await supabase
        .from('user_jerseys')
        .select('id')
        .eq('user_id', user.id)
        .eq('public_jersey_id', jersey.id)
        .single()

      let userJerseyId

      if (existing) {
        // Jersey already in main collection, just use that ID
        userJerseyId = existing.id
      } else {
        // Insert into user_jerseys (main collection) with details_completed: true
        // since the user is providing details through this modal
        const { data: newUserJersey, error: insertError } = await supabase
          .from('user_jerseys')
          .insert({
            user_id: user.id,
            public_jersey_id: jersey.id,
            jersey_fit: jerseyDetails.jersey_fit || 'mens',
            size: jerseyDetails.size || null,
            condition: jerseyDetails.condition,
            notes: jerseyDetails.notes || null,
            acquired_from: jerseyDetails.acquired_from || null,
            details_completed: true,
            created_at: new Date().toISOString()
          })
          .select()
          .single()

        if (insertError) throw insertError
        userJerseyId = newUserJersey.id
      }

      // Add to selected custom collections
      if (selectedCollections.length > 0) {
        const collectionJerseys = selectedCollections.map(collectionId => ({
          collection_id: collectionId,
          user_jersey_id: userJerseyId,
          created_at: new Date().toISOString()
        }))

        const { error: linkError } = await supabase
          .from('collection_jerseys')
          .insert(collectionJerseys)

        if (linkError) throw linkError
      }

      // Reset form
      setStep(1)
      setSelectedCollections([])
      setJerseyDetails({
        jersey_fit: 'mens',
        size: '',
        condition: 'new',
        notes: '',
        acquired_from: ''
      })

      // Call success callback
      onSuccess?.()

      // Close modal
      onClose()
    } catch (err) {
      console.error('Error adding jersey to collection:', err)
      setError(err.message || 'Failed to add jersey')
    } finally {
      setAdding(false)
    }
  }

  const handleClose = () => {
    if (!adding) {
      setStep(1)
      setSelectedCollections([])
      setError(null)
      setJerseyDetails({
        jersey_fit: 'mens',
        size: '',
        condition: 'new',
        notes: '',
        acquired_from: ''
      })
      onClose()
    }
  }

  if (!isOpen || !jersey) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {step === 1 ? 'Add to Your Collection' : 'Organize into Collections'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {jersey.team_name} - {jersey.season}
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={adding}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleNextStep} className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800">
                  This kit will be added to your main collection. You'll be able to organize it into custom collections in the next step.
                </p>
              </div>

              {/* Fit & Size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fit & Size</label>
                <div className="flex gap-3 items-start">
                  <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid #d1d5db' }}>
                    {[
                      { value: 'mens', label: "Men's" },
                      { value: 'womens', label: "Women's" },
                      { value: 'youth', label: 'Youth' }
                    ].map((option, idx) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setJerseyDetails({ ...jerseyDetails, jersey_fit: option.value })}
                        style={jerseyDetails.jersey_fit === option.value
                          ? { backgroundColor: '#7C3AED', color: 'white' }
                          : { backgroundColor: 'white', color: '#374151' }
                        }
                        className={`px-3 py-2 text-sm font-medium transition-colors hover:opacity-90${idx > 0 ? ' border-l border-gray-300' : ''}`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={jerseyDetails.size}
                    onChange={(e) => setJerseyDetails({ ...jerseyDetails, size: e.target.value })}
                    placeholder="e.g., M, L, XL"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                    style={{ minWidth: 0 }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Condition */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Purchased</label>
                  <select
                    value={jerseyDetails.condition}
                    onChange={(e) => setJerseyDetails({ ...jerseyDetails, condition: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="new">New</option>
                    <option value="used">Used</option>
                  </select>
                </div>

                {/* Acquired From */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Acquired From</label>
                  <input
                    type="text"
                    value={jerseyDetails.acquired_from}
                    onChange={(e) => setJerseyDetails({ ...jerseyDetails, acquired_from: e.target.value })}
                    placeholder="e.g., eBay, Local Shop, Gift"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={jerseyDetails.notes}
                  onChange={(e) => setJerseyDetails({ ...jerseyDetails, notes: e.target.value })}
                  rows={3}
                  placeholder="Any additional notes about this jersey..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={adding}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adding}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  Next: Organize
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Optional:</span> Add this kit to one or more of your custom collections for better organization.
                </p>
              </div>

              {collections.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-2">No custom collections yet</p>
                  <p className="text-sm text-gray-400">You can create collections later to organize your kits</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {collections.map((collection) => (
                    <label
                      key={collection.id}
                      className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 cursor-pointer transition-all"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCollections.includes(collection.id)}
                        onChange={() => toggleCollection(collection.id)}
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {collection.name}
                        </h3>
                        {collection.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {collection.description}
                          </p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  disabled={adding}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleAddToCollection}
                  disabled={adding}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <PlusIcon className="h-5 w-5" />
                  {adding ? 'Adding...' : 'Add to My Collection'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
