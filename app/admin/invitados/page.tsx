import { supabaseAdmin } from '@/lib/supabase/admin'
import Nueva from './nueva'
import Fila, { type FilaProps } from './fila'

export const dynamic = 'force-dynamic'

export default async function Invitaciones({
  searchParams,
}: {
  searchParams: Promise<{ ver?: string; q?: string }>
}) {
  const { ver = 'activas', q = '' } = await searchParams
  const db = supabaseAdmin()

  const { data: invitados } = await db
    .from('invitados')
    .select('id, token, nombre_display, pases_asignados, grupo, mesa, telefono, notas, eliminado_en')
    .order('nombre_display')

  const { data: respuestas } = await db
    .from('rsvp')
    .select('invitado_id, asiste, pases_confirmados, respondido_en')
    .order('respondido_en', { ascending: false })

  // Primera aparición = respuesta más reciente (viene ordenado desc).
  const vigente = new Map<string, { asiste: boolean; pases_confirmados: number }>()
  for (const r of respuestas ?? []) {
    if (!vigente.has(r.invitado_id)) {
      vigente.set(r.invitado_id, { asiste: r.asiste, pases_confirmados: r.pases_confirmados })
    }
  }

  const todas: FilaProps[] = (invitados ?? []).map((i) => {
    const r = vigente.get(i.id)
    return {
      id: i.id,
      token: i.token,
      nombre_display: i.nombre_display,
      pases_asignados: i.pases_asignados,
      grupo: i.grupo,
      mesa: i.mesa,
      telefono: i.telefono,
      notas: i.notas,
      estado: !r ? 'pendiente' : r.asiste ? 'confirmado' : 'no_asiste',
      pases_confirmados: r?.pases_confirmados ?? 0,
      archivada: i.eliminado_en !== null,
    }
  })

  const activas = todas.filter((i) => !i.archivada)
  const archivadas = todas.filter((i) => i.archivada)

  const base = ver === 'archivadas' ? archivadas : activas
  const termino = q.trim().toLowerCase()
  const visibles = termino
    ? base.filter(
        (i) =>
          i.nombre_display.toLowerCase().includes(termino) ||
          (i.grupo ?? '').toLowerCase().includes(termino)
      )
    : base

  return (
    <>
      <Nueva />

      <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2">
          {([
            ['activas', `Activas (${activas.length})`],
            ['archivadas', `Archivadas (${archivadas.length})`],
          ] as const).map(([v, label]) => (
            <a
              key={v}
              href={`/admin/invitados?ver=${v}`}
              className={`rounded-full border px-4 py-1.5 text-xs uppercase tracking-[0.1em] ${
                ver === v ? 'border-primary bg-primary text-white' : 'border-line text-muted'
              }`}
            >
              {label}
            </a>
          ))}
        </div>

        <form className="flex gap-2">
          <input type="hidden" name="ver" value={ver} />
          <input
            name="q"
            defaultValue={q}
            placeholder="Buscar por nombre o grupo"
            className="campo py-2 text-sm"
          />
          <button className="boton-borde px-5 py-2">Buscar</button>
        </form>
      </div>

      <div className="mt-5 overflow-x-auto rounded-2xl border border-line bg-surface">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line text-xs uppercase tracking-[0.1em] text-muted">
            <tr>
              <th className="p-3">Invitación</th>
              <th className="p-3">Estado</th>
              <th className="p-3">Lugares</th>
              <th className="p-3">Grupo</th>
              <th className="p-3">Compartir</th>
              <th className="p-3">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {visibles.map((inv) => (
              <Fila key={inv.id} inv={inv} />
            ))}
            {visibles.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted">
                  {termino ? 'Sin coincidencias.' : 'Crea la primera invitación arriba.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
