/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: '#faf6ec',
          2: '#f3ecd8',
          3: '#ebe2c8',
        },
        ink: {
          DEFAULT: '#0d0d0c',
          2: '#2a2925',
          soft: '#6b6b65',
          faint: '#a8a59e',
        },
        rule: {
          DEFAULT: '#d4cdb8',
          strong: '#bab39c',
        },
        oxblood: {
          DEFAULT: '#8a1c1c',
          deep: '#5e1313',
        },
        mustard: {
          DEFAULT: '#b88a1f',
          soft: '#d4af5c',
        },
        olive: '#5a6b3f',
        teal: '#2c5d63',
      },
      fontFamily: {
        serif: ['Fraunces', 'serif'],
        sans: ['Geist', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        widest2: '0.18em',
      },
      boxShadow: {
        paper: '0 1px 0 0 rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.04)',
        deep: '0 30px 60px -25px rgba(13, 13, 12, 0.25)',
      },
    },
  },
  plugins: [],
}
