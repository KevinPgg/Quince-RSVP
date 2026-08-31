/**
 * Línea de oro con el corazón al centro. Va bajo el nombre en la portada,
 * en la invitación y en la pantalla de gracias: un solo sitio para cambiarla.
 */
export default function Filigrana({ ancho = 74 }: { ancho?: number }) {
  return (
    <div className="flex items-center justify-center gap-3">
      <span
        className="h-px bg-gradient-to-r from-transparent to-accent"
        style={{ width: ancho }}
      />
      <svg width="15" height="14" viewBox="0 0 22 20" aria-hidden>
        <path
          d="M11 19C4 13.5 1 10.3 1 6.8 1 3.6 3.4 1 6.5 1 8.4 1 10.1 2 11 3.6 11.9 2 13.6 1 15.5 1 18.6 1 21 3.6 21 6.8c0 3.5-3 6.7-10 12.2Z"
          fill="#c2417d"
        />
      </svg>
      <span
        className="h-px bg-gradient-to-l from-transparent to-accent"
        style={{ width: ancho }}
      />
    </div>
  )
}
