'use client'

import { useRef, useState, useTransition } from 'react'
import { crearUsuario, cambiarPassword, cambiarEstadoUsuario, cambiarRol } from '../actions'
import type { Resultado, Rol } from '@/lib/types'

export type UsuarioFila = {
  id: string
  usuario: string
  nombre: string
  rol: Rol
  activo: boolean
  ultimo_acceso: string | null
}

function Fecha({ iso }: { iso: string | null }) {
  if (!iso) return <>nunca</>
  return <>{new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium' }).format(new Date(iso))}</>
}

export function NuevoUsuario() {
  const ref = useRef<HTMLFormElement>(null)
  const [abierto, setAbierto] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pendiente, iniciar] = useTransition()

  return (
    <section className="tarjeta">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <span>
          <span className="titulo-seccion block text-xl">Nuevo usuario</span>
          <span className="mt-1 block text-xs text-muted">
            Los editores solo crean y editan invitaciones.
          </span>
        </span>
        <span className="shrink-0 text-2xl leading-none text-primary">{abierto ? '−' : '+'}</span>
      </button>

      {abierto && (
        <form
          ref={ref}
          className="mt-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            const fd = new FormData(e.currentTarget)
            iniciar(async () => {
              const r = await crearUsuario(fd)
              if (r.ok) { ref.current?.reset(); setError(null); setAbierto(false) }
              else setError(r.error)
            })
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="etiqueta" htmlFor="n_nombre">Nombre</label>
              <input id="n_nombre" name="nombre" className="campo" required maxLength={80} />
            </div>
            <div>
              <label className="etiqueta" htmlFor="n_usuario">Usuario</label>
              <input id="n_usuario" name="usuario" className="campo" required maxLength={60} autoCapitalize="none" autoCorrect="off" placeholder="mama.angeles" />
            </div>
            <div>
              <label className="etiqueta" htmlFor="n_password">Contraseña</label>
              <input id="n_password" name="password" type="password" className="campo" required maxLength={200} autoComplete="new-password" />
              <p className="mt-1.5 text-xs text-muted">Mínimo 10 caracteres, letras y números.</p>
            </div>
            <div>
              <label className="etiqueta" htmlFor="n_rol">Rol</label>
              <select id="n_rol" name="rol" className="campo" defaultValue="editor">
                <option value="editor">Editor — solo invitaciones</option>
                <option value="dueno">Dueño — todo, incluidos usuarios</option>
              </select>
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button className="boton-primario w-full sm:w-auto" disabled={pendiente}>
            {pendiente ? 'Creando…' : 'Crear usuario'}
          </button>
        </form>
      )}
    </section>
  )
}

export function FilaUsuario({ u, esYo }: { u: UsuarioFila; esYo: boolean }) {
  const [cambiando, setCambiando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  const [pendiente, iniciar] = useTransition()

  function correr(accion: (fd: FormData) => Promise<Resultado>, extra: Record<string, string> = {}) {
    const fd = new FormData()
    fd.set('id', u.id)
    for (const [k, v] of Object.entries(extra)) fd.set(k, v)
    iniciar(async () => {
      const r = await accion(fd)
      setError(r.ok ? null : r.error)
    })
  }

  return (
    <li className={`tarjeta ${u.activo ? '' : 'opacity-60'}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium">
            {u.nombre} {esYo && <span className="text-xs text-muted">(tú)</span>}
          </p>
          <p className="mt-1 text-xs text-muted">
            @{u.usuario} · último acceso <Fecha iso={u.ultimo_acceso} />
          </p>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs ${
          u.rol === 'dueno' ? 'bg-primary/15 text-primary' : 'bg-neutral-100 text-neutral-600'
        }`}>
          {u.rol === 'dueno' ? 'dueño' : 'editor'}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
        <select
          className="rounded-full border border-line px-3 py-1.5 text-xs"
          defaultValue={u.rol}
          disabled={pendiente}
          onChange={(ev) => correr(cambiarRol, { rol: ev.target.value })}
        >
          <option value="editor">Editor</option>
          <option value="dueno">Dueño</option>
        </select>

        <button
          type="button"
          className="text-primary underline underline-offset-2"
          onClick={() => setCambiando((v) => !v)}
        >
          Cambiar contraseña
        </button>

        <button
          type="button"
          className={u.activo ? 'text-red-600 underline underline-offset-2' : 'text-primary underline underline-offset-2'}
          disabled={pendiente}
          onClick={() => correr(cambiarEstadoUsuario, { activar: u.activo ? 'no' : 'si' })}
        >
          {u.activo ? 'Desactivar' : 'Reactivar'}
        </button>
      </div>

      {cambiando && (
        <form
          className="mt-4 flex flex-col gap-2 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault()
            const fd = new FormData(e.currentTarget)
            fd.set('id', u.id)
            iniciar(async () => {
              const r = await cambiarPassword(fd)
              if (r.ok) {
                setCambiando(false); setError(null)
                setAviso('Contraseña actualizada.')
                setTimeout(() => setAviso(null), 3000)
              } else setError(r.error)
            })
          }}
        >
          <input
            name="password" type="password" className="campo py-2.5 text-sm"
            placeholder="Nueva contraseña" required maxLength={200} autoComplete="new-password"
          />
          <button className="boton-primario shrink-0 px-5 py-2.5 text-xs" disabled={pendiente}>
            Actualizar
          </button>
        </form>
      )}

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      {aviso && <p className="mt-2 text-xs text-green-700">{aviso}</p>}
    </li>
  )
}
