/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Cairo', 'Tajawal', 'system-ui', 'sans-serif'],
        display: ['Cairo', 'Tajawal', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#eef4ff',
          100: '#d9e6ff',
          200: '#bcd3ff',
          300: '#8eb6ff',
          400: '#598dff',
          500: '#3366ff',
          600: '#1f48f5',
          700: '#1733e1',
          800: '#1a2bb6',
          900: '#0f1a3d',
          950: '#0a1230',
        },
        beige: {
          50: '#fbf8f1',
          100: '#f5efe0',
          200: '#ebe0c4',
        },
        gold: {
          50: '#fff8ec',
          100: '#ffefd0',
          200: '#ffdb9b',
          300: '#ffc15c',
          400: '#ffa72b',
          500: '#f98608',
          600: '#dd6402',
          700: '#b74506',
          800: '#94360c',
          900: '#7a2d0d',
        },
      },
      boxShadow: {
        soft: '0 2px 12px -2px rgba(15, 26, 61, 0.08)',
        card: '0 4px 24px -6px rgba(15, 26, 61, 0.12)',
        glow: '0 0 0 4px rgba(249, 134, 8, 0.15)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'slide-in': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
        'slide-in': 'slide-in 0.25s ease-out',
        shimmer: 'shimmer 2s linear infinite',
      },
    },
  },
  plugins: [],
};
