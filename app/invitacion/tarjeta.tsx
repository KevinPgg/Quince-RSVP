'use client'

import { useState, useTransition } from 'react'
import {
  actualizarInvitacion, archivarInvitacion,
  restaurarInvitacion, reabrirRespuesta,
} from './actions'
import { armarMensaje } from '@/lib/whatsapp'
import type { EstadoRsvp, TipoInvitacion, Resultado } from '@/lib/types'

export type Datos = {
  id: string
  token: string
  nombre_display: string
  tipo: TipoInvitacion
  pases_asignados: number
  grupo: string | null
  mesa: string | null
  telefono: string | null
  notas: string | null
  estado: EstadoRsvp
  pases_confirmados: number
  archivada: boolean
}

const estilos: Record<EstadoRsvp, string> = {
  confirmado: 'bg-green-100 text-green-800',
  no_asiste: 'bg-red-100 text-red-800',
  pendiente: 'bg-neutral-100 text-neutral-600',
}
const rotulos: Record<EstadoRsvp, string> = {
  confirmado: 'confirmado',
  no_asiste: 'no asiste',
  pendiente: 'sin responder',
}

/** Lo que la tarjeta necesita del evento para armar el mensaje. Se pasa
 *  desde el server component: `tarjeta.tsx` es cliente y no puede leer la
 *  base. */
export type DatosEvento = {
  nombre: string
  fecha: string
  lugar: string
  whatsappPlantilla: string | null
}

export default function Tarjeta({ inv, evento }: { inv: Datos; evento: DatosEvento }) {
  const [editando, setEditando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copiado, setCopiado] = useState(false)
  const [pendiente, iniciar] = useTransition()

  const link =
    typeof window !== 'undefined'
      ? `${window.location.origin}/i/${inv.token}`
      : `/i/${inv.token}`

  function correr(accion: (fd: FormData) => Promise<Resultado>) {
    const fd = new FormData()
    fd.set('id', inv.id)
    iniciar(async () => {
      const r = await accion(fd)
      setError(r.ok ? null : r.error)
    })
  }

  async function copiar() {
    try {
      await navigator.clipboard.writeText(link)
    } catch {
      return setError('Tu navegador bloqueó el portapapeles. Copia el link a mano.')
    }
    setCopiado(true)
    setTimeout(() => setCopiado(false), 1600)
  }

  const mensajeWa = encodeURIComponent(
    armarMensaje(evento.whatsappPlantilla, {
      nombre: inv.nombre_display,
      link,
      lugares: inv.pases_asignados,
      tipo: inv.tipo,
      evento: evento.nombre,
      fecha: evento.fecha,
      lugar: evento.lugar,
    })
  )

  // ---------------- Edición ----------------
  if (editando) {
    return (
      <li className="tarjeta">
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            const fd = new FormData(e.currentTarget)
            fd.set('id', inv.id)
            iniciar(async () => {
              const r = await actualizarInvitacion(fd)
              if (r.ok) { setEditando(false); setError(null) } else setError(r.error)
            })
          }}
        >
          <input type="hidden" name="tipo" value={inv.tipo} />
          <input type="hidden" name="lleva_acompanantes" value={inv.pases_asignados > 1 ? 'si' : 'no'} />

          <div>
            <label className="etiqueta">Nombre</label>
            <input name="nombre_display" className="campo" defaultValue={inv.nombre_display} required maxLength={120} />
          </div>

          <div>
            <label className="etiqueta">
              {inv.tipo === 'grupal' ? 'Lugares en total' : 'Acompañantes'}
            </label>
            {inv.tipo === 'grupal' ? (
              <select name="lugares" className="campo" defaultValue={String(inv.pases_asignados)}>
                {Array.from({ length: 49 }, (_, i) => i + 2).map((n) => (
                  <option key={n} value={n}>{n} lugares</option>
                ))}
              </select>
            ) : (
              <select name="acompanantes" className="campo" defaultValue={String(Math.max(1, inv.pases_asignados - 1))}>
                {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>{n} · {n + 1} lugares</option>
                ))}
              </select>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="etiqueta">Grupo</label>
              <input name="grupo" className="campo" defaultValue={inv.grupo ?? ''} maxLength={60} />
            </div>
            <div>
              <label className="etiqueta">Mesa</label>
              <input name="mesa" className="campo" defaultValue={inv.mesa ?? ''} maxLength={20} />
            </div>
            <div>
              <label className="etiqueta">Teléfono</label>
              <input name="telefono" className="campo" defaultValue={inv.telefono ?? ''} inputMode="tel" maxLength={40} />
            </div>
            <div>
              <label className="etiqueta">Notas internas</label>
              <input name="notas" className="campo" defaultValue={inv.notas ?? ''} maxLength={300} />
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex flex-col gap-2 sm:flex-row">
            <button className="boton-primario" disabled={pendiente}>
              {pendiente ? 'Guardando…' : 'Guardar'}
            </button>
            <button
              type="button"
              className="boton-borde"
              onClick={() => { setEditando(false); setError(null) }}
            >
              Cancelar
            </button>
          </div>
        </form>
      </li>
    )
  }

  // ---------------- Vista ----------------
  return (
    <li className={`tarjeta ${inv.archivada ? 'opacity-60' : ''}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium leading-snug">{inv.nombre_display}</p>
          <p className="mt-1 text-xs text-muted">
            {inv.tipo === 'grupal' ? 'Grupal' : 'Individual'} ·{' '}
            {inv.pases_confirmados}/{inv.pases_asignados} lugares
            {inv.grupo && ` · ${inv.grupo}`}
            {inv.mesa && ` · mesa ${inv.mesa}`}
          </p>
          {inv.notas && <p className="mt-1 text-xs italic text-muted">{inv.notas}</p>}
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs ${estilos[inv.estado]}`}>
          {rotulos[inv.estado]}
        </span>
      </div>

      {!inv.archivada && (
        <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          <button type="button" onClick={copiar} className="boton-borde px-4 py-2 text-xs">
            {copiado ? '¡Copiado!' : 'Copiar link'}
          </button>
          <a
            href={`https://wa.me/?text=${mensajeWa}`}
            target="_blank"
            rel="noreferrer"
            className="boton-borde px-4 py-2 text-xs"
          >
            WhatsApp
          </a>
          <a
            href={`/i/${inv.token}`}
            target="_blank"
            rel="noreferrer"
            className="boton-borde px-4 py-2 text-xs"
          >
            Ver
          </a>
          <button
            type="button"
            onClick={() => setEditando(true)}
            className="boton-borde px-4 py-2 text-xs"
          >
            Editar
          </button>
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-4 text-xs">
        {inv.estado !== 'pendiente' && !inv.archivada && (
          <button
            type="button"
            className="text-muted underline underline-offset-2"
            disabled={pendiente}
            onClick={() => {
              if (confirm('Se borrará su respuesta para que pueda contestar de nuevo. ¿Continuar?'))
                correr(reabrirRespuesta)
            }}
          >
            Reabrir respuesta
          </button>
        )}
        {inv.archivada ? (
          <button
            type="button"
            className="text-primary underline underline-offset-2"
            disabled={pendiente}
            onClick={() => correr(restaurarInvitacion)}
          >
            Restaurar
          </button>
        ) : (
          <button
            type="button"
            className="text-red-600 underline underline-offset-2"
            disabled={pendiente}
            onClick={() => {
              if (confirm(`¿Archivar la invitación de ${inv.nombre_display}? Su link dejará de funcionar.`))
                correr(archivarInvitacion)
            }}
          >
            Archivar
          </button>
        )}
      </div>

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </li>
  )
}
