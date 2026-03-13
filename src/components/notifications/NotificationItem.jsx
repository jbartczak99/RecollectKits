import { useNavigate } from 'react-router-dom'
import NotificationIcon from './NotificationIcon'

function getRelativeTime(dateStr) {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now - date
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHr = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHr / 24)

  if (diffSec < 60) return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHr < 24) return `${diffHr}h ago`
  if (diffDay === 1) return 'Yesterday'
  if (diffDay < 7) return `${diffDay}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/**
 * Single notification row — used in both dropdown and full page
 * @param {Object} props
 * @param {Object} props.notification - The notification object
 * @param {Function} props.onMarkRead - Callback to mark as read
 * @param {boolean} props.truncate - Whether to truncate the message (dropdown mode)
 */
export default function NotificationItem({ notification, onMarkRead, truncate = true }) {
  const navigate = useNavigate()
  const isUnread = !notification.read_at

  const handleClick = () => {
    if (isUnread) {
      onMarkRead?.(notification.id)
    }
    if (notification.link_url) {
      navigate(notification.link_url)
    }
  }

  return (
    <button
      onClick={handleClick}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        padding: '12px 16px',
        width: '100%',
        textAlign: 'left',
        background: isUnread ? '#faf5ff' : 'transparent',
        border: 'none',
        borderLeft: isUnread ? '3px solid #7C3AED' : '3px solid transparent',
        cursor: notification.link_url ? 'pointer' : 'default',
        transition: 'background-color 0.15s'
      }}
      onMouseEnter={e => { e.currentTarget.style.backgroundColor = isUnread ? '#f3e8ff' : '#f9fafb' }}
      onMouseLeave={e => { e.currentTarget.style.backgroundColor = isUnread ? '#faf5ff' : 'transparent' }}
    >
      <NotificationIcon category={notification.category} size={36} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: '14px',
          fontWeight: isUnread ? 600 : 400,
          color: '#111827',
          margin: '0 0 2px',
          lineHeight: 1.3
        }}>
          {notification.title}
        </p>
        <p style={{
          fontSize: '13px',
          color: '#6b7280',
          margin: '0 0 4px',
          lineHeight: 1.4,
          ...(truncate ? {
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          } : {})
        }}>
          {notification.message}
        </p>
        <span style={{
          fontSize: '12px',
          color: '#9ca3af'
        }}>
          {getRelativeTime(notification.created_at)}
        </span>
      </div>

      {isUnread && (
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: '#7C3AED',
          flexShrink: 0,
          marginTop: '6px'
        }} />
      )}
    </button>
  )
}
