import { useState, useEffect } from 'react'
import { XMarkIcon, MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext.jsx'

export default function AddJerseyToCollectionModal({ isOpen, onClose, collection, onSuccess }) {
  const { user } = useAuth()
  const [jerseys, setJerseys] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedJersey, setSelectedJersey] = useState(null)
  const [showDetailsForm, setShowDetailsForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const [jerseyDetails, setJerseyDetails] = useState({
    size: '',
    condition: 'new',
    notes: '',
    acquired_from: ''
  })

  // Fetch jerseys
  useEffect(() => {
    if (isOpen) {
      fetchJerseys()
    }
  }, [isOpen, searchTerm])

  const fetchJerseys = async () => {
    setLoading(true)
    setError(null)

    try {
      let query = supabase
        .from('public_jerseys')
        .select('*')
        .order('created_at', { ascending: false })

      if (searchTerm) {
        query = query.or(`team_name.ilike.%${searchTerm}%,player_name.ilike.%${searchTerm}%,season.ilike.%${searchTerm}%`)
      }

      const { data, error: fetchError } = await query.limit(50)

      if (fetchError) throw fetchError

      setJerseys(data || [])
    } catch (err) {
      console.error('Error fetching jerseys:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleJerseySelect = (jersey) => {
    setSelectedJersey(jersey)
    setShowDetailsForm(true)
    setError(null)
  }

  const handleAddJersey = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      // Check if jersey already exists in this collection
      const { data: existing } = await supabase
        .from('user_jerseys')
        .select('id')
        .eq('collection_id', collection.id)
        .eq('public_jersey_id', selectedJersey.id)
        .single()

      if (existing) {
        setError('This jersey is already in this collection')
        setSaving(false)
        return
      }

      // Insert into user_jerseys
      const { data, error: insertError } = await supabase
        .from('user_jerseys')
        .insert({
          collection_id: collection.id,
          user_id: user.id,
          public_jersey_id: selectedJersey.id,
          size: jerseyDetails.size || null,
          condition: jerseyDetails.condition,
          notes: jerseyDetails.notes || null,
          acquired_from: jerseyDetails.acquired_from || null,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (insertError) throw insertError

      // Reset form
      setSelectedJersey(null)
      setShowDetailsForm(false)
      setJerseyDetails({
        size: '',
        condition: 'new',
        notes: '',
        acquired_from: ''
      })

      // Call success callback
      onSuccess?.(data)

      // Show success message briefly then close
      setTimeout(() => {
        onClose()
      }, 1000)
    } catch (err) {
      console.error('Error adding jersey to collection:', err)
      setError(err.message || 'Failed to add jersey')
    } finally {
      setSaving(false)
    }
  }

  const handleClose = () => {
    if (!saving) {
      setSearchTerm('')
      setSelectedJersey(null)
      setShowDetailsForm(false)
      setError(null)
      setJerseyDetails({
        size: '',
        condition: 'new',
        notes: '',
        acquired_from: ''
      })
      onClose()
    }
  }

  if (!isOpen || !collection) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Add Jersey to Collection</h2>
            <p className="text-sm text-gray-500 mt-1">{collection.name}</p>
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
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          {!showDetailsForm ? (
            <>
              {/* Search Bar */}
              <div className="mb-4">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search jerseys by team, player, or season..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              {/* Jersey Grid */}
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-gray-100 rounded-lg p-4 animate-pulse">
                      <div className="h-32 bg-gray-200 rounded mb-3"></div>
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  ))}
                </div>
              ) : jerseys.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">
                    {searchTerm ? 'No jerseys found matching your search' : 'No jerseys available'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {jerseys.map((jersey) => (
                    <button
                      key={jersey.id}
                      onClick={() => handleJerseySelect(jersey)}
                      className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden hover:border-green-500 transition-all text-left"
                    >
                      {(jersey.front_image_url || jersey.back_image_url) && (
                        <div className="h-32 bg-gray-50 flex items-center justify-center">
                          <img
                            src={jersey.front_image_url || jersey.back_image_url}
                            alt={jersey.team_name}
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                      )}
                      <div className="p-3">
                        <h3 className="font-semibold text-gray-900 text-sm mb-1">
                          {jersey.team_name}
                        </h3>
                        <p className="text-xs text-gray-600">
                          {jersey.season} • {jersey.jersey_type}
                        </p>
                        {jersey.player_name && (
                          <p className="text-xs text-gray-500 mt-1">{jersey.player_name}</p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            /* Jersey Details Form */
            <form onSubmit={handleAddJersey} className="space-y-4">
              {/* Selected Jersey Preview */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-1">
                  {selectedJersey.team_name}
                </h3>
                <p className="text-sm text-gray-600">
                  {selectedJersey.season} • {selectedJersey.jersey_type}
                  {selectedJersey.player_name && ` • ${selectedJersey.player_name}`}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedJersey(null)
                    setShowDetailsForm(false)
                  }}
                  className="text-sm text-blue-600 hover:text-blue-700 mt-2"
                >
                  ← Choose different jersey
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Size */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                  <input
                    type="text"
                    value={jerseyDetails.size}
                    onChange={(e) => setJerseyDetails({ ...jerseyDetails, size: e.target.value })}
                    placeholder="e.g., M, L, XL"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

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
                <div className="sm:col-span-2">
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
                  onClick={() => {
                    setSelectedJersey(null)
                    setShowDetailsForm(false)
                  }}
                  disabled={saving}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <PlusIcon className="h-5 w-5" />
                  {saving ? 'Adding...' : 'Add to Collection'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
