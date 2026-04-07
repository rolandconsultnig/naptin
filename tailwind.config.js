export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        jakarta: ['"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        naptin: {
          green: '#006838',
          dark: '#004D28',
          light: '#E8F5EE',
          gold: '#FFD700',
          'gold-dark': '#E6C200',
        }
      }
    }
  },
  plugins: []
}
