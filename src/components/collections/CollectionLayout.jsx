import CollectionSidebar from './CollectionSidebar'
import '../dashboard/Dashboard.css'

export default function CollectionLayout({ children }) {
  return (
    <div className="collection-layout">
      <CollectionSidebar />
      <div className="collection-layout__main">{children}</div>
    </div>
  )
}
