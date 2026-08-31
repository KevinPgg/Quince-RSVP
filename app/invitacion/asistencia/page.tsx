import { supabaseAdmin } from '@/lib/supabase/admin'
import { obtenerEvento } from '@/lib/evento'
import type { FilaAsistencia, EstadoRsvp } from '@/lib/types'

export const dynamic = 'force-dynamic'

const estilos: Record<EstadoRsvp, string> = {
  confirmado: 'bg-green-100 text-green-800',
  no_asiste: 'bg-red-100 text-red-800',
  pendiente: 'bg-neutral-100 text-neutral-600',
}
const rotulos: Record<EstadoRsvp, string> = {
  confirmado: 'confirmado',
  no_asiste: 'no asiste',
  pendiente: 'sin responder',
}

export default async function Asistencia({
  searchParams,
}: {
  searchParams: Promise<{ filtro?: string }>
}) {
  const { filtro = 'todos' } = await searchParams

  const evento = await obtenerEvento()
  const { data } = await supabaseAdmin()
    .from('vista_asistencia')
    .select('*')
    .order('nombre_display')
  const filas = (data ?? []) as FilaAsistencia[]

  const confirmados = filas.filter((f) => f.estado === 'confirmado')
  const noAsisten = filas.filter((f) => f.estado === 'no_asiste')
  const pendientes = filas.filter((f) => f.estado === 'pendiente')

  const personasInvitadas = filas.reduce((a, f) => a + f.pases_asignados, 0)
  const personasConfirmadas = confirmados.reduce((a, f) => a + f.pases_confirmados, 0)

  const dias = evento.fecha
    ? Math.ceil((new Date(evento.fecha).getTime() - Date.now()) / 86400000)
    : null

  const kpis: [string, string, string][] = [
    ['Personas confirmadas', String(personasConfirmadas), `de ${personasInvitadas} invitadas`],
    ['Invitaciones', String(filas.length), `${confirmados.length} confirmaron`],
    ['Sin responder', String(pendientes.length), 'requieren seguimiento'],
    ['Faltan', dias === null ? '—' : String(dias), dias === null ? 'sin fecha aún' : 'días'],
  ]

  const visibles = filtro === 'todos' ? filas : filas.filter((f) => f.estado === filtro)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map(([label, valor, pie]) => (
          <div key={label} className="tarjeta p-4">
            <p className="text-[10px] uppercase tracking-[0.12em] text-muted">{label}</p>
            <p className="mt-1 font-display text-3xl text-primary tabular-nums lg:text-4xl">{valor}</p>
            <p className="mt-1 text-xs text-muted">{pie}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-2 overflow-x-auto">
          {([
            ['todos', `Todos (${filas.length})`],
            ['confirmado', `Confirmados (${confirmados.length})`],
            ['no_asiste', `No asisten (${noAsisten.length})`],
            ['pendiente', `Pendientes (${pendientes.length})`],
          ] as const).map(([v, label]) => (
            <a
              key={v}
              href={`/invitacion/asistencia?filtro=${v}`}
              className={`whitespace-nowrap rounded-full border px-4 py-1.5 text-xs uppercase tracking-[0.1em] ${
                filtro === v ? 'border-primary bg-primary text-white' : 'border-line text-muted'
              }`}
            >
              {label}
            </a>
          ))}
        </div>
        <a href="/api/exportar" className="shrink-0 text-xs uppercase tracking-[0.1em] text-primary underline underline-offset-2">
          CSV
        </a>
      </div>

      {/* Móvil: tarjetas */}
      <ul className="grid gap-3 lg:hidden">
        {visibles.map((f) => (
          <li key={f.id} className="tarjeta p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium leading-snug">{f.nombre_display}</p>
                <p className="mt-1 text-xs text-muted">
                  {f.pases_confirmados}/{f.pases_asignados} lugares
                  {f.grupo && ` · ${f.grupo}`}
                  {f.mesa && ` · mesa ${f.mesa}`}
                </p>
              </div>
              <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs ${estilos[f.estado]}`}>
                {rotulos[f.estado]}
              </span>
            </div>
            {(f.acompanantes || f.restricciones || f.mensaje) && (
              <p className="mt-2 text-xs text-muted">
                {[f.acompanantes?.join(', '), f.restricciones, f.mensaje].filter(Boolean).join(' · ')}
              </p>
            )}
          </li>
        ))}
      </ul>

      {/* Desktop: tabla */}
      <div className="hidden overflow-x-auto rounded-2xl border border-line bg-surface lg:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line text-xs uppercase tracking-[0.1em] text-muted">
            <tr>
              <th className="p-3">Invitación</th>
              <th className="p-3">Estado</th>
              <th className="p-3">Lugares</th>
              <th className="p-3">Grupo</th>
              <th className="p-3">Mesa</th>
              <th className="p-3">Detalle</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {visibles.map((f) => (
              <tr key={f.id}>
                <td className="p-3 font-medium">{f.nombre_display}</td>
                <td className="p-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs ${estilos[f.estado]}`}>
                    {rotulos[f.estado]}
                  </span>
                </td>
                <td className="p-3 tabular-nums">{f.pases_confirmados} / {f.pases_asignados}</td>
                <td className="p-3 text-muted">{f.grupo ?? '—'}</td>
                <td className="p-3 text-muted">{f.mesa ?? '—'}</td>
                <td className="p-3 text-muted">
                  {[f.acompanantes?.join(', '), f.restricciones, f.mensaje].filter(Boolean).join(' · ') || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {visibles.length === 0 && (
        <p className="py-12 text-center text-sm text-muted">Nada por aquí todavía.</p>
      )}
    </div>
  )
}
