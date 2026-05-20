/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        coal: '#0d0d0d',
        ember: '#17120d',
        gold: {
          300: '#f0d080',
          400: '#e2b96f',
          500: '#c9a84c',
          700: '#7f6424'
        }
      },
      fontFamily: {
        arabic: ['Cairo', 'Noto Naskh Arabic', 'serif'],
        display: ['Noto Naskh Arabic', 'Cairo', 'serif']
      },
      boxShadow: {
        gold: '0 0 0 1px rgba(201, 168, 76, 0.25), 0 18px 60px rgba(0, 0, 0, 0.28)'
      }
    }
  },
  plugins: []
};

