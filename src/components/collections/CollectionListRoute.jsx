import CollectionLayout from './CollectionLayout'
import Collection from '../../pages/Collection'

// Route module for /collection: the collection sidebar layout around the
// collection view. Auth/approval gating is applied by the parent AppGateLayout.
export default function CollectionListRoute() {
  return (
    <CollectionLayout>
      <Collection />
    </CollectionLayout>
  )
}
