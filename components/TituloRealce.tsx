/**
 * Título editable desde el panel. Lo que va entre *asteriscos* sale en la
 * letra de firma, en fucsia y un poco más grande —como «quinceañera» en
 * el título original del álbum—. Sin asteriscos, sale todo en la letra
 * normal del título. Un asterisco suelto se muestra tal cual.
 *
 * Si el texto no trae asteriscos, se pinta solo el final: más o menos el
 * último 30 % de la frase, ajustado al inicio de palabra más cercano.
 * Así «El dulce paso de mis primeros *quince años*» conserva el realce
 * original sin tocar el contenido.
 */
const PROPORCION_FINAL = 0.3

function conRealceAutomatico(texto: string): string {
  if (texto.includes('*')) return texto
  const limpio = texto.trim()
  if (limpio.split(/\s+/).length < 2) return texto
  const objetivo = limpio.length * (1 - PROPORCION_FINAL)
  let mejor = -1
  for (const m of limpio.matchAll(/\S+/g)) {
    const i = m.index ?? 0
    if (i === 0) continue
    if (mejor < 0 || Math.abs(i - objetivo) < Math.abs(mejor - objetivo)) mejor = i
  }
  if (mejor < 0) return texto
  return `${limpio.slice(0, mejor)}*${limpio.slice(mejor)}*`
}

export default function TituloRealce({ texto }: { texto: string }) {
  const partes = conRealceAutomatico(texto).split(/(\*[^*]+\*)/g).filter(Boolean)
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
