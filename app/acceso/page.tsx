import { redirect } from 'next/navigation'
import { hayUsuarios, sesionActual } from '@/lib/auth'
import Formulario from './formulario'

export const dynamic = 'force-dynamic'

export default async function Acceso() {
  if (await sesionActual()) redirect('/invitacion')
  const primerUso = !(await hayUsuarios())

  return (
    <main className="flex min-h-dvh items-center justify-center px-5 py-10">
      <div className="w-full max-w-sm">
        <Formulario primerUso={primerUso} />
      </div>
    </main>
  )
}
