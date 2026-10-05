// Tipado del esquema para el cliente de Supabase.
// Mantener en sincronía con supabase/migrations/0001_init.sql

export type Rol = 'dueno' | 'editor'
export type TipoInvitacion = 'individual' | 'grupal'
export type EstadoRsvp = 'pendiente' | 'confirmado' | 'no_asiste'

export type ItemItinerario = { hora: string; titulo: string }
export type ItemRegalo = { titulo: string; detalle: string }

export type Database = {
  public: {
    Tables: {
      usuarios: {
        Row: {
          id: string
          usuario: string
          nombre: string
          password_hash: string
          rol: Rol
          activo: boolean
          creado_en: string
          ultimo_acceso: string | null
        }
        Insert: {
          id?: string
          usuario: string
          nombre: string
          password_hash: string
          rol?: Rol
          activo?: boolean
          creado_en?: string
          ultimo_acceso?: string | null
        }
        Update: Partial<Database['public']['Tables']['usuarios']['Insert']>
        Relationships: []
      }
      evento: {
        Row: {
          id: string
          singleton: boolean
          nombre: string
          nombre_completo: string | null
          frase: string | null
          fecha: string | null
          zona_horaria: string
          limite_rsvp: string | null
          lugar_nombre: string | null
          lugar_direccion: string | null
          lugar_maps: string | null
          itinerario: ItemItinerario[]
          regalos: ItemRegalo[]
          dress_code_titulo: string | null
          dress_code_detalle: string | null
          home_titulo: string | null
          home_descripcion: string | null
          contacto_nombre: string | null
          contacto_whatsapp: string | null
          lista_publica_activa: boolean
          lista_publica_formato: 'nombre_pila' | 'completo'
          whatsapp_plantilla: string | null
          flags: Record<string, boolean>
          retrato_ruta: string | null
          album_colores: string[] | null
          regalos_titulo: string | null
          regalos_texto: string | null
          album_titulo: string | null
          actualizado_en: string
        }
        Insert: Partial<Database['public']['Tables']['evento']['Row']>
        Update: Partial<Database['public']['Tables']['evento']['Row']>
        Relationships: []
      }
      invitados: {
        Row: {
          id: string
          token: string
          nombre_display: string
          tipo: TipoInvitacion
          pases_asignados: number
          grupo: string | null
          mesa: string | null
          telefono: string | null
          notas: string | null
          creado_por: string | null
          creado_en: string
          eliminado_en: string | null
          eliminado_por: string | null
        }
        Insert: {
          id?: string
          token: string
          nombre_display: string
          tipo?: TipoInvitacion
          pases_asignados?: number
          grupo?: string | null
          mesa?: string | null
          telefono?: string | null
          notas?: string | null
          creado_por?: string | null
          creado_en?: string
          eliminado_en?: string | null
          eliminado_por?: string | null
        }
        Update: Partial<Database['public']['Tables']['invitados']['Insert']>
        Relationships: []
      }
      rsvp: {
        Row: {
          id: string
          invitado_id: string
          asiste: boolean
          pases_confirmados: number
          acompanantes: string[] | null
          restricciones: string | null
          telefono: string | null
          mensaje: string | null
          respondido_en: string
        }
        Insert: {
          id?: string
          invitado_id: string
          asiste: boolean
          pases_confirmados?: number
          acompanantes?: string[] | null
          restricciones?: string | null
          telefono?: string | null
          mensaje?: string | null
          respondido_en?: string
        }
        Update: Partial<Database['public']['Tables']['rsvp']['Insert']>
        Relationships: []
      }
      fotos: {
        Row: {
          id: string
          ruta: string
          alt: string
          pie: string | null
          orden: number
          espejo: number | null
          visible: boolean
          ancho: number | null
          alto: number | null
          creado_en: string
        }
        Insert: {
          id?: string
          ruta: string
          alt?: string
          pie?: string | null
          orden?: number
          espejo?: number | null
          visible?: boolean
          ancho?: number | null
          alto?: number | null
          creado_en?: string
        }
        Update: Partial<Database['public']['Tables']['fotos']['Insert']>
        Relationships: []
      }
      bitacora: {
        Row: {
          id: string
          usuario_id: string | null
          usuario_txt: string | null
          accion: string
          entidad: string
          entidad_id: string | null
          detalle: Record<string, unknown> | null
          creado_en: string
        }
        Insert: {
          id?: string
          usuario_id?: string | null
          usuario_txt?: string | null
          accion: string
          entidad: string
          entidad_id?: string | null
          detalle?: Record<string, unknown> | null
          creado_en?: string
        }
        Update: Partial<Database['public']['Tables']['bitacora']['Insert']>
        Relationships: []
      }
    }
    Views: {
      vista_asistencia: {
        Row: {
          id: string
          token: string
          nombre_display: string
          tipo: TipoInvitacion
          pases_asignados: number
          grupo: string | null
          mesa: string | null
          notas: string | null
          telefono_lista: string | null
          creado_en: string
          asiste: boolean | null
          pases_confirmados: number
          acompanantes: string[] | null
          restricciones: string | null
          telefono_rsvp: string | null
          mensaje: string | null
          respondido_en: string | null
          estado: EstadoRsvp
        }
        Relationships: []
      }
    }
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
