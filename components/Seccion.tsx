import Ornamento from './Ornamento'

export default function Seccion({
  titulo,
  children,
  ancla,
}: {
  titulo?: string
  children: React.ReactNode
  /** id para enlazar desde otra página. `scroll-mt` evita que el título
   *  quede pegado al borde superior al aterrizar. */
  ancla?: string
}) {
  return (
    <section id={ancla} className="contenedor scroll-mt-8 py-8 sm:py-10">
      {titulo && (
        <div className="mb-5 sm:mb-6">
          <h2 className="titulo-seccion text-center">{titulo}</h2>
          <Ornamento className="mt-2.5" />
        </div>
      )}
      {children}
    </section>
  )
}
