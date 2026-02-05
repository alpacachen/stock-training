/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0f',
        surface: '#151520',
        primary: '#00f0ff',
        secondary: '#7c3aed',
        accent: '#10b981',
        danger: '#ef4444',
        muted: '#64748b',
        'surface-light': '#1a1a25',
        'text-primary': '#ffffff',
        'text-secondary': '#e2e8f0',
        'text-muted': '#94a3b8',
        border: 'rgba(255, 255, 255, 0.1)',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'SF Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(0, 240, 255, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(0, 240, 255, 0.8), 0 0 30px rgba(124, 58, 237, 0.4)' },
        },
      },
      backgroundImage: {
        'grid-pattern': 'linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px)',
      },
    },
  },
  plugins: [],
}
