'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { ALBUM, MARCO_FOTO, ROSAS, PETALOS } from '@/config/galeria'

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
/**
 * Pétalos que se desprenden del marco del carrusel.
 *
 * Posiciones en % del marco, elegidas junto a los racimos de las
 * esquinas para que se lean como caídos de ellos y no como confeti. El
 * ancho va en % y no en píxeles porque la tarjeta mide 72vw en móvil y
 * 300 px desde `sm`: en píxeles fijos los pétalos serían enormes en un
 * teléfono angosto.
 */
const PETALOS_MARCO = [
  { p: 0, left: '13%', top: '20%', ancho: '7%',   giro: -22, opacidad: 0.85, ritmo: 'deriva' },
  { p: 2, left: '77%', top: '30%', ancho: '5.5%', giro: 28,  opacidad: 0.7,  ritmo: 'deriva-b' },
  { p: 3, left: '24%', top: '62%', ancho: '5%',   giro: 10,  opacidad: 0.6,  ritmo: 'deriva-c' },
] as const

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
    <div>
      {/* El scroller y el indicador son HERMANOS, no anidados.
          Cuando los puntos vivían dentro del contenedor con
          `overflow-x-auto` se desplazaban con el carrusel: un hijo de
          bloque dentro de un contenedor con scroll resuelve su ancho
          contra el ancho visible, no contra el del contenido, así que
          quedaba clavado en el origen del scroll y se iba de pantalla al
          avanzar. Además cargaba con el `pb-4` del scroller y terminaba
          pegado al pie de la primera foto. */}
      <div
        className="-mx-5 overflow-x-auto px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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

                    {/* --- Rosas sueltas, solo con el marco limpio ---
                        Medido: montar la copia de una rosa ENCIMA de la
                        rosa que el marco ya trae pintada compone dos
                        veces el mismo borde semitransparente, y el
                        contorno sale hasta un 25 % más oscuro. No es
                        cosa de la compresión —pasa igual en WebP sin
                        pérdida—, es el doble alfa. Además, mientras el
                        original está debajo el recorrido no puede pasar
                        de un par de píxeles sin que asome.

                        Así que esta capa espera. En cuanto
                        `MARCO_FOTO.marco` apunte al marco sin rosas y
                        `sinRosas` pase a `true`, se enciende con
                        amplitud grande y sin artefacto. Los recortes ya
                        están generados. */}
                    {MARCO_FOTO.sinRosas && esActivo && (
                      <div aria-hidden className="pointer-events-none absolute inset-0">
                        {ROSAS.map((r, n) => (
                          <span
                            key={r.src}
                            className={[
                              'absolute block mece-amplio',
                              r.fase ? `fase-${r.fase}` : '',
                            ]
                              .filter(Boolean)
                              .join(' ')}
                            style={{
                              left: r.left,
                              top: r.top,
                              width: r.width,
                              transformOrigin: r.origen,
                            }}
                          >
                            <Image
                              src={r.src}
                              alt=""
                              width={240}
                              height={240}
                              sizes="(min-width: 640px) 100px, 24vw"
                              className="h-auto w-full"
                              priority={i === 0 && n < 2}
                            />
                          </span>
                        ))}
                      </div>
                    )}

                    {/* --- Pétalos a la deriva sobre el marco ---
                        Esto sí funciona con el marco actual: son pétalos
                        recortados del propio archivo, no copias de algo
                        que ya está pintado, así que no hay doble alfa
                        que los delate. Salen de las esquinas donde están
                        los racimos, como si se desprendieran de ellos.
                        Solo en la tarjeta activa: seis tarjetas por tres
                        pétalos animados son dieciocho composiciones a la
                        vez y en un móvil eso se siente en el scroll. */}
                    {esActivo && (
                      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
                        {PETALOS_MARCO.map((m, n) => (
                          <span
                            key={n}
                            className={`absolute block ${m.ritmo}`}
                            style={{
                              left: m.left,
                              top: m.top,
                              width: m.ancho,
                              opacity: m.opacidad,
                              ['--giro' as string]: `${m.giro}deg`,
                              transform: `rotate(${m.giro}deg)`,
                            }}
                          >
                            <Image
                              src={PETALOS[m.p]}
                              alt=""
                              width={64}
                              height={64}
                              sizes="34px"
                              className="h-auto w-full"
                            />
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {f.pie && (
                  <p
                    className="mt-2 text-center font-cinzel text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8a6a33] transition-opacity duration-500"
                    style={{ opacity: esActivo ? 1 : 0.45 }}
                  >
                    {f.pie}
                  </p>
                )}
              </li>
            )
          })}
        </ul>
      </div>

      {/* Indicador de posición. Fuera del scroller: se queda centrado en
          la pantalla pase lo que pase con el carrusel. */}
      <div className="mt-5 flex justify-center gap-1.5" aria-hidden>
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
