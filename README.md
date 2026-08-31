# Portal de invitaciones — XV Años

Invitaciones con link único por invitado. El invitado no necesita cuenta:
abre su link, confirma y puede volver a abrirlo cuando quiera para cambiar
su respuesta. Quien administra sí entra con usuario y contraseña.

## Puesta en marcha

1. `npm install`
2. Crear un proyecto nuevo en Supabase.
3. Pegar `supabase/migrations/0001_init.sql` completo en el SQL Editor y ejecutarlo.
4. `cp .env.example .env` y llenar las tres variables.
5. `npm run dev` → abrir http://localhost:3000/acceso

La primera vez, `/acceso` te pide crear tu usuario. Ese primero queda como
**dueño**. Después esa pantalla se cierra para siempre y solo el dueño puede
dar de alta a más gente.

## Mapa del sitio

| Ruta | Quién entra | Para qué |
|---|---|---|
| `/` | cualquiera | Portada pública con el detalle de la fiesta |
| `/i/[token]` | quien tenga el link | La invitación y la confirmación |
| `/acceso` | — | Entrar al panel |
| `/invitacion` | dueño y editor | Crear, editar y compartir invitaciones |
| `/invitacion/asistencia` | dueño y editor | Quién confirmó, exportar CSV |
| `/admin/evento` | solo dueño | Lugar, fecha, hora, textos: la plantilla |
| `/admin/ajustes` | solo dueño | Interruptores y lista pública |
| `/admin/usuarios` | solo dueño | Altas, roles, contraseñas |
| `/admin/bitacora` | solo dueño | Quién hizo qué |

## Cómo se usa

**Primero configura el evento** en `/admin/evento`. Lugar, fecha y hora son
una plantilla: se escriben una vez y aparecen en todas las invitaciones.

**Luego crea invitaciones** en `/invitacion`. Solo pide nombre y lugares:

- **Individual** — una persona, con o sin acompañantes. Eliges cuántos.
- **Grupal** — un solo link para N lugares. Lo abre quien lo tenga y confirma
  cuántos de esos lugares se ocupan.

El link se genera solo. Se comparte con *Copiar link* o *WhatsApp*, que abre
el chat con el mensaje ya escrito.

**Corregir errores:** *Editar* cambia los datos, *Reabrir* borra la respuesta
para que el invitado conteste de nuevo, *Archivar* desactiva el link sin
perder nada. Nada se borra de verdad; lo archivado se restaura.

## Decisiones que conviene conocer

**Una fila por respuesta, no una por invitado.** Si alguien confirma y luego
cancela, quedan las dos y `/admin/bitacora` lo muestra. La respuesta vigente
es la más reciente.

**No puedes bajar los lugares por debajo de lo ya confirmado.** Si una familia
confirmó 4, el sistema no te deja dejarlos en 2. Te obliga a hablar con ellos.

**Los campos opcionales ya existen como columnas.** Prender un interruptor en
`/admin/ajustes` no requiere migración ni deploy.

**El diseño arranca en 360 px.** Los botones miden 44 px de alto y los campos
usan 16 px de tipografía, que es el umbral bajo el cual iOS hace zoom al
enfocar un input. Las variantes `sm:` y `lg:` solo agrandan.

## Seguridad

- RLS activo **sin policies**: la anon key no lee ni escribe nada, ni siquiera
  la tabla de usuarios. Todo pasa por el servidor con la `service_role` key.
- Contraseñas con `scrypt` y sal por usuario. Mínimo 10 caracteres con letras
  y números.
- Sesión en cookie `httpOnly` firmada con HMAC. El usuario se relee de la base
  en cada request, así que desactivar una cuenta la corta de inmediato.
- Cada server action revalida sesión y rol por su cuenta. El `layout` que
  redirige es conveniencia, no la defensa.
- Retardo fijo de 600 ms por intento de login, exista o no el usuario.
- El token del invitado son 10 caracteres de un alfabeto de 32 (≈10^15
  combinaciones) sin letras que se confundan al dictarlas por teléfono.
- `X-Robots-Tag: noindex` en todo el sitio.

**Lo que no está resuelto:** la lista pública de asistentes. Si la activas en
`/admin/ajustes`, cualquiera que llegue al sitio ve quién asiste junto a la
dirección y la hora. Por eso viene apagada y el formato por omisión es
«Sofía M.» en vez del nombre completo.

## Pendiente

- Temática visual. Los siete colores viven en `app/globals.css` como variables
  `--c-*`. Cambiarlos reviste todo el sitio sin tocar componentes.
- Animaciones de la invitación.

## Deploy

Vercel. Cargar las mismas variables del `.env` en el proyecto.
`SUPABASE_SERVICE_ROLE_KEY` y `SESSION_SECRET` **nunca** con prefijo
`NEXT_PUBLIC_`.
