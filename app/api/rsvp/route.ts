import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { EVENTO } from '@/config/event'
import { FEATURES } from '@/config/features'

// ÚNICO punto de escritura de todo el portal.
// El navegador jamás toca Supabase directamente.

const MAX_RESPUESTAS_POR_INVITADO = 10 // freno anti-spam

function limpiar(v: unknown, max = 500): string | null {
  if (typeof v !== 'string') return null
  const s = v.trim().slice(0, max)
  return s === '' ? null : s
}

export async function POST(req: Request) {
  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Petición inválida.' }, { status: 400 })
  }

  const token = limpiar(body?.token, 64)
  if (!token) {
    return NextResponse.json({ error: 'Falta el identificador.' }, { status: 400 })
  }
  if (typeof body?.asiste !== 'boolean') {
    return NextResponse.json({ error: 'Elige una opción.' }, { status: 400 })
  }

  const db = supabaseAdmin()

  const { data: invitado } = await db
    .from('invitados')
    .select('id, pases_asignados')
    .eq('token', token)
    .is('eliminado_en', null)
    .maybeSingle<{ id: string; pases_asignados: number }>()

  if (!invitado) {
    return NextResponse.json({ error: 'Invitación no encontrada.' }, { status: 404 })
  }

  // --- Fecha límite ---
  if (
    FEATURES.aplicarFechaLimite &&
    Date.now() > new Date(EVENTO.limiteRsvpISO).getTime()
  ) {
    return NextResponse.json(
      { error: 'El plazo para confirmar ya cerró.' },
      { status: 403 }
    )
  }

  // --- Respuestas previas ---
  const { count } = await db
    .from('rsvp')
    .select('id', { count: 'exact', head: true })
    .eq('invitado_id', invitado.id)

  const previas = count ?? 0

  if (previas > 0 && !FEATURES.permitirCambiarRespuesta) {
    return NextResponse.json(
      { error: 'Ya registramos tu respuesta.' },
      { status: 409 }
    )
  }
  if (previas >= MAX_RESPUESTAS_POR_INVITADO) {
    return NextResponse.json(
      { error: 'Demasiados cambios. Contáctanos directamente.' },
      { status: 429 }
    )
  }

  // --- Pases: nunca más de los asignados ---
  const solicitados = Number(body?.pases_confirmados)
  const pases = body.asiste
    ? Math.min(
        Math.max(Number.isFinite(solicitados) ? solicitados : 1, 1),
        invitado.pases_asignados
      )
    : 0

  // --- Campos opcionales: se guardan solo si el flag está activo ---
  const acompanantes =
    FEATURES.pedirNombresAcompanantes && Array.isArray(body?.acompanantes)
      ? body.acompanantes
          .map((a: unknown) => limpiar(a, 120))
          .filter((a: string | null): a is string => a !== null)
          .slice(0, Math.max(0, pases - 1))
      : null

  const { error } = await db.from('rsvp').insert({
    invitado_id: invitado.id,
    asiste: body.asiste,
    pases_confirmados: pases,
    acompanantes: acompanantes && acompanantes.length > 0 ? acompanantes : null,
    restricciones: FEATURES.pedirRestriccionesAlimenticias
      ? limpiar(body?.restricciones, 300)
      : null,
    telefono: FEATURES.pedirTelefono ? limpiar(body?.telefono, 40) : null,
    mensaje: FEATURES.pedirMensaje ? limpiar(body?.mensaje, 800) : null,
  })

  if (error) {
    console.error('[rsvp] insert falló:', error.message)
    return NextResponse.json({ error: 'No pudimos guardar tu respuesta.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
