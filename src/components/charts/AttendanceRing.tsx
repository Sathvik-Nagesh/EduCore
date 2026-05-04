import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface AttendanceRingProps {
  percentage: number
  size?: number
  strokeWidth?: number
  label?: string
}

export default function AttendanceRing({
  percentage,
  size = 180,
  strokeWidth = 12,
  label = 'Overall Attendance',
}: AttendanceRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference

  const color = percentage >= 75 ? '#10B981' : percentage >= 65 ? '#F59E0B' : '#EF4444'
  const glowColor = percentage >= 75 ? 'rgba(16,185,129,0.4)' : percentage >= 65 ? 'rgba(245,158,11,0.4)' : 'rgba(239,68,68,0.4)'

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ transform: 'rotate(-90deg)' }}
        >
          {/* Glow filter */}
          <defs>
            <filter id="ring-glow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={strokeWidth}
          />

          {/* Progress */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: 'easeOut', delay: 0.2 }}
            filter="url(#ring-glow)"
          />
        </svg>

        {/* Center text */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ transform: 'rotate(0deg)' }}
        >
          <motion.span
            className="font-heading text-4xl font-bold"
            style={{ color }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 0.4 }}
          >
            {Math.round(percentage)}%
          </motion.span>
          <span className="text-xs text-white/40 mt-1">attendance</span>
        </div>
      </div>
      <motion.p
        className="text-sm text-white/60 font-medium"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        {label}
      </motion.p>
    </div>
  )
}
