import type { Config } from 'tailwindcss'

// Los colores apuntan a variables CSS definidas en app/globals.css.
// Para cambiar la tematica se edita globals.css, no este archivo.
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './config/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        base: 'rgb(var(--c-base) / <alpha-value>)',
        surface: 'rgb(var(--c-surface) / <alpha-value>)',
        ink: 'rgb(var(--c-ink) / <alpha-value>)',
        muted: 'rgb(var(--c-muted) / <alpha-value>)',
        primary: 'rgb(var(--c-primary) / <alpha-value>)',
        accent: 'rgb(var(--c-accent) / <alpha-value>)',
        line: 'rgb(var(--c-line) / <alpha-value>)',
      },
      fontFamily: {
        display: 'var(--f-display)',
        body: 'var(--f-body)',
        cinzel: 'var(--f-titulo)',
        firma: 'var(--f-firma)',
      },
    },
  },
  plugins: [],
}
export default config
