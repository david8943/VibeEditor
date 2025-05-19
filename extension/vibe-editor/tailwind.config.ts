import { color } from './src/constants/colors'

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/views/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: color,
    },
  },
  plugins: [],
}
