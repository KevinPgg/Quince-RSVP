import { supabaseAdmin } from '@/lib/supabase/admin'
import { sesionActual } from '@/lib/auth'
import { NuevoUsuario, FilaUsuario, type UsuarioFila } from './gestion'

export const dynamic = 'force-dynamic'

export default async function PaginaUsuarios() {
  const sesion = await sesionActual()
  const { data } = await supabaseAdmin()
    .from('usuarios')
    .select('id, usuario, nombre, rol, activo, ultimo_acceso')
    .order('creado_en')

  const usuarios = (data ?? []) as UsuarioFila[]

  return (
    <div className="space-y-6">
      <NuevoUsuario />

      <p className="text-sm leading-relaxed text-muted">
        Cada acción del panel queda registrada con el nombre de quien la hizo.
        Desactivar a alguien corta su sesión de inmediato, sin borrar lo que creó.
      </p>

      <ul className="grid gap-3 lg:grid-cols-2">
        {usuarios.map((u) => (
          <FilaUsuario key={u.id} u={u} esYo={u.id === sesion?.id} />
        ))}
      </ul>
    </div>
  )
}
