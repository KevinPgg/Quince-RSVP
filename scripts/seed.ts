/**
 * Carga la lista de invitados a Supabase y genera los links.
 *
 *   1. Copia scripts/invitados.example.csv a scripts/invitados.csv
 *   2. Llénalo con tu lista real
 *   3. npm run seed
 *
 * Genera scripts/links-generados.csv con la URL de cada invitado.
 * Es idempotente por nombre: si vuelves a correrlo, no duplica ni
 * regenera tokens de quien ya existe.
 */
import 'dotenv/config'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../lib/database.types'
import { customAlphabet } from 'nanoid'

const nano = customAlphabet('abcdefghijkmnpqrstuvwxyz23456789', 10)

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
if (!url || !key) throw new Error('Faltan variables de entorno de Supabase (.env)')

const db = createClient<Database>(url, key, { auth: { persistSession: false } })

function parseCsv(texto: string) {
  const lineas = texto.trim().split(/\r?\n/)
  const cols = lineas[0].split(',').map((c) => c.trim())
  return lineas.slice(1).filter(Boolean).map((linea) => {
    // CSV simple con soporte de comillas
    const campos: string[] = []
    let actual = '', dentro = false
    for (const ch of linea) {
      if (ch === '"') dentro = !dentro
      else if (ch === ',' && !dentro) { campos.push(actual); actual = '' }
      else actual += ch
    }
    campos.push(actual)
    return Object.fromEntries(cols.map((c, i) => [c, (campos[i] ?? '').trim()]))
  })
}

async function main() {
  const ruta = resolve(process.cwd(), 'scripts/invitados.csv')
  if (!existsSync(ruta)) {
    throw new Error('No existe scripts/invitados.csv. Copia el .example y llénalo.')
  }

  const filas = parseCsv(readFileSync(ruta, 'utf8'))
  const { data: existentes } = await db.from('invitados').select('nombre_display, token')
  const yaHay = new Map((existentes ?? []).map((e: any) => [e.nombre_display, e.token]))

  const nuevos = filas
    .filter((f) => f.nombre_display && !yaHay.has(f.nombre_display))
    .map((f) => ({
      token: nano(),
      nombre_display: f.nombre_display,
      pases_asignados: Math.max(1, Number(f.pases_asignados) || 1),
      grupo: f.grupo || null,
      mesa: f.mesa || null,
      telefono: f.telefono || null,
    }))

  if (nuevos.length > 0) {
    const { error } = await db.from('invitados').insert(nuevos)
    if (error) throw error
  }
  console.log(`Insertados: ${nuevos.length} · Ya existían: ${filas.length - nuevos.length}`)

  const { data: todos } = await db
    .from('invitados')
    .select('nombre_display, pases_asignados, token')
    .order('nombre_display')

  const csv =
    '﻿nombre,pases,link\n' +
    (todos ?? [])
      .map((i: any) => `"${i.nombre_display}",${i.pases_asignados},${site}/i/${i.token}`)
      .join('\n')

  writeFileSync(resolve(process.cwd(), 'scripts/links-generados.csv'), csv)
  console.log('Links escritos en scripts/links-generados.csv')
}

main().catch((e) => { console.error(e); process.exit(1) })
