import Image from 'next/image'
import type { NivelEspejo } from '@/config/galeria'
import { EspejoAdornos } from './EspejoAdornos'

/**
 * Un espejo del álbum, a cualquier tamaño.
 *
 * Todas las medidas del CSS van en `--u` (= ancho / 220), así que el
 * mismo espejo sirve de 220 px en la portada, de 150 en el carrusel
 * del panel y de 56 en el selector. Requiere <EspejoDefs/> montado
 * una vez en la página.
 *
 * `dorso`: el espejo visto de espaldas. Tapa de terciopelo con la foto
 * en un camafeo pequeño y su número: es la vista para ordenar, donde
 * importa qué foto es y en qué lugar va, no cómo luce.
 */
export default function Espejo({
  nivel,
  src,
  alt = '',
  ancho = 220,
  dorso = false,
  numero,
  sizes,
  priority,
  className = '',
}: {
  nivel: NivelEspejo
  src?: string
  alt?: string
  ancho?: number
  dorso?: boolean
  numero?: number
  sizes?: string
  priority?: boolean
  className?: string
}) {
  return (
    <div
      className={`espejo espejo-n${nivel} ${dorso ? 'espejo-dorso' : ''} ${className}`}
      style={{ width: ancho, '--u': ancho / 220 } as React.CSSProperties}
    >
      <div className="espejo-aro">
        {dorso ? (
          <div className="espejo-tapa">
            {src && (
              <span className="espejo-tapa-foto">
                <Image src={src} alt={alt} fill sizes={`${Math.round(ancho * 0.42)}px`} className="object-cover" />
              </span>
            )}
            {numero !== undefined && <span className="espejo-tapa-numero">{numero}</span>}
          </div>
        ) : (
          <div className="espejo-vidrio">
            {src && <Image src={src} alt={alt} fill sizes={sizes ?? `${ancho}px`} priority={priority} className="object-cover" />}
          </div>
        )}
      </div>
      <EspejoAdornos nivel={nivel} />
    </div>
  )
}
