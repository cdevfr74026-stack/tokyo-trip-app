/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: '#F6F1E7',
          soft: '#F1EADB',
          card: '#FCFAF5',
        },
        milktea: {
          DEFAULT: '#C9A57E',
          light: '#E4D2B4',
          dark: '#A9835C',
        },
        khaki: '#D9CBAD',
        warmgray: {
          DEFAULT: '#8C8375',
          light: '#B6AC9C',
          dark: '#5F5747',
        },
        sage: {
          DEFAULT: '#8FA286',
          light: '#B4C4AC',
          dark: '#6C7F63',
        },
        matcha: {
          DEFAULT: '#A6AD79',
          light: '#C7CDA0',
        },
        mist: {
          DEFAULT: '#A7BEC9',
          light: '#CBDBE2',
        },
        wood: {
          DEFAULT: '#8B6B4A',
          light: '#B99B78',
        },
        apricot: {
          DEFAULT: '#E3A868',
          light: '#F0C899',
        },
        butter: '#EFDDA3',
        ink: {
          DEFAULT: '#3D3630',
          soft: '#5C5347',
        },
        // Dark mode 暖色系深色
        dusk: {
          bg: '#2A2622',
          card: '#332C25',
          coffee: '#3B2E26',
          pine: '#26302A',
          border: '#463C32',
        },
      },
      fontFamily: {
        display: ['"Zen Maru Gothic"', '"Noto Sans TC"', 'sans-serif'],
        body: ['"Noto Sans TC"', '"Zen Maru Gothic"', 'sans-serif'],
        utility: ['Inter', '"Noto Sans TC"', 'sans-serif'],
      },
      borderRadius: {
        soft: '1.25rem',
        card: '1.5rem',
        pill: '999px',
      },
      boxShadow: {
        soft: '0 4px 20px -4px rgba(92, 74, 52, 0.12)',
        card: '0 2px 12px -2px rgba(92, 74, 52, 0.10)',
        lift: '0 8px 28px -6px rgba(92, 74, 52, 0.18)',
      },
      backgroundImage: {
        'grain': "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E\")",
      },
      keyframes: {
        'stamp-in': {
          '0%': { transform: 'scale(1.6) rotate(-8deg)', opacity: '0' },
          '60%': { transform: 'scale(0.95) rotate(2deg)', opacity: '1' },
          '100%': { transform: 'scale(1) rotate(-4deg)', opacity: '1' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'check-pop': {
          '0%': { transform: 'scale(0.6)', opacity: '0' },
          '70%': { transform: 'scale(1.15)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        'stamp-in': 'stamp-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'float-slow': 'float-slow 4s ease-in-out infinite',
        'check-pop': 'check-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
}
