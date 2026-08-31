import { ILUSTRACION_LARGA } from '@/config/galeria'

/**
 * Capa de ilustración vertical larga detrás de toda la página.
 *
 * Va como `background-image` de un div y no con `next/image` a propósito:
 * el archivo es opcional. Con `next/image`, una ruta que no existe revienta
 * en desarrollo y devuelve 400 en producción; con CSS, simplemente no se
 * pinta nada y la página sigue funcionando con el degradado y los pétalos.
 *
 * `background-attachment: scroll` y no `fixed`: en Safari iOS `fixed`
 * produce saltos al hacer scroll, el mismo motivo por el que el degradado
 * vive en un pseudoelemento fijo en vez de en el body.
 *
 * La máscara la desvanece arriba y abajo para que no corte en seco contra
 * el héroe ni contra el pie.
 */
export default function FondoLargo() {
  if (!ILUSTRACION_LARGA) return null

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      style={{
        backgroundImage: `url('${ILUSTRACION_LARGA.src}')`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: '100% auto',
        backgroundPosition: 'top center',
        opacity: ILUSTRACION_LARGA.opacidad,
        maskImage:
          'linear-gradient(180deg, transparent 0%, #000 12%, #000 82%, transparent 100%)',
        WebkitMaskImage:
          'linear-gradient(180deg, transparent 0%, #000 12%, #000 82%, transparent 100%)',
      }}
    />
  )
}
