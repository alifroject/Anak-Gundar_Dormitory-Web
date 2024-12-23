/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}', // Note the addition of the `app` directory.
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx}',

    // Or if using `src` directory:
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      screens: {
        xs: '200px', // Defines `xs` as a custom breakpoint at 400px
        '240px': '240px',
        '770px': '770px',
        '995px': '995px',
        '1026px': '1026px',
      }
    },
  },
  plugins: [],
}