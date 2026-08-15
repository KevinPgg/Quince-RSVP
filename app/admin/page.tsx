import { supabaseAdmin } from '@/lib/supabase/admin'
import { EVENTO } from '@/config/event'
import type { FilaAsistencia } from '@/lib/types'

export const dynamic = 'force-dynamic'

const badge: Record<FilaAsistencia['estado'], string> = {
  confirmado: 'bg-green-100 text-green-800',
  no_asiste: 'bg-red-100 text-red-800',
  pendiente: 'bg-neutral-100 text-neutral-600',
}

export default async function Resumen({
  searchParams,
}: {
  searchParams: Promise<{ filtro?: string }>
}) {
  const { filtro = 'todos' } = await searchParams

  const db = supabaseAdmin()
  const { data } = await db.from('vista_asistencia').select('*').order('nombre_display')
  const filas = (data ?? []) as FilaAsistencia[]

  const confirmados = filas.filter((f) => f.estado === 'confirmado')
  const noAsisten = filas.filter((f) => f.estado === 'no_asiste')
  const pendientes = filas.filter((f) => f.estado === 'pendiente')

  const personasInvitadas = filas.reduce((a, f) => a + f.pases_asignados, 0)
  const personasConfirmadas = confirmados.reduce((a, f) => a + f.pases_confirmados, 0)

  const diasRestantes = Math.ceil(
    (new Date(EVENTO.fechaISO).getTime() - Date.now()) / 86400000
  )

  const kpis: [string, string, string][] = [
    ['Personas confirmadas', `${personasConfirmadas}`, `de ${personasInvitadas} invitadas`],
    ['Invitaciones enviadas', `${filas.length}`, `${confirmados.length} confirmaron`],
    ['Sin responder', `${pendientes.length}`, 'requieren seguimiento'],
    ['Faltan', `${diasRestantes}`, 'días para el evento'],
  ]

  const visibles = filtro === 'todos' ? filas : filas.filter((f) => f.estado === filtro)

  return (
    <>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map(([label, valor, pie]) => (
          <div key={label} className="tarjeta">
            <p className="text-xs uppercase tracking-[0.12em] text-muted">{label}</p>
            <p className="mt-2 font-display text-4xl text-primary tabular-nums">{valor}</p>
            <p className="mt-1 text-xs text-muted">{pie}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        {([
          ['todos', `Todos (${filas.length})`],
          ['confirmado', `Confirmados (${confirmados.length})`],
          ['no_asiste', `No asisten (${noAsisten.length})`],
          ['pendiente', `Pendientes (${pendientes.length})`],
        ] as const).map(([v, label]) => (
          <a
            key={v}
            href={`/admin?filtro=${v}`}
            className={`rounded-full border px-4 py-1.5 text-xs uppercase tracking-[0.1em] ${
              filtro === v ? 'border-primary bg-primary text-white' : 'border-line text-muted'
            }`}
          >
            {label}
          </a>
        ))}
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-line bg-surface">
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
                  <span className={`rounded-full px-2.5 py-1 text-xs ${badge[f.estado]}`}>
                    {f.estado === 'no_asiste' ? 'no asiste' : f.estado}
                  </span>
                </td>
                <td className="p-3 tabular-nums">
                  {f.pases_confirmados} / {f.pases_asignados}
                </td>
                <td className="p-3 text-muted">{f.grupo ?? '—'}</td>
                <td className="p-3 text-muted">{f.mesa ?? '—'}</td>
                <td className="p-3 text-muted">
                  {[f.acompanantes?.join(', '), f.restricciones, f.mensaje]
                    .filter(Boolean)
                    .join(' · ') || '—'}
                </td>
              </tr>
            ))}
            {visibles.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted">
                  Nada por aquí todavía.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
