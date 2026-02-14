import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Core palette - Warm Earth Theme
        cream: {
          DEFAULT: '#E8E3CC',
          light: '#F5F2E8',
          dark: '#DDD7C0',
          50: '#FAF9F5',
          100: '#F5F2E8',
          200: '#E8E3CC',
          300: '#DDD7C0',
          400: '#D4CDB8',
          500: '#C5BDA8',
        },
        cinnamon: {
          DEFAULT: '#9C4A29',
          light: '#B85A35',
          dark: '#7D3B21',
          50: '#FDF5F2',
          100: '#F9E8E2',
          200: '#F0C9BC',
          300: '#D4856A',
          400: '#B85A35',
          500: '#9C4A29',
          600: '#7D3B21',
          700: '#5E2C19',
        },
        earth: {
          DEFAULT: '#2D1810',
          light: '#6B5B4F',
          dark: '#1A0E09',
        },
        // Semantic colors
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))'
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        'warm': '0 4px 6px -1px rgba(45, 24, 16, 0.1), 0 2px 4px -1px rgba(45, 24, 16, 0.06)',
        'warm-lg': '0 10px 15px -3px rgba(45, 24, 16, 0.1), 0 4px 6px -2px rgba(45, 24, 16, 0.05)',
        'warm-xl': '0 20px 25px -5px rgba(45, 24, 16, 0.1), 0 10px 10px -5px rgba(45, 24, 16, 0.04)',
        'cinnamon': '0 4px 14px -3px rgba(156, 74, 41, 0.25)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' }
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' }
        },
        'slide-up': {
          from: { transform: 'translateY(10px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-up': 'slide-up 0.3s ease-out'
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
