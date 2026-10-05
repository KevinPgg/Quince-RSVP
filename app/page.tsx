import Portada from '@/components/Portada'
import Camafeos from '@/components/Camafeos'
import Personaje from '@/components/tema/Personaje'
import Musica from '@/components/Musica'
import Revelar from '@/components/Revelar'
import { obtenerEvento, flagsDe, fechaSinDia, horaDe, ZONA_HORARIA, albumTituloDe, regalosTituloDe, hayRegalos } from '@/lib/evento'
import TituloRealce from '@/components/TituloRealce'
import MesaRegalos from '@/components/MesaRegalos'
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
      {/* Música de fondo + botón de silencio fijo en la esquina. */}
      <Musica />
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
          titulo={<TituloRealce texto={albumTituloDe(e)} />}
        >
          <Revelar efecto="zoom">
            <div className="relative">
              <Camafeos fotos={album} colores={coloresDe(e)} />
              <Personaje n="ardilla" anim="asoma" ancho={72} className="bottom-[34px] right-[2px] z-[3]" />
            </div>
          </Revelar>
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

        {flags.mostrarRegalos && hayRegalos(e) && (
          <Seccion eyebrow="Si deseas un detalle" titulo={regalosTituloDe(e)}>
            <MesaRegalos texto={e.regalos_texto} />
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
