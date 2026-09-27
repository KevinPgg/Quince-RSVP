/**
 * El castillo, una sola vez, cerrando el scroll: silueta de
 * `castillo.png` usada como máscara, con un sol de atardecer detrás.
 * Se desvanece por arriba con máscara, no con un velo pintado: el fondo
 * es un degradado y un velo de color fijo dejaría una franja.
 */
export default function HorizonteCastillo() {
  return (
    <div aria-hidden className="fundido-arriba pointer-events-none relative isolate mt-12 h-[260px] select-none overflow-hidden">
      <div
        className="absolute bottom-5 left-1/2 -z-10 h-[420px] w-[420px] -translate-x-1/2 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(255,232,190,.9), rgba(255,214,236,.5) 40%, transparent 70%)' }}
      />
      <div className="castillo castillo-oscuro w-[min(100%,560px)] opacity-70" />
    </div>
  )
}
