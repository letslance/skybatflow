import type { Config } from 'tailwindcss'

/**
 * Typography scale (base = 13px to match GARUDA7777 reference design):
 *   text-2xs  = 10px  — tiny chips, section labels
 *   text-xs   = 11px  — badges, sub-captions
 *   text-sm   = 12px  — muted / secondary text, table sub-values
 *   text-base = 13px  — body text, table cells, buttons, form inputs  ← default
 *   text-md   = 14px  — sub-headings, form labels
 *   text-lg   = 15px  — card titles
 *   text-xl   = 16px  — page headings
 *   text-2xl  = 18px  — large stats / KPI values
 *   text-3xl  = 22px  — dashboard big numbers
 */

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    // Override the entire fontSize scale so every text-* class maps to our 13px base
    fontSize: {
      '2xs':  ['10px', { lineHeight: '1.4' }],
      'xs':   ['11px', { lineHeight: '1.4' }],
      'sm':   ['12px', { lineHeight: '1.5' }],
      'base': ['13px', { lineHeight: '1.5' }],
      'md':   ['14px', { lineHeight: '1.5' }],
      'lg':   ['15px', { lineHeight: '1.5' }],
      'xl':   ['16px', { lineHeight: '1.4' }],
      '2xl':  ['18px', { lineHeight: '1.3' }],
      '3xl':  ['22px', { lineHeight: '1.3' }],
      '4xl':  ['28px', { lineHeight: '1.2' }],
    },
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
          sidebar: '#16191c',
          surface: '#2d353b',
          card:    '#2e3439',
          input:   '#1e2529',
          header:  '#1a2025',   // user header + betslip background
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
        sans: ['Noto Sans', 'Hind', 'sans-serif'],
      },
      borderColor: {
        DEFAULT: '#3a444c',
      },
    },
  },
  plugins: [],
}

export default config
