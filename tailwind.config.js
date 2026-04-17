/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        pm: {
          /** Esmeralda Figma (éxito / marca) */
          primary: '#00A884',
          'primary-hover': '#008f72',
          'primary-soft': '#E8F7F4',
          'primary-soft-dark': '#0D3328',
          ink: '#1A2B3E',
          'ink-on-dark': '#E2EAF4',
          /** Fondo app Figma */
          canvas: '#F8F9FA',
          'canvas-dark': '#0F1923',
          surface: '#FFFFFF',
          'surface-dark': '#1A2535',
          muted: '#707E8C',
          'muted-dark': '#94A3B8',
          subtle: '#94A3B8',
          'subtle-dark': '#607080',
          border: '#E2E8F0',
          'border-dark': '#2A3A4E',
          /** Azul suave información */
          info: '#5B8DEF',
          'info-soft': '#E8F1FF',
          warning: '#EAB308',
          'warning-soft': '#FEF9C3',
          /** Coral Figma (alertas / regresión) */
          danger: '#FF5252',
          'danger-dark': '#FF7A7A',
          'danger-bg': '#FFF0F0',
          'danger-bg-dark': '#3D1010',
          coral: '#FF5252',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        /** Tarjetas Figma 16px */
        card: '16px',
        cta: '16px',
        control: '8px',
      },
      boxShadow: {
        'pm-sm': '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        'pm-sm-dark': '0 1px 3px 0 rgba(0, 0, 0, 0.25)',
        'pm-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        'pm-md-dark': '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
      },
    },
  },
  plugins: [],
};
