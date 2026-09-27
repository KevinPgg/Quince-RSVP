import 'server-only'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { FLAGS_POR_OMISION, type Flags } from '@/config/features'
import type { Evento } from '@/lib/types'

/** Zona horaria del evento. Fija: Ecuador continental (UTC-5, sin horario de verano). */
export const ZONA_HORARIA = 'America/Guayaquil'

/** Lee el renglón único de evento. Si no existe, lo crea. */
export async function obtenerEvento(): Promise<Evento> {
  const db = supabaseAdmin()
  const { data } = await db.from('evento').select('*').limit(1).maybeSingle()
  if (data) return data as Evento

  const { data: creado, error } = await db
    .from('evento')
    .insert({ singleton: true })
    .select('*')
    .single()

  if (error || !creado) {
    throw new Error('No existe el renglón de evento y no se pudo crear. ¿Corriste la migración?')
  }
  return creado as Evento
}

/** Los flags guardados sobreescriben los valores por omisión. */
export function flagsDe(evento: Evento): Flags {
  return { ...FLAGS_POR_OMISION, ...(evento.flags ?? {}) } as Flags
}

// --- Formato de fechas -------------------------------------------------

export function fechaLarga(iso: string | null, tz: string): string {
  if (!iso) return 'Fecha por confirmar'
  return new Intl.DateTimeFormat('es-MX', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: tz,
  }).format(new Date(iso))
}

/** «14 de noviembre de 2026», sin el día de la semana. Para la portada:
 *  en versalitas con interletraje, `fechaLarga` parte en dos líneas a 390 px. */
export function fechaSinDia(iso: string | null, tz: string): string {
  if (!iso) return 'Fecha por confirmar'
  return new Intl.DateTimeFormat('es-MX', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: tz,
  }).format(new Date(iso))
}

export function fechaCorta(iso: string | null, tz: string): string {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('es-MX', {
    day: 'numeric', month: 'short', year: 'numeric', timeZone: tz,
  }).format(new Date(iso))
}

export function horaDe(iso: string | null, tz: string): string {
  if (!iso) return ''
  return new Intl.DateTimeFormat('es-MX', {
    hour: '2-digit', minute: '2-digit', timeZone: tz,
  }).format(new Date(iso))
}

/** Convierte un timestamptz a lo que espera <input type="datetime-local"> */
export function paraInputFecha(iso: string | null, tz: string): string {
  if (!iso) return ''
  const p = new Intl.DateTimeFormat('sv-SE', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', timeZone: tz, hour12: false,
  }).format(new Date(iso))
  return p.replace(' ', 'T')
}

/**
 * Convierte lo que devuelve <input type="datetime-local"> a timestamptz.
 * Usa el desfase horario vigente en esa fecha para la zona del evento,
 * así el horario de verano no corre la hora un mes antes de la fiesta.
 */
export function desdeInputFecha(valor: string, tz: string): string | null {
  if (!valor) return null
  const aprox = new Date(`${valor}:00Z`)
  const partes = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    timeZoneName: 'longOffset',
  }).formatToParts(aprox)
  let off = partes.find((p) => p.type === 'timeZoneName')?.value ?? 'GMT+00:00'
  off = off.replace('GMT', '').trim() || '+00:00'
  if (/^[+-]\d{1,2}$/.test(off)) {
    const signo = off[0]
    const hh = off.slice(1).padStart(2, '0')
    off = `${signo}${hh}:00`
  }
  const d = new Date(`${valor}:00${off}`)
  return Number.isNaN(d.getTime()) ? null : d.toISOString()
}

// --- Serialización de listas para editarlas como texto plano ----------

export function itinerarioATexto(items: { hora: string; titulo: string }[]): string {
  return items.map((i) => `${i.hora} | ${i.titulo}`).join('\n')
}

export function textoAItinerario(texto: string) {
  return texto
    .split('\n')
    .map((l) => l.split('|'))
    .filter((p) => p.length >= 2)
    .map((p) => ({ hora: p[0].trim().slice(0, 20), titulo: p.slice(1).join('|').trim().slice(0, 120) }))
    .filter((i) => i.hora && i.titulo)
    .slice(0, 30)
}

export function regalosATexto(items: { titulo: string; detalle: string }[]): string {
  return items.map((i) => `${i.titulo} | ${i.detalle}`).join('\n')
}

export function textoARegalos(texto: string) {
  return texto
    .split('\n')
    .map((l) => l.split('|'))
    .filter((p) => p.length >= 2)
    .map((p) => ({ titulo: p[0].trim().slice(0, 80), detalle: p.slice(1).join('|').trim().slice(0, 200) }))
    .filter((i) => i.titulo)
    .slice(0, 10)
}
