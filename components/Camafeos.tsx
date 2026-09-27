'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { ALBUM } from '@/config/galeria'
import { Lazo } from './tema/Ornamentos'

/**
 * Álbum en camafeos ovalados de oro, con un lazo arriba.
 *
 * Sustituye al carrusel con marco ilustrado. El óvalo no pelea con las
 * fotos: `scripts/album.py` ya las entrega con un lavado lila radial hacia
 * el borde, que es justo la forma de un camafeo.
 *
 * La tira va a sangre (`margin-inline: calc(50% - 50vw)`) y dos
 * separadores flexibles de `50% - 110px - gap` centran la primera y la
 * última foto. Con `padding` en porcentaje no funciona: el porcentaje se
 * resuelve contra el contenedor de la sección, no contra la tira.
 *
 * El indicador usa un IntersectionObserver sobre la tira, no
 * `scrollLeft` en cada cuadro, que en un móvil se siente pegajoso.
 */
export default function Camafeos() {
  const tiraRef = useRef<HTMLDivElement>(null)
  const [activo, setActivo] = useState(0)

  useEffect(() => {
    const tira = tiraRef.current
    if (!tira || typeof IntersectionObserver === 'undefined') return
    const items = Array.from(tira.querySelectorAll('figure'))
    const obs = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (e.isIntersecting && e.intersectionRatio > 0.6) {
            setActivo(items.indexOf(e.target as HTMLElement))
          }
        }
      },
      { root: tira, threshold: [0.6, 0.9] }
    )
    items.forEach((i) => obs.observe(i))
    return () => obs.disconnect()
  }, [])

  if (ALBUM.length === 0) return null

  return (
    <div>
      <div
        ref={tiraRef}
        className="flex gap-[18px] overflow-x-auto pb-6 pt-[18px] [margin-inline:calc(50%_-_50vw)] [scrollbar-width:none]
                   before:shrink-0 before:grow-0 before:basis-[calc(50%_-_128px)] before:content-['']
                   after:shrink-0 after:grow-0 after:basis-[calc(50%_-_128px)] after:content-['']
                   [&::-webkit-scrollbar]:hidden"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {ALBUM.map((f, i) => {
          const esActivo = i === activo
          return (
            <figure
              key={f.src}
              className="m-0 w-[220px] shrink-0 text-center"
              style={{ scrollSnapAlign: 'center' }}
            >
              <div
                className="transition-[transform,filter] duration-500 ease-out"
                style={{
                  transform: esActivo ? 'none' : `scale(0.9) rotate(${i % 2 ? 2 : -2}deg)`,
                  filter: esActivo ? 'none' : 'saturate(0.85)',
                }}
              >
                <div className="camafeo-marco">
                  <Lazo className="absolute -top-3 left-1/2 z-[2] h-6 w-11 -translate-x-1/2 drop-shadow-[0_2px_3px_rgba(120,80,20,0.3)]" />
                  <div className="camafeo-interior">
                    <Image
                      src={f.src}
                      alt={f.alt}
                      fill
                      sizes="220px"
                      priority={i === 0}
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
              <figcaption
                className="mt-3.5 min-h-[26px] font-firma text-[26px] leading-none text-[#b52272] transition-opacity duration-500"
                style={{ opacity: esActivo ? 1 : 0.5, paddingTop: '0.1em' }}
              >
                {f.pie}
              </figcaption>
            </figure>
          )
        })}
      </div>

      {/* Indicador, hermano del scroller: dentro se desplazaba con él. */}
      <div className="flex justify-center gap-2" aria-hidden>
        {ALBUM.map((f, i) => (
          <span
            key={f.src}
            className="h-[7px] rounded-full transition-all duration-300"
            style={{
              width: i === activo ? 18 : 7,
              background: i === activo ? '#c08a2e' : '#e2d3b6',
            }}
          />
        ))}
      </div>
    </div>
  )
}
