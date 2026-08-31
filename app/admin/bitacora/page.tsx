import { supabaseAdmin } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

const VERBOS: Record<string, string> = {
  crear: 'creó', editar: 'editó', archivar: 'archivó',
  restaurar: 'restauró', reabrir: 'reabrió', config: 'configuró',
}
const ENTIDADES: Record<string, string> = {
  invitacion: 'una invitación', evento: 'el evento', usuario: 'un usuario',
}

export default async function PaginaBitacora() {
  const { data } = await supabaseAdmin()
    .from('bitacora')
    .select('*')
    .order('creado_en', { ascending: false })
    .limit(200)

  const filas = data ?? []

  const fmt = new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'medium', timeStyle: 'short',
  })

  return (
    <div className="space-y-5">
      <p className="text-sm leading-relaxed text-muted">
        Últimos 200 movimientos. Esto es lo que hace útil tener usuarios
        separados: si algo desaparece, aquí está quién y cuándo.
      </p>

      {filas.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted">Todavía no hay movimientos.</p>
      ) : (
        <ol className="space-y-2">
          {filas.map((f) => (
            <li key={f.id} className="tarjeta flex flex-wrap items-baseline justify-between gap-2 p-4">
              <span className="text-sm">
                <strong className="font-medium">{f.usuario_txt ?? 'Alguien'}</strong>{' '}
                {VERBOS[f.accion] ?? f.accion} {ENTIDADES[f.entidad] ?? f.entidad}
                {f.detalle && typeof f.detalle === 'object' && 'nombre' in f.detalle && (
                  <span className="text-muted"> · {String((f.detalle as Record<string, unknown>).nombre)}</span>
                )}
              </span>
              <span className="text-xs tabular-nums text-muted">
                {fmt.format(new Date(f.creado_en))}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
