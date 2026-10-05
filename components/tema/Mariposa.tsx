/**
 * Mariposa vectorial de la temática: alas lila → celeste con filo violeta
 * punteado de blanco, al estilo de la referencia que mandó Kevin, pero
 * dibujada aquí (la referencia era una miniatura de 235 px con el fondo
 * de cuadros «transparente» pintado encima: no servía como recurso).
 *
 * Decorativa: sin eventos, `aria-hidden`. Lleva el mismo contorno blanco
 * + halo lila que los personajes (`.mariposa` en globals.css) para que
 * se lean como parte de la misma familia.
 *
 * Movimiento (solo con prefers-reduced-motion: no-preference):
 *  - `vuelo` a/b: deriva por el aire + ráfagas de aleteo y planeo.
 *  - `posada`: quieta, abre y cierra las alas despacio.
 * El aleteo es un scaleX de las alas sobre el eje del cuerpo (x = 50):
 * visto desde arriba, plegar las alas se lee como estrecharlas.
 *
 * Los degradados `t-ala-*` viven en <DefsTema /> (layout), una sola vez.
 */
export type TonoMariposa = 'lila' | 'rosa' | 'celeste'
export type VueloMariposa = 'a' | 'b' | 'posada'

// Ala derecha; la izquierda es su espejo sobre x = 50.
const ALA_ALTA = 'M51 33 C55 18 68 6 84 4 C95 3 99 10 97 19 C95 29 85 37 70 41 C62 43 55 42 51 40 Z'
const ALA_BAJA = 'M51 42 C58 43 70 45 78 52 C86 59 84 71 74 74 C65 77 57 69 54 60 C52 54 51 48 51 42 Z'
const VENAS = 'M53 37 Q70 28 88 11 M53 39 Q73 34 93 23 M53 44 Q67 52 77 66 M53 46 Q61 58 64 71'
const PUNTOS: [number, number, number][] = [
  [84, 6.6, 1.1], [90, 5.6, 1.3], [95, 9.5, 1], [96.2, 15, 1.2], [95, 21.5, 1], [91.5, 27.5, 1.2], [86, 32.5, 0.9],
  [79.5, 56, 1], [81.4, 62, 1.2], [80, 68, 1], [75.5, 71.6, 1.1], [69.5, 72, 0.8],
]

function Ala() {
  return (
    <>
      <path d={ALA_ALTA} />
      <path d={ALA_BAJA} />
      <path d={VENAS} fill="none" stroke="rgba(70,32,110,.32)" strokeWidth=".7" strokeLinecap="round" />
      {/* Ventana de luz en el ala alta. */}
      <ellipse cx="78" cy="17" rx="9" ry="4.6" transform="rotate(-32 78 17)" fill="#fff" opacity=".42" />
      <path d={ALA_ALTA} fill="none" stroke="#5a2f8c" strokeWidth="2.4" strokeLinejoin="round" />
      <path d={ALA_BAJA} fill="none" stroke="#5a2f8c" strokeWidth="2.4" strokeLinejoin="round" />
      {PUNTOS.map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill="#fff" />
      ))}
    </>
  )
}

export default function Mariposa({
  ancho,
  tono = 'lila',
  vuelo = 'a',
  giro = 0,
  espejado = false,
  retraso = 0,
  className = '',
}: {
  /** Ancho en px. */
  ancho: number
  tono?: TonoMariposa
  vuelo?: VueloMariposa
  /** Inclinación en grados (0 = cabeza arriba). */
  giro?: number
  espejado?: boolean
  /** Desfase de la animación en segundos, para que no aleteen a la vez. */
  retraso?: number
  /** Posición (absolute + top/left…) con utilidades de Tailwind. */
  className?: string
}) {
  return (
    <span
      aria-hidden
      className={`mariposa mariposa-${vuelo} ${className}`}
      style={{
        width: ancho,
        transform: `rotate(${giro}deg)${espejado ? ' scaleX(-1)' : ''}`,
        ['--retraso' as string]: `${-retraso}s`,
      }}
    >
      <svg viewBox="0 0 100 80" width="100%" style={{ display: 'block', overflow: 'visible' }}>
        <g className="mariposa-alas" fill={`url(#t-ala-${tono})`}>
          <Ala />
          <g transform="matrix(-1 0 0 1 100 0)">
            <Ala />
          </g>
        </g>
        {/* Antenas, cuerpo y cabeza. */}
        <path d="M49.2 25 C47 18 44 13 40.5 10.5 M50.8 25 C53 18 56 13 59.5 10.5" fill="none" stroke="#3b2350" strokeWidth="1" strokeLinecap="round" />
        <circle cx="40.3" cy="10.3" r="1.5" fill="#3b2350" />
        <circle cx="59.7" cy="10.3" r="1.5" fill="#3b2350" />
        <ellipse cx="50" cy="45" rx="2.6" ry="18" fill="#3b2350" />
        <ellipse cx="49.3" cy="40" rx=".8" ry="11" fill="#8a64b5" opacity=".7" />
        <circle cx="50" cy="26.5" r="3.3" fill="#3b2350" />
      </svg>
    </span>
  )
}
