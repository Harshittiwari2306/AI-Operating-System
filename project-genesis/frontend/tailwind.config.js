/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          dark: '#0A0915',
          card: 'rgba(20, 18, 40, 0.45)',
          teal: '#00F2FE',
          violet: '#9F7AEA',
          pink: '#FF007A',
          mint: '#00F5A0',
          border: 'rgba(255, 255, 255, 0.08)',
          glow: 'rgba(159, 122, 234, 0.15)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
