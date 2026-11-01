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
        pitch: {
          950: 'rgb(var(--pitch-950) / <alpha-value>)',
          900: 'rgb(var(--pitch-900) / <alpha-value>)',
          850: 'rgb(var(--pitch-850) / <alpha-value>)',
          800: 'rgb(var(--pitch-800) / <alpha-value>)',
          750: 'rgb(var(--pitch-750) / <alpha-value>)',
          700: 'rgb(var(--pitch-700) / <alpha-value>)',
          600: 'rgb(var(--pitch-600) / <alpha-value>)',
        },
        coral: {
          400: '#FF5C77',
          500: '#FF385C',
          600: '#E01E45',
        },
        surge: {
          400: '#2EECA3',
          500: '#00D688',
          600: '#00B06F',
        },
        gold: {
          400: '#FFD15C',
          500: '#FFBA08',
          600: '#D99B00',
        }
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-wicket': 'glowRed 1.5s ease-out',
        'glow-boundary': 'glowGreen 1.5s ease-out',
      },
      keyframes: {
        glowRed: {
          '0%': { boxShadow: '0 0 0px rgba(255, 56, 92, 0)' },
          '50%': { boxShadow: '0 0 30px rgba(255, 56, 92, 0.6)' },
          '100%': { boxShadow: '0 0 0px rgba(255, 56, 92, 0)' },
        },
        glowGreen: {
          '0%': { boxShadow: '0 0 0px rgba(0, 214, 136, 0)' },
          '50%': { boxShadow: '0 0 30px rgba(0, 214, 136, 0.6)' },
          '100%': { boxShadow: '0 0 0px rgba(0, 214, 136, 0)' },
        }
      }
    },
  },
  plugins: [],
}
