import type { Metadata, Viewport } from 'next'
import './globals.css'
import { obtenerEvento } from '@/lib/evento'
import { DefsTema } from '@/components/tema/Ornamentos'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#fdfaff',
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
      <body>
        {/* Degradados de oro, perla y joya que referencian los SVG del tema. */}
        <DefsTema />
        {children}
      </body>
    </html>
  )
}
