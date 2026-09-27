import Ornamento from './Ornamento'

/**
 * Sección de la portada o de la invitación: eyebrow, título, ornamento.
 *
 * `overflow-x: clip` y no `overflow: hidden`. Con `hidden` las sombras de
 * las tarjetas se cortaban en recto contra el borde inferior de la
 * sección. `clip` solo recorta en horizontal —lo que evita el scroll
 * lateral del álbum a sangre— y deja respirar la sombra hacia abajo.
 */
export default function Seccion({
  titulo,
  eyebrow,
  children,
  ancla,
}: {
  titulo?: React.ReactNode
  eyebrow?: string
  children: React.ReactNode
  /** id para enlazar desde otra página. */
  ancla?: string
}) {
  return (
    <section id={ancla} className="relative scroll-mt-8 pt-14 sm:pt-16 [overflow-x:clip]">
      <div className="contenedor">
        {titulo && (
          <div className="mb-6 text-center">
            {eyebrow && <p className="eyebrow mb-2.5">{eyebrow}</p>}
            <h2 className="font-display text-[34px] font-normal leading-[1.1] text-primary sm:text-[38px]">
              {titulo}
            </h2>
            <Ornamento className="mt-3" />
          </div>
        )}
        {children}
      </div>
    </section>
  )
}
