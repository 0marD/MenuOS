import type { Config } from 'tailwindcss';

const config: Omit<Config, 'content'> = {
  theme: {
    extend: {
      colors: {
        ink: '#0F0E0C',
        paper: '#F5F0E8',
        cream: '#EDE8DC',
        accent: {
          DEFAULT: '#D4500A',
          foreground: '#F5F0E8',
        },
        green: {
          DEFAULT: '#2A6B3F',
          foreground: '#F5F0E8',
        },
        blue: {
          DEFAULT: '#1A3A5C',
          foreground: '#F5F0E8',
        },
        muted: {
          DEFAULT: '#7A7060',
          foreground: '#F5F0E8',
        },
        highlight: '#F7C948',
        rule: '#C8BFA8',
        // shadcn/ui compatible tokens
        background: '#F5F0E8',
        foreground: '#0F0E0C',
        card: {
          DEFAULT: '#EDE8DC',
          foreground: '#0F0E0C',
        },
        primary: {
          DEFAULT: '#D4500A',
          foreground: '#F5F0E8',
        },
        secondary: {
          DEFAULT: '#EDE8DC',
          foreground: '#0F0E0C',
        },
        destructive: {
          DEFAULT: '#DC2626',
          foreground: '#F5F0E8',
        },
        border: '#C8BFA8',
        input: '#C8BFA8',
        ring: '#D4500A',
      },
      fontFamily: {
        display: ['var(--font-playfair)', 'Georgia', 'serif'],
        sans: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-dm-mono)', 'Menlo', 'monospace'],
      },
      borderRadius: {
        lg: '0.75rem',
        md: '0.5rem',
        sm: '0.375rem',
      },
    },
  },
};

export default config;
