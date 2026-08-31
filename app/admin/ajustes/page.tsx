import { obtenerEvento, flagsDe, fechaLarga, ZONA_HORARIA } from '@/lib/evento'
import { guardarAjustes } from '../actions'
import FormularioGuardado from '@/components/panel/FormularioGuardado'
import { Interruptor } from '@/components/panel/Campo'
import MensajeWhatsapp from '@/components/panel/MensajeWhatsapp'
import { ETIQUETAS_FLAGS, type ClaveFlag } from '@/config/features'

export const dynamic = 'force-dynamic'

const GRUPOS: { titulo: string; descripcion: string; claves: ClaveFlag[] }[] = [
  {
    titulo: 'Qué se le pide al invitado',
    descripcion:
      'Las columnas ya existen en la base. Prender uno de estos no borra ni migra nada: solo aparece el campo en el formulario.',
    claves: ['pedirNombresAcompanantes', 'pedirRestriccionesAlimenticias', 'pedirTelefono', 'pedirMensaje'],
  },
  {
    titulo: 'Comportamiento',
    descripcion: 'Cómo se comporta el link de invitación.',
    claves: ['permitirCambiarRespuesta', 'aplicarFechaLimite'],
  },
  {
    titulo: 'Secciones de la invitación',
    descripcion: 'Qué bloques se ven al abrir el link.',
    claves: ['mostrarContador', 'mostrarItinerario', 'mostrarDressCode', 'mostrarRegalos', 'mostrarMesaAsignada', 'mostrarContacto'],
  },
]

export default async function PaginaAjustes() {
  const evento = await obtenerEvento()
  const flags = flagsDe(evento)

  return (
    <FormularioGuardado accion={guardarAjustes}>
      {/* ---- Lista pública ---- */}
      <section className="tarjeta">
        <h2 className="titulo-seccion text-xl">Lista de asistentes</h2>
        <p className="mt-1 text-xs leading-relaxed text-muted">
          En el panel siempre ves la lista completa. Esto controla si además se
          publica en la página principal, donde la puede ver cualquiera que
          tenga la dirección del sitio.
        </p>

        <div className="mt-5 space-y-4">
          <Interruptor
            name="lista_publica_activa"
            defaultChecked={evento.lista_publica_activa}
            tono="alerta"
            titulo="Publicar la lista en la página principal"
            ayuda="Cualquiera que llegue al sitio verá quién asiste. La dirección y la hora ya están ahí. Piénsalo dos veces antes de activarlo."
          />

          <fieldset className="rounded-2xl border border-line p-4">
            <legend className="px-1 text-xs uppercase tracking-[0.12em] text-muted">
              Cómo se muestran los nombres
            </legend>
            <div className="mt-3 space-y-3">
              {([
                ['nombre_pila', 'Solo nombre e inicial', 'Así: «Sofía M.». Reconocible para quien la conoce, inútil para un extraño.'],
                ['completo', 'Nombre completo', 'La lista tal cual la capturaste. Máxima exposición.'],
              ] as const).map(([v, titulo, ayuda]) => (
                <label key={v} className="flex cursor-pointer items-start gap-3">
                  <input
                    type="radio"
                    name="lista_publica_formato"
                    value={v}
                    defaultChecked={evento.lista_publica_formato === v}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-[rgb(var(--c-primary))]"
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium">{titulo}</span>
                    <span className="mt-0.5 block text-xs leading-snug text-muted">{ayuda}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      </section>

      {/* ---- Mensaje de WhatsApp ---- */}
      <MensajeWhatsapp
        valorInicial={evento.whatsapp_plantilla}
        nombreEvento={evento.nombre}
        fechaTexto={fechaLarga(evento.fecha, ZONA_HORARIA)}
        lugarTexto={evento.lugar_nombre ?? 'el lugar del evento'}
      />

      {/* ---- Interruptores ---- */}
      {GRUPOS.map((g) => (
        <section key={g.titulo} className="tarjeta">
          <h2 className="titulo-seccion text-xl">{g.titulo}</h2>
          <p className="mt-1 text-xs leading-relaxed text-muted">{g.descripcion}</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {g.claves.map((c) => (
              <Interruptor
                key={c}
                name={`flag_${c}`}
                defaultChecked={flags[c]}
                titulo={ETIQUETAS_FLAGS[c].titulo}
                ayuda={ETIQUETAS_FLAGS[c].ayuda}
              />
            ))}
          </div>
        </section>
      ))}
    </FormularioGuardado>
  )
}
