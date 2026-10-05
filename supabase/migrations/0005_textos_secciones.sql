-- ============================================================
--  Textos editables de secciones de la portada / invitación.
--
--  Nulo = usar el texto por omisión del código (lib/evento.ts,
--  TEXTOS_POR_OMISION). Así, borrar el campo en el panel
--  devuelve el texto original en vez de dejar un hueco.
--
--  regalos_titulo  Título de la sección «Mesa de regalos».
--  regalos_texto   Contenido libre de la sección (párrafos).
--                  Convive con la lista evento.regalos.
--  album_titulo    Título del carrusel. Lo que vaya entre
--                  *asteriscos* sale en letra de firma.
-- ============================================================
alter table public.evento
  add column if not exists regalos_titulo text,
  add column if not exists regalos_texto  text,
  add column if not exists album_titulo   text;
