import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { FilaAsistencia } from '@/lib/types'

/** «Sofía Martínez Ruiz» -> «Sofía M.» */
function abreviar(nombre: string): string {
  const partes = nombre.trim().split(/\s+/)
  if (partes.length === 1) return partes[0]
  return `${partes[0]} ${partes[1][0].toUpperCase()}.`
}

/** «Ana», «Ana y Jorge», «Ana, Jorge y Camila». */
function enumerar(nombres: string[]): string {
  if (nombres.length <= 1) return nombres[0] ?? ''
  return `${nombres.slice(0, -1).join(', ')} y ${nombres[nombres.length - 1]}`
}

type Fila = Pick<
  FilaAsistencia,
  'id' | 'nombre_display' | 'tipo' | 'pases_asignados' | 'pases_confirmados' | 'acompanantes' | 'estado'
>

const COLUMNAS =
  'id, nombre_display, tipo, pases_asignados, pases_confirmados, acompanantes, estado'

/**
 * Nombres de una invitación. El titular de una individual cuenta como
 * asistente; en una grupal no hay titular, solo lugares.
 */
function integrantes(f: Fila, incluirAcompanantes: boolean): string[] {
  const acomp = incluirAcompanantes ? (f.acompanantes ?? []).filter((a) => a.trim()) : []
  if (f.tipo === 'grupal') return acomp
  return [f.nombre_display, ...acomp]
}

// =================================================================
//  Página principal: todos, agrupados por invitación.
//  Una píldora por grupo con los integrantes en texto corrido.
// =================================================================
export default async function ListaAsistentes({
  formato,
  incluirAcompanantes = true,
}: {
  formato: 'nombre_pila' | 'completo'
  /** Solo aplica si se están pidiendo los nombres de los acompañantes. */
  incluirAcompanantes?: boolean
}) {
  const { data } = await supabaseAdmin()
    .from('vista_asistencia')
    .select(COLUMNAS)
    .eq('estado', 'confirmado')
    .order('nombre_display')

  const filas = (data ?? []) as Fila[]
  const total = filas.reduce((a, f) => a + f.pases_confirmados, 0)

  if (filas.length === 0) {
    return (
      <p className="text-center text-sm text-muted">Todavía no hay confirmaciones.</p>
    )
  }

  const presentar = (n: string) => (formato === 'completo' ? n : abreviar(n))

  return (
    <div>
      <p className="text-center text-sm text-muted">
        {total} {total === 1 ? 'persona confirmada' : 'personas confirmadas'}
        {filas.length > 1 && ` · ${filas.length} invitaciones`}
      </p>

      <ul className="mt-5 flex flex-wrap justify-center gap-2">
        {filas.map((f) => {
          const nombres = integrantes(f, incluirAcompanantes).map(presentar)
          return (
            <li
              key={f.id}
              className="max-w-full rounded-2xl border border-line bg-surface px-4 py-2.5 shadow-[0_1px_12px_rgba(92,43,134,0.04)]"
            >
              <p className="font-cinzel text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8a6a33]">
                {presentar(f.nombre_display)}
                {f.pases_confirmados > 1 && (
                  <span className="text-primary"> · {f.pases_confirmados}</span>
                )}
              </p>
              {/* Si no se piden nombres de acompañantes, no hay nada que
                  enumerar: se dice cuántos vienen y ya. */}
              <p className="mt-1 text-[13px] leading-snug text-muted">
                {nombres.length > 0
                  ? enumerar(nombres)
                  : f.pases_confirmados === 1
                    ? 'Confirmado'
                    : `${f.pases_confirmados} personas`}
              </p>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

// =================================================================
//  Invitación /i/[token]: solo la unidad de quien abre el link.
//  No se enumera al resto de los invitados: quién más va es asunto
//  de la página principal, no del link personal de nadie.
// =================================================================
export async function MiGrupo({
  invitadoId,
  incluirAcompanantes = true,
  formato,
  enlaceATodos = true,
}: {
  invitadoId: string
  incluirAcompanantes?: boolean
  formato: 'nombre_pila' | 'completo'
  /** El atajo a la lista pública. Se apaga si la lista no está publicada. */
  enlaceATodos?: boolean
}) {
  const db = supabaseAdmin()

  const { data: mia } = await db
    .from('vista_asistencia')
    .select(COLUMNAS)
    .eq('id', invitadoId)
    .maybeSingle<Fila>()

  const { data: todos } = await db
    .from('vista_asistencia')
    .select('pases_confirmados')
    .eq('estado', 'confirmado')

  const total = (todos ?? []).reduce(
    (a, f) => a + ((f as { pases_confirmados: number }).pases_confirmados ?? 0),
    0
  )

  if (!mia || mia.estado !== 'confirmado') {
    return total > 0 ? (
      <p className="text-center text-sm text-muted">
        Somos {total} {total === 1 ? 'confirmado' : 'confirmados'} hasta ahora.
      </p>
    ) : null
  }

  const presentar = (n: string) => (formato === 'completo' ? n : abreviar(n))
  const nombres = integrantes(mia, incluirAcompanantes).map(presentar)
  const libres = Math.max(0, mia.pases_asignados - mia.pases_confirmados)

  return (
    <div className="tarjeta text-center">
      <p className="font-cinzel text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8a6a33]">
        {mia.pases_confirmados === 1 ? 'Confirmaste' : 'Ustedes confirmaron'}
      </p>

      <ul className="mt-4 flex flex-wrap justify-center gap-1.5">
        {nombres.map((n, i) => (
          <li
            key={`${n}-${i}`}
            className="rounded-full border border-accent/45 bg-base px-3.5 py-1.5 text-[13px]"
          >
            {n}
          </li>
        ))}
        {/* Sin nombres pedidos, el número es lo único que hay que decir. */}
        {nombres.length === 0 && (
          <li className="rounded-full border border-accent/45 bg-base px-3.5 py-1.5 text-[13px]">
            {mia.pases_confirmados} {mia.pases_confirmados === 1 ? 'lugar' : 'lugares'}
          </li>
        )}
        {libres > 0 && (
          <li className="rounded-full border border-line bg-base px-3.5 py-1.5 text-[13px] text-muted opacity-60">
            {libres} {libres === 1 ? 'lugar libre' : 'lugares libres'}
          </li>
        )}
      </ul>

      {total > 0 && (
        <p className="mt-4 text-[13px] leading-[1.7] text-muted">
          Somos {total} {total === 1 ? 'confirmado' : 'confirmados'} en total.
        </p>
      )}

      {enlaceATodos && (
        <Link href="/#asistentes" className="boton-oro mt-5">
          Ver quiénes van
        </Link>
      )}
    </div>
  )
}
