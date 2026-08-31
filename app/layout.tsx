import type { Metadata, Viewport } from 'next'
import './globals.css'
import { obtenerEvento } from '@/lib/evento'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#fcfaf8',
  colorScheme: 'light',
}

export async function generateMetadata(): Promise<Metadata> {
  let nombre = 'XV Años'
  try {
    nombre = (await obtenerEvento()).nombre
  } catch {
    // Base sin configurar todavía: no debe tumbar el render.
  }
  return {
    title: `XV Años · ${nombre}`,
    description: 'Invitación',
    robots: { index: false, follow: false },
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
