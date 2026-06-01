/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#0d1117',
        secondary: '#161b22',
        accent: '#4a8cc4',
        'accent-light': '#6aaee0',
      },
    },
  },
  plugins: [],
}

