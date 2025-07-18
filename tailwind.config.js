/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'palestine-green': '#006234',
        'palestine-red': '#fe3233',
        'palestine-black': '#000000',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
