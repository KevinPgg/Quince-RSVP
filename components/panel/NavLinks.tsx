'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

export type Enlace = { href: string; label: string }

export default function NavLinks({ enlaces }: { enlaces: Enlace[] }) {
  const path = usePathname()
  const navRef = useRef<HTMLElement>(null)
  // Qué lados tienen contenido escondido: el difuminado solo aparece
  // donde de verdad hay algo más, o parecería que el menú está cortado.
  const [lados, setLados] = useState({ izq: false, der: false })

  // /invitacion/asistencia también empieza con /invitacion, así que se
  // marcaban los dos. Gana el enlace coincidente más largo, uno solo.
  const activo = enlaces
    .filter((e) => path === e.href || path.startsWith(e.href + '/'))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href

  useEffect(() => {
    const nav = navRef.current
    if (!nav) return
    const medir = () => {
      const max = nav.scrollWidth - nav.clientWidth
      setLados({ izq: nav.scrollLeft > 2, der: nav.scrollLeft < max - 2 })
    }
    medir()
    // El enlace activo siempre a la vista al entrar a una sección.
    nav.querySelector('[aria-current="page"]')?.scrollIntoView({ block: 'nearest', inline: 'center' })
    nav.addEventListener('scroll', medir, { passive: true })
    window.addEventListener('resize', medir)
    return () => {
      nav.removeEventListener('scroll', medir)
      window.removeEventListener('resize', medir)
    }
  }, [path])

  const mascara = `linear-gradient(90deg, ${lados.izq ? 'transparent' : '#000'} 0, #000 28px, #000 calc(100% - 28px), ${lados.der ? 'transparent' : '#000'} 100%)`

  return (
    // En móvil se desliza en horizontal, sin barra; en desktop simplemente se alinea.
    <nav
      ref={navRef}
      className="-mx-5 overflow-x-auto px-5 [scrollbar-width:none] lg:mx-0 lg:overflow-visible lg:px-0 [&::-webkit-scrollbar]:hidden"
      style={{ WebkitMaskImage: mascara, maskImage: mascara }}
    >
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
