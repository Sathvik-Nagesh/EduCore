import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts'

interface EngagementBarProps {
  data: Array<{ subject: string; count: number }>
  height?: number
}

const COLORS = ['#4F8EF7', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899']

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="card px-5 py-4 border-slate-100 shadow-2xl bg-white/95 backdrop-blur-md">
        <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-1">{label}</p>
        <p className="font-black text-slate-900 text-lg">{payload[0].value} <span className="text-[10px] text-slate-400 font-medium">Interactions</span></p>
      </div>
    )
  }
  return null
}

export default function EngagementBar({ data, height = 200 }: EngagementBarProps) {
  return (
    <div style={{ width: '100%', height: height, minHeight: height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <XAxis
            dataKey="subject"
            tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 900 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            hide
          />
          <Tooltip cursor={{ fill: '#F8FAFC' }} content={<CustomTooltip />} />
          <Bar dataKey="count" radius={[16, 16, 16, 16]} barSize={32}>
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} fillOpacity={0.9} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
