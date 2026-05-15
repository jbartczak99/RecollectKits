import { useState } from 'react'
import { Link } from 'react-router-dom'
import { HeartIcon, StarIcon, PlusIcon, ChevronDownIcon, CheckIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid, StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import PlayerJerseyMiniCard from './PlayerJerseyMiniCard'

const styles = {
  card: {
    display: 'flex',
    flexDirection: 'column',
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
    overflow: 'hidden',
    transition: 'box-shadow 0.15s, border-color 0.15s, transform 0.15s',
  },
  imageWrap: {
    height: '240px',
    backgroundColor: '#f9fafb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    cursor: 'pointer',
  },
  image: {
    maxWidth: '230px',
    maxHeight: '230px',
    objectFit: 'contain',
    transition: 'transform 0.2s',
  },
  emptyImage: {
    fontSize: '13px',
    color: '#9ca3af',
    fontWeight: 500,
  },
  toggleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    padding: '6px 12px',
    fontSize: '12px',
    borderBottom: '1px solid #f3f4f6',
    backgroundColor: '#ffffff',
  },
  toggleBtn: (active) => ({
    padding: '3px 10px',
    fontSize: '12px',
    fontWeight: 500,
    border: 'none',
    background: 'transparent',
    color: active ? '#16a34a' : '#9ca3af',
    cursor: 'pointer',
    borderRadius: '4px',
  }),
  toggleDivider: { color: '#d1d5db', fontSize: '12px' },
  body: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    padding: '14px 16px',
  },
  headerRow: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '8px',
    marginBottom: '10px',
  },
  titleWrap: { flex: 1, minWidth: 0 },
  title: {
    margin: 0,
    fontSize: '15px',
    fontWeight: 600,
    color: '#111827',
    lineHeight: 1.3,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  sub: {
    margin: '2px 0 0',
    fontSize: '13px',
    color: '#6b7280',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  subPlayer: { color: '#374151', fontWeight: 500 },
  actions: { display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 },
  iconBtn: ({ active, activeBg, activeBorder, activeColor }) => ({
    width: '34px',
    height: '34px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '8px',
    border: '1px solid',
    borderColor: active ? activeBorder : '#e5e7eb',
    backgroundColor: active ? activeBg : '#f9fafb',
    color: active ? activeColor : '#6b7280',
    cursor: 'pointer',
    transition: 'background-color 0.15s, border-color 0.15s',
  }),
  addBtn: {
    width: '34px',
    height: '34px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#16a34a',
    color: '#ffffff',
    cursor: 'pointer',
    transition: 'background-color 0.15s',
  },
  inCollection: {
    width: '34px',
    height: '34px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '8px',
    border: '1px solid #bbf7d0',
    backgroundColor: '#dcfce7',
    color: '#16a34a',
  },
  badges: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    marginTop: '2px',
  },
  badge: (bg, color) => ({
    display: 'inline-flex',
    alignItems: 'center',
    padding: '3px 8px',
    fontSize: '11px',
    fontWeight: 500,
    borderRadius: '9999px',
    backgroundColor: bg,
    color: color,
    textTransform: 'capitalize',
  }),
  signInPrompt: {
    marginTop: 'auto',
    paddingTop: '12px',
    fontSize: '12px',
    color: '#9ca3af',
    textAlign: 'center',
  },
  expandSection: {
    borderTop: '1px solid #f3f4f6',
  },
  expandBtn: (open) => ({
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 16px',
    fontSize: '13px',
    fontWeight: 500,
    color: '#374151',
    background: open ? '#f9fafb' : '#ffffff',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.15s',
  }),
  chevron: (open) => ({
    width: '16px',
    height: '16px',
    transition: 'transform 0.2s',
    transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
  }),
  expandBody: {
    padding: '0 12px 12px',
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '8px',
  },
}

