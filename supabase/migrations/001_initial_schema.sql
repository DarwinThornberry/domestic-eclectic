-- Domestic Eclectic — Initial Database Schema
-- Run this in your Supabase SQL editor or via `supabase db push`

-- ─── Extensions ──────────────────────────────────────────────────────────────

create extension if not exists "uuid-ossp";

-- ─── Artworks ────────────────────────────────────────────────────────────────

create table artworks (
  id              uuid primary key default uuid_generate_v4(),
  slug            text unique not null,
  title           text not null,
  year            integer not null,
  tagline         text,
  description     text,
  original_dims   text,                      -- e.g. "760 × 1000 mm"
  hi_res_file_url text,                      -- private Supabase Storage URL (TIFF sent to printer)
  thumbnail_url   text,                      -- public-facing image URL
  gallery_images  text[] not null default '{}',
  is_published    boolean not null default false,
  sort_order      integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger artworks_updated_at
  before update on artworks
  for each row execute procedure update_updated_at();

-- ─── Orders ──────────────────────────────────────────────────────────────────

create table orders (
  id                    uuid primary key default uuid_generate_v4(),
  order_number          text unique not null,          -- e.g. "DE-2026-0001"
  stripe_session_id     text,
  stripe_payment_intent text,
  status                text not null default 'pending'
    check (status in ('pending','paid','sent_to_printer','shipped','delivered','cancelled','refunded')),
  customer_email        text not null,
  customer_name         text not null,
  shipping_address      jsonb not null,
  subtotal_aud          integer not null,              -- cents
  shipping_aud          integer not null,
  total_aud             integer not null,
  notes                 text,
  sent_to_printer_at    timestamptz,
  created_at            timestamptz not null default now()
);

-- ─── Order Items ─────────────────────────────────────────────────────────────

create table order_items (
  id                      uuid primary key default uuid_generate_v4(),
  order_id                uuid not null references orders(id) on delete cascade,
  artwork_id              uuid not null references artworks(id),
  artwork_title_snapshot  text not null,               -- preserved at time of order
  material                text not null
    check (material in ('cotton_rag_smooth','cotton_rag_textured','canvas_satin','canvas_lustre')),
  size                    text not null,               -- e.g. "600x800"
  framing                 text not null
    check (framing in ('unframed','standard_flooded_gum','standard_american_ash','premium_white','premium_mahogany','premium_walnut','premium_black')),
  quantity                integer not null default 1,
  unit_price_aud          integer not null,            -- cents
  line_total_aud          integer not null             -- cents
);

-- ─── Admins ──────────────────────────────────────────────────────────────────

create table admins (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text not null,
  is_active  boolean not null default true
);

-- ─── Row Level Security ───────────────────────────────────────────────────────

alter table artworks    enable row level security;
alter table orders      enable row level security;
alter table order_items enable row level security;
alter table admins      enable row level security;

-- Helper: is the current user a listed admin?
create or replace function is_admin()
returns boolean language sql security definer as $$
  select exists (
    select 1 from admins
    where id = auth.uid() and is_active = true
  );
$$;

-- Artworks: anyone can read published artworks; admins have full access
create policy "Public can read published artworks"
  on artworks for select
  using (is_published = true);

create policy "Admins can do anything with artworks"
  on artworks for all
  using (is_admin())
  with check (is_admin());

-- Orders: admin only
create policy "Admins can manage orders"
  on orders for all
  using (is_admin())
  with check (is_admin());

create policy "Admins can manage order items"
  on order_items for all
  using (is_admin())
  with check (is_admin());

-- Admins table: admin only
create policy "Admins can read admins table"
  on admins for select
  using (is_admin());

-- ─── Storage Buckets ─────────────────────────────────────────────────────────
-- Run these separately in the Supabase dashboard Storage section,
-- or uncomment and run if using supabase CLI.

-- Public bucket for thumbnails and gallery images
-- insert into storage.buckets (id, name, public) values ('artwork-public', 'artwork-public', true);

-- Private bucket for hi-res files sent to printer
-- insert into storage.buckets (id, name, public) values ('artwork-hires', 'artwork-hires', false);

-- ─── Sequence for order numbers ──────────────────────────────────────────────

create sequence order_number_seq start 1;

create or replace function generate_order_number()
returns text language plpgsql as $$
declare
  seq_val integer;
  year_part text;
begin
  seq_val := nextval('order_number_seq');
  year_part := extract(year from now())::text;
  return 'DE-' || year_part || '-' || lpad(seq_val::text, 4, '0');
end;
$$;
