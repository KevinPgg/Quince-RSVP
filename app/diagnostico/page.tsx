import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

type Check = { titulo: string; ok: boolean; detalle: string }

/** Las claves JWT de Supabase llevan el rol en el payload. */
function rolDeLaClave(key: string): string {
  if (key.startsWith('sb_secret_')) return 'service_role'
  if (key.startsWith('sb_publishable_')) return 'anon (publicable)'
  try {
    const payload = JSON.parse(
      Buffer.from(key.split('.')[1], 'base64').toString('utf8')
    )
    return String(payload.role ?? 'desconocido')
  } catch {
    return 'no se pudo leer'
  }
}

async function correr(): Promise<Check[]> {
  const checks: Check[] = []

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  const secret = process.env.SESSION_SECRET

  checks.push({
    titulo: 'NEXT_PUBLIC_SUPABASE_URL',
    ok: !!url && url.startsWith('https://'),
    detalle: url ? url : 'FALTA en .env',
  })

  checks.push({
    titulo: 'SESSION_SECRET',
    ok: !!secret && secret.length >= 24,
    detalle: !secret
      ? 'FALTA en .env'
      : secret.length < 24
        ? `Solo ${secret.length} caracteres, se necesitan 24+`
        : `${secret.length} caracteres`,
  })

  if (!key) {
    checks.push({ titulo: 'SUPABASE_SERVICE_ROLE_KEY', ok: false, detalle: 'FALTA en .env' })
    return checks
  }

  const rol = rolDeLaClave(key)
  checks.push({
    titulo: 'SUPABASE_SERVICE_ROLE_KEY',
    ok: rol === 'service_role',
    detalle:
      rol === 'service_role'
        ? 'Es la clave service_role. Correcto.'
        : `Esta clave es "${rol}". Con RLS activo no puede leer ni escribir nada. Copia la service_role de Settings > API.`,
  })

  if (!url || rol !== 'service_role') return checks

  const db = createClient(url, key, { auth: { persistSession: false } })

  // ¿Se corrió la migración?
  const { data: evento, error: eEvento } = await db.from('evento').select('id, nombre').limit(1)
  checks.push({
    titulo: 'Tabla evento',
    ok: !eEvento && (evento?.length ?? 0) === 1,
    detalle: eEvento
      ? `${eEvento.code ?? ''} ${eEvento.message}`
      : (evento?.length ?? 0) === 1
        ? 'Existe el renglón único.'
        : `Hay ${evento?.length ?? 0} renglones, debería haber exactamente 1.`,
  })

  // ¿Se puede escribir?
  const { data: escrito, error: eEscritura } = await db
    .from('bitacora')
    .insert({ accion: 'config', entidad: 'evento', usuario_txt: 'diagnóstico' })
    .select('id')
    .single()
  if (escrito) await db.from('bitacora').delete().eq('id', escrito.id)

  checks.push({
    titulo: 'Permiso de escritura',
    ok: !eEscritura,
    detalle: eEscritura
      ? `${eEscritura.code ?? ''} ${eEscritura.message}`
      : 'Se pudo insertar y borrar un renglón de prueba.',
  })

  // Usuarios
  const { count, error: eUsuarios } = await db
    .from('usuarios')
    .select('id', { count: 'exact', head: true })
  checks.push({
    titulo: 'Usuarios registrados',
    ok: !eUsuarios,
    detalle: eUsuarios
      ? `${eUsuarios.code ?? ''} ${eUsuarios.message}`
      : count === 0
        ? '0 — /acceso te dejará crear el primer dueño.'
        : `${count} — la pantalla de alta inicial ya está cerrada.`,
  })

  return checks
}

export default async function Diagnostico() {
  // Solo en local. En producción esta ruta no existe.
  if (process.env.NODE_ENV === 'production') notFound()

  const checks = await correr()
  const todoBien = checks.every((c) => c.ok)

  return (
    <main className="mx-auto max-w-2xl px-5 py-10">
      <h1 className="titulo-seccion">Diagnóstico</h1>
      <p className="mt-2 text-sm text-muted">
        Solo visible en desarrollo. Revisa la configuración antes de culpar al código.
      </p>

      <p
        className={`mt-6 rounded-2xl p-4 text-sm ${
          todoBien ? 'bg-green-100 text-green-900' : 'bg-amber-100 text-amber-900'
        }`}
      >
        {todoBien
          ? 'Todo en orden. Ve a /acceso.'
          : 'Hay algo mal configurado. El detalle está abajo.'}
      </p>

      <ul className="mt-5 space-y-3">
        {checks.map((c) => (
          <li key={c.titulo} className="tarjeta">
            <div className="flex items-start gap-3">
              <span className={`mt-0.5 shrink-0 text-lg ${c.ok ? 'text-green-600' : 'text-red-600'}`}>
                {c.ok ? '✓' : '✕'}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium">{c.titulo}</p>
                <p className="mt-1 break-words text-xs leading-relaxed text-muted">{c.detalle}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </main>
  )
}
