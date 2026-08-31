import Image from 'next/image'
import Filigrana from './Filigrana'

/**
 * Cabecera de la portada: el marco ilustrado como fondo estático.
 *
 * La proporción es 1:1 porque esa es la del marco. Recortarlo a un formato
 * más alto con `cover` se comería justo lo que lo hace reconocible: la corona
 * arriba a la izquierda, el conejo abajo, el castillo a la derecha. Todo eso
 * vive en los bordes.
 *
 * La zona clara utilizable del marco va del 23 % al 72 % de ancho y del 20 %
 * al 78 % de alto —medido sobre el archivo, no a ojo—, así que el texto se
 * ciñe a ese rectángulo y por eso el «XV» va más pequeño que en la invitación.
 *
 * No lleva la corona suelta: el marco ya trae una, y repetirla se vería como
 * un error.
 */
export default function Cabecera({
  nombre,
  fecha,
  frase,
}: {
  nombre: string
  fecha: string
  frase: string | null
}) {
  return (
    <section className="relative">
      <div className="relative mx-auto aspect-square w-full max-w-xl overflow-hidden sm:rounded-3xl">
        {/* El marco. `respira` es un 3.5 % de escala en 14 s: se percibe como
            que la escena está viva, no como un zoom. */}
        <Image
          src="/recursos/tema/marco-cabecera.webp"
          alt=""
          fill
          priority
          sizes="(min-width: 576px) 576px, 100vw"
          className="respira object-cover"
        />

        {/* Velo crema detrás del texto.
            No es opcional: la zona clara del marco se midió recorriendo
            desde el centro, y esa medida se pasa de optimista — por la
            derecha suben las torres del castillo justo donde cae la fecha.
            El velo es del mismo crema que ya tiene el resplandor central,
            así que no se lee como una capa: se lee como parte del arte. */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 60% 44% at 50% 42%, rgba(255,252,246,0.82), rgba(255,252,246,0.55) 58%, rgba(255,252,246,0) 80%)',
          }}
        />

        {/* Texto dentro de la zona clara medida del marco. */}
        <div className="absolute inset-x-[9%] top-[21%] flex flex-col items-center text-center">
          <p className="font-cinzel text-[10px] font-semibold uppercase tracking-[0.36em] text-[#7a5a94]">
            Mis
          </p>

          <div className="relative mt-1 h-[68px]">
            <span
              aria-hidden
              className="font-cinzel text-[68px] font-bold leading-none text-accent [-webkit-text-stroke:5px_#b07d24]"
            >
              XV
            </span>
            <span className="xv-relleno brilla absolute inset-x-0 top-0 font-cinzel text-[68px] font-bold leading-none">
              XV
            </span>
          </div>

          <p
            className="mt-1 font-firma text-[52px] leading-none text-[#a8145f] drop-shadow-[0_1px_0_rgba(255,255,255,0.85)] sm:text-[64px]"
            style={{ paddingTop: '0.14em' }}
          >
            {nombre}
          </p>

          <div className="mt-3">
            <Filigrana ancho={52} />
          </div>

          <p
            className="mt-3 font-cinzel text-[10px] font-semibold uppercase tracking-[0.18em] text-[#452a66]"
            style={{ textShadow: '0 1px 2px rgba(255,255,255,0.9)' }}
          >
            {fecha}
          </p>
        </div>
      </div>

      {/* La frase va fuera del marco: dentro no cabe sin invadir la zona
          decorada, y sobre la ilustración perdería legibilidad. */}
      {frase && (
        <p className="contenedor mt-6 text-center font-display text-[17px] font-light italic leading-relaxed text-muted text-pretty">
          {frase}
        </p>
      )}
    </section>
  )
}
