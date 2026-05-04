// Shared Recharts styling utilities — dark academia / Bloomberg vibe

export const CHART_COLORS = {
  blue:    '#2563EB',
  emerald: '#059669',
  amber:   '#D97706',
  purple:  '#7C3AED',
  pink:    '#DB2777',
  cyan:    '#0891B2',
  red:     '#DC2626',
}

export const GRID_STYLE = {
  stroke: 'rgba(0,0,0,0.05)',
  strokeDasharray: '4 4',
}

export const AXIS_STYLE = {
  tick: { fill: 'rgba(0,0,0,0.4)', fontSize: 10, fontWeight: 500 },
  axisLine: { stroke: 'rgba(0,0,0,0.05)' },
  tickLine: false as any,
}

export const CustomTooltip = ({ active, payload, label, unit = '%' }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'rgba(255,255,255,0.98)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(0,0,0,0.06)',
      borderRadius: 14,
      padding: '12px 16px',
      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
      fontFamily: "'Outfit', sans-serif",
    }}>
      {label && <p style={{ color: '#64748B', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color || '#0F172A', fontWeight: 800, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }}></span>
          {p.name && <span style={{ color: '#475569', fontWeight: 600, fontSize: 12 }}>{p.name}: </span>}
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
  DBMS: '#2563EB',
  DSA:  '#059669',
  OS:   '#D97706',
  CN:   '#7C3AED',
  ML:   '#DB2777',
}
