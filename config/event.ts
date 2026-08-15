// ============================================================
//  DATOS DEL EVENTO  —  edita SOLO este archivo para el contenido
//  Todo lo que dice PLACEHOLDER hay que reemplazarlo.
// ============================================================

export const EVENTO = {
  quinceanera: {
    nombre: 'Angeles',
    nombreCompleto: 'Maria de los Angeles PLACEHOLDER', // PLACEHOLDER
  },

  // Fecha y hora en formato ISO con zona horaria.
  // Ejemplo Ciudad de Mexico (UTC-6): 2026-11-14T19:00:00-06:00
  fechaISO: '2026-11-14T19:00:00-06:00', // PLACEHOLDER
  zonaHoraria: 'America/Mexico_City',    // PLACEHOLDER

  // Fecha limite para responder. Despues de esto /api/rsvp rechaza.
  limiteRsvpISO: '2026-10-31T23:59:59-06:00', // PLACEHOLDER

  ceremonia: {
    activa: true,
    titulo: 'Misa de accion de gracias',
    hora: '17:00',
    lugar: 'Parroquia PLACEHOLDER',       // PLACEHOLDER
    direccion: 'Calle PLACEHOLDER 000, Colonia PLACEHOLDER', // PLACEHOLDER
    mapsUrl: 'https://maps.google.com/?q=PLACEHOLDER',       // PLACEHOLDER
  },

  recepcion: {
    titulo: 'Recepcion',
    hora: '19:00',
    lugar: 'Salon PLACEHOLDER',            // PLACEHOLDER
    direccion: 'Calle PLACEHOLDER 000, Colonia PLACEHOLDER', // PLACEHOLDER
    mapsUrl: 'https://maps.google.com/?q=PLACEHOLDER',       // PLACEHOLDER
  },

  itinerario: [
    { hora: '17:00', titulo: 'Misa' },
    { hora: '19:00', titulo: 'Recepcion' },
    { hora: '19:45', titulo: 'Vals' },
    { hora: '20:30', titulo: 'Cena' },
    { hora: '21:30', titulo: 'Baile' },
  ],

  dressCode: {
    titulo: 'Formal',
    detalle: 'Se reserva el color PLACEHOLDER para la quinceanera.', // PLACEHOLDER
  },

  // Mesa de regalos / sobre. Deja el array vacio para ocultar la seccion.
  regalos: [
    // { titulo: 'Lluvia de sobres', detalle: 'Tu presencia es el mejor regalo' },
  ] as { titulo: string; detalle: string }[],

  contacto: {
    nombre: 'Kevin',                 // PLACEHOLDER
    whatsapp: '+52 000 000 0000',    // PLACEHOLDER — formato E.164 sin espacios para el link
    whatsappLink: '5210000000000',   // PLACEHOLDER
  },

  // Frase corta que aparece bajo el nombre.
  frase: 'Hay momentos en la vida que son especiales por si solos. Compartirlos con las personas que quieres los convierte en inolvidables.',
} as const
