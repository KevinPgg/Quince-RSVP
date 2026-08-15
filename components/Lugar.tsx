export default function Lugar({
  titulo,
  hora,
  lugar,
  direccion,
  mapsUrl,
}: {
  titulo: string
  hora: string
  lugar: string
  direccion: string
  mapsUrl: string
}) {
  return (
    <div className="tarjeta text-center">
      <p className="text-xs uppercase tracking-[0.2em] text-muted">{titulo}</p>
      <p className="mt-3 font-display text-2xl text-primary">{hora}</p>
      <p className="mt-3 font-medium">{lugar}</p>
      <p className="mt-1 text-sm text-muted">{direccion}</p>
      <a
        href={mapsUrl}
        target="_blank"
        rel="noreferrer"
        className="boton-borde mt-5"
      >
        Cómo llegar
      </a>
    </div>
  )
}
