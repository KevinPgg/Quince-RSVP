export default function Lugar({
  hora, lugar, direccion, mapsUrl,
}: {
  hora: string
  lugar: string
  direccion: string
  mapsUrl: string | null
}) {
  return (
    <div className="tarjeta text-center">
      {hora && (
        <>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted">A las</p>
          <p className="mt-2 font-display text-4xl text-primary">{hora}</p>
        </>
      )}
      <p className="mt-4 font-medium">{lugar}</p>
      {direccion && <p className="mt-1 text-sm leading-snug text-muted">{direccion}</p>}
      {mapsUrl && (
        <a href={mapsUrl} target="_blank" rel="noreferrer" className="boton-borde mt-5 w-full sm:w-auto">
          Cómo llegar
        </a>
      )}
    </div>
  )
}
