/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          light: '#ffffff',
          dark: '#141516',
        },
        text: {
          light: '#1a1a1a',
          dark: '#ffffff',
        },
        accent: {
          primary: '#228B22',
          secondary: '#fb562f',
          highlight: '#ffffff',
        },
      },
    },
  },
  plugins: [],
}