import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class', // use class-based dark mode (set by color-mode)
  theme: {
    extend: {
      colors: {
        // use your CSS variables here
        bg: 'rgb(var(--ui-bg) / <alpha-value>)',
        neutral: 'rgb(var(--ui-neutral) / <alpha-value>)',
        primary: 'rgb(var(--ui-primary) / <alpha-value>)',
        accent: 'rgb(var(--ui-accent) / <alpha-value>)',
      }
    }
  }
} satisfies Config
