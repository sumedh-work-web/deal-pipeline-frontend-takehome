/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
          'Apple Color Emoji',
          'Segoe UI Emoji',
        ],
      },
      colors: {
        ink: '#18222f',
        paper: '#f4f7fb',
        primary: '#2563eb',
        primarySoft: '#eff6ff',
        moss: '#2f6f5e',
        sea: '#26748c',
        clay: '#9a5f3f',
        signal: '#d99a2b',
      },
      boxShadow: {
        soft: '0 22px 70px -36px rgba(24, 34, 47, 0.4)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.2s ease-out',
      },
    },
  },
  plugins: [],
};
