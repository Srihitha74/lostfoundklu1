/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Spotify Dark Theme
        spotify: {
          black: '#000000',
          dark: '#121212',
          card: '#181818',
          elevated: '#282828',
          light: '#B3B3B3',
          white: '#FFFFFF',
          green: '#1DB954',
          greenHover: '#1ED760',
        },
        // Swiggy Orange Accent
        swiggy: {
          orange: '#FF5200',
          orangeLight: '#FF6D3A',
          orangeDark: '#E54800',
        },
        // Combined palette
        primary: '#1DB954',
        primaryHover: '#1ED760',
        accent: '#FF5200',
        accentHover: '#FF6D3A',
        surface: {
          dark: '#121212',
          card: '#181818',
          elevated: '#282828',
          hover: '#3E3E3E',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#B3B3B3',
          muted: '#727272',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Poppins', 'sans-serif'],
      },
      borderRadius: {
        xl: '12px',
        '2xl': '16px',
        '3xl': '24px',
        full: '9999px',
      },
      boxShadow: {
        card: '0 8px 24px rgba(0, 0, 0, 0.5)',
        cardHover: '0 16px 32px rgba(0, 0, 0, 0.6)',
        glowGreen: '0 0 20px rgba(29, 185, 84, 0.4)',
        glowOrange: '0 0 20px rgba(255, 82, 0, 0.4)',
      },
    },
  },
  plugins: [],
};
