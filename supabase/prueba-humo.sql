-- ===========================================================
--  PRUEBA DE HUMO — datos falsos para ver el portal con contenido.
--  Corre esto SOLO si quieres probar antes de capturar invitados
--  de verdad. Al final está el bloque para borrarlo todo.
-- ===========================================================

-- Evento mínimo para que el Home y la invitación se vean llenos.
update public.evento set
  nombre              = 'Angeles',
  nombre_completo     = 'María de los Angeles Palacios',
  fecha               = now() + interval '90 days',
  limite_rsvp         = now() + interval '75 days',
  zona_horaria        = 'America/Guayaquil',
  lugar_nombre        = 'Salón de prueba',
  lugar_direccion     = 'Av. Francisco de Orellana 123, Guayaquil',
  dress_code_titulo   = 'Formal',
  dress_code_detalle  = 'Se reserva el color rosa para la quinceañera.',
  home_titulo         = 'La fiesta',
  home_descripcion    = 'Texto de prueba para ver cómo se acomoda la portada.',
  itinerario          = '[{"hora":"19:00","titulo":"Recepción"},
                          {"hora":"19:45","titulo":"Vals"},
                          {"hora":"20:30","titulo":"Cena"},
                          {"hora":"21:30","titulo":"Baile"}]'::jsonb
where singleton;

-- Cuatro invitaciones que cubren los casos que importan.
insert into public.invitados (token, nombre_display, tipo, pases_asignados, grupo, mesa) values
  ('prueba0001', 'Sofía Martínez Ruiz',      'individual', 1, 'amigos',   '5'),
  ('prueba0002', 'Luis Hernández',           'individual', 3, 'amigos',   '5'),
  ('prueba0003', 'Familia López Hernández',  'grupal',     6, 'familia',  '1'),
  ('prueba0004', 'Padrinos Juan y Ana',      'grupal',     2, 'padrinos', '2')
on conflict (token) do nothing;

-- Respuestas: una confirmada, una declinada, dos pendientes.
insert into public.rsvp (invitado_id, asiste, pases_confirmados)
select id, true, 3 from public.invitados where token = 'prueba0002';

insert into public.rsvp (invitado_id, asiste, pases_confirmados)
select id, false, 0 from public.invitados where token = 'prueba0003';

-- Un cambio de opinión, para ver que el historial se conserva.
insert into public.rsvp (invitado_id, asiste, pases_confirmados)
select id, true, 4 from public.invitados where token = 'prueba0003';

-- ---- Qué debe verse ----
--  /i/prueba0001  -> individual sin acompañantes, sin responder
--  /i/prueba0002  -> individual con 2 acompañantes, ya confirmó 3
--  /i/prueba0003  -> grupal de 6, confirmó 4 tras haber declinado
--  /i/prueba0004  -> grupal de 2, sin responder
--  /invitacion/asistencia -> 7 personas confirmadas de 12 invitadas

-- ---- Resumen esperado ----
select
  count(*)                                      as invitaciones,
  count(*) filter (where estado = 'confirmado') as confirmadas,
  count(*) filter (where estado = 'no_asiste')  as declinadas,
  count(*) filter (where estado = 'pendiente')  as pendientes,
  sum(pases_confirmados)                        as personas_confirmadas,
  sum(pases_asignados)                          as personas_invitadas
from public.vista_asistencia;

-- ===========================================================
--  LIMPIEZA — borra solo los datos de prueba
-- ===========================================================
-- delete from public.invitados where token like 'prueba%';
