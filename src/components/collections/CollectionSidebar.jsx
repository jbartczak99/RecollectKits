import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  ChartBarIcon,
  FolderIcon,
  BookmarkIcon,
  HeartIcon,
} from '@heroicons/react/24/outline'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { supabase } from '../../lib/supabase'
import { usePendingDetailsCount } from '../../hooks/usePendingDetailsCount'
import DashboardFeedbackBox from './DashboardFeedbackBox'

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: ChartBarIcon },
  { key: 'collections', label: 'Collections', icon: FolderIcon },
  { key: 'wishlist', label: 'Wishlist', icon: BookmarkIcon },
  { key: 'liked', label: 'Liked Kits', icon: HeartIcon },
]

export default function CollectionSidebar() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams()
  const [searchParams] = useSearchParams()
  const [systemIds, setSystemIds] = useState({ wishlist: null, liked: null })
  const pendingDetailsCount = usePendingDetailsCount()

  useEffect(() => {
    if (!user) return
    let cancelled = false
    const load = async () => {
      const { data } = await supabase
        .from('collections')
        .select('id, name')
        .eq('user_id', user.id)
        .in('name', ['Wishlist', 'Liked Kits'])
      if (cancelled) return
      const map = { wishlist: null, liked: null }
      ;(data || []).forEach((c) => {
        if (c.name === 'Wishlist') map.wishlist = c.id
        if (c.name === 'Liked Kits') map.liked = c.id
      })
      setSystemIds(map)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [user])

  const activeKey = useMemo(() => {
    const collectionId = params.collectionId
    if (collectionId) {
      if (systemIds.wishlist && collectionId === systemIds.wishlist) return 'wishlist'
      if (systemIds.liked && collectionId === systemIds.liked) return 'liked'
      // 'all' and any custom collection both belong to the Collections tab
      return 'collections'
    }
    const view = searchParams.get('view')
    if (view === 'collections') return 'collections'
    return 'dashboard'
  }, [params.collectionId, systemIds, searchParams])

  const handleClick = (key) => {
    if (key === 'dashboard') {
      navigate('/collection')
      return
    }
    if (key === 'collections') {
      navigate('/collection?view=collections')
      return
    }
    if (key === 'wishlist' && systemIds.wishlist) {
      navigate(`/collection/${systemIds.wishlist}`)
      return
    }
    if (key === 'liked' && systemIds.liked) {
      navigate(`/collection/${systemIds.liked}`)
    }
  }

  const isDisabled = (item) =>
    (item.key === 'wishlist' && !systemIds.wishlist) ||
    (item.key === 'liked' && !systemIds.liked)

  // Hide the sidebar entirely for visitors who aren't signed in.
  if (!user) return null

  return (
    <div className="collection-sidebar">
      {/* Desktop sidebar */}
      <aside className="collection-sidebar__desktop">
        <ul className="collection-sidebar__list">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const active = item.key === activeKey
            const disabled = isDisabled(item)
            const showBadge = item.key === 'dashboard' && pendingDetailsCount > 0
            const className = active
              ? 'collection-sidebar__item collection-sidebar__item--active'
              : 'collection-sidebar__item'
            return (
              <li key={item.key}>
                <button
                  type="button"
                  className={className}
                  onClick={() => handleClick(item.key)}
                  disabled={disabled}
                >
                  <Icon className="collection-sidebar__icon" />
                  <span className="collection-sidebar__label">{item.label}</span>
                  {showBadge && (
                    <span className="collection-sidebar__badge">{pendingDetailsCount}</span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      </aside>

      {activeKey === 'dashboard' && (
        <div className="collection-sidebar__feedback">
          <DashboardFeedbackBox />
        </div>
      )}

      {/* Mobile tab strip */}
      <nav className="collection-sidebar__mobile">
        <ul className="collection-sidebar__mobile-list">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const active = item.key === activeKey
            const disabled = isDisabled(item)
            const showBadge = item.key === 'dashboard' && pendingDetailsCount > 0
            const className = active
              ? 'collection-sidebar__pill collection-sidebar__pill--active'
              : 'collection-sidebar__pill'
            return (
              <li key={item.key}>
                <button
                  type="button"
                  className={className}
                  onClick={() => handleClick(item.key)}
                  disabled={disabled}
                >
                  <Icon style={{ width: 16, height: 16 }} />
                  {item.label}
                  {showBadge && (
                    <span className="collection-sidebar__badge">{pendingDetailsCount}</span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}
