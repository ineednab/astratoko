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
        // AstraToko brand colors (dari brand guidelines)
        astrapay: {
          blue: '#1A3CC4',      // primary blue
          'blue-light': '#5C82E8', // blue lighter
          'blue-pale': '#EEF3FF',  // blue tint
          red: '#E31837',
          gold: '#F5A623',
          gray: '#F5F7FA',
        },
        app: {
          blue: '#1A3CC4',      // primary blue
          'blue-light': '#5C82E8',
          'blue-pale': '#EEF3FF',
          cream: '#F1EEE3',     // warm background
          surface: '#F5F2EA',   // card surface
          border: '#E3DFD0',    // border/divider
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
