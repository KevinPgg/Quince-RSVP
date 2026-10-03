import 'server-only'
import { supabaseAdmin } from '@/lib/supabase/admin'
import {
  ALBUM, COLORES_ALBUM, RETRATO_POR_OMISION, espejoAutomatico, type NivelEspejo,
} from '@/config/galeria'
import { validarPaleta } from '@/lib/colores'
import type { Evento, Foto } from '@/lib/types'

export const BUCKET = 'fotos'

export function urlPublica(ruta: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '')
  return `${base}/storage/v1/object/public/${BUCKET}/${ruta}`
}

export type FotoPublica = {
  id: string
  src: string
  alt: string
  pie: string
  espejo: NivelEspejo
}

/** Espejo efectivo: el elegido a mano, o el automático por posición. */
export function espejoDe(f: Pick<Foto, 'espejo'>, indice: number, total: number): NivelEspejo {
  return (f.espejo as NivelEspejo | null) ?? espejoAutomatico(indice, total)
}

/** Todas las fotos, visibles o no, en orden. Para el panel. */
export async function listarFotos(): Promise<{ fotos: Foto[]; error: string | null }> {
  const { data, error } = await supabaseAdmin()
    .from('fotos')
    .select('*')
    .order('orden', { ascending: true })
    .order('creado_en', { ascending: true })
  if (error) {
    const falta = error.code === '42P01' || /does not exist|schema cache/i.test(error.message)
    return {
      fotos: [],
      error: falta
        ? 'Falta la tabla de fotos. Corre supabase/migrations/0004_album_storage.sql en el SQL Editor.'
        : error.message,
    }
  }
  return { fotos: data ?? [], error: null }
}

/**
 * Álbum público. Si la tabla está vacía o no existe todavía, cae a
 * las fotos del repo (config/galeria.ts) para que la portada nunca
 * se quede sin álbum.
 */
export async function obtenerAlbum(): Promise<FotoPublica[]> {
  const { fotos, error } = await listarFotos()
  if (error) console.error('[album]', error)
  const visibles = fotos.filter((f) => f.visible)

  if (visibles.length === 0) {
    return ALBUM.map((f, i) => ({
      id: f.src,
      src: f.src,
      alt: f.alt,
      pie: f.pie ?? '',
      espejo: espejoAutomatico(i, ALBUM.length),
    }))
  }
  return visibles.map((f, i) => ({
    id: f.id,
    src: urlPublica(f.ruta),
    alt: f.alt,
    pie: f.pie ?? '',
    espejo: espejoDe(f, i, visibles.length),
  }))
}

export function retratoDe(e: Evento): string {
  return e.retrato_ruta ? urlPublica(e.retrato_ruta) : RETRATO_POR_OMISION
}

export function coloresDe(e: Evento): string[] {
  const c = e.album_colores
  return c && validarPaleta(c) === null ? c : COLORES_ALBUM
}
