import { cookies } from 'next/headers'
import { createHash, timingSafeEqual } from 'crypto'

export const COOKIE_ADMIN = 'quince_admin'

function sha256(s: string) {
  return createHash('sha256').update(s).digest()
}

export function hashPassword(pw: string) {
  return sha256(pw).toString('hex')
}

/** Comparación en tiempo constante: no filtra información por latencia. */
export function passwordCorrecta(intento: string, real: string) {
  return timingSafeEqual(sha256(intento), sha256(real))
}

export async function esAdmin(): Promise<boolean> {
  const pw = process.env.ADMIN_PASSWORD
  if (!pw) return false
  const c = await cookies()
  const cookie = c.get(COOKIE_ADMIN)?.value
  if (!cookie) return false
  return passwordCorrecta(cookie, hashPassword(pw))
}

/** Lanza si alguien invoca una server action sin sesión. */
export async function exigirAdmin() {
  if (!(await esAdmin())) throw new Error('No autorizado')
}

/** Advertencia en consola si la contraseña es trivial de adivinar. */
export function contrasenaDebil(pw: string | undefined) {
  return !pw || pw.length < 12
}
