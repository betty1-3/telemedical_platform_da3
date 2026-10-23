export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        editorial: ['DM Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c233c',
          950: '#071526',
        },
        ink: {
          DEFAULT: '#0f172a',
          muted: '#475569',
          soft: '#94a3b8',
        },
        line: {
          DEFAULT: '#e2e8f0',
          strong: '#cbd5e1',
        },
        canvas: '#f8fafc',
        pastel: {
          yellow: '#e0f2fe',
          pink: '#dcfce7',
          lavender: '#ccfbf1',
          olive: '#e0e7ff',
          blue: '#cffafe',
        },
        status: {
          ok: '#059669',
          okbg: '#ecfdf5',
          warn: '#d97706',
          warnbg: '#fffbeb',
          bad: '#dc2626',
          badbg: '#fef2f2',
          info: '#0284c7',
          infobg: '#f0f9ff',
        },
      },
      borderRadius: {
        DEFAULT: '6px',
        md: '8px',
        lg: '10px',
        xl: '12px',
      },
      boxShadow: {
        panel: '0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.05)',
        pop: '0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)',
      },
      fontSize: {
        '2xs': ['11px', '15px'],
      },
    },
  },
}
