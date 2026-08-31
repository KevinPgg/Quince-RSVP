/**
 * Plantilla del mensaje de WhatsApp con el que se comparte una invitación.
 *
 * No lleva 'server-only': el panel la usa desde el cliente para armar el
 * enlace wa.me y para la vista previa en vivo de /admin/ajustes.
 */

export type DatosMensaje = {
  nombre: string
  link: string
  lugares: number
  tipo: 'individual' | 'grupal'
  evento: string
  fecha: string
  lugar: string
}

/** Dos plantillas por omisión: el trato cambia con el tipo de invitación. */
export const PLANTILLA_INDIVIDUAL =
  'Hola {nombre}, te comparto la invitación a los XV años de {evento}. ' +
  'Ahí mismo puedes confirmar tu asistencia: {link}'

export const PLANTILLA_GRUPAL =
  'Hola, les compartimos la invitación a los XV años de {evento}. ' +
  'Tienen {lugares} lugares reservados y en el mismo link pueden confirmar: {link}'

export const MARCADORES: { clave: string; que: string }[] = [
  { clave: '{nombre}', que: 'Nombre de la invitación' },
  { clave: '{link}', que: 'El link personal. Si falta, se añade al final.' },
  { clave: '{lugares}', que: 'Cuántos lugares tiene reservados' },
  { clave: '{evento}', que: 'Nombre de la quinceañera' },
  { clave: '{fecha}', que: 'Fecha de la fiesta' },
  { clave: '{lugar}', que: 'Dónde es' },
]

/**
 * Sustituye los marcadores. Los desconocidos se dejan tal cual en vez de
 * borrarlos: un `{lugarr}` mal escrito se ve en el mensaje y se corrige,
 * mientras que un hueco en blanco pasa desapercibido hasta que ya se envió.
 */
export function armarMensaje(plantilla: string | null, d: DatosMensaje): string {
  const base =
    plantilla?.trim() ||
    (d.tipo === 'grupal' ? PLANTILLA_GRUPAL : PLANTILLA_INDIVIDUAL)

  const valores: Record<string, string> = {
    '{nombre}': d.nombre,
    '{link}': d.link,
    '{lugares}': String(d.lugares),
    '{evento}': d.evento,
    '{fecha}': d.fecha,
    '{lugar}': d.lugar,
  }

  let texto = base
  for (const [marcador, valor] of Object.entries(valores)) {
    texto = texto.split(marcador).join(valor)
  }

  // Red de seguridad: un mensaje sin link no sirve para nada, y es el error
  // fácil de cometer al editar la plantilla.
  if (!texto.includes(d.link)) texto = `${texto.trimEnd()}\n${d.link}`

  return texto
}

/** Tope de wa.me. Muy por encima de cualquier mensaje razonable, pero
 *  un texto más largo se trunca en silencio del lado de WhatsApp. */
export const LARGO_MAXIMO = 900
