/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          deep:     '#0A0A0F',
          surface:  '#13111C',
          elevated: '#1C1828',
          hover:    '#231F35',
        },
        border: {
          DEFAULT: '#2E2A45',
          subtle:  '#1E1A30',
          focus:   '#7C3AED',
        },
        purple: {
          DEFAULT: '#7C3AED',
          dark:    '#5B21B6',
          light:   '#9F67FF',
          muted:   '#4C1D95',
          glow:    '#7C3AED33',
          subtle:  '#7C3AED15',
        },
        text: {
          primary:   '#F8F7FF',
          secondary: '#9B8EC4',
          muted:     '#6B6494',
          inverse:   '#0A0A0F',
        },
        success: {
          DEFAULT: '#10B981',
          subtle:  '#10B98115',
          dark:    '#065F46',
        },
        warning: {
          DEFAULT: '#F59E0B',
          subtle:  '#F59E0B15',
        },
        danger: {
          DEFAULT: '#F43F5E',
          subtle:  '#F43F5E15',
        },
        // Keep legacy aliases for any existing code
        primary: {
          DEFAULT: '#7C3AED',
          500: '#7C3AED',
          foreground: '#F8F7FF',
        },
      },
      boxShadow: {
        'purple-glow':    '0 0 20px #7C3AED33',
        'purple-glow-lg': '0 0 40px #7C3AED44',
        'card':           '0 4px 24px rgba(0,0,0,0.4)',
        'card-hover':     '0 8px 32px rgba(0,0,0,0.6)',
      },
      backgroundImage: {
        'purple-gradient': 'linear-gradient(135deg, #7C3AED, #5B21B6)',
        'card-gradient':   'linear-gradient(145deg, #13111C, #1C1828)',
        'hero-glow':       'radial-gradient(ellipse at 50% 0%, #7C3AED22 0%, transparent 70%)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        float1: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '33%':      { transform: 'translate(30px, -30px)' },
          '66%':      { transform: 'translate(-20px, 20px)' },
        },
        float2: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '33%':      { transform: 'translate(-25px, 20px)' },
          '66%':      { transform: 'translate(15px, -15px)' },
        },
        float3: {
          '0%, 100%': { transform: 'translate(-50%, -50%)' },
          '33%':      { transform: 'translate(calc(-50% + 20px), calc(-50% - 20px))' },
          '66%':      { transform: 'translate(calc(-50% - 15px), calc(-50% + 10px))' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        countUp: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          from: { opacity: '0', transform: 'translateX(100%)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        slideInBottom: {
          from: { opacity: '0', transform: 'translateY(100%)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        bounceIcon: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%':      { transform: 'scale(1.2)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.5' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-4px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(4px)' },
        },
      },
      animation: {
        float1:         'float1 20s infinite ease-in-out',
        float2:         'float2 25s infinite ease-in-out',
        float3:         'float3 30s infinite ease-in-out',
        shimmer:        'shimmer 1.5s infinite linear',
        countUp:        'countUp 600ms ease-out forwards',
        slideUp:        'slideUp 300ms ease-out forwards',
        slideInRight:   'slideInRight 300ms ease-out forwards',
        slideInBottom:  'slideInBottom 300ms ease-out forwards',
        fadeIn:         'fadeIn 300ms ease-out forwards',
        bounceIcon:     'bounceIcon 200ms ease-out',
        shake:          'shake 400ms ease-out',
      },
    },
  },
  plugins: [],
}
