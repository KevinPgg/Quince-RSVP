'use server'

import { randomUUID } from 'crypto'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { exigirSesion } from '@/lib/auth'
import { registrar } from '@/lib/bitacora'
import { BUCKET, urlPublica } from '@/lib/album'
import { RETRATO_POR_OMISION, espejoAutomatico, type FotoPanel, type NivelEspejo } from '@/config/galeria'
import { validarPaleta } from '@/lib/colores'
import type { Resultado } from '@/lib/types'

// El navegador ya entrega WebP reducido (~150-400 KB). Este tope es
// solo la red de seguridad; debe quedar por debajo de
// `serverActions.bodySizeLimit` en next.config.mjs.
const PESO_MAXIMO = 3.5 * 1024 * 1024
const TIPOS: Record<string, string> = { 'image/webp': 'webp', 'image/jpeg': 'jpg', 'image/png': 'png' }

// Sin revalidatePath a propósito: `/` es force-dynamic y siempre lee la
// base, y revalidar aquí hacía que Next volviera a pedir /admin/fotos
// entera tras cada cambio. El panel lleva su propio estado en el cliente.
type Con<T> = ({ ok: true } & T) | { ok: false; error: string }
const UUID = /^[0-9a-f-]{36}$/i

function txt(fd: FormData, k: string, max: number): string | null {
  const v = fd.get(k)
  if (typeof v !== 'string') return null
  const s = v.trim().slice(0, max)
  return s === '' ? null : s
}

function entero(fd: FormData, k: string): number | null {
  const n = Number(fd.get(k))
  return Number.isFinite(n) && n > 0 ? Math.round(n) : null
}

/** Valida y sube el archivo del FormData. Devuelve la ruta o un error. */
async function subirArchivo(fd: FormData, carpeta: 'album' | 'retrato'): Promise<{ ruta: string } | { error: string }> {
  const archivo = fd.get('archivo')
  if (!(archivo instanceof File) || archivo.size === 0) return { error: 'No llegó ninguna imagen.' }
  const ext = TIPOS[archivo.type]
  if (!ext) return { error: 'Formato no admitido. Usa JPG, PNG o WebP.' }
  if (archivo.size > PESO_MAXIMO) return { error: 'La imagen pesa demasiado incluso después de reducirla.' }

  const ruta = `${carpeta}/${randomUUID()}.${ext}`
  const { error } = await supabaseAdmin()
    .storage.from(BUCKET)
    .upload(ruta, archivo, { contentType: archivo.type, cacheControl: '31536000', upsert: false })
  if (error) {
    console.error('[fotos] subir:', error)
    return {
      error: /bucket not found/i.test(error.message)
        ? 'No existe el bucket «fotos». Corre supabase/migrations/0004_album_storage.sql.'
        : `Supabase Storage rechazó la imagen: ${error.message}`,
    }
  }
  return { ruta }
}

async function quitarArchivo(ruta: string | null | undefined) {
  if (!ruta) return
  const { error } = await supabaseAdmin().storage.from(BUCKET).remove([ruta])
  if (error) console.error('[fotos] borrar archivo:', ruta, error)
}

// ===============================================================
//  ÁLBUM
// ===============================================================
export async function subirFoto(fd: FormData): Promise<Con<{ foto: FotoPanel }>> {
  const sesion = await exigirSesion('dueno')
  const r = await subirArchivo(fd, 'album')
  if ('error' in r) return { ok: false, error: r.error }

  const db = supabaseAdmin()
  const { data: ultima } = await db.from('fotos').select('orden').order('orden', { ascending: false }).limit(1).maybeSingle()
  const orden = (ultima?.orden ?? 0) + 1

  const { data, error } = await db
    .from('fotos')
    .insert({
      ruta: r.ruta,
      alt: `Foto ${orden} del álbum de Ángeles`,
      orden,
      ancho: entero(fd, 'ancho'),
      alto: entero(fd, 'alto'),
    })
    .select('id')
    .single()

  if (error || !data) {
    await quitarArchivo(r.ruta)
    return { ok: false, error: error?.message ?? 'No se pudo registrar la foto.' }
  }
  await registrar(sesion, 'crear', 'foto', data.id, { ruta: r.ruta })
  return { ok: true, foto: { id: data.id, src: urlPublica(r.ruta), pie: null, espejo: null, visible: true } }
}

/** Guarda el orden completo de una vez (tras soltar en el drag and drop). */
export async function reordenarFotos(ids: string[]): Promise<Resultado> {
  const sesion = await exigirSesion('dueno')
  if (!Array.isArray(ids) || ids.length > 500 || !ids.every((id) => typeof id === 'string' && UUID.test(id))) {
    return { ok: false, error: 'Orden no válido.' }
  }
  const db = supabaseAdmin()
  const res = await Promise.all(ids.map((id, k) => db.from('fotos').update({ orden: k + 1 }).eq('id', id)))
  const fallo = res.find((r) => r.error)
  if (fallo?.error) return { ok: false, error: fallo.error.message }
  await registrar(sesion, 'editar', 'foto', null, { campo: 'orden del álbum' })
  return { ok: true }
}

export async function guardarEspejo(id: string, nivel: NivelEspejo): Promise<Resultado> {
  await exigirSesion('dueno')
  if (!UUID.test(id) || ![1, 2, 3, 4, 5].includes(nivel)) return { ok: false, error: 'Espejo no válido.' }
  const { error } = await supabaseAdmin().from('fotos').update({ espejo: nivel }).eq('id', id)
  return error ? { ok: false, error: error.message } : { ok: true }
}

