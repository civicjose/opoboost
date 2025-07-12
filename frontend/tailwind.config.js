// frontend/tailwind.config.js
import defaultTheme from 'tailwindcss/defaultTheme';

export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      // --- AÑADIMOS LA CONFIGURACIÓN DE LA FUENTE ---
      fontFamily: {
        // 'sans' es la fuente por defecto de Tailwind.
        // La sobreescribimos para que use 'Lexend' primero.
        sans: ['Lexend', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        primary: '#1E3A8A',
        secondary: '#14B8A6',
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
    },
  },
  plugins: [],
};