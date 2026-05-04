// Shared Recharts styling utilities — dark academia / Bloomberg vibe

export const CHART_COLORS = {
  blue:    '#4F8EF7',
  emerald: '#10B981',
  amber:   '#F59E0B',
  purple:  '#8B5CF6',
  pink:    '#EC4899',
  cyan:    '#06B6D4',
  red:     '#EF4444',
}

export const GRID_STYLE = {
  stroke: 'rgba(255,255,255,0.05)',
  strokeDasharray: '3 3',
}

export const AXIS_STYLE = {
  tick: { fill: 'rgba(255,255,255,0.3)', fontSize: 11 },
  axisLine: { stroke: 'rgba(255,255,255,0.08)' },
  tickLine: false as any,
}

export const CustomTooltip = ({ active, payload, label, unit = '%' }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'rgba(26,29,46,0.92)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 14,
      padding: '12px 16px',
      boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
      fontFamily: "'Inter', sans-serif",
    }}>
      {label && <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, marginBottom: 4 }}>{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color || '#fff', fontWeight: 700, fontSize: 13 }}>
          {p.name && <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 400, fontSize: 11 }}>{p.name}: </span>}
          {typeof p.value === 'number' ? `${p.value}${unit}` : p.value}
        </p>
      ))}
    </div>
  )
}

export const ATTENDANCE_GRADIENT = (id = 'colorAttendance') => (
  <defs>
    <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%"  stopColor="#4F8EF7" stopOpacity={0.3} />
      <stop offset="95%" stopColor="#4F8EF7" stopOpacity={0}   />
    </linearGradient>
  </defs>
)

export const SUBJECT_COLOR_MAP: Record<string, string> = {
  DBMS: '#4F8EF7',
  DSA:  '#10B981',
  OS:   '#F59E0B',
  CN:   '#8B5CF6',
  ML:   '#EC4899',
}
