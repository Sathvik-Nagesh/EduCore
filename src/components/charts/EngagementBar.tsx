import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts'

interface EngagementBarProps {
  data: Array<{ subject: string; count: number }>
  height?: number
}

const COLORS = ['#4F8EF7', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899']

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="card px-4 py-3 text-sm">
        <p className="text-white/60 mb-1">{label}</p>
        <p className="font-semibold text-white">{payload[0].value} AI queries</p>
      </div>
    )
  }
  return null
}

export default function EngagementBar({ data, height = 200 }: EngagementBarProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <XAxis
          dataKey="subject"
          tick={{ fill: '#5A6479', fontSize: 11 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fill: '#5A6479', fontSize: 11 }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {data.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} fillOpacity={0.85} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
