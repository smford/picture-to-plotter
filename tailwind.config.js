/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cad: {
          bg: '#0f1115',
          panel: '#181b22',
          panelSub: '#1e222d',
          border: '#2a3140',
          borderLight: '#384257',
          accent: '#00e5ff',
          accentHover: '#33ebff',
          accentDark: '#00a3b8',
          success: '#00e676',
          warning: '#ffb300',
          danger: '#ff3d71',
          text: '#e2e8f0',
          textMuted: '#94a3b8',
          textDim: '#64748b',
          canvasBg: '#090a0f',
          grid: '#1f2536',
          rapidTravel: '#ff4444',
          toolhead: '#00e5ff',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      boxShadow: {
        'glow-accent': '0 0 15px rgba(0, 229, 255, 0.35)',
        'glow-success': '0 0 15px rgba(0, 230, 118, 0.35)',
      }
    },
  },
  plugins: [],
}
