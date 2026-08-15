export default function Seccion({
  titulo,
  children,
}: {
  titulo?: string
  children: React.ReactNode
}) {
  return (
    <section className="contenedor py-10">
      {titulo && <h2 className="titulo-seccion mb-6 text-center">{titulo}</h2>}
      {children}
    </section>
  )
}
