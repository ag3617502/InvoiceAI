/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#6C63FF',
        'primary-dark': '#4B44CC',
        secondary: '#00C9A7',
        accent: '#FF6B6B',
        warning: '#FFB347',
        success: '#2ECC71',
        background: '#0F0F1A',
        surface: '#1A1A2E',
        surface2: '#16213E',
        border: '#2A2A45',
        'text-primary': '#FFFFFF',
        'text-secondary': '#A0AEC0',
        'text-muted': '#4A5568',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'purple-glow': '0_4px_24px_rgba(108,99,255,0.15)',
      },
      borderRadius: {
        '2xl': '1rem',
        'xl': '0.75rem',
      },
    },
  },
  plugins: [],
};
