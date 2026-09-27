import Filigrana from './Filigrana'
import { Esquinas } from './tema/Ornamentos'

export default function Lugar({
  hora, lugar, direccion, mapsUrl,
}: {
  hora: string
  lugar: string
  direccion: string
  mapsUrl: string | null
}) {
  return (
    <div className="tarjeta-real">
      <Esquinas />
      {hora && (
        <>
          <p className="font-cinzel text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">✦ A las ✦</p>
          <p className="texto-oro mt-1.5 font-display text-[54px] font-medium leading-none">{hora}</p>
          <div className="mt-3"><Filigrana ancho={74} /></div>
        </>
      )}
      <p className="mt-3 font-display text-2xl leading-tight text-ink">{lugar}</p>
      {direccion && <p className="mt-1 text-[14.5px] leading-relaxed text-muted">{direccion}</p>}
      {mapsUrl && (
        <a href={mapsUrl} target="_blank" rel="noreferrer" className="boton-morado mt-5 w-auto px-7">
          Cómo llegar
        </a>
      )}
    </div>
  )
}
