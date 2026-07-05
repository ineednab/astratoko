import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // AstraToko Brand Colors — dari official brand guidelines v1.0
        brand: {
          primary:     '#1A3CC4', // Blue Core — CTAs, primary actions
          mid:         '#2E59DC', // Blue Mid — hover states
          light:       '#5C82E8', // Blue Light — disabled, decorative
          pale:        '#EEF1FB', // Blue Pale — tinted bg, focus bg
          surface:     '#F1EEE3', // Cream BG — app background
          card:        '#F5F2EA', // Cream Card — card surfaces
          border:      '#E3DFD0', // borders, dividers, input borders
          success:     '#1A7A4A',
          'success-bg':'#E8F5EE',
          error:       '#C41A1A',
          'error-bg':  '#FBF0EE',
          warning:     '#A05A00',
          'warning-bg':'#FBF4E6',
          gold:        '#F5A623', // AstraPoints
        },
        // Aliases yang sudah dipakai di codebase
        app: {
          blue:        '#1A3CC4',
          'blue-light':'#2E59DC',
          'blue-pale': '#EEF1FB',
          cream:       '#F1EEE3',
          surface:     '#F5F2EA',
          border:      '#E3DFD0',
        },
        astrapay: {
          blue:        '#1A3CC4',
          'blue-light':'#2E59DC',
          'blue-pale': '#EEF1FB',
          red:         '#C41A1A',
          gold:        '#F5A623',
          gray:        '#F5F2EA',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'], // Space Grotesk
        sans:    ['var(--font-body)',    'system-ui', 'sans-serif'], // Hanken Grotesk
        mono:    ['var(--font-mono)',    'ui-monospace', 'monospace'], // JetBrains Mono
      },
      fontSize: {
        'display': ['32px', { lineHeight: '1.1', fontWeight: '700' }],
        'h1':      ['26px', { lineHeight: '1.2', fontWeight: '700' }],
        'h2':      ['21px', { lineHeight: '1.25', fontWeight: '700' }],
        'h3':      ['17px', { lineHeight: '1.35', fontWeight: '600' }],
        'body':    ['16px', { lineHeight: '1.5',  fontWeight: '400' }],
        'label':   ['14px', { lineHeight: '1.4',  fontWeight: '500' }],
        'caption': ['12px', { lineHeight: '1.4',  fontWeight: '400' }],
        'mono':    ['13px', { lineHeight: '1.4',  fontWeight: '500' }],
      },
      borderRadius: {
        'sm':   '8px',
        'md':   '12px',
        'lg':   '16px',
        'xl':   '24px',
        'pill': '100px',
      },
      spacing: {
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '24px',
        '6': '32px',
      },
      boxShadow: {
        'float':  '0 2px 8px rgba(26,60,196,0.10)',
        'modal':  '0 8px 24px rgba(26,60,196,0.15)',
        'none':   'none',
      },
      transitionDuration: {
        'fast':    '150ms',
        'default': '250ms',
      },
      transitionTimingFunction: {
        'fast':    'ease-out',
        'default': 'ease-in-out',
      },
      keyframes: {
        fadein: {
          '0%':   { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        fadein: 'fadein 0.4s ease-out forwards',
      },
      height: {
        'btn':    '50px',
        'input':  '52px',
        'nav':    '60px',
        'topbar': '56px',
      },
      minWidth: {
        'btn': '120px',
      },
    },
  },
  plugins: [],
};
export default config;
