import {
  UserPlusIcon,
  TrophyIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'

const categoryConfig = {
  social: {
    icon: UserPlusIcon,
    color: '#7c3aed',
    bg: '#f3e8ff'
  },
  community: {
    icon: TrophyIcon,
    color: '#f59e0b',
    bg: '#fef9c3'
  },
  system: {
    icon: Cog6ToothIcon,
    color: '#6b7280',
    bg: '#f3f4f6'
  },
  partner: {
    icon: () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}>
        <path d="M7 11l3.5 3.5L21 4" />
        <path d="M3 17l3 3 4-4" />
        <path d="M17 3l4 4" />
      </svg>
    ),
    color: '#16a34a',
    bg: '#dcfce7'
  }
}

export default function NotificationIcon({ category, size = 32 }) {
  const config = categoryConfig[category] || categoryConfig.system
  const Icon = config.icon

  return (
    <div style={{
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: '50%',
      backgroundColor: config.bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    }}>
      <Icon style={{ width: `${size * 0.5}px`, height: `${size * 0.5}px`, color: config.color }} />
    </div>
  )
}
