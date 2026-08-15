'use client'

import { useState, useTransition } from 'react'
import {
  actualizarInvitacion,
  archivarInvitacion,
  restaurarInvitacion,
  reabrirRespuesta,
} from '../actions'

export type FilaProps = {
  id: string
  token: string
  nombre_display: string
  pases_asignados: number
  grupo: string | null
  mesa: string | null
  telefono: string | null
  notas: string | null
  estado: 'pendiente' | 'confirmado' | 'no_asiste'
  pases_confirmados: number
  archivada: boolean
}

const badge: Record<FilaProps['estado'], string> = {
  confirmado: 'bg-green-100 text-green-800',
  no_asiste: 'bg-red-100 text-red-800',
  pendiente: 'bg-neutral-100 text-neutral-600',
}

export default function Fila({ inv }: { inv: FilaProps }) {
  const [editando, setEditando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copiado, setCopiado] = useState(false)
  const [pendiente, iniciar] = useTransition()

  const link =
    typeof window !== 'undefined' ? `${window.location.origin}/i/${inv.token}` : `/i/${inv.token}`

  function correr(accion: (fd: FormData) => Promise<{ ok: true } | { ok: false; error: string }>) {
    const fd = new FormData()
    fd.set('id', inv.id)
    iniciar(async () => {
      const r = await accion(fd)
      setError(r.ok ? null : r.error)
    })
  }

  if (editando) {
    return (
      <tr className="bg-base/60">
        <td colSpan={6} className="p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              const fd = new FormData(e.currentTarget)
              fd.set('id', inv.id)
              iniciar(async () => {
                const r = await actualizarInvitacion(fd)
                if (r.ok) { setEditando(false); setError(null) } else setError(r.error)
              })
            }}
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
          >
            <input name="nombre_display" className="campo" defaultValue={inv.nombre_display} required maxLength={120} />
            <select name="acompanantes" className="campo" defaultValue={String(inv.pases_asignados - 1)}>
              {Array.from({ length: 20 }, (_, i) => i).map((n) => (
                <option key={n} value={n}>
                  {n === 0 ? 'Sin acompañantes' : `${n} (${n + 1} lugares)`}
                </option>
              ))}
            </select>
            <input name="grupo" className="campo" defaultValue={inv.grupo ?? ''} placeholder="Grupo" maxLength={60} />
            <input name="mesa" className="campo" defaultValue={inv.mesa ?? ''} placeholder="Mesa" maxLength={20} />
            <input name="telefono" className="campo" defaultValue={inv.telefono ?? ''} placeholder="Teléfono" maxLength={40} />
            <input name="notas" className="campo" defaultValue={inv.notas ?? ''} placeholder="Notas internas" maxLength={300} />

            {error && <p className="text-sm text-red-600 sm:col-span-2 lg:col-span-3">{error}</p>}

            <div className="flex gap-3 sm:col-span-2 lg:col-span-3">
              <button className="boton-primario" disabled={pendiente}>
                {pendiente ? 'Guardando…' : 'Guardar'}
              </button>
              <button type="button" className="boton-borde" onClick={() => { setEditando(false); setError(null) }}>
                Cancelar
              </button>
            </div>
          </form>
        </td>
      </tr>
    )
  }

  return (
    <tr className={inv.archivada ? 'opacity-50' : undefined}>
      <td className="p-3">
        <div className="font-medium">{inv.nombre_display}</div>
        {inv.notas && <div className="text-xs text-muted">{inv.notas}</div>}
        {error && <div className="text-xs text-red-600">{error}</div>}
      </td>
      <td className="p-3">
        <span className={`rounded-full px-2.5 py-1 text-xs ${badge[inv.estado]}`}>
          {inv.estado === 'no_asiste' ? 'no asiste' : inv.estado}
        </span>
      </td>
      <td className="p-3 tabular-nums">
        {inv.pases_confirmados} / {inv.pases_asignados}
      </td>
      <td className="p-3 text-muted">{inv.grupo ?? '—'}</td>
      <td className="p-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="rounded-full border border-line px-3 py-1 text-xs hover:border-primary hover:text-primary"
            onClick={async () => {
              await navigator.clipboard.writeText(link)
              setCopiado(true)
              setTimeout(() => setCopiado(false), 1500)
            }}
          >
            {copiado ? '¡Copiado!' : 'Copiar link'}
          </button>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(
              `Hola ${inv.nombre_display}, te comparto la invitación a mis XV años. Ahí mismo puedes confirmar: ${link}`
            )}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-line px-3 py-1 text-xs hover:border-primary hover:text-primary"
          >
            WhatsApp
          </a>
          <a
            href={`/i/${inv.token}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-line px-3 py-1 text-xs hover:border-primary hover:text-primary"
          >
            Ver
          </a>
        </div>
      </td>
      <td className="p-3">
        <div className="flex flex-wrap gap-3 text-xs">
          {!inv.archivada && (
            <button type="button" className="text-primary underline" onClick={() => setEditando(true)}>
              Editar
            </button>
          )}
          {inv.estado !== 'pendiente' && !inv.archivada && (
            <button
              type="button"
              className="text-muted underline"
              disabled={pendiente}
              onClick={() => {
                if (confirm('Se borrará su respuesta para que pueda contestar de nuevo. ¿Continuar?'))
                  correr(reabrirRespuesta)
              }}
            >
              Reabrir
            </button>
          )}
          {inv.archivada ? (
            <button type="button" className="text-primary underline" disabled={pendiente} onClick={() => correr(restaurarInvitacion)}>
              Restaurar
            </button>
          ) : (
            <button
              type="button"
              className="text-red-600 underline"
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
      </td>
    </tr>
  )
}
