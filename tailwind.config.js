const plugin = require('tailwindcss/plugin');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        accent: {
          500: '#a855f7',
          600: '#9333ea',
          700: '#7c3aed',
        },
        dark: {
          bg: '#080c14',
          sidebar: '#0b101c',
          card: '#151e33',
          input: '#1a253f',
          hover: '#1f2d4e',
          border: '#243455',
        },
        light: {
          bg: '#f8fafc',
          sidebar: '#ffffff',
          card: '#ffffff',
          input: '#f8fafc',
          hover: '#f1f5f9',
          border: '#e2e8f0',
        }
      },
      fontFamily: {
        heading: ['Outfit', 'sans-serif'],
        body: ['Plus Jakarta Sans', 'sans-serif'],
      },
      boxShadow: {
        'glow-primary': '0 0 20px rgba(59, 130, 246, 0.25)',
        'glow-accent': '0 0 20px rgba(168, 85, 247, 0.25)',
      }
    },
  },
  plugins: [
    plugin(function({ addVariant }) {
      addVariant('light', 'html:not(.dark) &');
    })
  ],
}
