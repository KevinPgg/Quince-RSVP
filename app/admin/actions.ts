'use server'

import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { exigirSesion, hashearPassword, passwordAceptable } from '@/lib/auth'
import { registrar } from '@/lib/bitacora'
import { explicar } from '@/lib/errores'
import { LARGO_MAXIMO } from '@/lib/whatsapp'
import { desdeInputFecha, textoAItinerario, textoARegalos, ZONA_HORARIA } from '@/lib/evento'
import { FLAGS_POR_OMISION, type ClaveFlag } from '@/config/features'
import type { Resultado, Rol } from '@/lib/types'

function txt(fd: FormData, k: string, max = 300): string | null {
  const v = fd.get(k)
  if (typeof v !== 'string') return null
  const s = v.trim().slice(0, max)
  return s === '' ? null : s
}

function revalidarTodo() {
  revalidatePath('/', 'layout')
}

// ===============================================================
//  EVENTO
// ===============================================================
export async function guardarEvento(fd: FormData): Promise<Resultado> {
  const sesion = await exigirSesion('dueno')

  const nombre = txt(fd, 'nombre', 60)
  if (!nombre) return { ok: false, error: 'El nombre de la quinceañera es obligatorio.' }

  // La zona horaria es fija: no se lee del formulario.
  const tz = ZONA_HORARIA
  const fecha = desdeInputFecha(String(fd.get('fecha') ?? ''), tz)
  const limite = desdeInputFecha(String(fd.get('limite_rsvp') ?? ''), tz)

  if (fecha && limite && new Date(limite) > new Date(fecha)) {
    return { ok: false, error: 'La fecha límite para confirmar no puede ser posterior al evento.' }
  }

  const db = supabaseAdmin()
  const { data: actual } = await db.from('evento').select('id').limit(1).maybeSingle()
  if (!actual) return { ok: false, error: 'No existe el evento. ¿Corriste la migración?' }

  const { error } = await db
    .from('evento')
    .update({
      nombre,
      nombre_completo: txt(fd, 'nombre_completo', 120),
      frase: txt(fd, 'frase', 400),
      fecha,
      zona_horaria: tz,
      limite_rsvp: limite,

      lugar_nombre: txt(fd, 'lugar_nombre', 120),
      lugar_direccion: txt(fd, 'lugar_direccion', 200),
      lugar_maps: txt(fd, 'lugar_maps', 500),

      itinerario: textoAItinerario(String(fd.get('itinerario') ?? '')),
      regalos: textoARegalos(String(fd.get('regalos') ?? '')),
      dress_code_titulo: txt(fd, 'dress_code_titulo', 80),
      dress_code_detalle: txt(fd, 'dress_code_detalle', 300),

      home_titulo: txt(fd, 'home_titulo', 80),
      home_descripcion: txt(fd, 'home_descripcion', 2000),

      contacto_nombre: txt(fd, 'contacto_nombre', 80),
      contacto_whatsapp: (txt(fd, 'contacto_whatsapp', 20) ?? '').replace(/\D/g, '') || null,

      actualizado_en: new Date().toISOString(),
    })
    .eq('id', actual.id)

  if (error) {
    console.error('[admin] guardar evento:', error)
    return { ok: false, error: explicar(error, 'guardar el evento') }
  }

  await registrar(sesion, 'config', 'evento', actual.id, { campo: 'datos del evento' })
  revalidarTodo()
  return { ok: true }
}

// ===============================================================
//  AJUSTES (flags + lista pública)
// ===============================================================
export async function guardarAjustes(fd: FormData): Promise<Resultado> {
  const sesion = await exigirSesion('dueno')

  const flags: Record<string, boolean> = {}
  for (const clave of Object.keys(FLAGS_POR_OMISION) as ClaveFlag[]) {
    flags[clave] = fd.get(`flag_${clave}`) === 'on'
  }

  const formato = fd.get('lista_publica_formato') === 'completo' ? 'completo' : 'nombre_pila'

  // Vacío = null, no cadena vacía: null significa «usa la plantilla del
  // código», así que borrar el campo devuelve el texto sugerido en lugar
  // de dejar el mensaje en blanco.
  const plantilla = txt(fd, 'whatsapp_plantilla', LARGO_MAXIMO)

  const db = supabaseAdmin()
  const { data: actual } = await db.from('evento').select('id').limit(1).maybeSingle()
  if (!actual) return { ok: false, error: 'No existe el evento.' }

  const { error } = await db
    .from('evento')
    .update({
      flags,
      lista_publica_activa: fd.get('lista_publica_activa') === 'on',
      lista_publica_formato: formato,
      whatsapp_plantilla: plantilla,
      actualizado_en: new Date().toISOString(),
    })
    .eq('id', actual.id)

  if (error) {
    console.error('[admin] guardar ajustes:', error)
    return { ok: false, error: explicar(error, 'guardar los ajustes') }
  }

  await registrar(sesion, 'config', 'evento', actual.id, {
    lista_publica: fd.get('lista_publica_activa') === 'on',
    formato,
  })
  revalidarTodo()
  return { ok: true }
}

