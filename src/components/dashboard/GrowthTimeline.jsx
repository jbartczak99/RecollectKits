import { AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts'
import EmptyChartState from './EmptyChartState'

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const { label, total } = payload[0].payload
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip__name">{label}</p>
      <p className="chart-tooltip__value">{total} {total === 1 ? 'kit' : 'kits'} total</p>
    </div>
  )
}

export default function GrowthTimeline({ data }) {
  if (!data?.length) {
    return <EmptyChartState message="Add your first kit to see your growth over time." />
  }

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#16A34A" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#16A34A" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#6B7280', fontSize: 12 }}
            interval="preserveStartEnd"
            minTickGap={20}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#6B7280', fontSize: 12 }}
            allowDecimals={false}
            width={32}
          />
          <Tooltip content={<ChartTooltip />} />
          <Area
            type="monotone"
            dataKey="total"
            stroke="#16A34A"
            strokeWidth={2.5}
            fill="url(#growthGradient)"
            dot={data.length <= 24 ? { fill: '#16A34A', r: 3 } : false}
            activeDot={{ r: 5, fill: '#16A34A' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
