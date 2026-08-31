-- ===========================================================
--  Portal RSVP quinceañera — esquema completo
--  Correr TAL CUAL en el SQL Editor de un proyecto NUEVO.
--  Idempotente: se puede volver a ejecutar sin romper nada.
-- ===========================================================

create extension if not exists pgcrypto;

-- -----------------------------------------------------------
--  usuarios — quienes administran el portal
--
--  rol 'dueno'  : configura el evento, crea usuarios, todo.
--  rol 'editor' : solo crea y edita invitaciones.
--
--  password_hash es scrypt en formato  scrypt$N$r$p$salt$hash
--  Se calcula en Node, nunca en SQL.
-- -----------------------------------------------------------
create table if not exists public.usuarios (
  id             uuid primary key default gen_random_uuid(),
  usuario        text not null unique,
  nombre         text not null,
  password_hash  text not null,
  rol            text not null default 'editor' check (rol in ('dueno', 'editor')),
  activo         boolean not null default true,
  creado_en      timestamptz not null default now(),
  ultimo_acceso  timestamptz
);

create index if not exists usuarios_activos_idx on public.usuarios (activo);

-- -----------------------------------------------------------
--  evento — UN SOLO RENGLÓN. La plantilla que comparten todas
--  las invitaciones: lugar, fecha, hora, textos y ajustes.
--
--  La columna 'singleton' con unique garantiza que nunca haya
--  dos renglones, sin importar quién ejecute qué.
-- -----------------------------------------------------------
create table if not exists public.evento (
  id        uuid primary key default gen_random_uuid(),
  singleton boolean not null default true unique check (singleton),

  -- Identidad
  nombre                text not null default 'Angeles',
  nombre_completo       text,
  frase                 text default 'Hay momentos en la vida que son especiales por sí solos. Compartirlos con las personas que quieres los convierte en inolvidables.',

  -- Cuándo
  fecha                 timestamptz,
  zona_horaria          text not null default 'America/Guayaquil',
  limite_rsvp           timestamptz,

  -- Dónde. Un solo lugar; la hora sale de 'fecha'.
  lugar_nombre          text,
  lugar_direccion       text,
  lugar_maps            text,

  -- Contenido
  itinerario            jsonb not null default '[]'::jsonb,  -- [{"hora":"19:00","titulo":"Vals"}]
  regalos               jsonb not null default '[]'::jsonb,  -- [{"titulo":"...","detalle":"..."}]
  dress_code_titulo     text,
  dress_code_detalle    text,
  home_titulo           text default 'La fiesta',
  home_descripcion      text,

  -- Contacto
  contacto_nombre       text,
  contacto_whatsapp     text,   -- solo dígitos, formato E.164 sin '+'

  -- Lista pública de asistentes
  lista_publica_activa  boolean not null default false,
  lista_publica_formato text not null default 'nombre_pila'
                        check (lista_publica_formato in ('nombre_pila', 'completo')),

  -- Interruptores de secciones y campos del formulario
  flags                 jsonb not null default '{}'::jsonb,

  actualizado_en        timestamptz not null default now()
);

-- Renglón inicial con marcadores. El panel lo edita después.
insert into public.evento (singleton)
values (true)
on conflict (singleton) do nothing;

-- -----------------------------------------------------------
--  invitados = INVITACIONES. Un renglón por link enviado.
--
--  tipo 'individual' : un titular + N acompañantes.
--                      pases_asignados = 1 + N
--  tipo 'grupal'     : un solo link para un grupo de N lugares.
--                      No hay titular; el que abre confirma cuántos van.
--
--  En ambos casos el conteo vive en pases_asignados. El tipo
--  cambia la redacción y la validación, no la aritmética.
--
--  eliminado_en: borrado suave. Nunca se borra de verdad.
-- -----------------------------------------------------------
create table if not exists public.invitados (
  id              uuid primary key default gen_random_uuid(),
  token           text not null unique,
  nombre_display  text not null,
  tipo            text not null default 'individual'
                  check (tipo in ('individual', 'grupal')),
  pases_asignados int not null default 1 check (pases_asignados between 1 and 50),
  grupo           text,
  mesa            text,
  telefono        text,
  notas           text,
  creado_por      uuid references public.usuarios(id) on delete set null,
  creado_en       timestamptz not null default now(),
  eliminado_en    timestamptz,
  eliminado_por   uuid references public.usuarios(id) on delete set null
);

