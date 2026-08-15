'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FEATURES } from '@/config/features'
import type { RespuestaVigente } from '@/lib/types'

type Props = {
  token: string
  pasesAsignados: number
  respuesta: RespuestaVigente
  vencido: boolean
  limiteTexto: string
}

export default function RsvpForm({
  token,
  pasesAsignados,
  respuesta,
  vencido,
  limiteTexto,
}: Props) {
  const router = useRouter()

  const yaRespondio = respuesta !== null
  const [editando, setEditando] = useState(!yaRespondio)
  const [asiste, setAsiste] = useState<boolean | null>(respuesta?.asiste ?? null)
  const [pases, setPases] = useState<number>(
    respuesta?.pases_confirmados ?? pasesAsignados
  )
  const [acompanantes, setAcompanantes] = useState<string[]>(
    respuesta?.acompanantes ?? []
  )
  const [restricciones, setRestricciones] = useState(respuesta?.restricciones ?? '')
  const [telefono, setTelefono] = useState(respuesta?.telefono ?? '')
  const [mensaje, setMensaje] = useState(respuesta?.mensaje ?? '')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ---- Estados que bloquean el formulario ----
  if (vencido && !yaRespondio) {
    return (
      <div className="tarjeta text-center">
        <p className="text-sm text-muted">
          El plazo para confirmar cerró el {limiteTexto}. Por favor contáctanos
          directamente.
        </p>
      </div>
    )
  }

  if (yaRespondio && !editando) {
    return (
      <div className="tarjeta text-center">
        <p className="font-display text-2xl text-primary">
          {respuesta!.asiste ? '¡Nos vemos ahí!' : 'Te vamos a extrañar'}
        </p>
        <p className="mt-3 text-sm text-muted">
          {respuesta!.asiste
            ? `Confirmaste ${respuesta!.pases_confirmados} ${
                respuesta!.pases_confirmados === 1 ? 'lugar' : 'lugares'
              }.`
            : 'Registramos que no podrás acompañarnos.'}
        </p>
        {FEATURES.permitirCambiarRespuesta && !vencido && (
          <button
            onClick={() => setEditando(true)}
            className="mt-5 text-xs uppercase tracking-[0.15em] text-primary underline"
          >
            Cambiar mi respuesta
          </button>
        )}
      </div>
    )
  }

  // ---- Envío ----
  async function enviar() {
    if (asiste === null) {
      setError('Elige una opción para continuar.')
      return
    }
    setEnviando(true)
    setError(null)

    const res = await fetch('/api/rsvp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token,
        asiste,
        pases_confirmados: asiste ? pases : 0,
        acompanantes: FEATURES.pedirNombresAcompanantes
          ? acompanantes.filter((a) => a.trim() !== '')
          : null,
        restricciones: FEATURES.pedirRestriccionesAlimenticias ? restricciones : null,
        telefono: FEATURES.pedirTelefono ? telefono : null,
        mensaje: FEATURES.pedirMensaje ? mensaje : null,
      }),
    })

    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      setError(j.error ?? 'No pudimos guardar tu respuesta. Intenta de nuevo.')
      setEnviando(false)
      return
    }

    router.push(`/i/${token}/gracias`)
  }

  const numAcompanantesExtra = Math.max(0, pases - 1)

  return (
    <div className="tarjeta space-y-6">
      {/* Sí / No */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setAsiste(true)}
          className={
            asiste === true
              ? 'boton bg-primary text-white'
              : 'boton border border-line text-muted'
          }
        >
          Sí asistiré
        </button>
        <button
          type="button"
          onClick={() => setAsiste(false)}
          className={
            asiste === false
              ? 'boton bg-primary text-white'
              : 'boton border border-line text-muted'
          }
        >
          No podré
        </button>
      </div>

      {/* Pases: solo si hay más de uno asignado */}
      {asiste === true && pasesAsignados > 1 && (
        <div>
          <label className="etiqueta" htmlFor="pases">
            ¿Cuántos asistirán? (máximo {pasesAsignados})
          </label>
          <select
            id="pases"
            className="campo"
            value={pases}
            onChange={(e) => {
              const n = Number(e.target.value)
              setPases(n)
              setAcompanantes((prev) => prev.slice(0, Math.max(0, n - 1)))
            }}
          >
            {Array.from({ length: pasesAsignados }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Nombres de acompañantes (flag) */}
      {asiste === true &&
        FEATURES.pedirNombresAcompanantes &&
        numAcompanantesExtra > 0 && (
          <div className="space-y-3">
            <span className="etiqueta">Nombres de quienes te acompañan</span>
            {Array.from({ length: numAcompanantesExtra }, (_, i) => (
              <input
                key={i}
                className="campo"
                placeholder={`Acompañante ${i + 1}`}
                value={acompanantes[i] ?? ''}
                onChange={(e) => {
                  const copia = [...acompanantes]
                  copia[i] = e.target.value
                  setAcompanantes(copia)
                }}
              />
            ))}
          </div>
        )}

      {/* Restricciones alimenticias (flag) */}
      {asiste === true && FEATURES.pedirRestriccionesAlimenticias && (
        <div>
          <label className="etiqueta" htmlFor="restricciones">
            Restricciones alimenticias o alergias
          </label>
          <input
            id="restricciones"
            className="campo"
            placeholder="Opcional"
            value={restricciones}
            onChange={(e) => setRestricciones(e.target.value)}
          />
        </div>
      )}

      {/* Teléfono (flag) */}
      {FEATURES.pedirTelefono && (
        <div>
          <label className="etiqueta" htmlFor="telefono">
            Teléfono de contacto
          </label>
          <input
            id="telefono"
            className="campo"
            inputMode="tel"
            placeholder="Opcional"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
          />
        </div>
      )}

      {/* Mensaje (flag) */}
      {FEATURES.pedirMensaje && (
        <div>
          <label className="etiqueta" htmlFor="mensaje">
            Un mensaje para la quinceañera
          </label>
          <textarea
            id="mensaje"
            className="campo min-h-24"
            placeholder="Opcional"
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
          />
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        onClick={enviar}
        disabled={enviando || asiste === null}
        className="boton-primario w-full"
      >
        {enviando ? 'Guardando…' : 'Enviar respuesta'}
      </button>

      <p className="text-center text-xs text-muted">
        Puedes responder hasta el {limiteTexto}.
      </p>
    </div>
  )
}
