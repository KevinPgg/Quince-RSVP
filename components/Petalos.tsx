import Image from 'next/image'
import { PETALOS } from '@/config/galeria'

/**
 * Pétalos sueltos flotando detrás del contenido de una sección.
 *
 * No es lo mismo que el `body::after`: aquel es un mosaico SVG plano de
 * 2 KB que da textura de fondo a todo el scroll. Estos son los pétalos
 * fotorrealistas recortados del propio marco ilustrado, poquísimos y
 * grandes, y son los que dan movimiento. Los dos conviven: la textura no
 * se mueve, estos sí.
 *
 * Las posiciones están escritas a mano y no salen de `Math.random()`: con
 * aleatorio el servidor y el cliente pintan cosas distintas y React tira
 * un error de hidratación. Tres juegos que rotan por índice de sección,
 * para que dos secciones seguidas nunca lleven el mismo dibujo.
 *
 * `aria-hidden` y `pointer-events-none`: son decoración, no contenido, y
 * no deben comerse un toque destinado a la tarjeta que tienen debajo.
 */

type Mota = {
  /** índice dentro de PETALOS */
  p: number
  left: string
  top: string
  /** ancho en px a 360; escala sola porque el contenedor no cambia */
  ancho: number
  giro: number
  opacidad: number
  ritmo: 0 | 1 | 2
}

const JUEGOS: Mota[][] = [
  [
    { p: 0, left: '4%',  top: '12%', ancho: 26, giro: -18, opacidad: 0.5,  ritmo: 0 },
    { p: 2, left: '88%', top: '30%', ancho: 20, giro: 34,  opacidad: 0.42, ritmo: 1 },
    { p: 3, left: '80%', top: '78%', ancho: 16, giro: -8,  opacidad: 0.34, ritmo: 2 },
  ],
  [
    { p: 1, left: '90%', top: '14%', ancho: 24, giro: 22,  opacidad: 0.48, ritmo: 1 },
    { p: 4, left: '2%',  top: '52%', ancho: 18, giro: -30, opacidad: 0.4,  ritmo: 2 },
    { p: 0, left: '12%', top: '86%', ancho: 22, giro: 12,  opacidad: 0.32, ritmo: 0 },
  ],
  [
    { p: 3, left: '6%',  top: '22%', ancho: 22, giro: 40,  opacidad: 0.46, ritmo: 2 },
    { p: 1, left: '86%', top: '62%', ancho: 26, giro: -14, opacidad: 0.44, ritmo: 0 },
    { p: 2, left: '46%', top: '94%', ancho: 15, giro: 6,   opacidad: 0.28, ritmo: 1 },
  ],
]

const RITMO = ['deriva', 'deriva-b', 'deriva-c']

export default function Petalos({ juego = 0 }: { juego?: number }) {
  const motas = JUEGOS[juego % JUEGOS.length]

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {motas.map((m, i) => (
        <span
          key={i}
          className={`absolute block ${RITMO[m.ritmo]}`}
          style={{
            left: m.left,
            top: m.top,
            width: m.ancho,
            opacity: m.opacidad,
            // El giro base va en una variable para que la animación pueda
            // sumarle unos grados sin borrarlo.
            ['--giro' as string]: `${m.giro}deg`,
            transform: `rotate(${m.giro}deg)`,
          }}
        >
          <Image
            src={PETALOS[m.p]}
            alt=""
            width={m.ancho * 2}
            height={m.ancho * 2}
            className="h-auto w-full"
          />
        </span>
      ))}
    </div>
  )
}
