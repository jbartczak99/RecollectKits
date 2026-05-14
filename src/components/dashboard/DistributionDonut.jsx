import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import EmptyChartState from './EmptyChartState'

const PALETTE = ['#16A34A', '#2563EB', '#7C3AED', '#DB2777', '#EA580C', '#9CA3AF']
const OTHER_COLOR = PALETTE[PALETTE.length - 1]

const colorFor = (entry, index) =>
  entry.name === 'Other' ? OTHER_COLOR : PALETTE[index % (PALETTE.length - 1)]

function ChartTooltip({ active, payload, total }) {
  if (!active || !payload?.length) return null
  const { name, value } = payload[0]
  const pct = total > 0 ? Math.round((value / total) * 100) : 0
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip__name">{name}</p>
      <p className="chart-tooltip__value">
        {value} {value === 1 ? 'kit' : 'kits'} · {pct}%
      </p>
    </div>
  )
}

export default function DistributionDonut({
  data,
  totalForEmptyCheck,
  onSliceClick,
  activeName,
}) {
  if (!data?.length || (totalForEmptyCheck != null && totalForEmptyCheck < 3)) {
    return <EmptyChartState />
  }

  const total = data.reduce((s, d) => s + d.value, 0)
  const handleClick = (entry) => {
    if (onSliceClick) onSliceClick(entry)
  }

  return (
    <div className="donut">
      <div className="donut__chart">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
              stroke="none"
              onClick={onSliceClick ? (slice) => handleClick(slice.payload) : undefined}
              style={onSliceClick ? { cursor: 'pointer' } : undefined}
            >
              {data.map((entry, i) => {
                const isActive = activeName != null && entry.name === activeName
                const isDimmed = activeName != null && !isActive
                return (
                  <Cell
                    key={entry.name}
                    fill={colorFor(entry, i)}
                    stroke={isActive ? '#111827' : 'none'}
                    strokeWidth={isActive ? 2 : 0}
                    fillOpacity={isDimmed ? 0.45 : 1}
                  />
                )
              })}
            </Pie>
            <Tooltip content={(props) => <ChartTooltip {...props} total={total} />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="donut__legend">
        {data.map((entry, i) => {
          const pct = total > 0 ? Math.round((entry.value / total) * 100) : 0
          const isActive = activeName != null && entry.name === activeName
          const isDimmed = activeName != null && !isActive
          const itemClass = [
            'donut__legend-item',
            onSliceClick ? 'donut__legend-item--clickable' : '',
            isActive ? 'donut__legend-item--active' : '',
            isDimmed ? 'donut__legend-item--dimmed' : '',
          ].filter(Boolean).join(' ')
          const interactiveProps = onSliceClick
            ? {
                role: 'button',
                tabIndex: 0,
                onClick: () => handleClick(entry),
                onKeyDown: (e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handleClick(entry)
                  }
                },
              }
            : {}
          return (
            <li key={entry.name} className={itemClass} {...interactiveProps}>
              <div className="donut__legend-left">
                <span className="donut__swatch" style={{ backgroundColor: colorFor(entry, i) }} />
                <span className="donut__legend-name">{entry.name}</span>
              </div>
              <span className="donut__legend-value">
                {entry.value} · {pct}%
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
