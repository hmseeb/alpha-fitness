/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          0: '#0a0a0b',
          1: '#111113',
          2: '#18181b',
          3: '#1f1f23',
          4: '#27272a',
          5: '#3f3f46',
        },
        line: {
          DEFAULT: '#2a2a2f',
          bright: '#3f3f46',
        },
        crimson: {
          DEFAULT: '#ef4444',
          deep: '#b91c1c',
          glow: '#dc2626',
          dim: '#7f1d1d',
        },
        lime: { soft: '#d9f99d' },
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'sans-serif'],
        sans: ['"Inter Tight"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(239, 68, 68, 0.35), 0 8px 30px -8px rgba(239, 68, 68, 0.4)',
        sharp: '0 1px 0 0 rgba(255,255,255,0.04), 0 0 0 1px rgba(255,255,255,0.04)',
        deep: '0 30px 60px -20px rgba(0, 0, 0, 0.8)',
      },
      letterSpacing: {
        widest2: '0.2em',
      },
    },
  },
  plugins: [],
}
