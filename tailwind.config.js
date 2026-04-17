/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        pm: {
          primary: '#00A781',
          'primary-hover': '#009670',
          ink: '#1A2B3E',
          'ink-on-dark': '#E2EAF4',
          canvas: '#F8FAFC',
          'canvas-dark': '#0F1923',
          surface: '#FFFFFF',
          'surface-dark': '#1A2535',
          muted: '#707E8C',
          'muted-dark': '#94A3B8',
          subtle: '#94A3B8',
          'subtle-dark': '#607080',
          border: '#E2E8F0',
          'border-dark': '#2A3A4E',
          info: '#4D94FF',
          warning: '#FFB84D',
          danger: '#FF5C5C',
          'danger-dark': '#FF8080',
          'danger-bg': '#FFF0F0',
          'danger-bg-dark': '#3D1010',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '12px',
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
