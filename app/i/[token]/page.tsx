import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { obtenerEvento, flagsDe, fechaLarga, horaDe, ZONA_HORARIA, regalosTituloDe, hayRegalos } from '@/lib/evento'
import MesaRegalos from '@/components/MesaRegalos'
import type { Invitado, RespuestaVigente } from '@/lib/types'
import Contador from '@/components/Contador'
import Seccion from '@/components/Seccion'
import Lugar from '@/components/Lugar'
import Itinerario from '@/components/Itinerario'
import Revelar from '@/components/Revelar'
import HorizonteCastillo from '@/components/HorizonteCastillo'
import { MiGrupo } from '@/components/ListaAsistentes'
import Filigrana from '@/components/Filigrana'
import Cartucho from '@/components/Cartucho'
import { Brillos, Esquinas, GuirnaldaCartucho } from '@/components/tema/Ornamentos'
import RsvpForm from './rsvp-form'
import Personaje from '@/components/tema/Personaje'

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
    <main className="relative">
      {/* ---------- Héroe (tablero 5a) ----------
          Alto según su contenido, no pantalla completa: el cartucho se monta sobre su borde
          inferior y los dos se leen como una sola pieza. Tope de `max-w-xl`:
          5a está dibujado a 390 px, es una tarjeta, no una página. */}
      <header className="relative isolate mx-auto w-full max-w-xl overflow-hidden px-4 pb-[58px] pt-6">
        {/* Pétalos de `fondo-invitacion.png`. Como fondo CSS y no con
            `next/image`: es decorativo y si falta no debe romper nada. */}
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-x-[8%] -inset-y-[4%] -z-10 opacity-55"
          style={{ background: "url('/recursos/tema/fondo-invitacion.png') center top / cover no-repeat" }}
        />
        <div
          aria-hidden
          className="aurora-1 pointer-events-none absolute left-1/2 top-[45%] -z-10 h-[340px] w-[340px] rounded-full opacity-55 blur-[40px]"
          style={{ transform: 'translate(-50%, -50%)', background: 'radial-gradient(circle, #f6d9ec, transparent 70%)' }}
        />
        {/* Sin castillo de fondo ni corona sueltos: el emblema del «XV» ya
            trae los dos, y repetidos se leen como error de montaje. */}
        <Brillos
          lista={[
            { left: '12%', top: '10%' },
            { left: '84%', top: '18%', tipo: 'lila' },
            { left: '8%', top: '58%', tipo: 'estrella' },
            { left: '90%', top: '52%', tipo: 'estrella' },
          ]}
        />

        {/* El emblema ya tiene su azulejo y su conejo: aquí solo el
            petirrojo, que no aparece en él. */}
        <div aria-hidden className="entra entra-6 pointer-events-none absolute inset-0">
          <Personaje n="petirrojo" anim="vuela-b" espejado ancho={70} className="right-[1%] top-[18px]" />
        </div>

        <div className="relative text-center">
          <p className="entra entra-2 font-cinzel text-[11px] font-semibold uppercase tracking-[0.34em] text-[#8d6bab]">
            Mis
          </p>

          {/* Emblema «XV» (public/recursos/tema/xv.webp, 800×507, 128 KB).
              Fondo lila del original quitado a transparencia (color a alfa),
              así se posa sobre los pétalos y auroras sin rectángulo; la
              máscara de .xv-emblema solo suaviza el halo que llega al borde.
              Márgenes negativos porque la ilustración trae aire alrededor. */}
          <div className="xv-emblema entra entra-3 relative mx-auto -mb-3 -mt-2 w-[min(100%,480px)]">
            {/* El «XV» lleva a la página principal. El enlace va DENTRO del
                div con `.entra`: esa animación deja `transform: none` fijado
                y anularía el realce al pasar el cursor. */}
            <Link href="/" aria-label="XV — ir a la página principal" title="Ir a la página principal" className="enlace-xv relative block">
              <Image
                src="/recursos/tema/xv.webp"
                alt=""
                width={800}
                height={507}
                priority
                sizes="(min-width: 520px) 480px, 100vw"
                className="h-auto w-full"
              />
              <span aria-hidden className="enlace-xv-barrido" />
            </Link>
          </div>

          <p
            className="entra entra-4 font-firma text-[64px] leading-none text-[#b52272]"
            style={{ paddingTop: '0.14em' }}
          >
            {e.nombre}
          </p>
          {e.fecha && (
            <p className="entra entra-5 mt-3 font-cinzel text-[11px] font-semibold uppercase tracking-[0.2em] text-[#5c3a80]">
              {fechaLarga(e.fecha, ZONA_HORARIA)}
            </p>
          )}
        </div>
      </header>

      {/* ---------- Saludo personal, montado sobre el héroe ---------- */}
      <div className="contenedor entra entra-6 relative -mt-[30px] mb-14">
        {/* Guirnalda colgando del borde inferior y la ardilla sentada en su
            voluta izquierda: así queda FUERA del texto y no flotando.
            `mb-12` reserva el alto que la guirnalda sobresale. No el conejo:
            el emblema del «XV», justo encima, ya trae uno dibujado distinto. */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 -bottom-[58px] z-[3]">
          <div className="relative mx-auto w-[min(100%,420px)]">
            <GuirnaldaCartucho className="block h-auto w-full drop-shadow-[0_3px_4px_rgba(92,43,134,0.18)]" />
            <Personaje n="ardilla" anim="asoma" ancho={60} className="left-[2px] bottom-[22%]" />
          </div>
        </div>
        <Cartucho>
          <p className="relative font-cinzel text-[10px] font-semibold uppercase tracking-[0.26em] text-[#8a6a33]">
            Con cariño para
          </p>
          <p className="relative mt-2.5 font-firma text-[42px] leading-[1.15] text-[#b52272]" style={{ paddingTop: '0.1em' }}>
            {invitado.nombre_display}
          </p>
          <div className="relative mt-3">
            <Filigrana ancho={74} />
          </div>

          <div className="relative mt-3.5 flex flex-wrap items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-accent px-3.5 py-2 font-cinzel text-[10px] font-semibold uppercase tracking-[0.14em] text-primary [background:linear-gradient(180deg,#fffaf0,#fff)]">
              ✦ {lugares} {lugares === 1 ? 'lugar' : 'lugares'}
            </span>
            {flags.mostrarMesaAsignada && invitado.mesa && (
              <span className="inline-flex items-center rounded-full border border-line px-3.5 py-2 font-cinzel text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
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
            <p className="relative mt-4 font-display text-[16px] font-light italic leading-relaxed text-muted text-pretty">
              {e.frase}
            </p>
          )}
          {/* Aire para la guirnalda y la ardilla, que montan sobre este borde. */}
          <div aria-hidden className="h-5" />
        </Cartucho>
      </div>

      {/* ---------- RSVP ----------
          Justo debajo del saludo, como en 5a: es a lo que viene quien abre
          el link. La información de la fiesta va después. */}
      <Seccion titulo={<span className="font-cinzel text-[13px] font-semibold uppercase tracking-[0.26em]">Confirma tu lugar</span>}>
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

      {/* Solo la unidad de quien abre el link; aparece si ya confirmaron. */}
      {ultima?.asiste === true && (
        <Seccion eyebrow="Tu grupo" titulo="Tu confirmación">
          <MiGrupo
            invitadoId={invitado.id}
            formato={e.lista_publica_formato}
            incluirAcompanantes={flags.pedirNombresAcompanantes}
            enlaceATodos={e.lista_publica_activa}
          />
        </Seccion>
      )}

      {flags.mostrarContador && e.fecha && (
        <Seccion eyebrow="La cuenta regresiva" titulo="Faltan">
          <Revelar><Contador fechaISO={e.fecha} /></Revelar>
        </Seccion>
      )}

      {e.lugar_nombre && (
        <Seccion eyebrow="El gran día" titulo="Dónde y cuándo">
          <Revelar>
            <Lugar
              hora={horaDe(e.fecha, ZONA_HORARIA)}
              lugar={e.lugar_nombre}
              direccion={e.lugar_direccion ?? ''}
              mapsUrl={e.lugar_maps}
            />
          </Revelar>
        </Seccion>
      )}

      {flags.mostrarItinerario && (e.itinerario?.length ?? 0) > 0 && (
        <Seccion eyebrow="La noche" titulo="Itinerario">
          <Revelar><Itinerario items={e.itinerario} /></Revelar>
        </Seccion>
      )}

      {flags.mostrarDressCode && e.dress_code_titulo && (
        <Seccion eyebrow="Vestimenta" titulo="Código de vestimenta">
          <Revelar>
            <div className="tarjeta-real arco">
              <Esquinas donde="abajo" />
              <p className="font-firma text-[44px] leading-none text-[#b52272]" style={{ paddingTop: '0.14em' }}>
                {e.dress_code_titulo}
              </p>
              {e.dress_code_detalle && (
                <p className="mt-2 text-[14.5px] leading-[1.75] text-muted">{e.dress_code_detalle}</p>
              )}
            </div>
          </Revelar>
        </Seccion>
      )}

      {flags.mostrarRegalos && hayRegalos(e) && (
        <Seccion eyebrow="Si deseas un detalle" titulo={regalosTituloDe(e)}>
          <MesaRegalos texto={e.regalos_texto} />
        </Seccion>
      )}


      {/* El castillo cierra la invitación igual que la portada, y aquí es
          además el vínculo de vuelta a la página principal. */}
      <HorizonteCastillo enlace={{ href: '/', texto: 'Visitar la página principal' }} />

      
      {flags.mostrarContacto && e.contacto_whatsapp && (
        <Seccion>
          <p style={{ marginBottom: '0.75em' }} 
            className="text-center text-sm leading-relaxed text-muted">
            ¿Dudas? Escribe a {e.contacto_nombre ?? 'los organizadores'}{' '}
            <a
              className="text-primary underline underline-offset-2"
              href={`https://wa.me/${e.contacto_whatsapp}`}
              target="_blank"
              rel="noreferrer"
            >
              por WhatsApp
            </a>
          </p  >
        </Seccion>
      )}
    </main>
  )
}
