// ============================================================
//  Valores por omisión de los interruptores.
//  El panel los guarda en evento.flags y esos ganan.
//  Las columnas SIEMPRE existen en la base: prender un flag
//  nunca requiere migración.
// ============================================================

export const FLAGS_POR_OMISION = {
  // Campos del formulario de confirmación
  pedirNombresAcompanantes: false,
  pedirRestriccionesAlimenticias: false,
  pedirTelefono: false,
  pedirMensaje: false,

  // Comportamiento
  permitirCambiarRespuesta: true,   // el link no expira
  aplicarFechaLimite: true,

  // Secciones de la invitación
  mostrarContador: true,
  mostrarItinerario: true,
  mostrarDressCode: true,
  mostrarRegalos: false,
  mostrarMesaAsignada: false,
  mostrarContacto: true,
}

export type Flags = typeof FLAGS_POR_OMISION
export type ClaveFlag = keyof Flags

export const ETIQUETAS_FLAGS: Record<ClaveFlag, { titulo: string; ayuda: string }> = {
  pedirNombresAcompanantes: { titulo: 'Nombres de acompañantes', ayuda: 'Útil para tarjetas de lugar y asignar mesas.' },
  pedirRestriccionesAlimenticias: { titulo: 'Restricciones alimenticias', ayuda: 'Alergias, vegetarianos, menú infantil.' },
  pedirTelefono: { titulo: 'Teléfono de contacto', ayuda: 'Para recordatorios por WhatsApp.' },
  pedirMensaje: { titulo: 'Mensaje para la quinceañera', ayuda: 'Campo libre. Bonito, sin valor logístico.' },
  permitirCambiarRespuesta: { titulo: 'Permitir cambiar la respuesta', ayuda: 'El link nunca expira y admite correcciones.' },
  aplicarFechaLimite: { titulo: 'Aplicar fecha límite', ayuda: 'Después de la fecha nadie puede responder.' },
  mostrarContador: { titulo: 'Cuenta regresiva', ayuda: 'Días, horas y minutos que faltan.' },
  mostrarItinerario: { titulo: 'Itinerario', ayuda: 'Horarios de la celebración.' },
  mostrarDressCode: { titulo: 'Código de vestimenta', ayuda: '' },
  mostrarRegalos: { titulo: 'Mesa de regalos', ayuda: '' },
  mostrarMesaAsignada: { titulo: 'Mostrar mesa al invitado', ayuda: 'Solo si ya asignaste mesas.' },
  mostrarContacto: { titulo: 'Contacto de dudas', ayuda: 'WhatsApp del organizador.' },
}
