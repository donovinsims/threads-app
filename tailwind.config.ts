import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: {
          '0': 'var(--surface-0)',
          '1': 'var(--surface-1)',
          '2': 'var(--surface-2)',
        },
        text: {
          '0': 'var(--text-0)',
          '1': 'var(--text-1)',
          '2': 'var(--text-2)',
        },
        border: {
          '0': 'var(--border-0)',
          '1': 'var(--border-1)',
          '2': 'var(--border-2)',
        },
        link: 'var(--link)',
      },
    },
  },
  plugins: [],
}

export default config