import { EVENTO } from '@/config/event'
import { THEME } from '@/config/theme'

// Landing publica: NO expone ningun dato de invitados.
export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 text-center">
      <div className="aparece">
        <p className="text-xs uppercase tracking-[0.35em] text-muted">Mis XV Años</p>
        <h1 className="mt-4 font-display text-6xl text-primary">
          {EVENTO.quinceanera.nombre}
        </h1>
        <p className="mt-6 text-accent">{THEME.ornamento}</p>
        <p className="mt-6 max-w-sm text-sm leading-relaxed text-muted">
          Esta invitación es personal. Abre el enlace que recibiste para ver tus
          datos y confirmar tu asistencia.
        </p>
      </div>
    </main>
  )
}
