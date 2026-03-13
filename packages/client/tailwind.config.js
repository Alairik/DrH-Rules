/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        panel: {
          bg: '#1a1a2e',
          border: '#2d2d4e',
          hover: '#252545',
        },
      },
    },
  },
  plugins: [],
}
