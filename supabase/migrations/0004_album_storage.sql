-- ============================================================
--  Álbum y retrato gestionados desde el panel (Supabase Storage).
--
--  Idempotente. Correr en el SQL Editor del proyecto.
--
--  Las fotos viven en el bucket público `fotos`. Público porque
--  la página principal ya es pública: cualquiera con la dirección
--  ve el álbum. Escribir solo lo hace el servidor con la
--  service_role; anon y authenticated no tienen permisos aquí.
-- ============================================================

create table if not exists public.fotos (
  id         uuid primary key default gen_random_uuid(),
  ruta       text not null unique,          -- ruta dentro del bucket: album/<id>.webp
  alt        text not null default '',
  pie        text,                          -- caption opcional; nulo = sin pie
  orden      integer not null default 0,
  espejo     smallint check (espejo between 1 and 5),  -- nulo = automático por posición
  visible    boolean not null default true,
  ancho      integer,
  alto       integer,
  creado_en  timestamptz not null default now()
);

create index if not exists fotos_orden_idx on public.fotos (orden);

alter table public.fotos enable row level security;
revoke all on public.fotos from anon, authenticated;

-- Retrato principal y paleta del álbum.
--   retrato_ruta  nulo = /recursos/cumpleanera/retrato.jpg del repo.
--   album_colores nulo = paleta por omisión del código (config/galeria.ts).
alter table public.evento
  add column if not exists retrato_ruta  text,
  add column if not exists album_colores jsonb;

-- Bucket. 5 MB de tope: el navegador ya entrega WebP de ~200 KB.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('fotos', 'fotos', true, 5242880, array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;
