import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Signal Guard AI Brand Palette
        brand: {
          navy:  '#0B1F33',   // Deep Navy — primary brand
          teal:  '#14B8A6',   // Teal — AI/signal/accent
          white: '#F8FAFC',   // Clean background/text
          slate: '#64748B',   // Supporting text/UI
          gold:  '#D4A017',   // High-confidence / Grade A
        },
        // Semantic aliases
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        primary: {
          DEFAULT: '#14B8A6',   // Teal as primary action
          foreground: '#F8FAFC',
        },
        secondary: {
          DEFAULT: '#0B1F33',
          foreground: '#F8FAFC',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: '#14B8A6',
      },
      borderRadius: { lg: 'var(--radius)', md: 'calc(var(--radius) - 2px)', sm: 'calc(var(--radius) - 4px)' },
    },
  },
  plugins: [],
}
export default config
