/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#f5f4ef',
        surface: {
          DEFAULT: '#ffffff',
          2: '#ebe9e2',
          3: '#e1dfd6',
        },
        ink: {
          DEFAULT: '#0a0a0a',
          2: '#1f1f1d',
        },
        muted: '#6b6862',
        soft: '#a8a59e',
        line: '#e6e3d8',
        lime: {
          DEFAULT: '#d4ff3a',
          deep: '#b9e620',
          soft: '#effbb0',
        },
        coral: '#ff6a4a',
        azure: '#4a7dff',
        plum: '#b94a8e',
        moss: '#5a8a3f',
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'sans-serif'],
        sans: ['Outfit', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      letterSpacing: {
        tightest2: '-0.04em',
      },
    },
  },
  plugins: [],
}
