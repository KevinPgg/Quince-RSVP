import { supabaseAdmin } from '@/lib/supabase/admin'
import Nueva from './nueva'
import Tarjeta, { type Datos, type DatosEvento } from './tarjeta'
import { obtenerEvento, fechaLarga, ZONA_HORARIA } from '@/lib/evento'

export const dynamic = 'force-dynamic'

export default async function Invitaciones({
  searchParams,
}: {
  searchParams: Promise<{ ver?: string; q?: string }>
}) {
  const { ver = 'activas', q = '' } = await searchParams
  const db = supabaseAdmin()

  const e = await obtenerEvento()
  const datosEvento: DatosEvento = {
    nombre: e.nombre,
    fecha: fechaLarga(e.fecha, ZONA_HORARIA),
    lugar: e.lugar_nombre ?? '',
    whatsappPlantilla: e.whatsapp_plantilla,
  }

  const { data: invitados } = await db
    .from('invitados')
    .select('id, token, nombre_display, tipo, pases_asignados, grupo, mesa, telefono, notas, eliminado_en')
    .order('creado_en', { ascending: false })

  const { data: respuestas } = await db
    .from('rsvp')
    .select('invitado_id, asiste, pases_confirmados, respondido_en')
    .order('respondido_en', { ascending: false })

  // La primera aparición es la respuesta vigente (viene ordenado desc).
  const vigente = new Map<string, { asiste: boolean; pases_confirmados: number }>()
  for (const r of respuestas ?? []) {
    if (!vigente.has(r.invitado_id)) {
      vigente.set(r.invitado_id, { asiste: r.asiste, pases_confirmados: r.pases_confirmados })
    }
  }

  const todas: Datos[] = (invitados ?? []).map((i) => {
    const r = vigente.get(i.id)
    return {
      id: i.id,
      token: i.token,
      nombre_display: i.nombre_display,
      tipo: i.tipo,
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
    <div className="space-y-6">
      <Nueva />

      <div className="space-y-3">
        <div className="flex gap-2 overflow-x-auto">
          {([
            ['activas', `Activas (${activas.length})`],
            ['archivadas', `Archivadas (${archivadas.length})`],
          ] as const).map(([v, label]) => (
            <a
              key={v}
              href={`/invitacion?ver=${v}`}
              className={`whitespace-nowrap rounded-full border px-4 py-1.5 text-xs uppercase tracking-[0.1em] ${
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
            className="campo py-2.5 text-sm"
          />
          <button className="boton-borde shrink-0 px-5 py-2.5 text-xs">Buscar</button>
        </form>
      </div>

      <ul className="grid gap-3 lg:grid-cols-2">
        {visibles.map((inv) => (
          <Tarjeta key={inv.id} inv={inv} evento={datosEvento} />
        ))}
      </ul>

      {visibles.length === 0 && (
        <p className="py-12 text-center text-sm text-muted">
          {termino ? 'Sin coincidencias.' : 'Crea la primera invitación arriba.'}
        </p>
      )}
    </div>
  )
}
