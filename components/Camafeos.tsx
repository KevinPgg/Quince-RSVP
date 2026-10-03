'use client'

import { useEffect, useRef, useState } from 'react'
import type { NivelEspejo } from '@/config/galeria'
import { aRgb, colorEn } from '@/lib/colores'
import { EspejoDefs } from './EspejoAdornos'
import Espejo from './Espejo'

export type FotoCarrusel = { id: string; src: string; alt: string; pie: string; espejo: NivelEspejo }

/**
 * Álbum en espejos de princesa, de niña a quinceañera.
 *
 * - Cada foto lleva uno de cinco espejos (EspejoAdornos); el nivel
 *   viene ya resuelto del servidor (manual o automático).
 * - El fondo de la banda se interpola entre los colores del panel
 *   según el avance del scroll horizontal. Se escribe directo en
 *   variables CSS dentro de un requestAnimationFrame, sin estado de
 *   React: un setState por cuadro de scroll se siente pegajoso en
 *   un móvil.
 * - El lavado del cristal usa el mismo tono (`--tinte`), así el
 *   borde de cada foto se funde con el fondo que tiene detrás.
 * - La tira va a sangre y dos separadores de `50% - 110px - gap`
 *   centran la primera y la última foto.
 */
export default function Camafeos({ fotos, colores }: { fotos: FotoCarrusel[]; colores: string[] }) {
  const tiraRef = useRef<HTMLDivElement>(null)
  const bandaRef = useRef<HTMLDivElement>(null)
  const [activo, setActivo] = useState(0)

  // Color por scroll.
  useEffect(() => {
    const tira = tiraRef.current
    const banda = bandaRef.current
    if (!tira || !banda) return
    const paradas = colores.map(aRgb)
    let cuadro = 0
    const pintar = () => {
      cuadro = 0
      const max = tira.scrollWidth - tira.clientWidth
      const [r, g, b] = colorEn(paradas, max > 0 ? tira.scrollLeft / max : 0)
      banda.style.setProperty('--fondo-album', `rgb(${r} ${g} ${b})`)
      banda.style.setProperty('--tinte', `${r} ${g} ${b}`)

      // Activo = el más cercano al centro. Con IntersectionObserver, en
      // escritorio caben 5 fotos enteras y ganaba la última en disparar.
      const centro = tira.getBoundingClientRect().left + tira.clientWidth / 2
      let mejor = 0
      let dist = Infinity
      tira.querySelectorAll('figure').forEach((f, i) => {
        const rf = f.getBoundingClientRect()
        const d = Math.abs(rf.left + rf.width / 2 - centro)
        if (d < dist) { dist = d; mejor = i }
      })
      setActivo((a) => (a === mejor ? a : mejor))
    }
    const alScroll = () => { if (!cuadro) cuadro = requestAnimationFrame(pintar) }
    pintar()
    tira.addEventListener('scroll', alScroll, { passive: true })
    window.addEventListener('resize', alScroll)
    return () => {
      tira.removeEventListener('scroll', alScroll)
      window.removeEventListener('resize', alScroll)
      if (cuadro) cancelAnimationFrame(cuadro)
    }
  }, [colores, fotos])

  if (fotos.length === 0) return null
  const [r0, g0, b0] = aRgb(colores[0])

  return (
    <div
      ref={bandaRef}
      className="album-banda [margin-inline:calc(50%_-_50vw)]"
      style={{ '--fondo-album': `rgb(${r0} ${g0} ${b0})`, '--tinte': `${r0} ${g0} ${b0}` } as React.CSSProperties}
    >
      <EspejoDefs />
      <div
        ref={tiraRef}
        className="relative z-[1] flex gap-[26px] overflow-x-auto pb-6 pt-[84px] [scrollbar-width:none]
                   before:shrink-0 before:grow-0 before:basis-[calc(50%_-_136px)] before:content-['']
                   after:shrink-0 after:grow-0 after:basis-[calc(50%_-_136px)] after:content-['']
                   [&::-webkit-scrollbar]:hidden"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {fotos.map((f, i) => {
          const esActivo = i === activo
          return (
            <figure
              key={f.id}
              className={`espejo-figura m-0 w-[220px] shrink-0 text-center ${esActivo ? 'es-activo' : ''}`}
              style={{ scrollSnapAlign: 'center' }}
            >
              <div className="espejo-giro">
                <Espejo nivel={f.espejo} src={f.src} alt={f.alt} ancho={220} priority={i === 0} />
              </div>
              <figcaption
                className="mt-[46px] min-h-[28px] font-firma text-[28px] leading-none text-[#b52272] transition-opacity duration-500"
                style={{ opacity: esActivo ? 1 : 0.45, paddingTop: '0.1em' }}
              >
                {f.pie}
              </figcaption>
            </figure>
          )
        })}
      </div>

      {/* Indicador, hermano del scroller: dentro se desplazaba con él. */}
      <div className="relative z-[1] flex justify-center gap-2 pb-6" aria-hidden>
        {fotos.map((f, i) => (
          <span
            key={f.id}
            className="h-[7px] rounded-full transition-all duration-300"
            style={{ width: i === activo ? 18 : 7, background: i === activo ? '#c08a2e' : '#e2d3b6' }}
          />
        ))}
      </div>
    </div>
  )
}
