'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { ALBUM, MARCO_FOTO } from '@/config/galeria'

/**
 * Carrusel del álbum con el marco ilustrado.
 *
 * Cada foto va DETRÁS del marco, recortada con `mask-image` usando el canal
 * alfa del propio marco. Es la única forma de que encaje exacto: el hueco
 * tiene el borde difuso y una elipse aproximada dejaría la foto asomando por
 * los lados, o un halo entre los dos.
 *
 * El movimiento: la tarjeta centrada crece y se endereza, las de los lados
 * quedan algo más pequeñas y giradas. Se calcula con un IntersectionObserver
 * sobre la tira, no leyendo `scrollLeft` en cada cuadro, que en un móvil se
 * siente como scroll pegajoso.
 */
export default function Album() {
  const tiraRef = useRef<HTMLUListElement>(null)
  const [activo, setActivo] = useState(0)

  useEffect(() => {
    const tira = tiraRef.current
    if (!tira || typeof IntersectionObserver === 'undefined') return

    const items = Array.from(tira.children) as HTMLElement[]
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
    <div
      className="-mx-5 overflow-x-auto px-5 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      style={{ scrollSnapType: 'x mandatory' }}
    >
      <ul ref={tiraRef} className="flex w-max items-center gap-3 py-2">
        {ALBUM.map((f, i) => {
          const esActivo = i === activo
          return (
            <li
              key={f.src}
              className="w-[72vw] max-w-[300px] shrink-0"
              style={{ scrollSnapAlign: 'center' }}
            >
              <div
                className="transition-[transform,filter] duration-500 ease-out"
                style={{
                  transform: esActivo
                    ? 'scale(1) rotate(0deg)'
                    : `scale(0.88) rotate(${i % 2 ? 2.5 : -2.5}deg)`,
                  filter: esActivo ? 'none' : 'saturate(0.82)',
                }}
              >
                <div
                  className="relative w-full"
                  style={{ aspectRatio: String(MARCO_FOTO.proporcion) }}
                >
                  {/* La foto, recortada con la máscara del marco. */}
                  <div
                    className="absolute inset-0"
                    style={{
                      maskImage: `url('${MARCO_FOTO.mascara}')`,
                      WebkitMaskImage: `url('${MARCO_FOTO.mascara}')`,
                      maskSize: '100% 100%',
                      WebkitMaskSize: '100% 100%',
                      maskRepeat: 'no-repeat',
                      WebkitMaskRepeat: 'no-repeat',
                    }}
                  >
                    <div
                      className="absolute"
                      style={{
                        left: MARCO_FOTO.hueco.left,
                        top: MARCO_FOTO.hueco.top,
                        width: MARCO_FOTO.hueco.width,
                        height: MARCO_FOTO.hueco.height,
                      }}
                    >
                      <Image
                        src={f.src}
                        alt={f.alt}
                        fill
                        sizes="(min-width: 640px) 300px, 72vw"
                        priority={i === 0}
                        className="object-cover"
                      />
                    </div>
                  </div>

                  {/* El marco, encima. */}
                  <Image
                    src={MARCO_FOTO.marco}
                    alt=""
                    fill
                    sizes="(min-width: 640px) 300px, 72vw"
                    priority={i === 0}
                    className="pointer-events-none object-contain"
                  />
                </div>
              </div>

              {f.pie && (
                <p
                  className="mt-1 text-center font-cinzel text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8a6a33] transition-opacity duration-500"
                  style={{ opacity: esActivo ? 1 : 0.45 }}
                >
                  {f.pie}
                </p>
              )}
            </li>
          )
        })}
      </ul>

      {/* Indicador de posición. */}
      <div className="mt-1 flex justify-center gap-1.5" aria-hidden>
        {ALBUM.map((f, i) => (
          <span
            key={f.src}
            className="h-1.5 rounded-full transition-all duration-400"
            style={{
              width: i === activo ? 18 : 6,
              background: i === activo ? '#c08a2e' : '#e2d3b6',
            }}
          />
        ))}
      </div>
    </div>
  )
}
