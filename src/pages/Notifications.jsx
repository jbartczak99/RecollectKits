import { useState } from 'react'
import { BellIcon, CheckIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useNotifications } from '../hooks/useNotifications'
import NotificationItem from '../components/notifications/NotificationItem'

const CATEGORIES = [
  { key: null, label: 'All' },
  { key: 'social', label: 'Social' },
  { key: 'community', label: 'Community' },
  { key: 'system', label: 'System' },
  { key: 'partner', label: 'Partner' }
]

export default function Notifications() {
  const { user } = useAuth()
  const [activeCategory, setActiveCategory] = useState(null)
  const [currentPage, setCurrentPage] = useState(0)

  const { notifications, unreadCount, loading, hasMore, markAsRead, markAllAsRead } = useNotifications(user?.id, {
    limit: 20,
    category: activeCategory,
    page: currentPage
  })

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat)
    setCurrentPage(0)
  }

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '64px 16px' }}>
        <p style={{ color: '#6b7280' }}>Please sign in to view notifications.</p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <BellIcon style={{ width: '28px', height: '28px', color: '#7C3AED' }} />
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0 }}>Notifications</h1>
          {unreadCount > 0 && (
            <span style={{
              backgroundColor: '#7C3AED',
              color: 'white',
              padding: '2px 10px',
              borderRadius: '99px',
              fontSize: '13px',
              fontWeight: 600
            }}>
              {unreadCount} new
            </span>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              backgroundColor: '#f3e8ff',
              color: '#7C3AED',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            <CheckIcon style={{ width: '16px', height: '16px' }} />
            Mark all as read
          </button>
        )}
      </div>

      {/* Category tabs */}
      <div style={{
        display: 'flex',
        gap: '4px',
        marginBottom: '20px',
        backgroundColor: '#f3f4f6',
        borderRadius: '10px',
        padding: '4px',
        flexWrap: 'wrap'
      }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat.key || 'all'}
            onClick={() => handleCategoryChange(cat.key)}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              backgroundColor: activeCategory === cat.key ? 'white' : 'transparent',
              color: activeCategory === cat.key ? '#111827' : '#6b7280',
              boxShadow: activeCategory === cat.key ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s'
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Notification list */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        overflow: 'hidden'
      }}>
        {loading && currentPage === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <div style={{
              width: '32px', height: '32px', margin: '0 auto 12px',
              border: '3px solid #e5e7eb', borderTopColor: '#7C3AED',
              borderRadius: '50%', animation: 'spin 0.8s linear infinite'
            }} />
            <p style={{ fontSize: '14px', color: '#9ca3af', margin: 0 }}>Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div style={{ padding: '64px 16px', textAlign: 'center' }}>
            <BellIcon style={{ width: '48px', height: '48px', color: '#d1d5db', margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 500, color: '#111827', margin: '0 0 8px' }}>
              No notifications yet
            </h3>
            <p style={{ fontSize: '14px', color: '#9ca3af', margin: 0 }}>
              {activeCategory ? `No ${activeCategory} notifications to show.` : "When something happens, you'll see it here."}
            </p>
          </div>
        ) : (
          <>
            {notifications.map(notification => (
              <div key={notification.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <NotificationItem
                  notification={notification}
                  onMarkRead={markAsRead}
                  truncate={false}
                />
              </div>
            ))}

            {hasMore && (
              <button
                onClick={() => setCurrentPage(p => p + 1)}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'none',
                  border: 'none',
                  color: '#7C3AED',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#faf5ff' }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent' }}
              >
                Load more
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
