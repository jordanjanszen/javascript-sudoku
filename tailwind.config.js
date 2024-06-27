/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './scripts/main.js',
    './styles/style.css'
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('tailwindcss'),
    require('autoprefixer'),
  ],
}

