const colors = require('./src/constants/colors').default

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,jsx,ts,tsx}',
    './src/components/**/*.{js,jsx,ts,tsx}',
    './src/features/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [],
  theme: {
    fontFamily: {
      sans: ['NotoSansKR-Regular'], // Tailwind 기본 sans 덮어쓰기
      thin: ['NotoSansKR-Thin'],
      extraLight: ['NotoSansKR-ExtraLight'],
      light: ['NotoSansKR-Light'],
      regular: ['NotoSansKR-Regular'],
      medium: ['NotoSansKR-Medium'],
      semiBold: ['NotoSansKR-SemiBold'],
      bold: ['NotoSansKR-Bold'],
      extraBold: ['NotoSansKR-ExtraBold'],
      black: ['NotoSansKR-Black'],
    },
    extend: {
      colors: colors,
    },
  },
  plugins: [],
}
