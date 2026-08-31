'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export type Enlace = { href: string; label: string }

export default function NavLinks({ enlaces }: { enlaces: Enlace[] }) {
  const path = usePathname()

  // /invitacion/asistencia también empieza con /invitacion, así que se
  // marcaban los dos. Gana el enlace coincidente más largo, uno solo.
  const activo = enlaces
    .filter((e) => path === e.href || path.startsWith(e.href + '/'))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href

  return (
    // En móvil se desliza en horizontal; en desktop simplemente se alinea.
    <nav className="-mx-5 overflow-x-auto px-5 lg:mx-0 lg:overflow-visible lg:px-0">
      <ul className="flex w-max gap-1 lg:w-auto">
        {enlaces.map((e) => (
          <li key={e.href}>
            <Link
              href={e.href}
              aria-current={activo === e.href ? 'page' : undefined}
              className={`block whitespace-nowrap rounded-full px-4 py-2 text-xs uppercase tracking-[0.1em] transition ${
                activo === e.href
                  ? 'bg-primary text-white'
                  : 'text-muted hover:bg-line/60 hover:text-ink'
              }`}
            >
              {e.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
