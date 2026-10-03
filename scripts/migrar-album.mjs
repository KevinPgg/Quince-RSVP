/**
 * Paso 2 de 2: sube el álbum preparado a Supabase Storage y lo
 * registra en la tabla `fotos`. Se corre desde Windows, en la raíz
 * del repo, donde sí hay red:
 *
 *   python scripts/migrar-album.py      (paso 1, si no se ha corrido)
 *   node scripts/migrar-album.mjs
 *
 * Requiere haber corrido supabase/migrations/0004_album_storage.sql.
 * Si la tabla ya tiene fotos no hace nada, para no duplicar el álbum;
 * `--forzar` sube igual y las agrega al final.
 *
 * Va con fetch directo a la API REST y no con supabase-js: desde la
 * 2.10x, createClient exige WebSocket nativo (Node 22+) aunque no se
 * use realtime, y en Node 20 revienta al construir el cliente.
 */
import fs from 'node:fs'
import { randomUUID } from 'node:crypto'

const DIR = 'scripts/_migracion'

function entorno() {
  if (!fs.existsSync('.env')) {
    console.error('No encuentro .env. Corre esto desde la raíz del repo.')
    process.exit(1)
  }
  const env = Object.fromEntries(
    fs.readFileSync('.env', 'utf8').split(/\r?\n/)
      .filter((l) => l && !l.trimStart().startsWith('#') && l.includes('='))
      .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')] })
  )
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Falta NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.')
    process.exit(1)
  }
  return env
}

const env = entorno()
const URL_BASE = env.NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, '')
const KEY = env.SUPABASE_SERVICE_ROLE_KEY
const AUTH = { apikey: KEY, Authorization: `Bearer ${KEY}` }

async function rest(ruta, opciones = {}) {
  const r = await fetch(`${URL_BASE}/rest/v1/${ruta}`, {
    ...opciones,
    headers: { ...AUTH, 'Content-Type': 'application/json', ...(opciones.headers ?? {}) },
  })
  const texto = await r.text()
  if (!r.ok) return { error: texto || r.statusText }
  return { data: texto ? JSON.parse(texto) : null }
}

async function subir(ruta, cuerpo) {
  const r = await fetch(`${URL_BASE}/storage/v1/object/fotos/${ruta}`, {
    method: 'POST',
    headers: { ...AUTH, 'Content-Type': 'image/webp', 'cache-control': 'max-age=31536000', 'x-upsert': 'false' },
    body: cuerpo,
  })
  return r.ok ? null : (await r.text()) || r.statusText
}

async function quitar(ruta) {
  await fetch(`${URL_BASE}/storage/v1/object/fotos`, {
    method: 'DELETE',
    headers: { ...AUTH, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prefixes: [ruta] }),
  })
}

if (!fs.existsSync(`${DIR}/manifiesto.json`)) {
  console.error(`No existe ${DIR}/manifiesto.json. Corre primero: python scripts/migrar-album.py`)
  process.exit(1)
}
const manifiesto = JSON.parse(fs.readFileSync(`${DIR}/manifiesto.json`, 'utf8'))

const { data: existentes, error: errLeer } = await rest('fotos?select=orden&order=orden.desc')
if (errLeer) {
  console.error('No se pudo leer la tabla fotos:', errLeer)
  console.error('¿Corriste supabase/migrations/0004_album_storage.sql en el SQL Editor?')
  process.exit(1)
}
if (existentes.length > 0 && !process.argv.includes('--forzar')) {
  console.log(`La tabla ya tiene ${existentes.length} fotos. No subo nada para no duplicar.`)
  console.log('Si de verdad quieres agregarlas al final: node scripts/migrar-album.mjs --forzar')
  process.exit(0)
}
const base = existentes[0]?.orden ?? 0

let ok = 0
for (const f of manifiesto) {
  const ruta = `album/${randomUUID()}.webp`
  const errSubir = await subir(ruta, fs.readFileSync(`${DIR}/${f.archivo}`))
  if (errSubir) { console.error(`✗ ${f.archivo}: ${errSubir}`); continue }

  const { error: errFila } = await rest('fotos', {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({ ruta, alt: f.alt, pie: f.pie, orden: base + f.orden, ancho: f.ancho, alto: f.alto }),
  })
  if (errFila) {
    console.error(`✗ ${f.archivo}: ${errFila}`)
    await quitar(ruta)
    continue
  }
  ok++
  console.log(`✓ ${f.archivo} → ${ruta}`)
}
console.log(`\n${ok} de ${manifiesto.length} fotos migradas. Revisa /admin/fotos.`)
