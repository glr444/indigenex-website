import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': 'var(--bg-primary)',
        'bg-dark': 'var(--bg-dark)',
        'card-caramel': 'var(--card-caramel)',
        'card-taupe': 'var(--card-taupe)',
        'card-sienna': 'var(--card-sienna)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-tertiary': 'var(--text-tertiary)',
        'divider': 'var(--divider)',
      },
      fontFamily: {
        'display': ['Inter', 'system-ui', 'sans-serif'],
        'body': ['Inter', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        'micro': '0.2em',
      },
      maxWidth: {
        '1440': '1440px',
      },
    },
  },
  plugins: [],
}

export default config
