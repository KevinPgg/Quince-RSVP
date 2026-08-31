-- ===========================================================
--  0002 — Un solo lugar y una sola hora. Sin ceremonia.
--  Correr en el SQL Editor DESPUÉS de 0001_init.sql.
--  Idempotente.
--
--  Si estás montando el proyecto desde cero, 0001_init.sql ya
--  incluye estos cambios y este archivo no hace nada.
-- ===========================================================

-- 1) La vista depende de columnas de evento: se recrea al final.
--    (En realidad no las usa, pero dejarlo explícito evita sorpresas.)

-- 2) Fuera la ceremonia.
alter table public.evento
  drop column if exists ceremonia_activa,
  drop column if exists ceremonia_titulo,
  drop column if exists ceremonia_hora,
  drop column if exists ceremonia_lugar,
  drop column if exists ceremonia_direccion,
  drop column if exists ceremonia_maps;

-- 3) "Recepción" pasa a ser "el lugar del evento".
--    La hora ya no vive aquí: sale de evento.fecha, porque todo
--    ocurre a la misma hora.
do $$
begin
  if exists (select 1 from information_schema.columns
             where table_schema='public' and table_name='evento' and column_name='recepcion_lugar') then
    alter table public.evento rename column recepcion_lugar     to lugar_nombre;
  end if;
  if exists (select 1 from information_schema.columns
             where table_schema='public' and table_name='evento' and column_name='recepcion_direccion') then
    alter table public.evento rename column recepcion_direccion to lugar_direccion;
  end if;
  if exists (select 1 from information_schema.columns
             where table_schema='public' and table_name='evento' and column_name='recepcion_maps') then
    alter table public.evento rename column recepcion_maps      to lugar_maps;
  end if;
end $$;

alter table public.evento
  drop column if exists recepcion_titulo,
  drop column if exists recepcion_hora;

-- 4) Zona horaria fija: Ecuador.
alter table public.evento
  alter column zona_horaria set default 'America/Guayaquil';

update public.evento set zona_horaria = 'America/Guayaquil' where singleton;

-- 5) El interruptor de ceremonia ya no existe.
update public.evento
set flags = flags - 'mostrarCeremonia'
where singleton and flags ? 'mostrarCeremonia';
