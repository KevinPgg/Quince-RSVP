-- ===========================================================
--  Portal RSVP quinceañera — esquema completo
--  Correr TAL CUAL en el SQL Editor de un proyecto nuevo.
--  Es idempotente: se puede volver a correr sin romper nada.
-- ===========================================================

create extension if not exists pgcrypto;

-- -----------------------------------------------------------
--  invitados = INVITACIONES. Un renglón por link enviado.
--
--  Modelo: invitación individual + acompañantes.
--    pases_asignados = 1 (el titular) + N acompañantes.
--    El admin decide N al crear la invitación.
--
--  eliminado_en: borrado suave. Nunca se borra de verdad,
--  porque borrar a alguien que ya confirmó es irreversible
--  y siempre pasa a dos semanas del evento.
-- -----------------------------------------------------------
create table if not exists public.invitados (
  id              uuid primary key default gen_random_uuid(),
  token           text not null unique,
  nombre_display  text not null,
  pases_asignados int  not null default 1 check (pases_asignados between 1 and 20),
  grupo           text,
  mesa            text,
  telefono        text,
  notas           text,                    -- solo visible en el panel
  creado_en       timestamptz not null default now(),
  eliminado_en    timestamptz
);

create index if not exists invitados_grupo_idx    on public.invitados (grupo);
create index if not exists invitados_activos_idx  on public.invitados (eliminado_en)
  where eliminado_en is null;

-- -----------------------------------------------------------
--  rsvp = UNA FILA POR RESPUESTA, no una por invitado.
--  Si alguien confirma y luego cancela, quedan las dos filas.
--  La respuesta vigente es la más reciente.
-- -----------------------------------------------------------
create table if not exists public.rsvp (
  id                uuid primary key default gen_random_uuid(),
  invitado_id       uuid not null references public.invitados(id) on delete cascade,
  asiste            boolean not null,
  pases_confirmados int not null default 0 check (pases_confirmados >= 0),
  acompanantes      jsonb,   -- ["Nombre 1","Nombre 2"]
  restricciones     text,
  telefono          text,
  mensaje           text,
  respondido_en     timestamptz not null default now()
);

create index if not exists rsvp_invitado_fecha_idx
  on public.rsvp (invitado_id, respondido_en desc);

-- -----------------------------------------------------------
--  vista_asistencia: última respuesta por invitación activa.
-- -----------------------------------------------------------
create or replace view public.vista_asistencia
with (security_invoker = on) as
select
  i.id,
  i.token,
  i.nombre_display,
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
--  leer ni escribir nada. Toda operación pasa por el servidor
--  usando la service_role key.
-- -----------------------------------------------------------
alter table public.invitados enable row level security;
alter table public.rsvp      enable row level security;

revoke all on public.invitados        from anon, authenticated;
revoke all on public.rsvp             from anon, authenticated;
revoke all on public.vista_asistencia from anon, authenticated;
