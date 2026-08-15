// Tipado del esquema para el cliente de Supabase.
// Debe mantenerse en sincronía con supabase/migrations/.
export type Database = {
  public: {
    Tables: {
      invitados: {
        Row: {
          id: string
          token: string
          nombre_display: string
          pases_asignados: number
          grupo: string | null
          mesa: string | null
          telefono: string | null
          notas: string | null
          creado_en: string
          eliminado_en: string | null
        }
        Insert: {
          id?: string
          token: string
          nombre_display: string
          pases_asignados?: number
          grupo?: string | null
          mesa?: string | null
          telefono?: string | null
          notas?: string | null
          creado_en?: string
          eliminado_en?: string | null
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
    }
    Views: {
      vista_asistencia: {
        Row: {
          id: string
          token: string
          nombre_display: string
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
          estado: 'pendiente' | 'confirmado' | 'no_asiste'
        }
        Relationships: []
      }
    }
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
