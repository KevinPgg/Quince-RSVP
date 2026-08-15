import type { Metadata } from 'next'
import './globals.css'
import { EVENTO } from '@/config/event'

export const metadata: Metadata = {
  title: `XV Años · ${EVENTO.quinceanera.nombre}`,
  description: 'Invitación',
  robots: { index: false, follow: false },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
