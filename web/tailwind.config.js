/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      keyframes: {
        'resync-bar': {
          '0%':   { width: '0%', marginLeft: '0%' },
          '50%':  { width: '60%', marginLeft: '20%' },
          '100%': { width: '0%', marginLeft: '100%' },
        },
      },
      animation: {
        'resync-bar': 'resync-bar 1.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
