import { Link } from 'react-router-dom'
import { UserMinusIcon, CheckIcon, XMarkIcon, ClockIcon } from '@heroicons/react/24/outline'

/**
 * Reusable card component for displaying a friend/user
 * @param {Object} props
 * @param {Object} props.user - User object with id, username, full_name, avatar_url
 * @param {string} props.friendshipId - The friendship record ID
 * @param {string} props.type - 'friend', 'received', 'sent'
 * @param {Function} props.onAccept - Accept handler for received requests
 * @param {Function} props.onReject - Reject handler for received requests
 * @param {Function} props.onCancel - Cancel handler for sent requests
 * @param {Function} props.onRemove - Remove handler for friends
 * @param {boolean} props.actionLoading - Loading state for actions
 */
export default function FriendCard({
  user,
  friendshipId,
  type = 'friend',
  onAccept,
  onReject,
  onCancel,
  onRemove,
  actionLoading = false
}) {
  const displayName = user.full_name || user.username
  const profileUrl = `/@${user.username}`

  return (
    <div
      style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        padding: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}
    >
      {/* Avatar */}
      <Link to={profileUrl} style={{ flexShrink: 0 }}>
        {user.avatar_url ? (
          <img
            src={user.avatar_url}
            alt={user.username}
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid #dcfce7'
            }}
          />
        ) : (
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #4ade80, #16a34a)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #dcfce7'
            }}
          >
            <span style={{ fontSize: '18px', fontWeight: 'bold', color: 'white' }}>
              {user.username?.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </Link>

      {/* User Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <Link
          to={profileUrl}
          style={{
            fontWeight: 600,
            color: '#111827',
            textDecoration: 'none',
            display: 'block',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {displayName}
        </Link>
        <Link
          to={profileUrl}
          style={{
            fontSize: '13px',
            color: '#6b7280',
            textDecoration: 'none',
            display: 'block',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          @{user.username}
        </Link>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
        {type === 'friend' && onRemove && (
          <button
            onClick={() => onRemove(friendshipId)}
            disabled={actionLoading}
            title="Remove friend"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              border: '1px solid #fecaca',
              backgroundColor: '#fef2f2',
              color: '#dc2626',
              cursor: actionLoading ? 'not-allowed' : 'pointer',
              opacity: actionLoading ? 0.5 : 1
            }}
          >
            <UserMinusIcon style={{ width: '18px', height: '18px' }} />
          </button>
        )}

        {type === 'received' && (
          <>
            <button
              onClick={() => onAccept && onAccept(friendshipId)}
              disabled={actionLoading}
              title="Accept request"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#16a34a',
                color: 'white',
                cursor: actionLoading ? 'not-allowed' : 'pointer',
                opacity: actionLoading ? 0.5 : 1
              }}
            >
              <CheckIcon style={{ width: '18px', height: '18px' }} />
            </button>
            <button
              onClick={() => onReject && onReject(friendshipId)}
              disabled={actionLoading}
              title="Reject request"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                border: '1px solid #fecaca',
                backgroundColor: '#fef2f2',
                color: '#dc2626',
                cursor: actionLoading ? 'not-allowed' : 'pointer',
                opacity: actionLoading ? 0.5 : 1
              }}
            >
              <XMarkIcon style={{ width: '18px', height: '18px' }} />
            </button>
          </>
        )}

        {type === 'sent' && (
          <button
            onClick={() => onCancel && onCancel(friendshipId)}
            disabled={actionLoading}
            title="Cancel request"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #d1d5db',
              backgroundColor: 'white',
              color: '#6b7280',
              fontSize: '13px',
              fontWeight: 500,
              cursor: actionLoading ? 'not-allowed' : 'pointer',
              opacity: actionLoading ? 0.5 : 1
            }}
          >
            <ClockIcon style={{ width: '16px', height: '16px' }} />
            Pending
          </button>
        )}
      </div>
    </div>
  )
}
