/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ivory: '#fffaf6',
        pearl: '#f8efe7',
        blush: '#f3d9d3',
        champagne: '#d8b76a',
        espresso: '#3f342d',
        ink: '#27211d',
      },
      boxShadow: {
        soft: '0 18px 50px rgba(63, 52, 45, 0.08)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
