import { cookies } from 'next/headers'
import Link from 'next/link'
import { esAdmin } from '@/lib/auth'
import { EVENTO } from '@/config/event'

export const dynamic = 'force-dynamic'

function Login({ error }: { error: boolean }) {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <form
        action="/api/admin/login"
        method="POST"
        className="tarjeta w-full max-w-sm space-y-4"
      >
        <h1 className="titulo-seccion text-center">Panel</h1>
        <p className="text-center text-xs text-muted">
          XV de {EVENTO.quinceanera.nombre}
        </p>
        <input
          className="campo"
          type="password"
          name="password"
          placeholder="Contraseña"
          autoComplete="current-password"
          autoFocus
        />
        {error && <p className="text-sm text-red-600">Contraseña incorrecta.</p>}
        <button className="boton-primario w-full" type="submit">
          Entrar
        </button>
      </form>
    </main>
  )
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  if (!(await esAdmin())) {
    const c = await cookies()
    return <Login error={c.get('quince_login_error')?.value === '1'} />
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5">
        <div className="flex items-center gap-6">
          <span className="font-display text-2xl text-primary">
            {EVENTO.quinceanera.nombre}
          </span>
          <nav className="flex gap-4 text-xs uppercase tracking-[0.12em] text-muted">
            <Link href="/admin" className="hover:text-primary">
              Resumen
            </Link>
            <Link href="/admin/invitados" className="hover:text-primary">
              Invitaciones
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <a href="/api/admin/export" className="text-xs uppercase tracking-[0.12em] text-primary underline">
            Exportar CSV
          </a>
          <form action="/api/admin/logout" method="POST">
            <button className="text-xs uppercase tracking-[0.12em] text-muted underline">
              Salir
            </button>
          </form>
        </div>
      </header>
      {children}
    </div>
  )
}
