import { useAuth } from '../contexts/AuthContext.jsx'
import { useCollection } from '../hooks/useCollection'
import CollectionView from '../components/collection/CollectionView'
import CollectionStats from '../components/collection/CollectionStats'

export default function Collection() {
  const { user } = useAuth()
  const {
    collection,
    loading,
    error,
    removeFromCollection,
    updateCollectionStatus
  } = useCollection(user?.id)

  const handleRemove = async (collectionId) => {
    const { error } = await removeFromCollection(collectionId)
    if (error) {
      alert('Error removing item from collection: ' + error)
    }
  }

  const handleStatusChange = async (collectionId, newStatus) => {
    const { error } = await updateCollectionStatus(collectionId, newStatus)
    if (error) {
      alert('Error updating collection status: ' + error)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Collection</h1>
        <p className="text-gray-600 mt-1">
          Track the jerseys you have and want in your personal collection
        </p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error loading collection: {error}
        </div>
      )}

      <CollectionStats collection={collection} />

      <CollectionView
        collection={collection}
        loading={loading}
        onRemove={handleRemove}
        onStatusChange={handleStatusChange}
      />
    </div>
  )
}