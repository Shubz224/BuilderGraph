/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // OriginTrail color palette
        primary: {
          DEFAULT: '#7B61FF',
          light: '#9B84FF',
          dark: '#6B4CE6',
        },
        accent: {
          DEFAULT: '#00D9FF',
          light: '#32B8C6',
          dark: '#00B8D9',
        },
        background: {
          DEFAULT: '#000000',
          card: '#1A1A1A',
          elevated: '#1F1F1F',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#A0ADB5',
          muted: '#6B7280',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Rajdhani', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
