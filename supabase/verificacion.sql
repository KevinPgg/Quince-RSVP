-- ===========================================================
--  VERIFICACIÓN — correr DESPUÉS de 0001_init.sql
--  Cada bloque debe devolver lo que dice el comentario.
--  Si alguno falla, la migración no quedó completa.
-- ===========================================================

-- 1) ¿Existen las 5 tablas y la vista?
--    Esperado: 5 renglones BASE TABLE + 1 VIEW
select table_name, table_type
from information_schema.tables
where table_schema = 'public'
order by table_type, table_name;

-- 2) ¿RLS activo en todas? Esperado: rowsecurity = true en las 5
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
order by tablename;

-- 3) ¿SIN policies? Esperado: 0 renglones.
--    Cualquier policy aquí significa que la anon key puede tocar datos.
select tablename, policyname, cmd
from pg_policies
where schemaname = 'public';

-- 4) ¿anon y authenticated sin permisos? Esperado: 0 renglones.
--    Este es el chequeo que de verdad importa.
select grantee, table_name, privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and grantee in ('anon', 'authenticated');

-- 5) ¿Existe el renglón único de evento? Esperado: exactamente 1
select count(*) as renglones_evento from public.evento;

-- 6) ¿El candado del singleton funciona?
--    Esperado: ERROR de llave duplicada. Si inserta, el candado falla.
-- insert into public.evento (singleton) values (true);

-- 7) ¿Hay usuarios? Esperado: 0 la primera vez.
--    Si es 0, /acceso te deja crear el primer dueño.
--    Si es >0, esa pantalla ya está cerrada.
select count(*) as usuarios, count(*) filter (where rol = 'dueno' and activo) as duenos
from public.usuarios;

-- 8) ¿La vista responde? Esperado: 0 renglones, sin error.
select * from public.vista_asistencia;

-- 9) ¿Los CHECK están puestos? Esperado: los de rol, tipo, pases y formato.
select conrelid::regclass as tabla, conname, pg_get_constraintdef(oid) as definicion
from pg_constraint
where connamespace = 'public'::regnamespace and contype = 'c'
order by 1, 2;

-- 10) ¿Los índices? Esperado: 5 índices propios además de las llaves.
select tablename, indexname
from pg_indexes
where schemaname = 'public'
order by tablename, indexname;
