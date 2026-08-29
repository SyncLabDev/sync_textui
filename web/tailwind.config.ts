import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        sync: {
          bg: '#060810',
          surface: '#0D111B',
          raised: '#121927',
          accent: '#6BBFFF',
          text: '#FFFFFF',
          muted: '#8B96A8',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        body: ['Rajdhani', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config
