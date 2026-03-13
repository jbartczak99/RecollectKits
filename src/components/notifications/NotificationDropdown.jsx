import { Link } from 'react-router-dom'
import { CheckCircleIcon } from '@heroicons/react/24/outline'
import NotificationItem from './NotificationItem'

export default function NotificationDropdown({ notifications, unreadCount, loading, onMarkRead, onMarkAllRead, onClose }) {
  return (
    <div style={{
      position: 'absolute',
      top: 'calc(100% + 8px)',
      right: 0,
      width: '380px',
      maxHeight: '480px',
      backgroundColor: 'white',
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
      boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 16px',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', margin: 0 }}>Notifications</h3>
          {unreadCount > 0 && (
            <span style={{
              backgroundColor: '#7C3AED',
              color: 'white',
              padding: '2px 8px',
              borderRadius: '99px',
              fontSize: '11px',
              fontWeight: 600
            }}>
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllRead}
            style={{
              background: 'none',
              border: 'none',
              color: '#7C3AED',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: '6px'
            }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#f3e8ff' }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent' }}
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Notification list */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {loading ? (
          <div style={{ padding: '32px', textAlign: 'center' }}>
            <div style={{
              width: '24px', height: '24px', margin: '0 auto 8px',
              border: '2px solid #e5e7eb', borderTopColor: '#7C3AED',
              borderRadius: '50%', animation: 'spin 0.8s linear infinite'
            }} />
            <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0 }}>Loading...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div style={{ padding: '40px 16px', textAlign: 'center' }}>
            <CheckCircleIcon style={{ width: '40px', height: '40px', color: '#16a34a', margin: '0 auto 12px' }} />
            <p style={{ fontSize: '15px', fontWeight: 500, color: '#111827', margin: '0 0 4px' }}>You're all caught up!</p>
            <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0 }}>No new notifications</p>
          </div>
        ) : (
          notifications.map(notification => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkRead={(id) => { onMarkRead(id); onClose?.() }}
              truncate
            />
          ))
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <Link
          to="/notifications"
          onClick={onClose}
          style={{
            display: 'block',
            padding: '12px 16px',
            textAlign: 'center',
            borderTop: '1px solid #e5e7eb',
            fontSize: '13px',
            fontWeight: 500,
            color: '#7C3AED',
            textDecoration: 'none'
          }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#faf5ff' }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent' }}
        >
          View all notifications
        </Link>
      )}
    </div>
  )
}
