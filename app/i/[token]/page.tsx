import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { EVENTO } from '@/config/event'
import { FEATURES } from '@/config/features'
import { THEME } from '@/config/theme'
import type { Invitado, RespuestaVigente } from '@/lib/types'
import Contador from '@/components/Contador'
import Seccion from '@/components/Seccion'
import Lugar from '@/components/Lugar'
import RsvpForm from './rsvp-form'

export const dynamic = 'force-dynamic'

function fechaLarga(iso: string, tz: string) {
  return new Intl.DateTimeFormat('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: tz,
  }).format(new Date(iso))
}

export default async function Invitacion({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const db = supabaseAdmin()

  const { data: invitado } = await db
    .from('invitados')
    .select('id, token, nombre_display, pases_asignados, grupo, mesa, telefono')
    .eq('token', token)
    .is('eliminado_en', null)
    .maybeSingle<Invitado>()

  // Token invalido -> 404 generico. No revelamos si existe o no.
  if (!invitado) notFound()

  const { data: ultima } = await db
    .from('rsvp')
    .select('asiste, pases_confirmados, acompanantes, restricciones, telefono, mensaje, respondido_en')
    .eq('invitado_id', invitado.id)
    .order('respondido_en', { ascending: false })
    .limit(1)
    .maybeSingle<NonNullable<RespuestaVigente>>()

  const vencido =
    FEATURES.aplicarFechaLimite && Date.now() > new Date(EVENTO.limiteRsvpISO).getTime()

  return (
    <main className="pb-20">
      {/* ---------- Portada ---------- */}
      <section className="flex min-h-[85vh] flex-col items-center justify-center px-6 text-center aparece">
        <p className="text-xs uppercase tracking-[0.35em] text-muted">Mis XV Años</p>
        <h1 className="mt-5 font-display text-6xl leading-none text-primary sm:text-7xl">
          {EVENTO.quinceanera.nombre}
        </h1>
        <p className="mt-6 text-2xl text-accent">{THEME.ornamento}</p>
        <p className="mt-6 text-sm uppercase tracking-[0.2em] text-muted">
          {fechaLarga(EVENTO.fechaISO, EVENTO.zonaHoraria)}
        </p>
        <p className="mt-10 max-w-md font-display text-xl italic leading-relaxed">
          {EVENTO.frase}
        </p>
      </section>

      {/* ---------- Saludo personal ---------- */}
      <Seccion>
        <div className="tarjeta text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">Con cariño para</p>
          <p className="mt-3 font-display text-3xl text-primary">
            {invitado.nombre_display}
          </p>
          <p className="mt-4 text-sm text-muted">
            {invitado.pases_asignados === 1
              ? 'Se ha reservado 1 lugar para ti.'
              : `Se han reservado ${invitado.pases_asignados} lugares para ustedes.`}
          </p>
          {FEATURES.mostrarMesaAsignada && invitado.mesa && (
            <p className="mt-2 text-sm text-muted">Mesa {invitado.mesa}</p>
          )}
        </div>
      </Seccion>

      {/* ---------- Contador ---------- */}
      {FEATURES.mostrarContador && (
        <Seccion titulo="Faltan">
          <Contador fechaISO={EVENTO.fechaISO} />
        </Seccion>
      )}

      {/* ---------- Lugares ---------- */}
      <Seccion titulo="Dónde y cuándo">
        <div className="space-y-4">
          {FEATURES.mostrarCeremonia && EVENTO.ceremonia.activa && (
            <Lugar
              titulo={EVENTO.ceremonia.titulo}
              hora={EVENTO.ceremonia.hora}
              lugar={EVENTO.ceremonia.lugar}
              direccion={EVENTO.ceremonia.direccion}
              mapsUrl={EVENTO.ceremonia.mapsUrl}
            />
          )}
          <Lugar
            titulo={EVENTO.recepcion.titulo}
            hora={EVENTO.recepcion.hora}
            lugar={EVENTO.recepcion.lugar}
            direccion={EVENTO.recepcion.direccion}
            mapsUrl={EVENTO.recepcion.mapsUrl}
          />
        </div>
      </Seccion>

      {/* ---------- Itinerario ---------- */}
      {FEATURES.mostrarItinerario && (
        <Seccion titulo="Itinerario">
          <ol className="tarjeta divide-y divide-line">
            {EVENTO.itinerario.map((it) => (
              <li key={it.hora + it.titulo} className="flex justify-between py-3">
                <span className="font-display text-lg text-primary">{it.hora}</span>
                <span className="text-sm text-muted">{it.titulo}</span>
              </li>
            ))}
          </ol>
        </Seccion>
      )}

      {/* ---------- Dress code ---------- */}
      {FEATURES.mostrarDressCode && (
        <Seccion titulo="Código de vestimenta">
          <div className="tarjeta text-center">
            <p className="font-display text-2xl text-primary">{EVENTO.dressCode.titulo}</p>
            <p className="mt-2 text-sm text-muted">{EVENTO.dressCode.detalle}</p>
          </div>
        </Seccion>
      )}

      {/* ---------- Regalos ---------- */}
      {FEATURES.mostrarRegalos && EVENTO.regalos.length > 0 && (
        <Seccion titulo="Mesa de regalos">
          <div className="space-y-4">
            {EVENTO.regalos.map((r) => (
              <div key={r.titulo} className="tarjeta text-center">
                <p className="font-medium">{r.titulo}</p>
                <p className="mt-1 text-sm text-muted">{r.detalle}</p>
              </div>
            ))}
          </div>
        </Seccion>
      )}

      {/* ---------- RSVP ---------- */}
      <Seccion titulo="Confirma tu asistencia">
        <RsvpForm
          token={invitado.token}
          pasesAsignados={invitado.pases_asignados}
          respuesta={ultima ?? null}
          vencido={vencido}
          limiteTexto={fechaLarga(EVENTO.limiteRsvpISO, EVENTO.zonaHoraria)}
        />
      </Seccion>

      {/* ---------- Contacto ---------- */}
      {FEATURES.mostrarContacto && (
        <Seccion>
          <p className="text-center text-sm text-muted">
            ¿Dudas? Escribe a {EVENTO.contacto.nombre}{' '}
            <a
              className="text-primary underline"
              href={`https://wa.me/${EVENTO.contacto.whatsappLink}`}
              target="_blank"
              rel="noreferrer"
            >
              por WhatsApp
            </a>
          </p>
        </Seccion>
      )}
    </main>
  )
}
