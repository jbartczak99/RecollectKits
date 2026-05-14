export default function EmptyChartState({ message = 'Add more jerseys to see distribution.' }) {
  return (
    <div className="chart-empty">
      <div className="chart-empty__icon">
        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6h13M9 19a2 2 0 11-4 0 2 2 0 014 0zm0 0V9a2 2 0 00-2-2H3" />
        </svg>
      </div>
      <p className="chart-empty__text">{message}</p>
    </div>
  )
}
