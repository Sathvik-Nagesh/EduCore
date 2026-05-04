/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0F1117',
          50: '#1A1D2E',
          100: '#252840',
          200: '#2D3155',
        },
        charcoal: '#1A1D2E',
        'electric-blue': '#4F8EF7',
        'electric-blue-dark': '#3B7AE8',
        'electric-blue-light': '#7AACFF',
        amber: {
          DEFAULT: '#F59E0B',
          dark: '#D97706',
          light: '#FCD34D',
        },
        emerald: {
          DEFAULT: '#10B981',
          dark: '#059669',
          light: '#34D399',
        },
        danger: '#EF4444',
        'danger-dark': '#DC2626',
        surface: '#1E2130',
        'surface-raised': '#252840',
        border: 'rgba(255,255,255,0.08)',
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        heading: ['Syne', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'grid-pattern': `
          linear-gradient(rgba(79,142,247,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(79,142,247,0.03) 1px, transparent 1px)
        `,
        'glow-radial': 'radial-gradient(ellipse at center, rgba(79,142,247,0.15) 0%, transparent 70%)',
      },
      backgroundSize: {
        'grid': '40px 40px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease forwards',
        'slide-up': 'slideUp 0.4s ease forwards',
        'slide-in-right': 'slideInRight 0.3s ease forwards',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
        'count-up': 'countUp 1s ease forwards',
        'shimmer': 'shimmer 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(79,142,247,0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(79,142,247,0.6)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      boxShadow: {
        'glow-blue': '0 0 20px rgba(79,142,247,0.3)',
        'glow-blue-lg': '0 0 40px rgba(79,142,247,0.4)',
        'glow-green': '0 0 20px rgba(16,185,129,0.3)',
        'glow-amber': '0 0 20px rgba(245,158,11,0.3)',
        'glow-red': '0 0 20px rgba(239,68,68,0.3)',
        'card': '0 4px 24px rgba(0,0,0,0.4)',
        'card-hover': '0 8px 40px rgba(0,0,0,0.5)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}
