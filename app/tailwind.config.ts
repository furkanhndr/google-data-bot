import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563EB',
        primaryHover: '#1D4ED8',
        primaryLight: '#EFF6FF',
        secondary: '#64748B',
        success: '#16A34A',
        successLight: '#F0FDF4',
        warning: '#D97706',
        warningLight: '#FFFBEB',
        danger: '#DC2626',
        dangerLight: '#FEF2F2',
        border: '#E2E8F0',
        borderFocus: '#2563EB',
        bg: '#F8FAFC',
        bgCard: '#FFFFFF',
        text: '#0F172A',
        textMuted: '#64748B',
        textLight: '#94A3B8',
        sidebarText: '#CBD5E1',
        sidebar: '#1E293B',
      },
      spacing: {
        '7.5': '30px',
        '2.5': '10px',
      },
      fontSize: {
        xs: '12px',
        sm: '14px',
        base: '16px',
        lg: '18px',
        xl: '20px',
        '2xl': '24px',
      },
      borderRadius: {
        md: '6px',
        lg: '8px',
      },
      zIndex: {
        '60': '60',
        '70': '70',
      },
    },
  },
  plugins: [],
}

export default config
