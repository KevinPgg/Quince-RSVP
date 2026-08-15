import type { Database } from '@/lib/database.types'

export type Invitado = Pick<
  Database['public']['Tables']['invitados']['Row'],
  'id' | 'token' | 'nombre_display' | 'pases_asignados' | 'grupo' | 'mesa' | 'telefono'
>

export type RespuestaVigente = Pick<
  Database['public']['Tables']['rsvp']['Row'],
  'asiste' | 'pases_confirmados' | 'acompanantes' | 'restricciones' | 'telefono' | 'mensaje' | 'respondido_en'
> | null

export type FilaAsistencia = Database['public']['Views']['vista_asistencia']['Row']
