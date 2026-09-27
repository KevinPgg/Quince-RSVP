/**
 * Volutas de oro con una joya al centro, bajo cada título de sección.
 * Más ornamental que `Filigrana`, que es la línea con el corazón bajo los
 * nombres. Las líneas van en color sólido y no con el degradado `t-oro`:
 * un trazo horizontal tiene caja de alto cero y el degradado en
 * `objectBoundingBox` no se pinta.
 */
export default function Ornamento({ className = '' }: { className?: string }) {
  return (
    <div className={`flex justify-center ${className}`} aria-hidden>
      <svg width="180" height="18" viewBox="0 0 180 18" fill="none">
        <path d="M4 9 H62 M176 9 H118" stroke="#c08a2e" strokeWidth="1" />
        <g stroke="#c08a2e" strokeWidth="1" fill="none">
          <path d="M62 9 C70 1 78 1 80 7 C81 11 76 12 75 9" />
          <path d="M118 9 C110 1 102 1 100 7 C99 11 104 12 105 9" />
          <path d="M62 9 C70 17 78 17 80 11" />
          <path d="M118 9 C110 17 102 17 100 11" />
        </g>
        <path d="M90 2 l6 7 -6 7 -6 -7z" fill="url(#t-joya)" stroke="#c08a2e" strokeWidth=".8" />
        <circle cx="4" cy="9" r="1.6" fill="#c08a2e" />
        <circle cx="176" cy="9" r="1.6" fill="#c08a2e" />
      </svg>
    </div>
  )
}
