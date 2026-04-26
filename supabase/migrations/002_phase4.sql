-- Phase 4: Admin interface schema additions

-- ─── Orders: add timestamp columns for status transitions ────────────────────

alter table orders
  add column if not exists shipped_at     timestamptz,
  add column if not exists delivered_at   timestamptz,
  add column if not exists cancelled_at   timestamptz,
  add column if not exists refunded_at    timestamptz,
  add column if not exists tracking_number text;

-- ─── Artworks: add display metadata columns ───────────────────────────────────

alter table artworks
  add column if not exists aspect_ratio   numeric,        -- width ÷ height
  add column if not exists blur_color     text,           -- dominant hue hex
  add column if not exists gallery_image_urls text[] not null default '{}';

-- ─── Settings (singleton row — id is always 1) ───────────────────────────────

create table if not exists settings (
  id                 integer primary key default 1 check (id = 1),
  markup_multiplier  numeric not null default 2.2,
  admin_email        text not null default '',
  printer_email      text not null default 'southernbuoy@gmail.com',
  studio_name        text not null default 'Domestic Eclectic',
  contact_email      text not null default '',
  instagram_url      text,
  updated_at         timestamptz not null default now()
);

-- Seed the singleton row if it doesn't exist
insert into settings (id) values (1) on conflict do nothing;

alter table settings enable row level security;

create policy "Admins can manage settings"
  on settings for all
  using (is_admin())
  with check (is_admin());

-- ─── Storage Buckets ──────────────────────────────────────────────────────────
-- Run these in the Supabase dashboard → Storage, or uncomment for CLI use.

-- Public bucket: web images, thumbnails, gallery shots
-- insert into storage.buckets (id, name, public)
--   values ('artwork-public', 'artwork-public', true)
--   on conflict do nothing;

-- Private bucket: high-resolution TIFF files sent to printer
-- insert into storage.buckets (id, name, public)
--   values ('artwork-hires', 'artwork-hires', false)
--   on conflict do nothing;

-- Storage RLS: allow admins to upload to public bucket
-- create policy "Admins can upload to artwork-public"
--   on storage.objects for insert to authenticated
--   with check (bucket_id = 'artwork-public' and is_admin());
--
-- create policy "Public can read artwork-public"
--   on storage.objects for select
--   using (bucket_id = 'artwork-public');
--
-- create policy "Admins can manage artwork-hires"
--   on storage.objects for all to authenticated
--   using (bucket_id = 'artwork-hires' and is_admin())
--   with check (bucket_id = 'artwork-hires' and is_admin());
