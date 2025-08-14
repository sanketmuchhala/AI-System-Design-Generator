/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Geist', 'system-ui', 'sans-serif'],
        'mono': ['Geist Mono', 'Menlo', 'Monaco', 'monospace']
      },
      colors: {
        primary: {
          50: '#f0f9ff',
          500: '#4f46e5',
          600: '#4338ca',
          700: '#3730a3'
        },
        accent: {
          500: '#06d6a0'
        }
      },
      animation: {
        'spin-slow': 'spin 2s linear infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        }
      }
    },
  },
  plugins: [],
}