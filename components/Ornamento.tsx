/**
 * Filigrana de oro para separar secciones. Más ornamental que `Filigrana`,
 * que es la línea con el corazón bajo los nombres.
 *
 * Es SVG en línea y no un archivo: son 40 líneas que no justifican una
 * petición HTTP, y así hereda `currentColor` si algún día hace falta.
 */
export default function Ornamento({ className = '' }: { className?: string }) {
  return (
    <div className={`flex justify-center ${className}`} aria-hidden>
      <svg width="168" height="20" viewBox="0 0 168 20" fill="none">
        <g stroke="#c08a2e" strokeWidth="1.1" strokeLinecap="round" fill="none">
          {/* Volutas enfrentadas */}
          <path d="M6 10c14 0 20-6 30-6s14 5 22 5" opacity=".55" />
          <path d="M162 10c-14 0-20-6-30-6s-14 5-22 5" opacity=".55" />
          <path d="M30 10c6 0 9 4 15 4s9-4 15-4" opacity=".8" />
          <path d="M138 10c-6 0-9 4-15 4s-9-4-15-4" opacity=".8" />
        </g>
        {/* Rombo central */}
        <path d="M84 3.5 88.5 10 84 16.5 79.5 10Z" fill="#c08a2e" opacity=".85" />
        <circle cx="70" cy="10" r="1.8" fill="#c2417d" opacity=".75" />
        <circle cx="98" cy="10" r="1.8" fill="#c2417d" opacity=".75" />
      </svg>
    </div>
  )
}
