import CollectionLayout from './CollectionLayout'
import CollectionDetail from '../../pages/CollectionDetail'

// Route module for /collection/:collectionId. Matches the old App.jsx route,
// which wrapped CollectionDetail in CollectionLayout with NO auth gate.
export default function CollectionDetailRoute() {
  return (
    <CollectionLayout>
      <CollectionDetail />
    </CollectionLayout>
  )
}
