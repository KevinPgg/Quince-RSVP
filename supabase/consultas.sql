-- ===========================================================
--  Consultas de apoyo. Pegar en el SQL Editor cuando haga falta.
-- ===========================================================

-- 1) Resumen para el salón: cuántos platos pedir
select
  count(*) filter (where estado = 'confirmado')            as invitaciones_confirmadas,
  count(*) filter (where estado = 'no_asiste')             as invitaciones_declinadas,
  count(*) filter (where estado = 'pendiente')             as sin_responder,
  sum(pases_confirmados)                                   as personas_confirmadas,
  sum(pases_asignados)                                     as personas_invitadas
from public.vista_asistencia;

-- 2) A quién hay que perseguir (pendientes, con teléfono)
select nombre_display, telefono_lista, pases_asignados, grupo
from public.vista_asistencia
where estado = 'pendiente'
order by grupo nulls last, nombre_display;

-- 3) Restricciones alimenticias reportadas
select nombre_display, pases_confirmados, restricciones
from public.vista_asistencia
where restricciones is not null and restricciones <> ''
order by nombre_display;

-- 4) Ocupación por mesa
select coalesce(mesa, 'sin asignar') as mesa,
       sum(pases_confirmados) as personas,
       string_agg(nombre_display, ', ' order by nombre_display) as invitados
from public.vista_asistencia
where estado = 'confirmado'
group by 1
order by 1;

-- 5) Quiénes cambiaron de opinión (más de una respuesta)
select i.nombre_display, count(*) as respuestas,
       string_agg(case when r.asiste then 'sí' else 'no' end,
                  ' → ' order by r.respondido_en) as historial
from public.rsvp r
join public.invitados i on i.id = r.invitado_id
group by i.nombre_display
having count(*) > 1;

-- 6) Lista de links para enviar (invitaciones activas)
select nombre_display,
       pases_asignados - 1 as acompanantes,
       'https://TU-DOMINIO.vercel.app/i/' || token as link
from public.invitados
where eliminado_en is null
order by nombre_display;

-- 7) Papelera: invitaciones archivadas
select nombre_display, eliminado_en
from public.invitados
where eliminado_en is not null
order by eliminado_en desc;
