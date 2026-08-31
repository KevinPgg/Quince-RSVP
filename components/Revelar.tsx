'use client'

import { useEffect, useRef, useState, type ElementType } from 'react'

type Efecto = 'sube' | 'zoom' | 'giro' | 'izq' | 'der'

const CLASE: Record<Efecto, string> = {
  sube: 'revela',
  zoom: 'revela revela-zoom',
  giro: 'revela revela-giro',
  izq: 'revela revela-izq',
  der: 'revela revela-der',
}

/**
 * Revela su contenido cuando entra en pantalla.
 *
 * Un IntersectionObserver por elemento y no un listener de scroll: el
 * listener obliga a leer geometría en cada cuadro y en un móvil eso se nota
 * como scroll pegajoso. El observador lo resuelve el navegador fuera del
 * hilo principal.
 *
 * `once` por omisión: una vez revelado se deja de observar. Animar de vuelta
 * al salir de pantalla convierte el scroll hacia arriba en un parpadeo.
 *
 * Si el navegador no trae IntersectionObserver, el contenido se marca
 * visible de inmediato. Nunca se queda oculto.
 */
export default function Revelar({
  children,
  efecto = 'sube',
  retraso = 0,
  umbral = 0.15,
  como: Como = 'div',
  className = '',
}: {
  children: React.ReactNode
  efecto?: Efecto
  /** 1 a 4; escalona elementos hermanos. */
  retraso?: 0 | 1 | 2 | 3 | 4
  umbral?: number
  como?: ElementType
  className?: string
}) {
  const ref = useRef<HTMLElement | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const nodo = ref.current
    if (!nodo) return
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }
    const obs = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) {
          setVisible(true)
          obs.disconnect()
        }
      },
      // El margen inferior negativo evita que se dispare cuando el elemento
      // apenas asoma un píxel por el borde de la pantalla.
      { threshold: umbral, rootMargin: '0px 0px -8% 0px' }
    )
    obs.observe(nodo)
    return () => obs.disconnect()
  }, [umbral])

  const clases = [
    CLASE[efecto],
    retraso ? `revela-${retraso}` : '',
    visible ? 'visible' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <Como ref={ref} className={clases}>
      {children}
    </Como>
  )
}
