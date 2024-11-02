/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./editors/**/*.{js,jsx}",
    "./index.html",
  ],
  theme: {
    extend: {
      colors: {
        'slime': {
          400: '#a2ff00',
          500: '#91e600',
        },
        'neonorange': {
          400: '#ff9100',
          500: '#ff7b00',
        },
        'neonpink': {
          400: '#ff00e6',
          500: '#e600ff',
        },
        'violet': {
          500: '#af67de',
          600: '#9747ff',
          700: '#8034bd',
        },
      }
    }
  },
  plugins: [],
}
