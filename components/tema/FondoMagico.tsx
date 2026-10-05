/**
 * Cielo de la página principal, debajo de todo el contenido.
 *
 * Capa fija sobre el degradado de `body::before` (que sigue siendo el
 * respaldo y el de las demás páginas). Tres cosas, todas CSS:
 *  1. Tres orbes de luz grandes (rosa, lila, celeste) que derivan muy
 *     despacio. Son radial-gradient y se mueven con `translate`: nada de
 *     `filter: blur`, que en un móvil repinta la pantalla entera.
 *  2. Un velo de «atardecer» que aparece al bajar por la página: arriba
 *     amanecer rosado, abajo lila-azul. Con `animation-timeline: scroll()`
 *     donde exista; donde no, se queda en amanecer y no pasa nada.
 *  3. Estrellas de cuatro puntas, puestas a mano (nunca Math.random:
 *     hidratación), que titilan.
 */
const ESTRELLAS: { left: string; top: string; t: number; d: number }[] = [
  { left: '6%', top: '14%', t: 10, d: 0 },
  { left: '93%', top: '9%', t: 8, d: 1.7 },
  { left: '17%', top: '41%', t: 7, d: 3.1 },
  { left: '88%', top: '37%', t: 11, d: 0.6 },
  { left: '4%', top: '68%', t: 9, d: 2.4 },
  { left: '95%', top: '63%', t: 7, d: 4.2 },
  { left: '12%', top: '89%', t: 8, d: 1.1 },
  { left: '84%', top: '86%', t: 10, d: 3.6 },
  { left: '50%', top: '4%', t: 6, d: 2.9 },
]

export default function FondoMagico() {
  return (
    <div aria-hidden className="fondo-magico">
      <div className="fondo-orbe fondo-orbe-1" />
      <div className="fondo-orbe fondo-orbe-2" />
      <div className="fondo-orbe fondo-orbe-3" />
      <div className="fondo-ocaso" />
      {ESTRELLAS.map((e, i) => (
        <svg
          key={i}
          viewBox="0 0 20 20"
          className="fondo-estrella"
          style={{ left: e.left, top: e.top, width: e.t * 2, height: e.t * 2, animationDelay: `${-e.d}s` }}
        >
          <path d="M10 0 C11 7 13 9 20 10 C13 11 11 13 10 20 C9 13 7 11 0 10 C7 9 9 7 10 0 Z" fill="#fff" />
        </svg>
      ))}
    </div>
  )
}
