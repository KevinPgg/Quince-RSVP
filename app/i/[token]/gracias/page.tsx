import Link from 'next/link'
import { THEME } from '@/config/theme'

export default async function Gracias({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  return (
    <main className="flex min-h-screen items-center justify-center px-6 text-center">
      <div className="aparece">
        <p className="text-3xl text-accent">{THEME.ornamento}</p>
        <h1 className="mt-6 font-display text-4xl text-primary">¡Gracias!</h1>
        <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
          Tu respuesta quedó registrada. Si necesitas cambiarla, vuelve a abrir tu
          invitación.
        </p>
        <Link href={`/i/${token}`} className="boton-borde mt-8">
          Volver a la invitación
        </Link>
      </div>
    </main>
  )
}
