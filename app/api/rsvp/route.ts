import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { obtenerEvento, flagsDe } from '@/lib/evento'

// ÚNICO punto de escritura público del portal.
// El navegador nunca habla con Supabase directamente.

const MAX_RESPUESTAS_POR_INVITADO = 20 // freno anti-spam; el link no expira

function limpiar(v: unknown, max = 500): string | null {
  if (typeof v !== 'string') return null
  const s = v.trim().slice(0, max)
  return s === '' ? null : s
}

export async function POST(req: Request) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Petición inválida.' }, { status: 400 })
  }

  const token = limpiar(body?.token, 64)
  if (!token) return NextResponse.json({ error: 'Falta el identificador.' }, { status: 400 })
  if (typeof body?.asiste !== 'boolean')
    return NextResponse.json({ error: 'Elige una opción.' }, { status: 400 })

  const db = supabaseAdmin()

  const { data: invitado } = await db
    .from('invitados')
    .select('id, tipo, pases_asignados')
    .eq('token', token)
    .is('eliminado_en', null)
    .maybeSingle()

  if (!invitado) {
    return NextResponse.json({ error: 'Invitación no encontrada.' }, { status: 404 })
  }

  const evento = await obtenerEvento()
  const flags = flagsDe(evento)

  if (flags.aplicarFechaLimite && evento.limite_rsvp &&
      Date.now() > new Date(evento.limite_rsvp).getTime()) {
    return NextResponse.json({ error: 'El plazo para confirmar ya cerró.' }, { status: 403 })
  }

  const { count } = await db
    .from('rsvp')
    .select('id', { count: 'exact', head: true })
    .eq('invitado_id', invitado.id)
  const previas = count ?? 0

  if (previas > 0 && !flags.permitirCambiarRespuesta) {
    return NextResponse.json({ error: 'Ya registramos tu respuesta.' }, { status: 409 })
  }
  if (previas >= MAX_RESPUESTAS_POR_INVITADO) {
    return NextResponse.json(
      { error: 'Demasiados cambios. Contáctanos directamente.' },
      { status: 429 }
    )
  }

  // Nunca más lugares de los asignados.
  const solicitados = Number(body?.pases_confirmados)
  const pases = body.asiste
    ? Math.min(
        Math.max(Number.isFinite(solicitados) ? solicitados : 1, 1),
        invitado.pases_asignados
      )
    : 0

  const maxNombres = invitado.tipo === 'grupal' ? pases : Math.max(0, pases - 1)
  const acompanantes =
    flags.pedirNombresAcompanantes && Array.isArray(body?.acompanantes)
      ? (body.acompanantes as unknown[])
          .map((a) => limpiar(a, 120))
          .filter((a): a is string => a !== null)
          .slice(0, maxNombres)
      : null

  const { error } = await db.from('rsvp').insert({
    invitado_id: invitado.id,
    asiste: body.asiste,
    pases_confirmados: pases,
    acompanantes: acompanantes && acompanantes.length > 0 ? acompanantes : null,
    restricciones: flags.pedirRestriccionesAlimenticias ? limpiar(body?.restricciones, 300) : null,
    telefono: flags.pedirTelefono ? limpiar(body?.telefono, 40) : null,
    mensaje: flags.pedirMensaje ? limpiar(body?.mensaje, 800) : null,
  })

  if (error) {
    console.error('[rsvp] insert falló:', error.message)
    return NextResponse.json({ error: 'No pudimos guardar tu respuesta.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
