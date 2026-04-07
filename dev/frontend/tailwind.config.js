/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        whatsapp: {
          green: '#00a884',
          'dark-green': '#008069',
          'bg-light': '#e9edef',
          'bg-dark': '#0b141a',
          'sender-bg': '#d9fdd3',
          'receiver-bg': '#ffffff',
        }
      },
      fontFamily: {
        sans: ['Segoe UI', 'Helvetica Neue', 'Helvetica', 'Lucida Grande', 'Arial', 'Ubuntu', 'Cantarell', 'Fira Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
