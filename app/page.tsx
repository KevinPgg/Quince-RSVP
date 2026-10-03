import Portada from '@/components/Portada'
import Camafeos from '@/components/Camafeos'
import Revelar from '@/components/Revelar'
import { obtenerEvento, flagsDe, fechaSinDia, horaDe, ZONA_HORARIA } from '@/lib/evento'
import Contador from '@/components/Contador'
import { obtenerAlbum, retratoDe, coloresDe } from '@/lib/album'
import Seccion from '@/components/Seccion'
import HorizonteCastillo from '@/components/HorizonteCastillo'
import Lugar from '@/components/Lugar'
import Itinerario from '@/components/Itinerario'
import ListaAsistentes from '@/components/ListaAsistentes'
import { Corona, Esquinas } from '@/components/tema/Ornamentos'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const [e, album] = await Promise.all([obtenerEvento(), obtenerAlbum()])
  const flags = flagsDe(e)

  return (
    <>
      <Portada
        nombre={e.nombre}
        fecha={fechaSinDia(e.fecha, ZONA_HORARIA)}
        frase={e.frase}
        retrato={retratoDe(e)}
      />

      <main id="contenido" className="relative">
        {flags.mostrarContador && e.fecha && (
          <Seccion eyebrow="La cuenta regresiva" titulo="Faltan">
            <Revelar><Contador fechaISO={e.fecha} /></Revelar>
          </Seccion>
        )}

        {/* Álbum temprano: quien llega a la portada entra por la persona,
            no por la dirección del salón. */}
        <Seccion
          eyebrow="Álbum"
          titulo={<>De niña a <em className="font-firma text-[1.25em] not-italic text-[#b52272]">quinceañera</em></>}
        >
          <Revelar efecto="zoom"><Camafeos fotos={album} colores={coloresDe(e)} /></Revelar>
        </Seccion>

        {e.home_descripcion && (
          <Seccion eyebrow="Una invitación" titulo={e.home_titulo ?? 'La fiesta'}>
            <Revelar>
              <div className="tarjeta-real arco">
                <Esquinas donde="abajo" />
                {e.home_descripcion.split('\n').filter(Boolean).map((p, i) => (
                  <p key={i} className="mt-3 text-[14.5px] leading-[1.75] text-muted first:mt-0">{p}</p>
                ))}
              </div>
            </Revelar>
          </Seccion>
        )}

        <Seccion eyebrow="El gran día" titulo="Dónde y cuándo">
          <Revelar>
            {e.lugar_nombre ? (
              <Lugar
                hora={horaDe(e.fecha, ZONA_HORARIA)}
                lugar={e.lugar_nombre}
                direccion={e.lugar_direccion ?? ''}
                mapsUrl={e.lugar_maps}
              />
            ) : (
              <p className="text-center text-sm text-muted">Detalles próximamente.</p>
            )}
          </Revelar>
        </Seccion>

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
                <Revelar key={i} retraso={Math.min(i, 4) as 0 | 1 | 2 | 3 | 4}>
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

        {e.lista_publica_activa && (
          <Seccion eyebrow="Ya confirmaron" titulo="Nos acompañan" ancla="asistentes">
            <Revelar>
              <ListaAsistentes
                formato={e.lista_publica_formato}
                incluirAcompanantes={flags.pedirNombresAcompanantes}
              />
            </Revelar>
          </Seccion>
        )}

        {/* ---------- Llamada a la acción ---------- */}
        <Seccion>
          <Revelar>
            <div className="tarjeta-real arco">
              <Esquinas donde="abajo" />
              <Corona className="mx-auto mb-2.5 block h-[34px] w-12" />
              <p className="font-display text-2xl leading-tight text-primary">¿Tienes tu invitación?</p>
              <p className="mt-2 text-[14.5px] leading-[1.75] text-muted">
                Cada invitación tiene un link personal. Ábrelo para ver tus lugares
                reservados y confirmar tu asistencia.
              </p>
              {e.contacto_whatsapp && (
                <a
                  href={`https://wa.me/${e.contacto_whatsapp}`}
                  target="_blank"
                  rel="noreferrer"
                  className="boton-oro mt-5 max-w-full whitespace-normal text-center leading-snug"
                >
                  Escribir a {e.contacto_nombre ?? 'los organizadores'}
                </a>
              )}
            </div>
          </Revelar>
        </Seccion>

        {/* El castillo, una sola vez, cerrando el scroll. */}
        <HorizonteCastillo />

        {/* Sin enlace al panel: esta página la ven todos los invitados.
            Quien administra entra directo a /acceso. */}
        <div className="pb-10" />
      </main>
    </>
  )
}
