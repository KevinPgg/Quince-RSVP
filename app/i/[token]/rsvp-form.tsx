'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { RespuestaVigente, TipoInvitacion } from '@/lib/types'
import Filigrana from '@/components/Filigrana'

type FlagsRsvp = {
  pedirNombresAcompanantes: boolean
  pedirRestriccionesAlimenticias: boolean
  pedirTelefono: boolean
  pedirMensaje: boolean
  permitirCambiarRespuesta: boolean
}

type Props = {
  token: string
  tipo: TipoInvitacion
  lugares: number
  respuesta: RespuestaVigente
  vencido: boolean
  limiteTexto: string | null
  flags: FlagsRsvp
}

export default function RsvpForm({
  token, tipo, lugares, respuesta, vencido, limiteTexto, flags,
}: Props) {
  const router = useRouter()
  const yaRespondio = respuesta !== null

  const [editando, setEditando] = useState(!yaRespondio)
  const [asiste, setAsiste] = useState<boolean | null>(respuesta?.asiste ?? null)
  const [confirmados, setConfirmados] = useState<number>(respuesta?.pases_confirmados || lugares)
  const [acompanantes, setAcompanantes] = useState<string[]>(respuesta?.acompanantes ?? [])
  const [restricciones, setRestricciones] = useState(respuesta?.restricciones ?? '')
  const [telefono, setTelefono] = useState(respuesta?.telefono ?? '')
  const [mensaje, setMensaje] = useState(respuesta?.mensaje ?? '')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ---- Plazo cerrado y sin respuesta previa ----
  if (vencido && !yaRespondio) {
    return (
      <div className="tarjeta-real">
        <p className="text-sm leading-relaxed text-muted">
          El plazo para confirmar cerró{limiteTexto ? ` el ${limiteTexto}` : ''}.
          Por favor contáctanos directamente.
        </p>
      </div>
    )
  }

  // ---- Resumen de lo ya respondido ----
  if (yaRespondio && !editando) {
    const r = respuesta!
    return (
      <div className="tarjeta-real">
        <p className="font-firma text-[38px] leading-tight text-[#b52272]" style={{ paddingTop: '0.1em' }}>
          {r.asiste ? '¡Nos vemos ahí!' : 'Te vamos a extrañar'}
        </p>
        <div className="mt-4">
          <Filigrana ancho={56} />
        </div>
        <p className="mt-4 text-[13px] leading-[1.7] text-muted">
          {r.asiste
            ? `Confirmaste ${r.pases_confirmados} ${r.pases_confirmados === 1 ? 'lugar' : 'lugares'}.`
            : 'Registramos que no podrán acompañarnos.'}
        </p>
        {flags.permitirCambiarRespuesta && !vencido && (
          <button
            onClick={() => setEditando(true)}
            className="mt-5 font-cinzel text-[11px] font-semibold uppercase tracking-[0.16em] text-primary underline underline-offset-4"
          >
            Cambiar mi respuesta
          </button>
        )}
      </div>
    )
  }

  function cambiarConfirmados(n: number) {
    const acotado = Math.min(lugares, Math.max(1, n))
    setConfirmados(acotado)
    // Al bajar el número, sobran campos de nombre: se recortan.
    setAcompanantes((prev) =>
      prev.slice(0, tipo === 'grupal' ? acotado : Math.max(0, acotado - 1))
    )
  }

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
        pases_confirmados: asiste ? confirmados : 0,
        acompanantes: flags.pedirNombresAcompanantes
          ? acompanantes.filter((a) => a.trim() !== '')
          : null,
        restricciones: flags.pedirRestriccionesAlimenticias ? restricciones : null,
        telefono: flags.pedirTelefono ? telefono : null,
        mensaje: flags.pedirMensaje ? mensaje : null,
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

  // En una invitación grupal todos los lugares son "acompañantes";
  // en una individual, el titular ya ocupa uno.
  const camposNombres = tipo === 'grupal' ? confirmados : Math.max(0, confirmados - 1)

  return (
    <div className="rounded-3xl border border-line bg-white px-5 py-6 shadow-[var(--sombra-real)] space-y-6">
      <div className="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          aria-pressed={asiste === true}
          onClick={() => setAsiste(true)}
          className={asiste === true ? 'boton-morado' : 'boton-tenue'}
        >
          {tipo === 'grupal' ? 'Sí asistiremos' : 'Sí asistiré'}
        </button>
        <button
          type="button"
          aria-pressed={asiste === false}
          onClick={() => setAsiste(false)}
          className={asiste === false ? 'boton-morado' : 'boton-tenue'}
        >
          No podremos
        </button>
      </div>

      {asiste === true && lugares > 1 && (
        <div>
          <span id="rot-lugares" className="etiqueta-tema">
            ¿Cuántos de los {lugares} lugares se ocupan?
          </span>

          {/* Los puntos son decoración: para un lector de pantalla el estado
              real lo dan el aria-labelledby del grupo y el aria-live de abajo. */}
          <div
            role="group"
            aria-labelledby="rot-lugares"
            className="flex items-center justify-between rounded-2xl border border-line bg-base p-2 px-2.5"
          >
            <button
              type="button"
              aria-label="Quitar un lugar"
              disabled={confirmados <= 1}
              onClick={() => cambiarConfirmados(confirmados - 1)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-white text-xl text-primary transition disabled:opacity-35"
            >
              –
            </button>

            <div aria-hidden className="flex flex-wrap items-center justify-center gap-2.5 px-2">
              {Array.from({ length: lugares }, (_, i) => (
                <span
                  key={i}
                  className={
                    i < confirmados
                      ? 'h-[17px] w-[17px] rounded-full shadow-[0_0_0_3px_rgba(192,138,46,0.18)] [background:radial-gradient(circle_at_35%_30%,#fbecc4,#c08a2e_55%,#9c6d1f)]'
                      : 'h-[17px] w-[17px] rounded-full bg-[#f2ecdd] shadow-[inset_0_0_0_1px_#e2d3b6]'
                  }
                />
              ))}
            </div>

            <button
              type="button"
              aria-label="Añadir un lugar"
              disabled={confirmados >= lugares}
              onClick={() => cambiarConfirmados(confirmados + 1)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-white text-xl text-primary transition disabled:opacity-35"
            >
              +
            </button>
          </div>

          <p aria-live="polite" className="mt-2 text-center text-xs text-[#8d6bab]">
            {confirmados} de {lugares} {lugares === 1 ? 'lugar confirmado' : 'lugares confirmados'}
          </p>
        </div>
      )}

      {asiste === true && flags.pedirNombresAcompanantes && camposNombres > 0 && (
        <div className="space-y-3">
          <span className="etiqueta-tema">
            {tipo === 'grupal' ? 'Nombres de quienes asisten' : 'Nombres de quienes te acompañan'}
          </span>
          {Array.from({ length: camposNombres }, (_, i) => (
            <input
              key={i}
              className="campo"
              placeholder={`Persona ${i + 1}`}
              value={acompanantes[i] ?? ''}
              onChange={(ev) => {
                const copia = [...acompanantes]
                copia[i] = ev.target.value
                setAcompanantes(copia)
              }}
            />
          ))}
        </div>
      )}

      {asiste === true && flags.pedirRestriccionesAlimenticias && (
        <div>
          <label className="etiqueta-tema" htmlFor="restricciones">Restricciones alimenticias o alergias</label>
          <input
            id="restricciones" className="campo" placeholder="Opcional"
            value={restricciones} onChange={(ev) => setRestricciones(ev.target.value)}
          />
        </div>
      )}

      {flags.pedirTelefono && (
        <div>
          <label className="etiqueta-tema" htmlFor="telefono">Teléfono de contacto</label>
          <input
            id="telefono" className="campo" inputMode="tel" placeholder="Opcional"
            value={telefono} onChange={(ev) => setTelefono(ev.target.value)}
          />
        </div>
      )}

      {flags.pedirMensaje && (
        <div>
          <label className="etiqueta-tema" htmlFor="mensaje">Un mensaje para la quinceañera</label>
          <textarea
            id="mensaje" className="campo min-h-[80px] font-display text-[17px] italic" placeholder="Opcional"
            value={mensaje} onChange={(ev) => setMensaje(ev.target.value)}
          />
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button onClick={enviar} disabled={enviando || asiste === null} className="boton-rosa">
        {enviando ? 'Guardando…' : 'Enviar respuesta'}
      </button>

      <p className="text-center text-[11px] leading-[1.6] text-[#8d6bab]">
        {limiteTexto ? `Puedes responder hasta el ${limiteTexto}. ` : ''}
        {flags.permitirCambiarRespuesta && 'Guarda este link: sirve para cambiar tu respuesta después.'}
      </p>
    </div>
  )
}