export default function KitGroupCard({
  group,
  user,
  imageStates,
  setImageStates,
  hasLiked,
  getLikeCount,
  toggleLike,
  isInMainCollection,
  isInWishlist,
  toggleWishlist,
  onOpenSelectCollection,
}) {
  const [expanded, setExpanded] = useState(false)
  const [hover, setHover] = useState(false)
  const jersey = group.representative

  const handleLike = async () => {
    if (!user) {
      alert('Please sign in to like kits')
      return
    }
    const { error } = await toggleLike(jersey.id)
    if (error) alert(`Error: ${error}`)
  }

  const handleWant = async () => {
    if (!user) {
      alert('Please sign in to add kits to your wishlist')
      return
    }
    const { error } = await toggleWishlist(jersey.id)
    if (error) alert(`Error: ${error}`)
  }

  const showPlayerName = !group.hasBlankKit && jersey.player_name
  const liked = hasLiked(jersey.id)
  const owned = isInMainCollection(jersey.id)
  const wished = isInWishlist(jersey.id)

  const imageSrc =
    jersey.front_image_url && jersey.back_image_url
      ? imageStates[jersey.id]
        ? jersey.back_image_url
        : jersey.front_image_url
      : jersey.front_image_url || jersey.back_image_url

  return (
    <div
      style={{
        ...styles.card,
        boxShadow: hover ? '0 4px 12px rgba(0, 0, 0, 0.08)' : styles.card.boxShadow,
        borderColor: hover ? '#d1d5db' : '#e5e7eb',
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <Link to={`/jerseys/${jersey.id}`} style={styles.imageWrap}>
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={`${jersey.team_name || ''} ${jersey.jersey_type || ''} kit`}
            style={{
              ...styles.image,
              transform: hover ? 'scale(1.03)' : 'scale(1)',
            }}
            onError={(e) => { e.target.style.display = 'none' }}
          />
        ) : (
          <span style={styles.emptyImage}>No image available</span>
        )}
      </Link>

      {jersey.front_image_url && jersey.back_image_url && (
        <div style={styles.toggleRow}>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setImageStates((prev) => ({ ...prev, [jersey.id]: false }))
            }}
            style={styles.toggleBtn(!imageStates[jersey.id])}
          >
            Front
          </button>
          <span style={styles.toggleDivider}>|</span>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setImageStates((prev) => ({ ...prev, [jersey.id]: true }))
            }}
            style={styles.toggleBtn(imageStates[jersey.id])}
          >
            Back
          </button>
        </div>
      )}

      <div style={styles.body}>
        <div style={styles.headerRow}>
          <div style={styles.titleWrap}>
            <h3 style={styles.title}>{jersey.team_name || 'Unknown Team'}</h3>
            <p style={styles.sub}>
              {showPlayerName && (
                <span style={styles.subPlayer}>{jersey.player_name} · </span>
              )}
              {jersey.season || 'Unknown Season'}
            </p>
          </div>

          {user && (
            <div style={styles.actions}>
              <button
                type="button"
                onClick={handleLike}
                style={styles.iconBtn({
                  active: liked,
                  activeBg: '#fee2e2',
                  activeBorder: '#fecaca',
                  activeColor: '#dc2626',
                })}
                title={`Like${getLikeCount(jersey.id) > 0 ? ` (${getLikeCount(jersey.id)})` : ''}`}
              >
                {liked
                  ? <HeartIconSolid style={{ width: '16px', height: '16px' }} />
                  : <HeartIcon style={{ width: '16px', height: '16px' }} />}
              </button>

              {owned ? (
                <div style={styles.inCollection} title="In your collection">
                  <CheckIcon style={{ width: '16px', height: '16px' }} />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onOpenSelectCollection(jersey)
                  }}
                  style={styles.addBtn}
                  onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#15803d')}
                  onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#16a34a')}
                  title="Add to collection"
                >
                  <PlusIcon style={{ width: '16px', height: '16px' }} />
                </button>
              )}

              {!owned && (
                <button
                  type="button"
                  onClick={handleWant}
                  style={styles.iconBtn({
                    active: wished,
                    activeBg: '#fef3c7',
                    activeBorder: '#fde68a',
                    activeColor: '#d97706',
                  })}
                  title="Wishlist"
                >
                  {wished
                    ? <StarIconSolid style={{ width: '16px', height: '16px' }} />
                    : <StarIcon style={{ width: '16px', height: '16px' }} />}
                </button>
              )}
            </div>
          )}
        </div>

        <div style={styles.badges}>
          {jersey.kit_type && (
            jersey.kit_type === 'international'
              ? <span style={styles.badge('#f3e8ff', '#6b21a8')}>International</span>
              : <span style={styles.badge('#dcfce7', '#15803d')}>Club</span>
          )}
          {jersey.jersey_type && (
            <span style={styles.badge('#dbeafe', '#1d4ed8')}>{jersey.jersey_type}</span>
          )}
          {jersey.manufacturer && (
            <span style={styles.badge('#f3f4f6', '#374151')}>{jersey.manufacturer}</span>
          )}
        </div>

        {!user && (
          <div style={styles.signInPrompt}>Sign in to interact</div>
        )}
      </div>

      {group.playerJerseys.length > 0 && (
        <div style={styles.expandSection}>
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            style={styles.expandBtn(expanded)}
          >
            <span>
              {group.playerJerseys.length} player {group.playerJerseys.length === 1 ? 'version' : 'versions'}
            </span>
            <ChevronDownIcon style={styles.chevron(expanded)} />
          </button>

          {expanded && (
            <div style={styles.expandBody}>
              {group.playerJerseys.map((pj) => (
                <PlayerJerseyMiniCard
                  key={pj.id}
                  jersey={pj}
                  user={user}
                  hasLiked={hasLiked}
                  getLikeCount={getLikeCount}
                  toggleLike={toggleLike}
                  isInMainCollection={isInMainCollection}
                  isInWishlist={isInWishlist}
                  toggleWishlist={toggleWishlist}
                  onOpenSelectCollection={onOpenSelectCollection}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
