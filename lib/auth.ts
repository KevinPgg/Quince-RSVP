import 'server-only'
import { cookies } from 'next/headers'
import {
  scryptSync,
  randomBytes,
  timingSafeEqual,
  createHmac,
} from 'crypto'
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { SesionUsuario, Rol } from '@/lib/types'

export const COOKIE_SESION = 'quince_sesion'
const DIAS_SESION = 14

// ---------------------------------------------------------------
//  Contraseñas: scrypt con sal aleatoria por usuario.
//  Formato almacenado:  scrypt$N$r$p$saltHex$hashHex
// ---------------------------------------------------------------
const N = 16384, R = 8, P = 1, LARGO = 32

export function hashearPassword(password: string): string {
  const salt = randomBytes(16)
  const hash = scryptSync(password.normalize('NFKC'), salt, LARGO, { N, r: R, p: P })
  return ['scrypt', N, R, P, salt.toString('hex'), hash.toString('hex')].join('$')
}

export function verificarPassword(password: string, almacenado: string): boolean {
  try {
    const [algo, n, r, p, saltHex, hashHex] = almacenado.split('$')
    if (algo !== 'scrypt') return false
    const salt = Buffer.from(saltHex, 'hex')
    const esperado = Buffer.from(hashHex, 'hex')
    const calculado = scryptSync(password.normalize('NFKC'), salt, esperado.length, {
      N: Number(n), r: Number(r), p: Number(p),
    })
    return timingSafeEqual(calculado, esperado)
  } catch {
    return false
  }
}

/** Fuerza mínima. No es opcional: es la única puerta del panel. */
export function passwordAceptable(pw: string): string | null {
  if (pw.length < 10) return 'La contraseña debe tener al menos 10 caracteres.'
  if (!/[a-zA-Z]/.test(pw) || !/[0-9]/.test(pw))
    return 'La contraseña debe combinar letras y números.'
  return null
}

// ---------------------------------------------------------------
//  Sesión: cookie firmada con HMAC. Sin tabla de sesiones, pero
//  el usuario se relee de la base en cada request, así que
//  desactivar una cuenta la corta de inmediato.
// ---------------------------------------------------------------
function secreto(): string {
  const s = process.env.SESSION_SECRET
  if (!s || s.length < 24) {
    throw new Error('Falta SESSION_SECRET (mínimo 24 caracteres) en el entorno.')
  }
  return s
}

function firmar(payload: string): string {
  return createHmac('sha256', secreto()).update(payload).digest('base64url')
}

function crearCookie(usuarioId: string): string {
  const exp = Date.now() + DIAS_SESION * 86400_000
  const payload = `${usuarioId}.${exp}`
  return `${payload}.${firmar(payload)}`
}

function leerCookie(valor: string): string | null {
  const partes = valor.split('.')
  if (partes.length !== 3) return null
  const [id, exp, firma] = partes
  const payload = `${id}.${exp}`
  const esperada = Buffer.from(firmar(payload))
  const recibida = Buffer.from(firma)
  if (esperada.length !== recibida.length) return null
  if (!timingSafeEqual(esperada, recibida)) return null
  if (Date.now() > Number(exp)) return null
  return id
}

export async function abrirSesion(usuarioId: string) {
  const c = await cookies()
  c.set(COOKIE_SESION, crearCookie(usuarioId), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: DIAS_SESION * 86400,
  })
}

export async function cerrarSesion() {
  const c = await cookies()
  c.set(COOKIE_SESION, '', { path: '/', maxAge: 0 })
}

// ---------------------------------------------------------------
//  Lectura de sesión
// ---------------------------------------------------------------
export async function sesionActual(): Promise<SesionUsuario | null> {
  let valor: string | undefined
  try {
    valor = (await cookies()).get(COOKIE_SESION)?.value
  } catch {
    return null
  }
  if (!valor) return null

  let id: string | null
  try {
    id = leerCookie(valor)
  } catch {
    return null // SESSION_SECRET mal configurado
  }
  if (!id) return null

  const { data } = await supabaseAdmin()
    .from('usuarios')
    .select('id, usuario, nombre, rol, activo')
    .eq('id', id)
    .maybeSingle()

  if (!data || !data.activo) return null
  return { id: data.id, usuario: data.usuario, nombre: data.nombre, rol: data.rol }
}

/** Para server actions: lanza si no hay sesión válida. */
export async function exigirSesion(rol?: Rol): Promise<SesionUsuario> {
  const s = await sesionActual()
  if (!s) throw new Error('No autorizado')
  if (rol === 'dueno' && s.rol !== 'dueno') throw new Error('Requiere permisos de dueño')
  return s
}

/** ¿Ya existe al menos un usuario? Si no, hay que crear el primero. */
export async function hayUsuarios(): Promise<boolean> {
  const { count } = await supabaseAdmin()
    .from('usuarios')
    .select('id', { count: 'exact', head: true })
  return (count ?? 0) > 0
}
