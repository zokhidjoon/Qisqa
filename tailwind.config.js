/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#FF4500',
          50: '#FFF3EF',
          100: '#FFE3D9',
          200: '#FFBEA8',
          300: '#FF9675',
          400: '#FF6B3F',
          500: '#FF4500',
          600: '#E03D00',
          700: '#B53300',
          800: '#7F2300',
          900: '#3D1100',
          950: '#1A0A00'
        }
      },
      boxShadow: {
        ring: '0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.08)'
      },
      borderRadius: {
        xl: '12px',
        '2xl': '16px'
      }
    }
  },
  plugins: [require('@tailwindcss/typography'), require('@tailwindcss/forms'), require('@tailwindcss/container-queries')]
}
