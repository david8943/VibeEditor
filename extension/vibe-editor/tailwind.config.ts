import { color } from './src/constants/colors'

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/views/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: color,
    },
  },
  plugins: [],
}
