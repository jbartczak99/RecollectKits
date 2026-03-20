export default function Logo({ layout = 'horizontal', iconSize = 40, fontSize = 22, showTagline = false }) {
  const isStacked = layout === 'stacked'

  return (
    <div style={{
      display: 'flex',
      flexDirection: isStacked ? 'column' : 'row',
      alignItems: 'center',
      gap: isStacked ? `${Math.round(iconSize * 0.08)}px` : '8px',
      textDecoration: 'none',
    }}>
      <img
        src="/icon.svg"
        alt=""
        style={{
          width: `${iconSize}px`,
          height: `${iconSize}px`,
        }}
      />
      <span style={{
        fontFamily: "'Darker Grotesque', sans-serif",
        fontWeight: 900,
        fontSize: `${fontSize}px`,
        color: '#205A40',
        letterSpacing: '-0.02em',
        lineHeight: isStacked ? 1 : `${iconSize}px`,
        whiteSpace: 'nowrap',
        ...(!isStacked && { display: 'inline-flex', alignItems: 'center', height: `${iconSize}px`, marginTop: '-3px' }),
      }}>
        Recollect<span style={{ color: '#7C3AED' }}>Kits</span>
      </span>
      {showTagline && (
        <span style={{
          fontSize: `${fontSize * 0.45}px`,
          color: '#6B7280',
          letterSpacing: '0.02em',
          marginTop: '2px',
        }}>
          Your kits. Your story. Recollected.
        </span>
      )}
    </div>
  )
}