// ===============================================================
//  USUARIOS
// ===============================================================
export async function crearUsuario(fd: FormData): Promise<Resultado> {
  const sesion = await exigirSesion('dueno')

  const nombre = txt(fd, 'nombre', 80)
  const usuario = (txt(fd, 'usuario', 60) ?? '').toLowerCase()
  const password = String(fd.get('password') ?? '')
  const rol: Rol = fd.get('rol') === 'dueno' ? 'dueno' : 'editor'

  if (!nombre) return { ok: false, error: 'Escribe el nombre.' }
  if (!/^[a-z0-9._-]{3,60}$/.test(usuario))
    return { ok: false, error: 'Usuario inválido: letras, números, punto, guion y guion bajo (mínimo 3).' }

  const problema = passwordAceptable(password)
  if (problema) return { ok: false, error: problema }

  const { data, error } = await supabaseAdmin()
    .from('usuarios')
    .insert({ usuario, nombre, rol, password_hash: hashearPassword(password) })
    .select('id')
    .single()

  if (error) {
    console.error('[admin] crear usuario:', error)
    if (error.code === '23505') return { ok: false, error: 'Ese nombre de usuario ya está tomado.' }
    return { ok: false, error: explicar(error, 'crear el usuario') }
  }

  await registrar(sesion, 'crear', 'usuario', data.id, { usuario, rol })
  revalidatePath('/admin/usuarios')
  return { ok: true }
}

export async function cambiarPassword(fd: FormData): Promise<Resultado> {
  const sesion = await exigirSesion('dueno')
  const id = txt(fd, 'id', 40)
  const password = String(fd.get('password') ?? '')
  if (!id) return { ok: false, error: 'Falta el identificador.' }

  const problema = passwordAceptable(password)
  if (problema) return { ok: false, error: problema }

  const { error } = await supabaseAdmin()
    .from('usuarios')
    .update({ password_hash: hashearPassword(password) })
    .eq('id', id)

  if (error) return { ok: false, error: explicar(error, 'cambiar la contraseña') }

  await registrar(sesion, 'editar', 'usuario', id, { campo: 'contraseña' })
  revalidatePath('/admin/usuarios')
  return { ok: true }
}

export async function cambiarEstadoUsuario(fd: FormData): Promise<Resultado> {
  const sesion = await exigirSesion('dueno')
  const id = txt(fd, 'id', 40)
  const activar = fd.get('activar') === 'si'
  if (!id) return { ok: false, error: 'Falta el identificador.' }

  if (id === sesion.id && !activar) {
    return { ok: false, error: 'No puedes desactivarte a ti mismo.' }
  }

  const db = supabaseAdmin()

  // Nunca dejar el portal sin un dueño activo.
  if (!activar) {
    const { data: duenos } = await db
      .from('usuarios')
      .select('id')
      .eq('rol', 'dueno')
      .eq('activo', true)
    if ((duenos ?? []).length <= 1 && (duenos ?? []).some((d) => d.id === id)) {
      return { ok: false, error: 'Es el único dueño activo. Nombra otro antes de desactivarlo.' }
    }
  }

  const { error } = await db.from('usuarios').update({ activo: activar }).eq('id', id)
  if (error) return { ok: false, error: explicar(error, 'actualizar el usuario') }

  await registrar(sesion, activar ? 'restaurar' : 'archivar', 'usuario', id)
  revalidatePath('/admin/usuarios')
  return { ok: true }
}

export async function cambiarRol(fd: FormData): Promise<Resultado> {
  const sesion = await exigirSesion('dueno')
  const id = txt(fd, 'id', 40)
  const rol: Rol = fd.get('rol') === 'dueno' ? 'dueno' : 'editor'
  if (!id) return { ok: false, error: 'Falta el identificador.' }

  if (id === sesion.id && rol !== 'dueno') {
    return { ok: false, error: 'No puedes quitarte a ti mismo el rol de dueño.' }
  }

  const { error } = await supabaseAdmin().from('usuarios').update({ rol }).eq('id', id)
  if (error) return { ok: false, error: explicar(error, 'cambiar el rol') }

  await registrar(sesion, 'editar', 'usuario', id, { rol })
  revalidatePath('/admin/usuarios')
  return { ok: true }
}
