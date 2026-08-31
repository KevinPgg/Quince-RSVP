import { redirect } from 'next/navigation'
import { sesionActual } from '@/lib/auth'
import { obtenerEvento } from '@/lib/evento'
import Chrome from '@/components/panel/Chrome'

export const dynamic = 'force-dynamic'

// Todo /admin requiere rol dueño. Las server actions lo revalidan
// por su cuenta: esto es conveniencia, no la defensa.
export default async function LayoutAdmin({
  children,
}: {
  children: React.ReactNode
}) {
  const sesion = await sesionActual()
  if (!sesion) redirect('/acceso')
  if (sesion.rol !== 'dueno') redirect('/invitacion')
  const evento = await obtenerEvento()

  return (
    <Chrome sesion={sesion} nombreEvento={evento.nombre}>
      {children}
    </Chrome>
  )
}
