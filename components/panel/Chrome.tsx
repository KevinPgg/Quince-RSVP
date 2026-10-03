import { salir } from '@/app/acceso/actions'
import type { SesionUsuario } from '@/lib/types'
import NavLinks, { type Enlace } from './NavLinks'

export default function Chrome({
  sesion,
  nombreEvento,
  children,
}: {
  sesion: SesionUsuario
  nombreEvento: string
  children: React.ReactNode
}) {
  const enlaces: Enlace[] = [
    { href: '/invitacion', label: 'Invitaciones' },
    { href: '/invitacion/asistencia', label: 'Asistencia' },
  ]
  if (sesion.rol === 'dueno') {
    enlaces.push(
      { href: '/admin/evento', label: 'Evento' },
      { href: '/admin/fotos', label: 'Fotos' },
      { href: '/admin/usuarios', label: 'Usuarios' },
      { href: '/admin/ajustes', label: 'Ajustes' },
      { href: '/admin/bitacora', label: 'Bitácora' }
    )
  }

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-20 border-b border-line bg-base/90 backdrop-blur">
        <div className="mx-auto max-w-6xl px-5 py-3">
          <div className="flex items-center justify-between gap-3">
            <span className="truncate font-display text-xl text-primary">
              {nombreEvento}
            </span>
            <div className="flex shrink-0 items-center gap-3">
              <span className="hidden text-xs text-muted sm:inline">
                {sesion.nombre}
                {sesion.rol === 'dueno' && ' · dueño'}
              </span>
              <form action={salir}>
                <button className="text-xs uppercase tracking-[0.1em] text-muted underline underline-offset-2">
                  Salir
                </button>
              </form>
            </div>
          </div>
          <div className="mt-2">
            <NavLinks enlaces={enlaces} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-6 lg:py-10">{children}</main>
    </div>
  )
}
