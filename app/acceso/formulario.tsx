'use client'

import { useState, useTransition } from 'react'
import { iniciarSesion, crearPrimerUsuario } from './actions'
import type { Resultado } from '@/lib/types'

export default function Formulario({ primerUso }: { primerUso: boolean }) {
  const [error, setError] = useState<string | null>(null)
  const [pendiente, iniciar] = useTransition()

  const accion = primerUso ? crearPrimerUsuario : iniciarSesion

  return (
    <form
      className="tarjeta w-full space-y-4"
      onSubmit={(e) => {
        e.preventDefault()
        const fd = new FormData(e.currentTarget)
        iniciar(async () => {
          // Si tiene éxito la acción redirige y esto nunca vuelve.
          const r: Resultado | undefined = await accion(fd)
          if (r && !r.ok) setError(r.error)
        })
      }}
    >
      <div className="text-center">
        <h1 className="titulo-seccion text-2xl">
          {primerUso ? 'Configura tu acceso' : 'Panel'}
        </h1>
        <p className="mt-2 text-xs leading-relaxed text-muted">
          {primerUso
            ? 'No hay usuarios todavía. El primero que crees será el dueño del portal.'
            : 'Entra con tu usuario y contraseña.'}
        </p>
      </div>

      {primerUso && (
        <div>
          <label className="etiqueta" htmlFor="nombre">Tu nombre</label>
          <input id="nombre" name="nombre" className="campo" placeholder="Kevin" required maxLength={80} />
        </div>
      )}

      <div>
        <label className="etiqueta" htmlFor="usuario">Usuario</label>
        <input
          id="usuario" name="usuario" className="campo"
          placeholder="kevin" required maxLength={60}
          autoCapitalize="none" autoCorrect="off" autoComplete="username"
        />
      </div>

      <div>
        <label className="etiqueta" htmlFor="password">Contraseña</label>
        <input
          id="password" name="password" type="password" className="campo"
          required maxLength={200}
          autoComplete={primerUso ? 'new-password' : 'current-password'}
        />
        {primerUso && (
          <p className="mt-2 text-xs text-muted">
            Mínimo 10 caracteres, con letras y números.
          </p>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button className="boton-primario w-full" disabled={pendiente}>
        {pendiente ? 'Un momento…' : primerUso ? 'Crear mi usuario' : 'Entrar'}
      </button>
    </form>
  )
}
