module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dream': {
          'purple': '#8B5CF6',
          'pink': '#EC4899',
          'blue': '#3B82F6',
          'dark': '#1F2937',
          'darker': '#111827'
        }
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          'from': { boxShadow: '0 0 10px #8B5CF6, 0 0 20px #8B5CF6' },
          'to': { boxShadow: '0 0 20px #8B5CF6, 0 0 30px #8B5CF6' },
        }
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}