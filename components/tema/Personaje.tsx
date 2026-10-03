import Image from 'next/image'

/**
 * Personajes de la temática (recortes en public/recursos/personajes/).
 *
 * Decorativos: `alt` vacío, sin eventos, detrás del texto. El contorno
 * blanco + halo lila (`.personaje` en globals.css) es lo que los ata al
 * resto: sin él, su dibujo con volumen se lee pegado sobre el oro y las
 * fotos. Fuentes de ~300-460 px: no mostrarlos a más de ~150 px de
 * ancho o se ven borrosos.
 *
 * El movimiento usa `translate`/`rotate`/`scale` sueltos, no `transform`,
 * así `espejado` (scaleX(-1)) convive con la animación.
 */
const FUENTES = {
  azulejo: { src: '/recursos/personajes/azulejo.webp', w: 465, h: 430 },
  petirrojo: { src: '/recursos/personajes/petirrojo.webp', w: 445, h: 433 },
  conejo: { src: '/recursos/personajes/conejo.webp', w: 307, h: 413 },
  ardilla: { src: '/recursos/personajes/ardilla.webp', w: 314, h: 411 },
} as const

export type NombrePersonaje = keyof typeof FUENTES
export type Animacion = 'vuela' | 'vuela-b' | 'respira' | 'asoma'

export default function Personaje({
  n,
  anim,
  espejado = false,
  ancho,
  className = '',
  prioridad = false,
}: {
  n: NombrePersonaje
  anim: Animacion
  /** Voltear horizontalmente, para que mire hacia el centro. */
  espejado?: boolean
  /** Ancho en px a 1x; fija `sizes`. */
  ancho: number
  /** Posición (absolute + top/left…) con utilidades de Tailwind. */
  className?: string
  prioridad?: boolean
}) {
  const f = FUENTES[n]
  return (
    <Image
      src={f.src}
      alt=""
      aria-hidden
      width={f.w}
      height={f.h}
      sizes={`${ancho}px`}
      priority={prioridad}
      draggable={false}
      className={`personaje personaje-${anim} ${espejado ? 'personaje-espejado' : ''} ${className}`}
      style={{ width: ancho, height: 'auto' }}
    />
  )
}
