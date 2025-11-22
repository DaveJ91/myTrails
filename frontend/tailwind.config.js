/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'forest-dark': '#1a3d0a',
        'forest-medium': '#2d5016',
        'forest-light': '#4a7c2c',
        'forest-accent': '#6b9d3e',
        'earth-brown': '#8b6f47',
        'earth-light': '#d4a574',
        'cream': '#f5f1e8',
        'moss': '#7a9b76',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
