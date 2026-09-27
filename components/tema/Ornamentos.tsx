/**
 * Piezas vectoriales del tema: oro, perlas, joyas, corona, volutas.
 *
 * Todo lo que antes venía de imágenes generadas se dibuja aquí. Los
 * degradados se definen UNA vez en `<DefsTema />` (montado en el layout) y
 * cada pieza los referencia por id, así una página con veinte perlas no
 * repite veinte `<defs>`.
 */

/** Degradados compartidos. Va una sola vez, en `app/layout.tsx`. */
export function DefsTema() {
  return (
    <svg width="0" height="0" aria-hidden style={{ position: 'absolute' }}>
      <defs>
        <linearGradient id="t-oro" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f6e4b4" />
          <stop offset=".3" stopColor="#c08a2e" />
          <stop offset=".55" stopColor="#f9efcf" />
          <stop offset=".8" stopColor="#a8741f" />
          <stop offset="1" stopColor="#eed9a4" />
        </linearGradient>
        <radialGradient id="t-perla" cx=".35" cy=".3" r=".7">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset=".45" stopColor="#f6eefb" />
          <stop offset="1" stopColor="#cdb7de" />
        </radialGradient>
        <radialGradient id="t-joya" cx=".35" cy=".3" r=".8">
          <stop offset="0" stopColor="#ffd0e6" />
          <stop offset=".5" stopColor="#c2417d" />
          <stop offset="1" stopColor="#7a1048" />
        </radialGradient>
      </defs>
    </svg>
  )
}

export function Corona({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 70 48" aria-hidden className={className} style={style}>
      <path
        d="M6 40 L3 14 L18 26 L27 6 L35 22 L43 6 L52 26 L67 14 L64 40 Z"
        fill="url(#t-oro)" stroke="#9c6d1f" strokeWidth=".8" strokeLinejoin="round"
      />
      <rect x="5" y="39" width="60" height="7" rx="2" fill="url(#t-oro)" stroke="#9c6d1f" strokeWidth=".8" />
      <circle cx="3" cy="13" r="3" fill="url(#t-perla)" />
      <circle cx="67" cy="13" r="3" fill="url(#t-perla)" />
      <circle cx="27" cy="5" r="3" fill="url(#t-perla)" />
      <circle cx="43" cy="5" r="3" fill="url(#t-perla)" />
      <path d="M35 14 l4 7 -4 7 -4 -7z" fill="url(#t-joya)" />
      <circle cx="20" cy="42.5" r="2" fill="url(#t-joya)" />
      <circle cx="35" cy="42.5" r="2.4" fill="url(#t-joya)" />
      <circle cx="50" cy="42.5" r="2" fill="url(#t-joya)" />
    </svg>
  )
}

/**
 * Collar de perlas en círculo. Las posiciones se calculan en el servidor:
 * son deterministas, así que no hay riesgo de error de hidratación.
 */
export function CollarPerlas({ n = 36, className = '' }: { n?: number; className?: string }) {
  const c = 108
  const r = 104
  return (
    <svg viewBox="0 0 216 216" aria-hidden className={className} style={{ overflow: 'visible' }}>
      {Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2
        return (
          <circle
            key={i}
            cx={(c + r * Math.cos(a)).toFixed(1)}
            cy={(c + r * Math.sin(a)).toFixed(1)}
            r={i % 2 ? 2.6 : 3.6}
            fill="url(#t-perla)"
            stroke="rgba(160,120,190,.35)"
            strokeWidth=".4"
          />
        )
      })}
    </svg>
  )
}

/** Voluta de esquina. Se orienta con `scale` desde `Esquinas`. */
function Voluta({ className, style }: { className: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 30 30" aria-hidden className={className} style={style}>
      <path d="M2 28 C2 12 12 2 28 2" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <path d="M6 28 C6 18 10 12 16 10 C12 14 12 18 16 18 C19 18 20 15 18 13" fill="none" stroke="currentColor" strokeWidth="1" />
      <circle cx="4" cy="4" r="2" fill="currentColor" />
    </svg>
  )
}

/** Volutas de oro en las esquinas de una `.tarjeta-real`. */
export function Esquinas({ donde = 'todas' }: { donde?: 'todas' | 'arriba' | 'abajo' }) {
  const base = 'pointer-events-none absolute h-[30px] w-[30px] text-accent'
  return (
    <>
      {donde !== 'abajo' && (
        <>
          <Voluta className={`${base} left-[3px] top-[3px]`} />
          <Voluta className={`${base} right-[3px] top-[3px]`} style={{ scale: '-1 1' }} />
        </>
      )}
      {donde !== 'arriba' && (
        <>
          <Voluta className={`${base} bottom-[3px] left-[3px]`} style={{ scale: '1 -1' }} />
          <Voluta className={`${base} bottom-[3px] right-[3px]`} style={{ scale: '-1 -1' }} />
        </>
      )}
    </>
  )
}

/** Lazo de oro con joya, para el remate de los camafeos. */
export function Lazo({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 44 24" aria-hidden className={className}>
      <path d="M22 12 C14 2 3 2 3 10 C3 17 13 16 22 12Z" fill="url(#t-oro)" stroke="#9c6d1f" strokeWidth=".7" />
      <path d="M22 12 C30 2 41 2 41 10 C41 17 31 16 22 12Z" fill="url(#t-oro)" stroke="#9c6d1f" strokeWidth=".7" />
      <path d="M20 13 L15 23 M24 13 L29 23" stroke="#c08a2e" strokeWidth="2" strokeLinecap="round" />
      <circle cx="22" cy="12" r="3.4" fill="url(#t-joya)" />
    </svg>
  )
}

/**
 * Destellos y estrellas. Posiciones escritas a mano, nunca con
 * `Math.random()`: con aleatorio el servidor y el cliente pintan cosas
 * distintas y React tira un error de hidratación.
 */
export type Brillo = { left: string; top: string; tipo?: 'oro' | 'lila' | 'rosa' | 'estrella' }

const TONO = {
  oro: ['#e8d49a', 'rgba(232,212,154,.8)'],
  lila: ['#d9b6ee', 'rgba(217,182,238,.8)'],
  rosa: ['#f0cfe2', 'rgba(240,207,226,.85)'],
} as const

export function Brillos({ lista }: { lista: Brillo[] }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {lista.map((b, i) =>
        b.tipo === 'estrella' ? (
          <span key={i} className="estrella" style={{ left: b.left, top: b.top }} />
        ) : (
          <span
            key={i}
            className="destello absolute block h-[5px] w-[5px] rounded-full"
            style={{
              left: b.left,
              top: b.top,
              background: TONO[b.tipo ?? 'oro'][0],
              boxShadow: `0 0 12px 3px ${TONO[b.tipo ?? 'oro'][1]}`,
            }}
          />
        )
      )}
    </div>
  )
}
