'use client'

import { useState } from 'react'
import {
  armarMensaje, MARCADORES, LARGO_MAXIMO,
  PLANTILLA_INDIVIDUAL, PLANTILLA_GRUPAL,
} from '@/lib/whatsapp'

/**
 * Editor de la plantilla del mensaje de WhatsApp, con vista previa en vivo.
 *
 * La previa es el punto: los marcadores entre llaves son fáciles de escribir
 * mal y el error solo se descubre cuando ya se mandó el mensaje a alguien.
 * Aquí se ve el resultado real mientras se escribe, con datos de ejemplo.
 */
export default function MensajeWhatsapp({
  valorInicial,
  nombreEvento,
  fechaTexto,
  lugarTexto,
}: {
  valorInicial: string | null
  nombreEvento: string
  fechaTexto: string
  lugarTexto: string
}) {
  const [texto, setTexto] = useState(valorInicial ?? '')
  const [tipo, setTipo] = useState<'individual' | 'grupal'>('individual')

  const ejemplo = {
    nombre: tipo === 'grupal' ? 'Familia Vera Suárez' : 'Ana Lucía',
    link: 'https://quince-angeles.vercel.app/i/K7M2XP9RTQ',
    lugares: tipo === 'grupal' ? 4 : 2,
    tipo,
    evento: nombreEvento,
    fecha: fechaTexto,
    lugar: lugarTexto,
  }

  const previa = armarMensaje(texto, ejemplo)
  const usandoOmision = texto.trim() === ''

  function insertar(marcador: string) {
    setTexto((t) => (t.trim() === '' ? marcador : `${t}${t.endsWith(' ') ? '' : ' '}${marcador}`))
  }

  return (
    <section className="tarjeta">
      <h2 className="titulo-seccion text-xl">Mensaje de WhatsApp</h2>
      <p className="mt-1 text-xs leading-relaxed text-muted">
        El texto que se abre ya escrito al tocar «WhatsApp» en una invitación.
        Déjalo vacío para usar el sugerido, que cambia solo según si la
        invitación es individual o grupal.
      </p>

      <div className="mt-5">
        <label className="etiqueta" htmlFor="whatsapp_plantilla">Plantilla</label>
        <textarea
          id="whatsapp_plantilla"
          name="whatsapp_plantilla"
          className="campo min-h-32"
          maxLength={LARGO_MAXIMO}
          placeholder={PLANTILLA_INDIVIDUAL}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
        />
        <p className="mt-1.5 text-xs text-muted">
          {texto.length} / {LARGO_MAXIMO} caracteres
        </p>
      </div>

      <div className="mt-4">
        <span className="etiqueta">Marcadores — toca para insertarlos</span>
        <ul className="flex flex-wrap gap-2">
          {MARCADORES.map((m) => (
            <li key={m.clave}>
              <button
                type="button"
                onClick={() => insertar(m.clave)}
                title={m.que}
                className="rounded-full border border-line px-3 py-1.5 font-mono text-xs text-primary transition active:bg-primary active:text-white sm:hover:border-primary"
              >
                {m.clave}
              </button>
            </li>
          ))}
        </ul>
        <ul className="mt-3 space-y-1 text-xs leading-snug text-muted">
          {MARCADORES.map((m) => (
            <li key={m.clave}>
              <span className="font-mono text-primary">{m.clave}</span> — {m.que}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-5 rounded-2xl border border-line bg-base p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs uppercase tracking-[0.12em] text-muted">
            Vista previa{usandoOmision && ' (usando el sugerido)'}
          </span>
          <div className="flex gap-1.5">
            {(['individual', 'grupal'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTipo(t)}
                aria-pressed={tipo === t}
                className={`rounded-full px-3 py-1 text-xs capitalize transition ${
                  tipo === t ? 'bg-primary text-white' : 'border border-line text-muted'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Burbuja de WhatsApp. Verde literal y no un token del tema: imita
            una app ajena, no forma parte de la paleta del sitio. */}
        <div className="mt-3 rounded-2xl rounded-tr-md bg-[#d9fdd3] p-3">
          <p className="whitespace-pre-wrap break-words text-[13px] leading-relaxed text-[#111b21]">
            {previa}
          </p>
        </div>

        {usandoOmision && (
          <p className="mt-3 text-xs leading-snug text-muted">
            Sugerido para grupales:{' '}
            <span className="italic">{PLANTILLA_GRUPAL}</span>
          </p>
        )}
      </div>
    </section>
  )
}
