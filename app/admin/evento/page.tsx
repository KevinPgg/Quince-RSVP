import { obtenerEvento, paraInputFecha, itinerarioATexto, regalosATexto, ZONA_HORARIA } from '@/lib/evento'
import { guardarEvento } from '../actions'
import FormularioGuardado from '@/components/panel/FormularioGuardado'
import { Campo, Bloque } from '@/components/panel/Campo'

export const dynamic = 'force-dynamic'

export default async function PaginaEvento() {
  const e = await obtenerEvento()
  const tz = ZONA_HORARIA

  return (
    <FormularioGuardado accion={guardarEvento}>
      <p className="text-sm leading-relaxed text-muted">
        Esto es la plantilla: lo que escribas aquí aparece en <em>todas</em> las
        invitaciones. Al crear una invitación solo se llenan nombre y lugares.
      </p>

      <Bloque titulo="La quinceañera">
        <Campo id="nombre" label="Nombre corto *" ayuda="El que aparece grande en la portada.">
          <input id="nombre" name="nombre" className="campo" defaultValue={e.nombre} required maxLength={60} />
        </Campo>
        <Campo id="nombre_completo" label="Nombre completo">
          <input id="nombre_completo" name="nombre_completo" className="campo" defaultValue={e.nombre_completo ?? ''} maxLength={120} />
        </Campo>
        <div className="sm:col-span-2">
          <Campo id="frase" label="Frase de la portada">
            <textarea id="frase" name="frase" className="campo min-h-24" defaultValue={e.frase ?? ''} maxLength={400} />
          </Campo>
        </div>
      </Bloque>

      <Bloque titulo="Cuándo" descripcion="Horario de Ecuador (Guayaquil, UTC−5). Una sola hora para todo el evento.">
        <Campo id="fecha" label="Fecha y hora del evento">
          <input id="fecha" name="fecha" type="datetime-local" className="campo" defaultValue={paraInputFecha(e.fecha, tz)} />
        </Campo>
        <Campo id="limite_rsvp" label="Fecha límite para confirmar" ayuda="Después de esto nadie puede responder, si el interruptor está activo en Ajustes.">
          <input id="limite_rsvp" name="limite_rsvp" type="datetime-local" className="campo" defaultValue={paraInputFecha(e.limite_rsvp, tz)} />
        </Campo>
      </Bloque>

      <Bloque titulo="Dónde" descripcion="Un solo lugar. La hora es la del bloque anterior.">
        <div className="sm:col-span-2">
          <Campo id="lugar_nombre" label="Nombre del lugar">
            <input id="lugar_nombre" name="lugar_nombre" className="campo" defaultValue={e.lugar_nombre ?? ''} maxLength={120} placeholder="Salón Los Jardines" />
          </Campo>
        </div>
        <div className="sm:col-span-2">
          <Campo id="lugar_direccion" label="Dirección">
            <input id="lugar_direccion" name="lugar_direccion" className="campo" defaultValue={e.lugar_direccion ?? ''} maxLength={200} placeholder="Av. Francisco de Orellana 123, Guayaquil" />
          </Campo>
        </div>
        <div className="sm:col-span-2">
          <Campo id="lugar_maps" label="Link de Google Maps" ayuda="Abre Google Maps, busca el lugar, Compartir y copia el enlace.">
            <input id="lugar_maps" name="lugar_maps" className="campo" defaultValue={e.lugar_maps ?? ''} maxLength={500} placeholder="https://maps.app.goo.gl/..." />
          </Campo>
        </div>
      </Bloque>

      <Bloque titulo="Contenido">
        <div className="sm:col-span-2">
          <Campo id="itinerario" label="Itinerario" ayuda="Una línea por punto, con el formato:  hora | qué pasa">
            <textarea id="itinerario" name="itinerario" className="campo min-h-32 font-mono text-sm" defaultValue={itinerarioATexto(e.itinerario ?? [])} placeholder={'17:00 | Misa\n19:00 | Recepción\n19:45 | Vals'} />
          </Campo>
        </div>
        <Campo id="dress_code_titulo" label="Código de vestimenta">
          <input id="dress_code_titulo" name="dress_code_titulo" className="campo" defaultValue={e.dress_code_titulo ?? ''} maxLength={80} placeholder="Formal" />
        </Campo>
        <Campo id="dress_code_detalle" label="Detalle del código">
          <input id="dress_code_detalle" name="dress_code_detalle" className="campo" defaultValue={e.dress_code_detalle ?? ''} maxLength={300} placeholder="Se reserva el color rosa" />
        </Campo>
        <div className="sm:col-span-2">
          <Campo id="regalos" label="Mesa de regalos" ayuda="Una línea por opción:  título | detalle">
            <textarea id="regalos" name="regalos" className="campo min-h-24 font-mono text-sm" defaultValue={regalosATexto(e.regalos ?? [])} placeholder={'Lluvia de sobres | Tu presencia es el mejor regalo'} />
          </Campo>
        </div>
      </Bloque>

      <Bloque titulo="Página principal" descripcion="Lo que ve quien entra al sitio sin un link de invitación.">
        <Campo id="home_titulo" label="Título de la sección">
          <input id="home_titulo" name="home_titulo" className="campo" defaultValue={e.home_titulo ?? ''} maxLength={80} />
        </Campo>
        <div className="sm:col-span-2">
          <Campo id="home_descripcion" label="Descripción de la fiesta" ayuda="Puedes usar varios párrafos.">
            <textarea id="home_descripcion" name="home_descripcion" className="campo min-h-40" defaultValue={e.home_descripcion ?? ''} maxLength={2000} />
          </Campo>
        </div>
      </Bloque>

      <Bloque titulo="Contacto para dudas">
        <Campo id="contacto_nombre" label="Nombre">
          <input id="contacto_nombre" name="contacto_nombre" className="campo" defaultValue={e.contacto_nombre ?? ''} maxLength={80} />
        </Campo>
        <Campo id="contacto_whatsapp" label="WhatsApp" ayuda="Solo dígitos con código de país. Ej. 5215512345678">
          <input id="contacto_whatsapp" name="contacto_whatsapp" className="campo" inputMode="numeric" defaultValue={e.contacto_whatsapp ?? ''} maxLength={20} />
        </Campo>
      </Bloque>
    </FormularioGuardado>
  )
}
