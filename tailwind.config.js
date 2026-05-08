/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          DEFAULT: '#0f172a',
          lighter: '#1e293b',
          lightest: '#334155'
        },
        primary: {
          DEFAULT: '#3b82f6',
          dark: '#2563eb'
        }
      }
    },
  },
  plugins: [],
}
