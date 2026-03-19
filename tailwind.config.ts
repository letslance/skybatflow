import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary brand — matches ref-code --btn-primary
        primary: {
          DEFAULT: '#03b37f',
          dark:    '#028f66',
          darker:  '#126e51',
        },
        // Background scale — matches ref-code dark theme
        bg: {
          body:    '#23292e',
          surface: '#2d353b',
          card:    '#323b42',
          input:   '#1e2529',
          hover:   '#3a444c',
        },
        // Text
        tx: {
          primary:   '#e0e6ea',
          secondary: '#9aa5b1',
          muted:     '#6b7a87',
        },
        // Betting specifics
        back: {
          DEFAULT: '#f994ba',
          dark:    '#d4709a',
          bg:      '#fce4ef',
        },
        lay: {
          DEFAULT: '#72bbef',
          dark:    '#4d9fd6',
          bg:      '#d4eaf7',
        },
        // Status
        win:    '#03b37f',
        loss:   '#e04b4b',
        void:   '#f0a500',
        // Table header green
        tableHeader: '#126e51',
      },
      fontFamily: {
        sans: ['Noto Sans', 'sans-serif'],
      },
      borderColor: {
        DEFAULT: '#3a444c',
      },
    },
  },
  plugins: [],
}

export default config
