import Image from 'next/image'
import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { obtenerEvento, flagsDe, fechaLarga, horaDe, ZONA_HORARIA } from '@/lib/evento'
import type { Invitado, RespuestaVigente } from '@/lib/types'
import Contador from '@/components/Contador'
import Seccion from '@/components/Seccion'
import Lugar from '@/components/Lugar'
import { MiGrupo } from '@/components/ListaAsistentes'
import Filigrana from '@/components/Filigrana'
import FondoLargo from '@/components/FondoLargo'
import Cartucho from '@/components/Cartucho'
import RsvpForm from './rsvp-form'

export const dynamic = 'force-dynamic'

export default async function Invitacion({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const db = supabaseAdmin()

  const { data: invitado } = await db
    .from('invitados')
    .select('*')
    .eq('token', token)
    .is('eliminado_en', null)
    .maybeSingle<Invitado>()

  // Token inválido o archivado -> 404 genérico, sin revelar si existió.
  if (!invitado) notFound()

  const e = await obtenerEvento()
  const flags = flagsDe(e)

  const { data: ultima } = await db
    .from('rsvp')
    .select('asiste, pases_confirmados, acompanantes, restricciones, telefono, mensaje, respondido_en')
    .eq('invitado_id', invitado.id)
    .order('respondido_en', { ascending: false })
    .limit(1)
    .maybeSingle<NonNullable<RespuestaVigente>>()

  const vencido =
    flags.aplicarFechaLimite &&
    !!e.limite_rsvp &&
    Date.now() > new Date(e.limite_rsvp).getTime()

  const esGrupal = invitado.tipo === 'grupal'
  const lugares = invitado.pases_asignados

  return (
    <main className="relative pb-16">
      <FondoLargo />

      {/* ---------- Héroe + saludo (tablero 5a) ----------
          El héroe mide 400 px y no una pantalla completa: el cartucho del
          saludo se monta sobre su borde inferior y los dos se leen como una
          sola pieza. Por eso `fondo-invitacion` solo tiene que cubrir esos
          400 px y no los 4000 de la página entera. */}
      <section className="relative aparece">
        {/* El tablero 5a está dibujado a 390 px: es una tarjeta, no una
            página. A pantalla completa los pétalos se agrandan un 32 % y del
            castillo solo quedan los muros. Por eso el héroe se limita a
            `max-w-xl`, el mismo ancho que `.contenedor`, y así queda alineado
            con el cartucho de abajo. En móvil no cambia nada. */}
        <div className="relative mx-auto h-[400px] w-full max-w-xl overflow-hidden sm:rounded-3xl [background:linear-gradient(180deg,#fefcff_0%,#faf3fd_44%,#f3e9fa_76%,#eddff8_100%)]">
          {/* Marco de pétalos. Decorativo y opcional: si el archivo no está,
              lo único que se pierde es textura. */}
          <div className="pointer-events-none absolute inset-0 opacity-35">
            <Image
              src="/recursos/tema/fondo-invitacion.png"
              alt=""
              fill
              priority
              sizes="(min-width: 576px) 576px, 100vw"
              className="object-cover object-top"
            />
          </div>

          {/* Anclado al ancho con alto automático, igual que en la portada:
              con `fill` + `object-cover` en una franja de 150 px el castillo
              se recorta hasta quedar en muros sin torres. */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 mx-auto w-full max-w-[420px] opacity-45">
            <Image
              src="/recursos/tema/castillo.png"
              alt=""
              width={1137}
              height={620}
              sizes="(min-width: 420px) 420px, 100vw"
              className="h-auto w-full"
            />
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[110px] [background:linear-gradient(180deg,rgba(237,223,248,0),rgba(240,228,250,0.9)_70%,#eddff8)]" />

          <span aria-hidden className="destello pointer-events-none absolute left-[15%] top-[16%] h-1.5 w-1.5 rounded-full bg-accent" />
          <span aria-hidden className="destello pointer-events-none absolute left-[81%] top-[26%] h-1 w-1 rounded-full bg-primary/45 [animation-delay:1.2s]" />

          <div className="absolute inset-x-0 top-10 text-center">
            <Image
              src="/recursos/tema/corona.png"
              alt=""
              width={770}
              height={420}
              priority
              className="mx-auto mb-2.5 h-10 w-auto"
            />
            <p className="font-cinzel text-[11px] font-semibold uppercase tracking-[0.34em] text-muted">Mis</p>

            {/* «XV»: contorno de oro detrás, degradado rosa recortado al texto
                delante. El `color` del span de arriba es el respaldo: si el
                navegador no aplica `background-clip: text`, el relleno
                transparente no llega a activarse y se ve rosa plano en lugar
                de desaparecer. */}
            <div className="relative mt-1 h-24">
              <span
                aria-hidden
                className="font-cinzel text-[96px] font-bold leading-none text-accent [-webkit-text-stroke:6px_#c08a2e]"
              >
                XV
              </span>
              <span className="xv-relleno absolute inset-x-0 top-0 font-cinzel text-[96px] font-bold leading-none">
                XV
              </span>
            </div>

            <p className="mt-2 font-firma text-[68px] leading-none text-[#b52272]" style={{ paddingTop: '0.14em' }}>
              {e.nombre}
            </p>
            {e.fecha && (
              <p className="mt-4 font-cinzel text-[11px] font-semibold uppercase tracking-[0.2em] text-[#5c3a80]">
                {fechaLarga(e.fecha, ZONA_HORARIA)}
              </p>
            )}
          </div>
        </div>

        {/* Saludo personal, montado sobre el héroe. */}
        <div className="contenedor -mt-[26px] pb-2">
          <Cartucho>
            <p className="relative font-cinzel text-[10px] font-semibold uppercase tracking-[0.26em] text-[#8a6a33]">
              Con cariño para
            </p>
            <p className="relative mt-2.5 font-firma text-[40px] leading-[1.15] text-[#b52272]" style={{ paddingTop: '0.1em' }}>
              {invitado.nombre_display}
            </p>

            <div className="relative mt-4 flex flex-wrap items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-accent px-3.5 py-[7px] font-cinzel text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
                ✦ {lugares} {lugares === 1 ? 'lugar' : 'lugares'}
              </span>
              {flags.mostrarMesaAsignada && invitado.mesa && (
                <span className="inline-flex items-center rounded-full border border-line px-3.5 py-[7px] font-cinzel text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
                  Mesa {invitado.mesa}
                </span>
              )}
            </div>

            <p className="relative mt-4 text-[13px] leading-[1.7] text-muted">
              {esGrupal
                ? `Se han reservado ${lugares} lugares para ustedes.`
                : lugares === 1
                  ? 'Se ha reservado 1 lugar para ti.'
                  : `Se han reservado ${lugares} lugares: tú y ${lugares - 1} ${
                      lugares - 1 === 1 ? 'acompañante' : 'acompañantes'
                    }.`}
            </p>

            {e.frase && (
              <div className="relative mt-5">
                <Filigrana ancho={56} />
                <p className="mt-4 font-display text-[15px] font-light italic leading-relaxed text-muted text-pretty">
                  {e.frase}
                </p>
              </div>
            )}
          </Cartucho>
        </div>
      </section>

      {flags.mostrarContador && e.fecha && (
        <Seccion titulo="Faltan">
          <Contador fechaISO={e.fecha} />
        </Seccion>
      )}

      {/* ---------- Lugar ---------- */}
      {e.lugar_nombre && (
        <Seccion titulo="Dónde y cuándo">
          <Lugar
            hora={horaDe(e.fecha, ZONA_HORARIA)}
            lugar={e.lugar_nombre}
            direccion={e.lugar_direccion ?? ''}
            mapsUrl={e.lugar_maps}
          />
        </Seccion>
      )}

      {flags.mostrarItinerario && (e.itinerario?.length ?? 0) > 0 && (
        <Seccion titulo="Itinerario">
          <ol className="tarjeta divide-y divide-line">
            {e.itinerario.map((it, i) => (
              <li key={i} className="flex items-baseline justify-between gap-4 py-3">
                <span className="font-display text-lg text-primary">{it.hora}</span>
                <span className="text-right text-sm text-muted">{it.titulo}</span>
              </li>
            ))}
          </ol>
        </Seccion>
      )}

      {flags.mostrarDressCode && e.dress_code_titulo && (
        <Seccion titulo="Código de vestimenta">
          <div className="tarjeta text-center">
            <p className="font-display text-2xl text-primary">{e.dress_code_titulo}</p>
            {e.dress_code_detalle && <p className="mt-2 text-sm text-muted">{e.dress_code_detalle}</p>}
          </div>
        </Seccion>
      )}

      {flags.mostrarRegalos && (e.regalos?.length ?? 0) > 0 && (
        <Seccion titulo="Mesa de regalos">
          <div className="space-y-4">
            {e.regalos.map((r, i) => (
              <div key={i} className="tarjeta text-center">
                <p className="font-medium">{r.titulo}</p>
                {r.detalle && <p className="mt-1 text-sm text-muted">{r.detalle}</p>}
              </div>
            ))}
          </div>
        </Seccion>
      )}

      {/* ---------- RSVP ---------- */}
      <Seccion titulo="Confirma tu asistencia">
        <RsvpForm
          token={invitado.token}
          tipo={invitado.tipo}
          lugares={lugares}
          respuesta={ultima ?? null}
          vencido={vencido}
          limiteTexto={e.limite_rsvp ? fechaLarga(e.limite_rsvp, ZONA_HORARIA) : null}
          flags={{
            pedirNombresAcompanantes: flags.pedirNombresAcompanantes,
            pedirRestriccionesAlimenticias: flags.pedirRestriccionesAlimenticias,
            pedirTelefono: flags.pedirTelefono,
            pedirMensaje: flags.pedirMensaje,
            permitirCambiarRespuesta: flags.permitirCambiarRespuesta,
          }}
        />
      </Seccion>

      {/* Solo la unidad de quien abre el link. Enumerar aquí a los demás
          invitados convertiría cada link personal en un directorio de la
          fiesta; para eso está la lista pública de la portada.
          El bloque solo aparece si ya confirmaron: antes de eso el
          formulario de arriba ya dice todo lo que hay que decir. */}
      {ultima?.asiste === true && (
        <Seccion titulo="Tu confirmación">
          <MiGrupo
            invitadoId={invitado.id}
            formato={e.lista_publica_formato}
            incluirAcompanantes={flags.pedirNombresAcompanantes}
            enlaceATodos={e.lista_publica_activa}
          />
        </Seccion>
      )}

      {flags.mostrarContacto && e.contacto_whatsapp && (
        <Seccion>
          <p className="text-center text-sm leading-relaxed text-muted">
            ¿Dudas? Escribe a {e.contacto_nombre ?? 'los organizadores'}{' '}
            <a
              className="text-primary underline underline-offset-2"
              href={`https://wa.me/${e.contacto_whatsapp}`}
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
