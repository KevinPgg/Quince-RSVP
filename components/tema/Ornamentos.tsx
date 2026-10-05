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
        {/* Alas de mariposa (components/tema/Mariposa.tsx): oscuro junto al
            cuerpo, claro hacia el filo. Mismo centro para ala alta y baja. */}
        {([
          ['lila', '#5d2f9a', '#a98ae6', '#d8e6ff'],
          ['rosa', '#8e2f86', '#de9ad6', '#fbe3f4'],
          ['celeste', '#4a3fa6', '#9db6f2', '#e6f1ff'],
        ] as const).map(([n, a, b, c]) => (
          <radialGradient key={n} id={`t-ala-${n}`} gradientUnits="userSpaceOnUse" cx="50" cy="42" r="50">
            <stop offset="0" stopColor={a} />
            <stop offset=".45" stopColor={b} />
            <stop offset=".85" stopColor={c} />
            <stop offset="1" stopColor={b} />
          </radialGradient>
        ))}
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

/**
 * Guirnalda de oro que cuelga del borde inferior del cartucho: dos
 * volutas por lado, hojas, flores lila, un festón de perlas y una
 * amatista con colgante al centro (el vocabulario del emblema «XV»).
 * La voluta exterior izquierda es la rama donde se sienta la ardilla.
 *
 * viewBox 400×96; el borde del cartucho cae en y≈22. Es más ancha que
 * el cartucho a propósito: los extremos salen por los costados y la
 * ardilla queda fuera del texto.
 */
const VOLUTA = 'M212 26 C236 38 262 41 286 32 C306 24 330 24 344 34 C356 43 372 45 382 37 C390 30 387 20 379 22 C372 24 374 31 381 30'
const RAMA_BAJA = 'M206 40 C226 56 258 60 292 50 C310 45 322 48 330 56'

// Festón: 9 perlas sobre una curva colgante (cuadrática 216,34 → 302,36, control 259,68).
const FESTON: [number, number][] = Array.from({ length: 9 }, (_, i) => {
  const t = (i + 1) / 10
  const x = (1 - t) ** 2 * 216 + 2 * (1 - t) * t * 259 + t ** 2 * 302
  const y = (1 - t) ** 2 * 34 + 2 * (1 - t) * t * 68 + t ** 2 * 36
  return [Math.round(x * 10) / 10, Math.round(y * 10) / 10]
})

function Hoja({ x, y, r, s = 1 }: { x: number; y: number; r: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
      <path d="M0 0 C4 -6 12 -6 17 0 C12 6 4 6 0 0Z" fill="#7d9a63" />
      <path d="M1 0 L15 0" stroke="#55703f" strokeWidth=".7" />
    </g>
  )
}

function Flor({ x, y, r }: { x: number; y: number; r: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx="0" cy={-r * 0.95} rx={r * 0.62} ry={r * 0.95} fill="#b47ad8" stroke="#8e52c4" strokeWidth=".5" transform={`rotate(${a})`} />
      ))}
      <circle r={r * 0.42} fill="url(#t-oro)" />
    </g>
  )
}

function Destello({ x, y, r }: { x: number; y: number; r: number }) {
  return (
    <path
      d={`M${x} ${y - r} Q${x} ${y} ${x + r} ${y} Q${x} ${y} ${x} ${y + r} Q${x} ${y} ${x - r} ${y} Q${x} ${y} ${x} ${y - r}Z`}
      fill="#fff6d6" opacity=".9"
    />
  )
}

function Rama() {
  return (
    <g>
      {/* Rama baja, más fina, detrás */}
      <path d={RAMA_BAJA} fill="none" stroke="url(#t-oro)" strokeWidth="2.4" strokeLinecap="round" opacity=".9" />
      <Hoja x={250} y={57} r={170} s={0.8} />
      <Hoja x={300} y={47} r={-20} s={0.75} />
      <Hoja x={326} y={53} r={60} s={0.7} />

      {/* Festón de perlas */}
      {FESTON.map(([x, y]) => (
        <g key={`p${x}`}>
          <circle cx={x + 0.5} cy={y + 0.8} r={2.7} fill="rgba(70,40,10,.3)" />
          <circle cx={x} cy={y} r={2.7} fill="url(#t-perla)" />
        </g>
      ))}

      {/* Voluta principal: sombra, oro y filo de luz */}
      <path d={VOLUTA} fill="none" stroke="#7a4f12" strokeWidth="5.4" strokeLinecap="round" opacity=".35" transform="translate(.6 1)" />
      <path d={VOLUTA} fill="none" stroke="url(#t-oro)" strokeWidth="4.4" strokeLinecap="round" />
      <path d="M214 27 C236 37 262 39 284 31" fill="none" stroke="#fff6d6" strokeWidth=".9" opacity=".7" strokeLinecap="round" />

      <Hoja x={236} y={36} r={28} />
      <Hoja x={266} y={39} r={160} />
      <Hoja x={312} y={24} r={-35} />
      <Hoja x={340} y={33} r={50} s={0.85} />
      <Hoja x={392} y={28} r={80} s={0.75} />

      <Flor x={286} y={32} r={5.4} />
      <Flor x={322} y={25} r={4} />
      <Flor x={356} y={43} r={4.6} />
      <circle cx={368} cy={30} r={2.4} fill="#c99be6" />
      <circle cx={300} cy={22} r={2} fill="#c99be6" />

      <Destello x={262} y={80} r={5} />
      <Destello x={346} y={66} r={4} />
      <Destello x={386} y={52} r={3} />
    </g>
  )
}

export function GuirnaldaCartucho({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 96" aria-hidden className={className}>
      <defs>
        <linearGradient id="gc-amatista" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f1dcff" />
          <stop offset=".45" stopColor="#9b5bd0" />
          <stop offset="1" stopColor="#4a1d73" />
        </linearGradient>
      </defs>
      <Rama />
      <g transform="translate(400 0) scale(-1 1)"><Rama /></g>

      {/* Amatista central con engaste, dos joyas laterales y colgante */}
      <circle cx="186" cy="27" r="3.2" fill="url(#t-joya)" stroke="#7a4f12" strokeWidth=".5" />
      <circle cx="214" cy="27" r="3.2" fill="url(#t-joya)" stroke="#7a4f12" strokeWidth=".5" />
      <path d="M200 4 L215 26 L200 52 L185 26Z" fill="url(#t-oro)" stroke="#7a4f12" strokeWidth=".8" />
      <path d="M200 10 L210.5 26 L200 46 L189.5 26Z" fill="url(#gc-amatista)" />
      <path d="M200 10 L204.5 26 L200 46 M189.5 26 L210.5 26" stroke="#f3e2ff" strokeWidth=".6" opacity=".6" fill="none" />
      <circle cx="196" cy="19" r="2" fill="#fff" opacity=".9" />
      <path d="M200 52 L200 60" stroke="#c08a2e" strokeWidth="1.2" />
      <path d="M200 60 L205 68 L200 77 L195 68Z" fill="url(#t-oro)" stroke="#7a4f12" strokeWidth=".6" />
      <circle cx="200" cy="83" r="3.4" fill="url(#t-perla)" />
      <circle cx="200" cy="91" r="2.2" fill="url(#t-perla)" />
    </svg>
  )
}
