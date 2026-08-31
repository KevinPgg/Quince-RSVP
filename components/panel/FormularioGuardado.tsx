'use client'

import { useState, useTransition } from 'react'
import type { Resultado } from '@/lib/types'

/** Envoltorio de formulario con estado de guardado y mensajes. */
export default function FormularioGuardado({
  accion,
  children,
  etiqueta = 'Guardar cambios',
}: {
  accion: (fd: FormData) => Promise<Resultado>
  children: React.ReactNode
  etiqueta?: string
}) {
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState(false)
  const [pendiente, iniciar] = useTransition()

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault()
        const fd = new FormData(e.currentTarget)
        iniciar(async () => {
          const r = await accion(fd)
          if (r.ok) {
            setError(null)
            setOk(true)
            setTimeout(() => setOk(false), 3000)
          } else {
            setOk(false)
            setError(r.error)
          }
        })
      }}
    >
      {children}

      <div className="sticky bottom-0 -mx-5 border-t border-line bg-base/95 px-5 py-3 backdrop-blur lg:static lg:mx-0 lg:border-0 lg:bg-transparent lg:px-0 lg:py-0">
        {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
        {ok && <p className="mb-2 text-sm text-green-700">Guardado.</p>}
        <button className="boton-primario w-full lg:w-auto" disabled={pendiente}>
          {pendiente ? 'Guardando…' : etiqueta}
        </button>
      </div>
    </form>
  )
}