/**
 * Reparte los cinco espejos por partes iguales entre las fotos
 * visibles (total ÷ 5) y los FIJA en cada foto: después de esto,
 * reordenar no cambia el espejo de nadie.
 */
export async function repartirEspejos(): Promise<Con<{ niveles: Record<string, NivelEspejo> }>> {
  const sesion = await exigirSesion('dueno')
  const db = supabaseAdmin()
  const { data, error } = await db.from('fotos').select('id, visible').order('orden').order('creado_en')
  if (error || !data) return { ok: false, error: error?.message ?? 'No se pudo leer el álbum.' }

  const visibles = data.filter((f) => f.visible)
  const niveles: Record<string, NivelEspejo> = {}
  visibles.forEach((f, i) => { niveles[f.id] = espejoAutomatico(i, visibles.length) })

  const res = await Promise.all(Object.entries(niveles).map(([id, n]) => db.from('fotos').update({ espejo: n }).eq('id', id)))
  const fallo = res.find((r) => r.error)
  if (fallo?.error) return { ok: false, error: fallo.error.message }
  await registrar(sesion, 'config', 'foto', null, { campo: 'espejos repartidos' })
  return { ok: true, niveles }
}

export async function guardarDetalles(id: string, pie: string, visible: boolean): Promise<Resultado> {
  await exigirSesion('dueno')
  if (!UUID.test(id)) return { ok: false, error: 'Foto no válida.' }
  const limpio = String(pie ?? '').trim().slice(0, 60)
  const { error } = await supabaseAdmin()
    .from('fotos')
    .update({ pie: limpio === '' ? null : limpio, visible: !!visible })
    .eq('id', id)
  return error ? { ok: false, error: error.message } : { ok: true }
}

export async function borrarFoto(id: string): Promise<Resultado> {
  const sesion = await exigirSesion('dueno')
  if (!UUID.test(id)) return { ok: false, error: 'Foto no válida.' }
  const db = supabaseAdmin()
  const { data } = await db.from('fotos').select('ruta').eq('id', id).maybeSingle()
  const { error } = await db.from('fotos').delete().eq('id', id)
  if (error) return { ok: false, error: error.message }
  await quitarArchivo(data?.ruta)
  await registrar(sesion, 'eliminar', 'foto', id, { ruta: data?.ruta })
  return { ok: true }
}

// ===============================================================
//  COLORES DEL ÁLBUM
// ===============================================================
export async function guardarColores(fd: FormData): Promise<Resultado> {
  const sesion = await exigirSesion('dueno')
  let colores: string[] | null = null

  if (fd.get('restaurar') !== '1') {
    try {
      colores = JSON.parse(String(fd.get('colores') ?? '[]'))
    } catch {
      return { ok: false, error: 'La paleta no tiene el formato esperado.' }
    }
    const motivo = validarPaleta(colores)
    if (motivo) return { ok: false, error: motivo }
    colores = colores!.map((c) => c.toLowerCase())
  }

  const db = supabaseAdmin()
  const { data: ev } = await db.from('evento').select('id').limit(1).maybeSingle()
  if (!ev) return { ok: false, error: 'No existe el evento.' }
  const { error } = await db.from('evento').update({ album_colores: colores }).eq('id', ev.id)
  if (error) return { ok: false, error: error.message }

  await registrar(sesion, 'config', 'evento', ev.id, { campo: 'colores del álbum', colores })
  return { ok: true }
}

// ===============================================================
//  FOTO PRINCIPAL
// ===============================================================
export async function subirRetrato(fd: FormData): Promise<Con<{ url: string }>> {
  const sesion = await exigirSesion('dueno')
  const db = supabaseAdmin()
  const { data: ev } = await db.from('evento').select('id, retrato_ruta').limit(1).maybeSingle()
  if (!ev) return { ok: false, error: 'No existe el evento.' }

  const r = await subirArchivo(fd, 'retrato')
  if ('error' in r) return { ok: false, error: r.error }

  const { error } = await db.from('evento').update({ retrato_ruta: r.ruta }).eq('id', ev.id)
  if (error) {
    await quitarArchivo(r.ruta)
    return { ok: false, error: error.message }
  }
  await quitarArchivo(ev.retrato_ruta)
  await registrar(sesion, 'config', 'evento', ev.id, { campo: 'foto principal' })
  return { ok: true, url: urlPublica(r.ruta) }
}

/** Vuelve al retrato del repo. */
export async function quitarRetrato(): Promise<Con<{ url: string }>> {
  const sesion = await exigirSesion('dueno')
  const db = supabaseAdmin()
  const { data: ev } = await db.from('evento').select('id, retrato_ruta').limit(1).maybeSingle()
  if (!ev) return { ok: false, error: 'No existe el evento.' }
  const { error } = await db.from('evento').update({ retrato_ruta: null }).eq('id', ev.id)
  if (error) return { ok: false, error: error.message }
  await quitarArchivo(ev.retrato_ruta)
  await registrar(sesion, 'config', 'evento', ev.id, { campo: 'foto principal', valor: 'por omisión' })
  return { ok: true, url: RETRATO_POR_OMISION }
}
