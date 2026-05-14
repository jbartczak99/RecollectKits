export default function StatCard({ label, value, hint, accent = 'green' }) {
  const className = `stat-card stat-card--${accent}`
  return (
    <div className={className}>
      <div className="stat-card__bar" />
      <div className="stat-card__body">
        <p className="stat-card__label">{label}</p>
        <p className="stat-card__value">{value}</p>
        {hint && <p className="stat-card__hint">{hint}</p>}
      </div>
    </div>
  )
}
