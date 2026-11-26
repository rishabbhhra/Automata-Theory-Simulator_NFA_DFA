/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Space Mono', 'monospace'],
      },
      colors: {
        brand: {
          cyan: '#06b6d4',
          sky: '#38bdf8',
          purple: '#8b5cf6',
          indigo: '#6366f1',
          green: '#10b981',
          red: '#f43f5e',
          amber: '#f59e0b',
        },
        surface: {
          950: '#060911',
          900: '#0a0f1d',
          850: '#0f172a',
          800: '#131e36',
          700: '#1b2a4a',
          600: '#23355d',
          500: '#2f4577',
        }
      },
      animation: {
        'pulse-cyan': 'pulse-cyan 1.5s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        'pulse-cyan': {
          '0%, 100%': { boxShadow: '0 0 10px rgba(6,182,212,0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(6,182,212,0.8), 0 0 60px rgba(6,182,212,0.4)' },
        },
        'glow': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.6 },
        }
      }
    },
  },
  plugins: [],
}
