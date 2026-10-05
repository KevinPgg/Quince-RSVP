import 'server-only'
import type { PostgrestError } from '@supabase/supabase-js'

/**
 * Traduce el error de Postgres a algo accionable.
 * Los dos primeros casos son el 90% de los tropiezos al montar el proyecto,
 * y ambos se ven idénticos si solo dices "no se pudo".
 */
export function explicar(error: PostgrestError | null, accion: string): string {
  if (!error) return `No se pudo ${accion}.`

  const detalle = `${error.code ?? ''} ${error.message ?? ''}`.toLowerCase()

  // La anon key en lugar de la service_role: RLS bloquea todo.
  if (
    error.code === '42501' ||
    detalle.includes('permission denied') ||
    detalle.includes('row-level security')
  ) {
    return 'Supabase rechazó la operación por permisos. Casi siempre significa que SUPABASE_SERVICE_ROLE_KEY tiene la clave pública (anon / publishable) en vez de la service_role. Revísala en Settings > API y reinicia el servidor.'
  }

  // Falta una columna: hay una migración nueva sin correr. Va antes del
  // caso de tabla porque Postgres también dice «does not exist».
  if (
    error.code === '42703' ||
    error.code === 'PGRST204' ||
    (detalle.includes('column') && (detalle.includes('does not exist') || detalle.includes('could not find')))
  ) {
    return 'A la base le falta una columna: hay una migración nueva sin correr. Corre en el SQL Editor de Supabase el archivo más reciente de supabase/migrations (por ejemplo 0005_textos_secciones.sql) y vuelve a guardar.'
  }

  // La migración no se corrió, o se corrió en otro esquema.
  if (error.code === '42P01' || detalle.includes('does not exist')) {
    return 'La tabla no existe. Corre supabase/migrations/0001_init.sql en el SQL Editor del proyecto que apunta NEXT_PUBLIC_SUPABASE_URL.'
  }

  if (error.code === '23505') return 'Ese valor ya existe.'
  if (error.code === '23514') return 'Un dato quedó fuera del rango permitido.'

  // En local conviene ver el error crudo; en producción no.
  if (process.env.NODE_ENV !== 'production') {
    return `No se pudo ${accion}. Supabase dijo: ${error.code ?? 's/c'} — ${error.message}`
  }
  return `No se pudo ${accion}.`
}
