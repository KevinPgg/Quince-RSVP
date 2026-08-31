/**
 * Herramienta de recuperación del panel. Se corre desde Windows,
 * en la raíz del repo, donde sí hay red:
 *
 *   node scripts/usuarios.mjs listar
 *   node scripts/usuarios.mjs clave <usuario> "<contraseña nueva>"
 *   node scripts/usuarios.mjs crear <usuario> "<nombre>" "<contraseña>"
 *
 * Lee .env directamente. Usa la clave service_role, así que salta RLS:
 * no lo subas a ningún servidor ni lo expongas como ruta.
 *
 * Las contraseñas se guardan con scrypt y sal aleatoria, exactamente
 * con los mismos parámetros que lib/auth.ts. No hay forma de recuperar
 * una contraseña olvidada: solo de reemplazarla.
 */
import fs from 'node:fs'
import { scryptSync, randomBytes } from 'node:crypto'

const N = 16384, R = 8, P = 1, LARGO = 32

function hashear(password) {
  const salt = randomBytes(16)
  const hash = scryptSync(password.normalize('NFKC'), salt, LARGO, { N, r: R, p: P })
  return ['scrypt', N, R, P, salt.toString('hex'), hash.toString('hex')].join('$')
}

function aceptable(pw) {
  if (pw.length < 10) return 'La contraseña debe tener al menos 10 caracteres.'
  if (!/[a-zA-Z]/.test(pw) || !/[0-9]/.test(pw)) return 'Debe combinar letras y números.'
  return null
}

function entorno() {
  if (!fs.existsSync('.env')) {
    console.error('No encuentro .env. Corre esto desde la raíz del repo.')
    process.exit(1)
  }
  const env = Object.fromEntries(
    fs.readFileSync('.env', 'utf8').split(/\r?\n/)
      .filter((l) => l && !l.trimStart().startsWith('#') && l.includes('='))
      .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()] })
  )
  const url = env.NEXT_PUBLIC_SUPABASE_URL
  const key = env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    console.error('Falta NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.')
    process.exit(1)
  }
  return { url, key }
}

async function api(ruta, opciones = {}) {
  const { url, key } = entorno()
  const r = await fetch(`${url}/rest/v1/${ruta}`, {
    ...opciones,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...(opciones.headers ?? {}),
    },
  })
  const cuerpo = await r.text()
  if (!r.ok) {
    console.error(`Supabase respondió ${r.status}: ${cuerpo}`)
    process.exit(1)
  }
  return cuerpo ? JSON.parse(cuerpo) : null
}

const [accion, ...args] = process.argv.slice(2)

if (accion === 'listar') {
  const filas = await api('usuarios?select=usuario,nombre,rol,activo,creado_en,ultimo_acceso&order=creado_en')
  if (!filas.length) {
    console.log('La tabla usuarios está vacía. Abre /acceso y crea el primer usuario ahí.')
  } else {
    console.log(`${filas.length} usuario(s):\n`)
    for (const u of filas) {
      console.log(`  usuario:       ${u.usuario}`)
      console.log(`  nombre:        ${u.nombre}`)
      console.log(`  rol:           ${u.rol}${u.activo ? '' : '   (DESACTIVADO)'}`)
      console.log(`  último acceso: ${u.ultimo_acceso ?? 'nunca'}\n`)
    }
  }
} else if (accion === 'clave') {
  const [usuario, password] = args
  if (!usuario || !password) {
    console.error('Uso: node scripts/usuarios.mjs clave <usuario> "<contraseña nueva>"')
    process.exit(1)
  }
  const problema = aceptable(password)
  if (problema) { console.error(problema); process.exit(1) }

  const filas = await api(`usuarios?usuario=eq.${encodeURIComponent(usuario.toLowerCase())}`, {
    method: 'PATCH',
    body: JSON.stringify({ password_hash: hashear(password), activo: true }),
  })
  if (!filas.length) {
    console.error(`No existe el usuario "${usuario}". Corre "listar" para ver cuáles hay.`)
    process.exit(1)
  }
  console.log(`Contraseña de "${filas[0].usuario}" reemplazada. La cuenta queda activa.`)
  console.log('Entra en /acceso con esos datos.')
} else if (accion === 'crear') {
  const [usuario, nombre, password] = args
  if (!usuario || !nombre || !password) {
    console.error('Uso: node scripts/usuarios.mjs crear <usuario> "<nombre>" "<contraseña>"')
    process.exit(1)
  }
  if (!/^[a-z0-9._-]{3,60}$/.test(usuario.toLowerCase())) {
    console.error('El usuario admite letras, números, punto, guion y guion bajo (mínimo 3).')
    process.exit(1)
  }
  const problema = aceptable(password)
  if (problema) { console.error(problema); process.exit(1) }

  const filas = await api('usuarios', {
    method: 'POST',
    body: JSON.stringify({
      usuario: usuario.toLowerCase(), nombre, rol: 'dueno',
      password_hash: hashear(password),
    }),
  })
  console.log(`Usuario "${filas[0].usuario}" creado con rol dueño.`)
} else {
  console.log(`Herramienta de recuperación del panel.

  node scripts/usuarios.mjs listar
  node scripts/usuarios.mjs clave <usuario> "<contraseña nueva>"
  node scripts/usuarios.mjs crear <usuario> "<nombre>" "<contraseña>"

La contraseña debe tener 10+ caracteres y combinar letras y números.`)
}
