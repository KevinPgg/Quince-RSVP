import type { Database } from '@/lib/database.types'

export type { Rol, TipoInvitacion, EstadoRsvp, ItemItinerario, ItemRegalo } from '@/lib/database.types'

export type Usuario = Database['public']['Tables']['usuarios']['Row']
export type SesionUsuario = Pick<Usuario, 'id' | 'usuario' | 'nombre' | 'rol'>
export type Evento = Database['public']['Tables']['evento']['Row']
export type Invitado = Database['public']['Tables']['invitados']['Row']
export type Rsvp = Database['public']['Tables']['rsvp']['Row']
export type FilaAsistencia = Database['public']['Views']['vista_asistencia']['Row']

export type RespuestaVigente = Pick<
  Rsvp,
  'asiste' | 'pases_confirmados' | 'acompanantes' | 'restricciones' | 'telefono' | 'mensaje' | 'respondido_en'
> | null

export type Resultado = { ok: true } | { ok: false; error: string }
