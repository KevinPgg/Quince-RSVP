'use server'

import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase/admin'
import {
  hashearPassword, verificarPassword, passwordAceptable,
  abrirSesion, cerrarSesion, hayUsuarios,
} from '@/lib/auth'
import { registrar } from '@/lib/bitacora'
import { explicar } from '@/lib/errores'
import type { Resultado } from '@/lib/types'

const RETARDO_MS = 600

function campo(fd: FormData, k: string, max = 120): string {
  const v = fd.get(k)
  return typeof v === 'string' ? v.trim().slice(0, max) : ''
}

// ---------------------------------------------------------------
export async function iniciarSesion(fd: FormData): Promise<Resultado> {
  const inicio = Date.now()
  const usuario = campo(fd, 'usuario', 60).toLowerCase()
  const password = campo(fd, 'password', 200)

  const db = supabaseAdmin()
  const { data } = await db
    .from('usuarios')
    .select('id, nombre, password_hash, activo')
    .eq('usuario', usuario)
    .maybeSingle()

  const ok = !!data && data.activo && verificarPassword(password, data.password_hash)

  // Mismo tiempo de respuesta exista o no el usuario.
  await new Promise((r) => setTimeout(r, Math.max(0, RETARDO_MS - (Date.now() - inicio))))

  if (!ok || !data) {
    return { ok: false, error: 'Usuario o contraseña incorrectos.' }
  }

  await abrirSesion(data.id)
  await db.from('usuarios').update({ ultimo_acceso: new Date().toISOString() }).eq('id', data.id)

  redirect('/invitacion')
}

// ---------------------------------------------------------------
// Alta del primer usuario. Solo funciona si la tabla está vacía;
// después queda cerrada para siempre.
export async function crearPrimerUsuario(fd: FormData): Promise<Resultado> {
  if (await hayUsuarios()) {
    return { ok: false, error: 'Ya existe un usuario. Inicia sesión.' }
  }

  const nombre = campo(fd, 'nombre', 80)
  const usuario = campo(fd, 'usuario', 60).toLowerCase()
  const password = campo(fd, 'password', 200)

  if (!nombre) return { ok: false, error: 'Escribe tu nombre.' }
  if (!/^[a-z0-9._-]{3,60}$/.test(usuario))
    return { ok: false, error: 'El usuario admite letras, números, punto, guion y guion bajo (mínimo 3).' }

  const problema = passwordAceptable(password)
  if (problema) return { ok: false, error: problema }

  const { data, error } = await supabaseAdmin()
    .from('usuarios')
    .insert({
      usuario, nombre, rol: 'dueno',
      password_hash: hashearPassword(password),
    })
    .select('id, usuario, nombre, rol')
    .single()

  if (error || !data) {
    console.error('[acceso] crear primer usuario:', error)
    return { ok: false, error: explicar(error, 'crear el usuario') }
  }

  await registrar(data, 'crear', 'usuario', data.id, { rol: 'dueno', primero: true })
  await abrirSesion(data.id)
  redirect('/admin/evento')
}

// ---------------------------------------------------------------
export async function salir() {
  await cerrarSesion()
  redirect('/acceso')
}
