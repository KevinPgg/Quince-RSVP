import Link from 'next/link'

/**
 * El castillo, una sola vez, cerrando el scroll: silueta de
 * `castillo.png` usada como máscara, con un sol de atardecer detrás.
 * Se desvanece por arriba con máscara, no con un velo pintado: el fondo
 * es un degradado y un velo de color fijo dejaría una franja.
 *
 * Con `enlace` el castillo entero es un vínculo (en la invitación lleva
 * a la página principal). Las señales de que se puede tocar viven en
 * `.castillo-enlace` de globals.css: el sol respira, un cartel con
 * destellos late, y al pasar el cursor el castillo se eleva y se ilumina.
 */
export default function HorizonteCastillo({ enlace }: { enlace?: { href: string; texto: string } }) {
  const escena = (
    <>
      <div
        className="castillo-sol absolute bottom-5 left-1/2 -z-10 h-[420px] w-[420px] -translate-x-1/2 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(255,232,190,.9), rgba(255,214,236,.5) 40%, transparent 70%)' }}
      />
      <div className="castillo castillo-oscuro castillo-figura w-[min(100%,560px)] opacity-70" />
    </>
  )

  if (!enlace) {
    return (
      <div aria-hidden className="fundido-arriba pointer-events-none relative isolate mt-12 h-[260px] select-none overflow-hidden">
        {escena}
      </div>
    )
  }

  return (
    <Link
      href={enlace.href}
      aria-label={enlace.texto}
      className="castillo-enlace group relative isolate mt-12 block h-[280px] select-none overflow-hidden"
    >
      <div className="fundido-arriba absolute inset-0 isolate">{escena}</div>
      {/* Cartel sobre la base del castillo: el texto dice adónde lleva. */}
      <span className="castillo-cartel absolute bottom-7 left-1/2 z-[2] -translate-x-1/2 whitespace-nowrap">
        <span aria-hidden className="castillo-destello castillo-destello-1">✦</span>
        {enlace.texto}
        <span aria-hidden className="castillo-destello castillo-destello-2">✦</span>
      </span>
    </Link>
  )
}
