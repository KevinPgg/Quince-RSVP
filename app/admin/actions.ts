'use server'

import { revalidatePath } from 'next/cache'
import { customAlphabet } from 'nanoid'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { exigirAdmin } from '@/lib/auth'

// Alfabeto sin caracteres que se confunden al dictar (l, o, 0, 1).
const nuevoToken = customAlphabet('abcdefghijkmnpqrstuvwxyz23456789', 10)

const MAX_ACOMPANANTES = 19

function texto(fd: FormData, campo: string, max = 200): string | null {
  const v = fd.get(campo)
  if (typeof v !== 'string') return null
  const s = v.trim().slice(0, max)
  return s === '' ? null : s
}

function pasesDesdeAcompanantes(fd: FormData): number {
  const n = Number(fd.get('acompanantes'))
  const seguro = Number.isFinite(n) ? Math.min(Math.max(n, 0), MAX_ACOMPANANTES) : 0
  return seguro + 1 // el titular siempre cuenta
}

export type ResultadoAccion = { ok: true } | { ok: false; error: string }

// -----------------------------------------------------------
export async function crearInvitacion(fd: FormData): Promise<ResultadoAccion> {
  await exigirAdmin()

  const nombre = texto(fd, 'nombre_display', 120)
  if (!nombre) return { ok: false, error: 'El nombre es obligatorio.' }

  const db = supabaseAdmin()
  const { error } = await db.from('invitados').insert({
    token: nuevoToken(),
    nombre_display: nombre,
    pases_asignados: pasesDesdeAcompanantes(fd),
    grupo: texto(fd, 'grupo', 60),
    mesa: texto(fd, 'mesa', 20),
    telefono: texto(fd, 'telefono', 40),
    notas: texto(fd, 'notas', 300),
  })

  if (error) {
    console.error('[admin] crear falló:', error.message)
    return { ok: false, error: 'No se pudo crear la invitación.' }
  }

  revalidatePath('/admin/invitados')
  revalidatePath('/admin')
  return { ok: true }
}

// -----------------------------------------------------------
export async function actualizarInvitacion(fd: FormData): Promise<ResultadoAccion> {
  await exigirAdmin()

  const id = texto(fd, 'id', 40)
  const nombre = texto(fd, 'nombre_display', 120)
  if (!id) return { ok: false, error: 'Falta el identificador.' }
  if (!nombre) return { ok: false, error: 'El nombre es obligatorio.' }

  const db = supabaseAdmin()

  // No permitir dejar menos pases de los que el invitado ya confirmó.
  const pases = pasesDesdeAcompanantes(fd)
  const { data: ultima } = await db
    .from('rsvp')
    .select('pases_confirmados')
    .eq('invitado_id', id)
    .order('respondido_en', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (ultima && ultima.pases_confirmados > pases) {
    return {
      ok: false,
      error: `Ya confirmaron ${ultima.pases_confirmados} lugares. No puedes bajar de ahí sin avisarles.`,
    }
  }

  const { error } = await db
    .from('invitados')
    .update({
      nombre_display: nombre,
      pases_asignados: pases,
      grupo: texto(fd, 'grupo', 60),
      mesa: texto(fd, 'mesa', 20),
      telefono: texto(fd, 'telefono', 40),
      notas: texto(fd, 'notas', 300),
    })
    .eq('id', id)

  if (error) {
    console.error('[admin] actualizar falló:', error.message)
    return { ok: false, error: 'No se pudo guardar el cambio.' }
  }

  revalidatePath('/admin/invitados')
  revalidatePath('/admin')
  return { ok: true }
}

// -----------------------------------------------------------
// Borrado suave: la fila y sus respuestas se conservan.
export async function archivarInvitacion(fd: FormData): Promise<ResultadoAccion> {
  await exigirAdmin()
  const id = texto(fd, 'id', 40)
  if (!id) return { ok: false, error: 'Falta el identificador.' }

  const db = supabaseAdmin()
  const { error } = await db
    .from('invitados')
    .update({ eliminado_en: new Date().toISOString() })
    .eq('id', id)

  if (error) return { ok: false, error: 'No se pudo archivar.' }

  revalidatePath('/admin/invitados')
  revalidatePath('/admin')
  return { ok: true }
}

export async function restaurarInvitacion(fd: FormData): Promise<ResultadoAccion> {
  await exigirAdmin()
  const id = texto(fd, 'id', 40)
  if (!id) return { ok: false, error: 'Falta el identificador.' }

  const db = supabaseAdmin()
  const { error } = await db
    .from('invitados')
    .update({ eliminado_en: null })
    .eq('id', id)

  if (error) return { ok: false, error: 'No se pudo restaurar.' }

  revalidatePath('/admin/invitados')
  revalidatePath('/admin')
  return { ok: true }
}

// -----------------------------------------------------------
// Borra la respuesta del invitado para que pueda volver a contestar
// desde cero (útil si respondió por error).
export async function reabrirRespuesta(fd: FormData): Promise<ResultadoAccion> {
  await exigirAdmin()
  const id = texto(fd, 'id', 40)
  if (!id) return { ok: false, error: 'Falta el identificador.' }

  const db = supabaseAdmin()
  const { error } = await db.from('rsvp').delete().eq('invitado_id', id)
  if (error) return { ok: false, error: 'No se pudo reabrir.' }

  revalidatePath('/admin/invitados')
  revalidatePath('/admin')
  return { ok: true }
}
