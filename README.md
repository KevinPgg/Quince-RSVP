# Portal RSVP — XV Años

Portal de invitaciones con link único por invitado. Sin cuentas de usuario:
los invitados solo abren su link, y el panel se desbloquea con una contraseña.

## Puesta en marcha

1. `npm install`
2. Crear un proyecto nuevo en Supabase.
3. Pegar `supabase/migrations/0001_init.sql` completo en el SQL Editor y ejecutarlo.
4. `cp .env.example .env` y llenar las variables.
5. Llenar `config/event.ts` — todo lo marcado `PLACEHOLDER`.
6. `npm run dev` → http://localhost:3000/admin

## Cómo se usa

**Crear invitaciones:** `/admin/invitados`. Escribes el nombre y eliges cuántos
acompañantes lleva. El titular siempre cuenta como un lugar, así que
"2 acompañantes" = 3 lugares. El link se genera solo.

**Enviarlas:** botón *Copiar link* o *WhatsApp* en cada renglón.

**Ver quién confirmó:** `/admin`. Filtros por estado y botón de exportar CSV.

**Corregir errores:** *Editar* cambia datos, *Reabrir* borra la respuesta para
que el invitado conteste de nuevo, *Archivar* desactiva el link sin perder nada.
Nada se borra de verdad; lo archivado se puede restaurar.

**Carga masiva (opcional):** si ya tienes la lista en una hoja de cálculo,
`cp scripts/invitados.example.csv scripts/invitados.csv`, llénalo y corre
`npm run seed`. Genera `scripts/links-generados.csv`.

## Qué archivo tocar

| Archivo | Para qué |
|---|---|
| `config/event.ts` | Fecha, lugares, itinerario, textos |
| `config/features.ts` | Qué campos se piden y qué secciones se ven |
| `app/globals.css` | Colores y tipografías (variables `--c-*`) |
| `supabase/consultas.sql` | Consultas de apoyo para el día del evento |

Los campos opcionales (acompañantes, restricciones, teléfono, mensaje) ya existen
como columnas en la base. Prender un flag en `features.ts` **no requiere migración**.

## Seguridad

- RLS activo **sin policies**: la anon key no lee ni escribe nada.
- Todo pasa por el servidor con la `service_role` key. El navegador nunca
  habla con Supabase.
- El token de 10 caracteres (32^10 ≈ 10^15 combinaciones) es la única
  credencial del invitado.
- `/admin` usa `ADMIN_PASSWORD`: comparación en tiempo constante y 700 ms de
  retardo por intento. **Usa 16+ caracteres aleatorios**, es lo único que
  separa a un extraño de tu lista completa.
- Cada server action revalida la sesión por su cuenta, no confía en la página.
- `X-Robots-Tag: noindex` en todo el sitio.

## Deploy

Vercel. Cargar las mismas variables del `.env` en el proyecto.
`SUPABASE_SERVICE_ROLE_KEY` **nunca** con prefijo `NEXT_PUBLIC_`.
