/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'slime': {
          400: '#A3E635',
          500: '#84CC16',
        },
        'neonorange': {
          400: '#FB923C',
          500: '#F97316',
        },
        'neonpink': {
          500: '#EC4899',
        },
        'violet': {
          600: '#7C3AED',
          700: '#6D28D9',
        }
      }
    },
  },
  plugins: [],
}