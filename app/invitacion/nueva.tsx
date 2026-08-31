'use client'

import { useRef, useState, useTransition } from 'react'
import { crearInvitacion } from './actions'

export default function Nueva() {
  const ref = useRef<HTMLFormElement>(null)
  const [tipo, setTipo] = useState<'individual' | 'grupal'>('individual')
  const [llevaAcomp, setLlevaAcomp] = useState(false)
  const [abierto, setAbierto] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  const [pendiente, iniciar] = useTransition()

  return (
    <section className="tarjeta">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <span>
          <span className="titulo-seccion block text-xl">Nueva invitación</span>
          <span className="mt-1 block text-xs text-muted">
            Lugar, fecha y hora ya vienen del evento. Aquí solo el invitado.
          </span>
        </span>
        <span className="shrink-0 text-2xl leading-none text-primary">
          {abierto ? '−' : '+'}
        </span>
      </button>

      {abierto && (
        <form
          ref={ref}
          className="mt-6 space-y-5"
          onSubmit={(e) => {
            e.preventDefault()
            const fd = new FormData(e.currentTarget)
            iniciar(async () => {
              const r = await crearInvitacion(fd)
              if (r.ok) {
                ref.current?.reset()
                setTipo('individual')
                setLlevaAcomp(false)
                setError(null)
                setAviso('Invitación creada. Aparece abajo con su link.')
                setTimeout(() => setAviso(null), 4000)
              } else {
                setError(r.error)
              }
            })
          }}
        >
          {/* Tipo */}
          <div>
            <span className="etiqueta">Tipo de invitación</span>
            <input type="hidden" name="tipo" value={tipo} />
            <div className="grid gap-2 sm:grid-cols-2">
              {([
                ['individual', 'Individual', 'Para una persona, con o sin acompañantes.'],
                ['grupal', 'Grupal', 'Un solo link para varios lugares. Lo abre quien lo tenga.'],
              ] as const).map(([v, titulo, ayuda]) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setTipo(v)}
                  className={`rounded-2xl border p-4 text-left transition ${
                    tipo === v ? 'border-primary bg-primary/5' : 'border-line'
                  }`}
                >
                  <span className="block text-sm font-medium">{titulo}</span>
                  <span className="mt-1 block text-xs leading-snug text-muted">{ayuda}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="etiqueta" htmlFor="nombre_display">
              {tipo === 'grupal' ? 'Nombre del grupo *' : 'Nombre y apellidos *'}
            </label>
            <input
              id="nombre_display"
              name="nombre_display"
              className="campo"
              placeholder={tipo === 'grupal' ? 'Familia López Hernández' : 'Sofía Martínez Ruiz'}
              required
              maxLength={120}
            />
          </div>

          {/* Lugares */}
          {tipo === 'grupal' ? (
            <div>
              <label className="etiqueta" htmlFor="lugares">Lugares en total</label>
              <select id="lugares" name="lugares" className="campo" defaultValue="4">
                {Array.from({ length: 49 }, (_, i) => i + 2).map((n) => (
                  <option key={n} value={n}>{n} lugares</option>
                ))}
              </select>
              <p className="mt-2 text-xs text-muted">
                Quien abra el link confirma cuántos de esos {' '}lugares se ocupan.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <span className="etiqueta">¿Lleva acompañantes?</span>
                <input type="hidden" name="lleva_acompanantes" value={llevaAcomp ? 'si' : 'no'} />
                <div className="grid grid-cols-2 gap-2">
                  {([[false, 'No'], [true, 'Sí']] as const).map(([v, label]) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setLlevaAcomp(v)}
                      className={`rounded-full border px-4 py-2.5 text-sm transition ${
                        llevaAcomp === v ? 'border-primary bg-primary text-white' : 'border-line text-muted'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {llevaAcomp && (
                <div>
                  <label className="etiqueta" htmlFor="acompanantes">Cuántos acompañantes</label>
                  <select id="acompanantes" name="acompanantes" className="campo" defaultValue="1">
                    {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>
                        {n} · {n + 1} lugares en total
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Opcionales */}
          <details className="rounded-2xl border border-line p-4">
            <summary className="cursor-pointer text-xs uppercase tracking-[0.12em] text-muted">
              Datos opcionales
            </summary>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="etiqueta" htmlFor="grupo">Grupo</label>
                <input id="grupo" name="grupo" className="campo" placeholder="familia, amigos, padrinos" maxLength={60} />
              </div>
              <div>
                <label className="etiqueta" htmlFor="mesa">Mesa</label>
                <input id="mesa" name="mesa" className="campo" maxLength={20} />
              </div>
              <div>
                <label className="etiqueta" htmlFor="telefono">Teléfono</label>
                <input id="telefono" name="telefono" className="campo" inputMode="tel" maxLength={40} />
              </div>
              <div>
                <label className="etiqueta" htmlFor="notas">Notas internas</label>
                <input id="notas" name="notas" className="campo" placeholder="Solo tú lo ves" maxLength={300} />
              </div>
            </div>
          </details>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {aviso && <p className="text-sm text-green-700">{aviso}</p>}

          <button className="boton-primario w-full sm:w-auto" disabled={pendiente}>
            {pendiente ? 'Creando…' : 'Crear y generar link'}
          </button>
        </form>
      )}
    </section>
  )
}
