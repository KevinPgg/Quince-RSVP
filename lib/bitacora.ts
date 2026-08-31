import 'server-only'
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { SesionUsuario } from '@/lib/types'

/** Registra una acción. Nunca debe tumbar la operación principal. */
export async function registrar(
  usuario: SesionUsuario | null,
  accion: string,
  entidad: string,
  entidadId: string | null,
  detalle?: Record<string, unknown>
) {
  try {
    await supabaseAdmin().from('bitacora').insert({
      usuario_id: usuario?.id ?? null,
      usuario_txt: usuario?.nombre ?? null,
      accion,
      entidad,
      entidad_id: entidadId,
      detalle: detalle ?? null,
    })
  } catch (e) {
    console.error('[bitacora] no se pudo registrar:', e)
  }
}
