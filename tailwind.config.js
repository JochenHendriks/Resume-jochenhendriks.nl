/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './template.html',
    './index.html',
    './build.js',
    './resume.json',
    './ui-config.json'
  ],
  darkMode: 'class',
  safelist: [
    'bg-[#fef3c7]', 'bg-[#ccfbf1]', 'bg-[#fef08a]', 'bg-[#ffe4e6]', 'bg-[#f0fdfa]', 'bg-[#f8fafc]',
    'text-amber-950', 'text-teal-950', 'text-yellow-950', 'text-rose-950',
    'border-amber-300', 'border-teal-300', 'border-yellow-300', 'border-rose-300', 'border-teal-200', 'border-slate-300',
    'rotate-1', '-rotate-1', 'rotate-1.5', '-rotate-1.5', 'rotate-[1.2deg]', 'rotate-[-0.8deg]',
    'grid-cols-1', 'grid-cols-2', 'grid-cols-3', 'grid-cols-4', 'sm:grid-cols-3', 'sm:grid-cols-4'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Shantell Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        hand: ['"Caveat"', 'cursive', 'sans-serif'],
        marker: ['"Permanent Marker"', 'cursive', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e',
        },
        paper: {
          yellow: '#fef08a',
          rose: '#ffe4e6',
          teal: '#ccfbf1',
          amber: '#fef3c7',
          slate: '#f8fafc',
        }
      },
      boxShadow: {
        'postit': '2px 4px 10px rgba(0,0,0,0.15)',
        'board': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      }
    }
  },
  plugins: []
};
