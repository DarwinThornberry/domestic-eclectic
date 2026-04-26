-- Phase 5: Pricing control, discounts, and analytics

-- ─── Order activity (referenced by webhook — create if not exists) ────────────

create table if not exists order_activity (
  id         uuid primary key default uuid_generate_v4(),
  order_id   uuid not null references orders(id) on delete cascade,
  activity   text not null,
  created_at timestamptz not null default now()
);

alter table order_activity enable row level security;

create policy "Admins can manage order activity"
  on order_activity for all
  using (is_admin())
  with check (is_admin());

-- ─── Artworks: per-artwork pricing columns ───────────────────────────────────

alter table artworks
  add column if not exists pricing_mode   text not null default 'default'
    check (pricing_mode in ('default', 'custom_markup', 'fixed_prices')),
  add column if not exists custom_markup  numeric,
  add column if not exists fixed_prices   jsonb;
-- fixed_prices keys: "material:size:framing" → price in AUD cents (integer)

-- ─── Orders: discount tracking columns ───────────────────────────────────────

alter table orders
  add column if not exists discount_id    uuid,
  add column if not exists discount_code  text,
  add column if not exists discount_aud   integer not null default 0;

-- ─── Discounts ────────────────────────────────────────────────────────────────

create table if not exists discounts (
  id                   uuid primary key default uuid_generate_v4(),
  name                 text not null,
  code                 text unique,              -- null = automatic discount
  discount_type        text not null default 'percentage'
    check (discount_type in ('percentage', 'fixed')),
  value                numeric not null,         -- percentage 0–100, or cents for fixed
  applies_to           text not null default 'order'
    check (applies_to in ('order', 'specific_artworks', 'material')),
  applies_to_data      jsonb,                    -- artwork UUID array, or material string
  minimum_spend_aud    integer,                  -- in cents; null = no minimum
  max_total_uses       integer,                  -- null = unlimited
  max_uses_per_customer integer not null default 1,
  starts_at            timestamptz,
  ends_at              timestamptz,
  is_active            boolean not null default true,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

alter table discounts enable row level security;

create trigger discounts_updated_at
  before update on discounts
  for each row execute procedure update_updated_at();

-- Admins can do everything
create policy "Admins can manage discounts"
  on discounts for all
  using (is_admin())
  with check (is_admin());

-- Anonymous users can read active discounts (needed to validate codes at checkout)
create policy "Public can read active discounts"
  on discounts for select
  using (is_active = true);

-- ─── Discount redemptions ─────────────────────────────────────────────────────

create table if not exists discount_redemptions (
  id                    uuid primary key default uuid_generate_v4(),
  discount_id           uuid not null references discounts(id) on delete cascade,
  order_id              uuid not null references orders(id) on delete cascade,
  customer_email        text not null,
  amount_discounted_aud integer not null,        -- in cents
  created_at            timestamptz not null default now()
);

alter table discount_redemptions enable row level security;

create policy "Admins can manage redemptions"
  on discount_redemptions for all
  using (is_admin())
  with check (is_admin());
