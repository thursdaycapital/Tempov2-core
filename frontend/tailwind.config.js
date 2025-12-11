/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
        colors: {
            'uniswap-pink': '#ff007a',
            'uniswap-dark': '#0d111c',
            'uniswap-card': '#131a2a',
            'uniswap-border': '#293249',
        }
    },
  },
  plugins: [],
}