create index if not exists invitados_grupo_idx   on public.invitados (grupo);
create index if not exists invitados_activos_idx on public.invitados (eliminado_en)
  where eliminado_en is null;

-- -----------------------------------------------------------
--  rsvp — UNA FILA POR RESPUESTA, no una por invitado.
--  El link nunca expira: cada cambio agrega una fila nueva y
--  la vigente es la más reciente.
-- -----------------------------------------------------------
create table if not exists public.rsvp (
  id                uuid primary key default gen_random_uuid(),
  invitado_id       uuid not null references public.invitados(id) on delete cascade,
  asiste            boolean not null,
  pases_confirmados int not null default 0 check (pases_confirmados >= 0),
  acompanantes      jsonb,
  restricciones     text,
  telefono          text,
  mensaje           text,
  respondido_en     timestamptz not null default now()
);

create index if not exists rsvp_invitado_fecha_idx
  on public.rsvp (invitado_id, respondido_en desc);

-- -----------------------------------------------------------
--  bitacora — quién hizo qué. Sin esto, tener usuarios no sirve.
-- -----------------------------------------------------------
create table if not exists public.bitacora (
  id          uuid primary key default gen_random_uuid(),
  usuario_id  uuid references public.usuarios(id) on delete set null,
  usuario_txt text,          -- copia del nombre por si el usuario se borra
  accion      text not null, -- crear | editar | archivar | restaurar | reabrir | config | usuario
  entidad     text not null, -- invitacion | evento | usuario
  entidad_id  uuid,
  detalle     jsonb,
  creado_en   timestamptz not null default now()
);

create index if not exists bitacora_fecha_idx on public.bitacora (creado_en desc);

-- -----------------------------------------------------------
--  vista_asistencia — última respuesta por invitación activa
-- -----------------------------------------------------------
create or replace view public.vista_asistencia
with (security_invoker = on) as
select
  i.id,
  i.token,
  i.nombre_display,
  i.tipo,
  i.pases_asignados,
  i.grupo,
  i.mesa,
  i.notas,
  i.telefono                       as telefono_lista,
  i.creado_en,
  r.asiste,
  coalesce(r.pases_confirmados, 0) as pases_confirmados,
  r.acompanantes,
  r.restricciones,
  r.telefono                       as telefono_rsvp,
  r.mensaje,
  r.respondido_en,
  case
    when r.id is null then 'pendiente'
    when r.asiste      then 'confirmado'
    else 'no_asiste'
  end as estado
from public.invitados i
left join lateral (
  select * from public.rsvp
  where rsvp.invitado_id = i.id
  order by respondido_en desc
  limit 1
) r on true
where i.eliminado_en is null;

-- -----------------------------------------------------------
--  SEGURIDAD
--  RLS activo y SIN policies a propósito: la anon key no puede
--  leer ni escribir nada, ni siquiera la tabla de usuarios.
--  Toda operación pasa por el servidor con la service_role key.
-- -----------------------------------------------------------
alter table public.usuarios  enable row level security;
alter table public.evento    enable row level security;
alter table public.invitados enable row level security;
alter table public.rsvp      enable row level security;
alter table public.bitacora  enable row level security;

revoke all on public.usuarios         from anon, authenticated;
revoke all on public.evento           from anon, authenticated;
revoke all on public.invitados        from anon, authenticated;
revoke all on public.rsvp             from anon, authenticated;
revoke all on public.bitacora         from anon, authenticated;
revoke all on public.vista_asistencia from anon, authenticated;
