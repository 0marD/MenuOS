import type { Config } from 'tailwindcss';

const config: Omit<Config, 'content'> = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ink: '#0F0E0C',
        paper: '#F5F0E8',
        cream: '#EDE8DC',
        accent: {
          DEFAULT: '#D4500A',
          green: '#2A6B3F',
          blue: '#1A3A5C',
        },
        muted: '#7A7060',
        highlight: '#F7C948',
        rule: '#C8BFA8',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"DM Mono"', '"Fira Code"', 'monospace'],
      },
      fontSize: {
        kds: ['24px', { lineHeight: '1.3' }],
      },
      borderRadius: {
        DEFAULT: '3px',
        sm: '2px',
        md: '4px',
        lg: '6px',
        xl: '8px',
      },
    },
  },
  plugins: [],
};

export default config;
