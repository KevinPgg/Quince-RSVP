// ============================================================
//  FLAGS  —  que se le pide al invitado y que se muestra
//  Las columnas SIEMPRE existen en la base de datos.
//  Prender un flag aqui NO requiere migracion.
// ============================================================

export const FEATURES = {
  // --- Campos del formulario RSVP ---
  pedirNombresAcompanantes: false,
  pedirRestriccionesAlimenticias: false,
  pedirTelefono: false,
  pedirMensaje: false,

  // --- Comportamiento ---
  // Permite que un invitado que ya respondio cambie su respuesta.
  permitirCambiarRespuesta: true,
  // Aplica la fecha limite de EVENTO.limiteRsvpISO.
  aplicarFechaLimite: true,

  // --- Secciones visibles de la invitacion ---
  mostrarContador: true,
  mostrarItinerario: true,
  mostrarCeremonia: true,
  mostrarDressCode: true,
  mostrarRegalos: false,
  mostrarMesaAsignada: false,
  mostrarContacto: true,
} as const

export type Features = typeof FEATURES
