'use server'

import { revalidatePath } from 'next/cache'
import { customAlphabet } from 'nanoid'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { exigirSesion } from '@/lib/auth'
import { registrar } from '@/lib/bitacora'
import { explicar } from '@/lib/errores'
import type { Resultado, TipoInvitacion } from '@/lib/types'

// Sin caracteres que se confunden al dictar por teléfono (l, o, 0, 1).
const nuevoToken = customAlphabet('abcdefghijkmnpqrstuvwxyz23456789', 10)

const MAX_LUGARES = 50

function txt(fd: FormData, k: string, max = 200): string | null {
  const v = fd.get(k)
  if (typeof v !== 'string') return null
  const s = v.trim().slice(0, max)
  return s === '' ? null : s
}

/**
 * Los dos tipos comparten la misma aritmética:
 *  - individual: 1 titular + N acompañantes  -> pases = 1 + N
 *  - grupal    : N lugares en un solo link   -> pases = N
 * El tipo cambia la redacción y la validación, no el conteo.
 */
function calcularPases(fd: FormData, tipo: TipoInvitacion): number {
  if (tipo === 'grupal') {
    const n = Number(fd.get('lugares'))
    return Math.min(Math.max(Number.isFinite(n) ? n : 2, 2), MAX_LUGARES)
  }
  const permite = fd.get('lleva_acompanantes') === 'si'
  if (!permite) return 1
  const n = Number(fd.get('acompanantes'))
  const seguro = Math.min(Math.max(Number.isFinite(n) ? n : 1, 1), MAX_LUGARES - 1)
  return seguro + 1
}

function leerTipo(fd: FormData): TipoInvitacion {
  return fd.get('tipo') === 'grupal' ? 'grupal' : 'individual'
}

function revalidar() {
  revalidatePath('/invitacion')
  revalidatePath('/invitacion/asistencia')
  revalidatePath('/')
}

// ---------------------------------------------------------------
export async function crearInvitacion(fd: FormData): Promise<Resultado> {
  const sesion = await exigirSesion()

  const nombre = txt(fd, 'nombre_display', 120)
  if (!nombre) return { ok: false, error: 'El nombre es obligatorio.' }

  const tipo = leerTipo(fd)
  const pases = calcularPases(fd, tipo)
  const token = nuevoToken()

  const { data, error } = await supabaseAdmin()
    .from('invitados')
    .insert({
      token,
      nombre_display: nombre,
      tipo,
      pases_asignados: pases,
      grupo: txt(fd, 'grupo', 60),
      mesa: txt(fd, 'mesa', 20),
      telefono: txt(fd, 'telefono', 40),
      notas: txt(fd, 'notas', 300),
      creado_por: sesion.id,
    })
    .select('id')
    .single()

  if (error || !data) {
    console.error('[invitacion] crear falló:', error)
    return { ok: false, error: explicar(error, 'crear la invitación') }
  }

  await registrar(sesion, 'crear', 'invitacion', data.id, { nombre, tipo, pases })
  revalidar()
  return { ok: true }
}

// ---------------------------------------------------------------
export async function actualizarInvitacion(fd: FormData): Promise<Resultado> {
  const sesion = await exigirSesion()

  const id = txt(fd, 'id', 40)
  const nombre = txt(fd, 'nombre_display', 120)
  if (!id) return { ok: false, error: 'Falta el identificador.' }
  if (!nombre) return { ok: false, error: 'El nombre es obligatorio.' }

  const db = supabaseAdmin()
  const tipo = leerTipo(fd)
  const pases = calcularPases(fd, tipo)

  // No permitir dejar menos lugares de los que ya confirmaron.
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
      error: `Ya confirmaron ${ultima.pases_confirmados} lugares. Avísales antes de bajar el número.`,
    }
  }

  const { error } = await db
    .from('invitados')
    .update({
      nombre_display: nombre,
      tipo,
      pases_asignados: pases,
      grupo: txt(fd, 'grupo', 60),
      mesa: txt(fd, 'mesa', 20),
      telefono: txt(fd, 'telefono', 40),
      notas: txt(fd, 'notas', 300),
    })
    .eq('id', id)

  if (error) return { ok: false, error: explicar(error, 'guardar el cambio') }

  await registrar(sesion, 'editar', 'invitacion', id, { nombre, tipo, pases })
  revalidar()
  return { ok: true }
}

// ---------------------------------------------------------------
export async function archivarInvitacion(fd: FormData): Promise<Resultado> {
  const sesion = await exigirSesion()
  const id = txt(fd, 'id', 40)
  if (!id) return { ok: false, error: 'Falta el identificador.' }

  const { error } = await supabaseAdmin()
    .from('invitados')
    .update({ eliminado_en: new Date().toISOString(), eliminado_por: sesion.id })
    .eq('id', id)

  if (error) return { ok: false, error: explicar(error, 'archivar') }

  await registrar(sesion, 'archivar', 'invitacion', id)
  revalidar()
  return { ok: true }
}

export async function restaurarInvitacion(fd: FormData): Promise<Resultado> {
  const sesion = await exigirSesion()
  const id = txt(fd, 'id', 40)
  if (!id) return { ok: false, error: 'Falta el identificador.' }

  const { error } = await supabaseAdmin()
    .from('invitados')
    .update({ eliminado_en: null, eliminado_por: null })
    .eq('id', id)

  if (error) return { ok: false, error: explicar(error, 'restaurar') }

  await registrar(sesion, 'restaurar', 'invitacion', id)
  revalidar()
  return { ok: true }
}

// ---------------------------------------------------------------
/** Borra la respuesta para que el invitado conteste desde cero. */
export async function reabrirRespuesta(fd: FormData): Promise<Resultado> {
  const sesion = await exigirSesion()
  const id = txt(fd, 'id', 40)
  if (!id) return { ok: false, error: 'Falta el identificador.' }

  const { error } = await supabaseAdmin().from('rsvp').delete().eq('invitado_id', id)
  if (error) return { ok: false, error: explicar(error, 'reabrir la respuesta') }

  await registrar(sesion, 'reabrir', 'invitacion', id)
  revalidar()
  return { ok: true }
}
