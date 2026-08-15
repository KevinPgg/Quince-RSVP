import { NextResponse } from 'next/server'
import { COOKIE_ADMIN, hashPassword, passwordCorrecta, contrasenaDebil } from '@/lib/auth'

// Retardo fijo en cada intento. En serverless no hay estado compartido para
// un rate limit real, pero 700 ms por intento vuelve inviable la fuerza bruta
// contra una contraseña larga.
const RETARDO_MS = 700

export async function POST(req: Request) {
  const inicio = Date.now()
  const form = await req.formData()
  const intento = String(form.get('password') ?? '')
  const real = process.env.ADMIN_PASSWORD

  const origin = new URL(req.url).origin
  const destino = new URL('/admin', origin)

  const ok = !!real && intento.length > 0 && passwordCorrecta(intento, real)

  await new Promise((r) => setTimeout(r, Math.max(0, RETARDO_MS - (Date.now() - inicio))))

  if (!ok) {
    const fallo = NextResponse.redirect(destino, { status: 303 })
    fallo.cookies.set('quince_login_error', '1', { path: '/', maxAge: 10 })
    return fallo
  }

  if (contrasenaDebil(real)) {
    console.warn('[admin] ADMIN_PASSWORD tiene menos de 12 caracteres. Cámbiala.')
  }

  const res = NextResponse.redirect(destino, { status: 303 })
  res.cookies.set('quince_login_error', '', { path: '/', maxAge: 0 })
  res.cookies.set(COOKIE_ADMIN, hashPassword(real!), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  })
  return res
}
