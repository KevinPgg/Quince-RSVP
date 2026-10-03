import { obtenerEvento } from '@/lib/evento'
import { listarFotos, urlPublica, retratoDe, coloresDe } from '@/lib/album'
import GestorFotos from '@/components/panel/fotos/GestorFotos'
import type { FotoPanel, NivelEspejo } from '@/config/galeria'

export const dynamic = 'force-dynamic'

export default async function PaginaFotos() {
  const [evento, { fotos, error }] = await Promise.all([obtenerEvento(), listarFotos()])

  const lista: FotoPanel[] = fotos.map((f) => ({
    id: f.id,
    src: urlPublica(f.ruta),
    pie: f.pie,
    espejo: (f.espejo as NivelEspejo | null) ?? null,
    visible: f.visible,
  }))

  return (
    <GestorFotos
      fotos={lista}
      retrato={retratoDe(evento)}
      retratoPropio={!!evento.retrato_ruta}
      colores={coloresDe(evento)}
      coloresPropios={!!evento.album_colores}
      errorTabla={error}
    />
  )
}
