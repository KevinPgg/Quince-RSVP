import { redirect } from 'next/navigation'
import { sesionActual } from '@/lib/auth'
import { obtenerEvento } from '@/lib/evento'
import Chrome from '@/components/panel/Chrome'

export const dynamic = 'force-dynamic'

export default async function LayoutInvitacion({
  children,
}: {
  children: React.ReactNode
}) {
  const sesion = await sesionActual()
  if (!sesion) redirect('/acceso')
  const evento = await obtenerEvento()

  return (
    <Chrome sesion={sesion} nombreEvento={evento.nombre}>
      {children}
    </Chrome>
  )
}
