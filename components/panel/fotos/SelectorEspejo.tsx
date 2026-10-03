'use client'

import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react'
import Espejo from '@/components/Espejo'
import { ESPEJOS, type NivelEspejo } from '@/config/galeria'

/**
 * Selector de espejo con miniaturas (Headless UI Listbox: teclado,
 * lector de pantalla y posicionamiento resueltos; el aspecto es todo
 * nuestro). Cada opción muestra la foto real dentro de ese espejo,
 * así se elige viendo el resultado y no un nombre.
 *
 * No hay opción «Automático» a propósito: eso es el botón
 * «Repartir automáticamente» del modo Marcos.
 */
export default function SelectorEspejo({
  valor,
  src,
  onCambio,
  deshabilitado,
}: {
  valor: NivelEspejo
  src?: string
  onCambio: (n: NivelEspejo) => void
  deshabilitado?: boolean
}) {
  return (
    <Listbox value={valor} onChange={onCambio} disabled={deshabilitado}>
      <ListboxButton
        className="group flex w-full items-center gap-4 rounded-2xl border border-line bg-surface px-4 py-3 text-left shadow-sm transition
                   hover:border-[#d9a845] focus:outline-none data-[focus]:ring-2 data-[focus]:ring-[#d9a845]/60 data-[disabled]:opacity-50"
      >
        <span className="flex h-[72px] w-[54px] shrink-0 items-center justify-center pt-2">
          <Espejo nivel={valor} src={src} ancho={44} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[11px] uppercase tracking-[0.14em] text-muted">Espejo</span>
          <span className="block font-display text-xl text-primary">{valor} · {ESPEJOS[valor - 1]}</span>
        </span>
        <svg viewBox="0 0 20 20" className="h-5 w-5 text-muted transition group-data-[open]:rotate-180" aria-hidden>
          <path d="M5 7.5 10 12.5 15 7.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </ListboxButton>

      <ListboxOptions
        anchor={{ to: 'bottom', gap: 8, padding: 12 }}
        transition
        className="z-50 w-[min(92vw,460px)] rounded-3xl border border-line bg-surface/95 p-3 shadow-[0_24px_60px_-12px_rgba(92,43,134,.35)] backdrop-blur
                   transition duration-150 ease-out focus:outline-none data-[closed]:-translate-y-1 data-[closed]:opacity-0"
      >
        <div className="grid grid-cols-5 gap-1">
          {ESPEJOS.map((nombre, k) => {
            const n = (k + 1) as NivelEspejo
            return (
              <ListboxOption
                key={n}
                value={n}
                className="group flex cursor-pointer flex-col items-center gap-2 rounded-2xl px-1 pb-2 pt-5 transition
                           data-[focus]:bg-[#f3e9fa] data-[selected]:bg-[#efe1f8]"
              >
                <Espejo nivel={n} src={src} ancho={52} />
                <span className="mt-2 text-center text-[10px] uppercase leading-tight tracking-[0.1em] text-muted group-data-[selected]:font-semibold group-data-[selected]:text-primary">
                  {nombre}
                </span>
              </ListboxOption>
            )
          })}
        </div>
      </ListboxOptions>
    </Listbox>
  )
}
