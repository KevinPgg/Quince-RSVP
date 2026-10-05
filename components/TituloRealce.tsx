/**
 * Título editable desde el panel. Lo que va entre *asteriscos* sale en la
 * letra de firma, en fucsia y un poco más grande —como «quinceañera» en
 * el título original del álbum—. Sin asteriscos, sale todo en la letra
 * normal del título. Un asterisco suelto se muestra tal cual.
 */
export default function TituloRealce({ texto }: { texto: string }) {
  const partes = texto.split(/(\*[^*]+\*)/g).filter(Boolean)
  return (
    <>
      {partes.map((p, i) =>
        p.length > 2 && p.startsWith('*') && p.endsWith('*') ? (
          <em key={i} className="font-firma text-[1.25em] not-italic text-[#b52272]">
            {p.slice(1, -1)}
          </em>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  )
}
