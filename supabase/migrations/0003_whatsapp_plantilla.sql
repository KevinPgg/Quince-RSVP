-- ============================================================
--  Plantilla del mensaje que se manda por WhatsApp al compartir
--  una invitación.
--
--  Se guarda como texto con marcadores entre llaves. La
--  sustitución ocurre en el cliente (lib/whatsapp.ts), no aquí:
--  el mensaje depende del invitado y del origen del sitio, y
--  ninguno de los dos se conoce desde SQL.
--
--  Nulo = usar la plantilla por omisión del código. Así, si
--  algún día se cambia el texto sugerido, quien nunca lo editó
--  recibe el nuevo sin tener que tocar nada.
-- ============================================================
alter table public.evento
  add column if not exists whatsapp_plantilla text;
