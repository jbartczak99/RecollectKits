import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import EmptyChartState from './EmptyChartState'

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const { name, value } = payload[0].payload
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip__name">{name}</p>
      <p className="chart-tooltip__value">{value} {value === 1 ? 'kit' : 'kits'}</p>
    </div>
  )
}

export default function DistributionBar({
  data,
  totalForEmptyCheck,
  gradientId = 'distBarGradient',
  gradientFrom = '#16A34A',
  gradientTo = '#2563EB',
  maxItems = 8,
}) {
  if (!data?.length || (totalForEmptyCheck != null && totalForEmptyCheck < 3)) {
    return <EmptyChartState />
  }

  const rows = data.slice(0, maxItems)
  const height = Math.max(240, rows.length * 36 + 24)

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={rows}
          margin={{ top: 8, right: 24, left: 8, bottom: 0 }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={gradientFrom} />
              <stop offset="100%" stopColor={gradientTo} />
            </linearGradient>
          </defs>
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="name"
            width={110}
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#4B5563', fontSize: 12 }}
          />
          <Tooltip cursor={{ fill: 'rgba(0,0,0,0.04)' }} content={<ChartTooltip />} />
          <Bar
            dataKey="value"
            radius={[0, 6, 6, 0]}
            label={{ position: 'right', fill: '#6B7280', fontSize: 12 }}
          >
            {rows.map((entry) => (
              <Cell key={entry.name} fill={`url(#${gradientId})`} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
