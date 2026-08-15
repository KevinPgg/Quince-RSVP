'use client'

import { useRef, useState, useTransition } from 'react'
import { crearInvitacion } from '../actions'

export default function Nueva() {
  const ref = useRef<HTMLFormElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [pendiente, iniciar] = useTransition()

  return (
    <form
      ref={ref}
      className="tarjeta"
      onSubmit={(e) => {
        e.preventDefault()
        const fd = new FormData(e.currentTarget)
        iniciar(async () => {
          const r = await crearInvitacion(fd)
          if (r.ok) {
            ref.current?.reset()
            setError(null)
          } else {
            setError(r.error)
          }
        })
      }}
    >
      <h2 className="titulo-seccion text-xl">Nueva invitación</h2>
      <p className="mt-1 text-xs text-muted">
        El titular siempre cuenta como un lugar. Los acompañantes se suman a él.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="sm:col-span-2 lg:col-span-1">
          <label className="etiqueta" htmlFor="nombre_display">
            Nombre en la invitación *
          </label>
          <input
            id="nombre_display"
            name="nombre_display"
            className="campo"
            placeholder="Sofía Martínez"
            required
            maxLength={120}
          />
        </div>

        <div>
          <label className="etiqueta" htmlFor="acompanantes">
            Acompañantes
          </label>
          <select id="acompanantes" name="acompanantes" className="campo" defaultValue="0">
            {Array.from({ length: 20 }, (_, i) => i).map((n) => (
              <option key={n} value={n}>
                {n === 0 ? 'Sin acompañantes' : `${n} (${n + 1} lugares en total)`}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="etiqueta" htmlFor="grupo">Grupo</label>
          <input id="grupo" name="grupo" className="campo" placeholder="familia, amigos, padrinos" maxLength={60} />
        </div>

        <div>
          <label className="etiqueta" htmlFor="mesa">Mesa</label>
          <input id="mesa" name="mesa" className="campo" placeholder="Opcional" maxLength={20} />
        </div>

        <div>
          <label className="etiqueta" htmlFor="telefono">Teléfono</label>
          <input id="telefono" name="telefono" className="campo" inputMode="tel" placeholder="Para dar seguimiento" maxLength={40} />
        </div>

        <div>
          <label className="etiqueta" htmlFor="notas">Notas internas</label>
          <input id="notas" name="notas" className="campo" placeholder="Solo tú lo ves" maxLength={300} />
        </div>
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <button className="boton-primario mt-6" disabled={pendiente}>
        {pendiente ? 'Creando…' : 'Crear invitación'}
      </button>
    </form>
  )
}
