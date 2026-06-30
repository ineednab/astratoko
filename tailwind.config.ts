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
        background: "var(--background)",
        foreground: "var(--foreground)",
        astrapay: {
          blue: '#003087',
          'blue-light': '#0050CC',
          'blue-pale': '#E8F0FE',
          red: '#E31837',
          gold: '#F5A623',
          gray: '#F5F7FA',
        },
        app: {
          blue: '#3B5BDB',
          'blue-light': '#4C6EF5',
          'blue-pale': '#EEF2FF',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
