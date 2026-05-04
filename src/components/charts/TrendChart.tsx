import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Area, AreaChart } from 'recharts'

interface TrendChartProps {
  data: Array<{ date: string; attendance: number | null }>
  height?: number
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="card px-4 py-3 text-sm border-navy-100 shadow-xl">
        <p className="text-navy-400 font-bold mb-1">{label}</p>
        <p className="text-blue-600 font-black">{payload[0].value}% attendance</p>
      </div>
    )
  }
  return null
}

export default function TrendChart({ data, height = 200 }: TrendChartProps) {
  const filtered = data.filter(d => d.attendance !== null)

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={filtered} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#4F8EF7" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#4F8EF7" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
        <XAxis
          dataKey="date"
          tick={{ fill: '#718096', fontSize: 11, fontWeight: 700 }}
          tickLine={false}
          axisLine={false}
          interval={4}
        />
        <YAxis
          domain={[40, 100]}
          tick={{ fill: '#718096', fontSize: 11, fontWeight: 700 }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="attendance"
          stroke="#4F8EF7"
          strokeWidth={2}
          fill="url(#blueGradient)"
          dot={false}
          activeDot={{ r: 4, fill: '#4F8EF7', strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
