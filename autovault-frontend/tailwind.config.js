/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1e3a8a", // Rich Navy Blue (Professional, Trustworthy)
        secondary: "#f97316", // Vibrant Orange (Energy, Action)
        accent: "#fbbf24", // Gold (Premium, Luxury)
        dark: "#1f2937", // Charcoal (Depth, Sophistication)
        background: "#f8fafc", // Light (Clean Background)
        surface: "#ffffff", // White (Cards)
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
        heading: ['Poppins', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)',
        'gradient-hero': 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #60a5fa 100%)',
        'gradient-dark': 'linear-gradient(180deg, #1f2937 0%, #111827 100%)',
      },
      boxShadow: {
        'premium': '0 20px 60px -15px rgba(0, 0, 0, 0.3)',
        'glow': '0 0 20px rgba(251, 191, 36, 0.4)',
        'glow-orange': '0 0 20px rgba(249, 115, 22, 0.4)',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-left': {
          '0%': { opacity: '0', transform: 'translateX(-30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(251, 191, 36, 0.4)' },
          '50%': { boxShadow: '0 0 30px rgba(251, 191, 36, 0.6)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.8s ease-out forwards',
        'slide-in': 'slide-in 0.8s ease-out forwards',
        'slide-in-left': 'slide-in-left 0.8s ease-out forwards',
        'slide-in-right': 'slide-in-right 0.8s ease-out forwards',
        'float': 'float 3s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
