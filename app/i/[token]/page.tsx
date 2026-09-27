import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { obtenerEvento, flagsDe, fechaLarga, horaDe, ZONA_HORARIA } from '@/lib/evento'
import type { Invitado, RespuestaVigente } from '@/lib/types'
import Contador from '@/components/Contador'
import Seccion from '@/components/Seccion'
import Lugar from '@/components/Lugar'
import Itinerario from '@/components/Itinerario'
import Revelar from '@/components/Revelar'
import { MiGrupo } from '@/components/ListaAsistentes'
import Filigrana from '@/components/Filigrana'
import Cartucho from '@/components/Cartucho'
import { Brillos, Corona, Esquinas } from '@/components/tema/Ornamentos'
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
      {/* ---------- Héroe (tablero 5a) ----------
          420 px y no pantalla completa: el cartucho se monta sobre su borde
          inferior y los dos se leen como una sola pieza. Tope de `max-w-xl`:
          5a está dibujado a 390 px, es una tarjeta, no una página. */}
      <header className="relative isolate mx-auto h-[420px] w-full max-w-xl overflow-hidden">
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
        {/* Castillo como máscara, desvanecido hacia abajo. Las puntas quedan
            detrás del nombre y la fecha, igual que en el tablero 5a: a esta
            opacidad no compiten con el texto. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            WebkitMask: 'linear-gradient(0deg, transparent 0, #000 90px)',
            mask: 'linear-gradient(0deg, transparent 0, #000 90px)',
          }}
        >
          <div className="castillo w-[min(100%,440px)] opacity-50" />
        </div>

        <Brillos
          lista={[
            { left: '15%', top: '16%' },
            { left: '81%', top: '24%', tipo: 'lila' },
            { left: '24%', top: '44%', tipo: 'estrella' },
            { left: '72%', top: '12%', tipo: 'estrella' },
          ]}
        />

        <div className="absolute inset-x-0 top-[34px] text-center">
          <div className="entra entra-1">
            <Corona className="flota mx-auto mb-2.5 block h-10 w-[58px]" />
          </div>
          <p className="entra entra-2 font-cinzel text-[11px] font-semibold uppercase tracking-[0.34em] text-[#8d6bab]">
            Mis
          </p>

          {/* «XV» en tres capas: filo de oro detrás, degradado rosa, y un
              reflejo que lo recorre. Las dos de encima tienen color de
              respaldo por si el navegador no recorta el fondo al texto. */}
          <div className="entra entra-3 relative mt-1 h-[100px] font-cinzel text-[100px] font-bold leading-none" aria-label="XV">
            <span
              aria-hidden
              className="text-accent [-webkit-text-stroke:6px_#c08a2e]"
              style={{ filter: 'drop-shadow(0 6px 14px rgba(160,110,30,.3))' }}
            >
              XV
            </span>
            <span aria-hidden className="xv-relleno absolute inset-x-0 top-0">XV</span>
            <span aria-hidden className="xv-reflejo absolute inset-x-0 top-0">XV</span>
          </div>

          <p
            className="entra entra-4 mt-1.5 font-firma text-[68px] leading-none text-[#b52272]"
            style={{ paddingTop: '0.14em' }}
          >
            {e.nombre}
          </p>
          {e.fecha && (
            <p className="entra entra-5 mt-3.5 font-cinzel text-[11px] font-semibold uppercase tracking-[0.2em] text-[#5c3a80]">
              {fechaLarga(e.fecha, ZONA_HORARIA)}
            </p>
          )}
        </div>
      </header>

      {/* ---------- Saludo personal, montado sobre el héroe ---------- */}
      <div className="contenedor entra entra-6 -mt-[30px]">
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

      {flags.mostrarRegalos && (e.regalos?.length ?? 0) > 0 && (
        <Seccion eyebrow="Si deseas un detalle" titulo="Mesa de regalos">
          <div className="space-y-5">
            {e.regalos.map((r, i) => (
              <Revelar key={i}>
                <div className="tarjeta-real">
                  <Esquinas donde="arriba" />
                  <p className="font-display text-2xl leading-tight text-ink">{r.titulo}</p>
                  {r.detalle && <p className="mt-1.5 text-[14.5px] leading-[1.75] text-muted">{r.detalle}</p>}
                </div>
              </Revelar>
            ))}
          </div>
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
