-- Catch-up migration: applies everything from migrations 002–004 that wasn't
-- yet in the live Supabase project. Safe to re-run (uses IF NOT EXISTS / IF EXISTS).

-- ─── artworks: rename hi_res_file_path → hi_res_file_url (matches app code) ──

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='artworks' AND column_name='hi_res_file_path'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='artworks' AND column_name='hi_res_file_url'
  ) THEN
    ALTER TABLE artworks RENAME COLUMN hi_res_file_path TO hi_res_file_url;
  END IF;
END $$;

-- ─── artworks: phase 4 display metadata ───────────────────────────────────────

ALTER TABLE artworks
  ADD COLUMN IF NOT EXISTS blur_color         text,
  ADD COLUMN IF NOT EXISTS gallery_image_urls text[] NOT NULL DEFAULT '{}';

-- ─── artworks: phase 5 per-artwork pricing ────────────────────────────────────

ALTER TABLE artworks
  ADD COLUMN IF NOT EXISTS pricing_mode  text NOT NULL DEFAULT 'default',
  ADD COLUMN IF NOT EXISTS custom_markup numeric,
  ADD COLUMN IF NOT EXISTS fixed_prices  jsonb;

-- Add pricing_mode check constraint if it doesn't already exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name='artworks' AND constraint_name='artworks_pricing_mode_check'
  ) THEN
    ALTER TABLE artworks ADD CONSTRAINT artworks_pricing_mode_check
      CHECK (pricing_mode IN ('default','custom_markup','fixed_prices','custom_band_markups'));
  END IF;
END $$;

-- ─── artworks: three-tier pricing columns ─────────────────────────────────────

ALTER TABLE artworks
  ADD COLUMN IF NOT EXISTS custom_markup_small  numeric,
  ADD COLUMN IF NOT EXISTS custom_markup_medium numeric,
  ADD COLUMN IF NOT EXISTS custom_markup_large  numeric,
  ADD COLUMN IF NOT EXISTS price_overrides      jsonb;

-- ─── settings: three-tier markup + rounding columns ──────────────────────────

ALTER TABLE settings
  ADD COLUMN IF NOT EXISTS markup_small   numeric NOT NULL DEFAULT 3.5,
  ADD COLUMN IF NOT EXISTS markup_medium  numeric NOT NULL DEFAULT 2.8,
  ADD COLUMN IF NOT EXISTS markup_large   numeric NOT NULL DEFAULT 2.2,
  ADD COLUMN IF NOT EXISTS rounding_small  int    NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS rounding_medium int    NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS rounding_large  int    NOT NULL DEFAULT 10;

-- Seed defaults into the singleton row
INSERT INTO settings (id, markup_small, markup_medium, markup_large,
                      rounding_small, rounding_medium, rounding_large)
VALUES (1, 3.5, 2.8, 2.2, 5, 5, 10)
ON CONFLICT (id) DO UPDATE
  SET markup_small    = COALESCE(settings.markup_small,    3.5),
      markup_medium   = COALESCE(settings.markup_medium,   2.8),
      markup_large    = COALESCE(settings.markup_large,    2.2),
      rounding_small  = COALESCE(settings.rounding_small,  5),
      rounding_medium = COALESCE(settings.rounding_medium, 5),
      rounding_large  = COALESCE(settings.rounding_large,  10);

-- ─── orders: discount tracking columns ────────────────────────────────────────

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS discount_id   uuid,
  ADD COLUMN IF NOT EXISTS discount_code text,
  ADD COLUMN IF NOT EXISTS discount_aud  integer NOT NULL DEFAULT 0;

-- ─── discounts table ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS discounts (
  id                    uuid primary key default uuid_generate_v4(),
  name                  text not null,
  code                  text unique,
  discount_type         text not null default 'percentage'
    check (discount_type in ('percentage', 'fixed')),
  value                 numeric not null,
  applies_to            text not null default 'order'
    check (applies_to in ('order', 'specific_artworks', 'material')),
  applies_to_data       jsonb,
  minimum_spend_aud     integer,
  max_total_uses        integer,
  max_uses_per_customer integer not null default 1,
  starts_at             timestamptz,
  ends_at               timestamptz,
  is_active             boolean not null default true,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

ALTER TABLE discounts ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'discounts_updated_at'
  ) THEN
    CREATE TRIGGER discounts_updated_at
      BEFORE UPDATE ON discounts
      FOR EACH ROW EXECUTE PROCEDURE update_updated_at();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='discounts' AND policyname='Admins can manage discounts'
  ) THEN
    CREATE POLICY "Admins can manage discounts" ON discounts FOR ALL
      USING (is_admin()) WITH CHECK (is_admin());
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='discounts' AND policyname='Public can read active discounts'
  ) THEN
    CREATE POLICY "Public can read active discounts" ON discounts FOR SELECT
      USING (is_active = true);
  END IF;
END $$;

-- ─── discount_redemptions table ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS discount_redemptions (
  id                    uuid primary key default uuid_generate_v4(),
  discount_id           uuid not null references discounts(id) on delete cascade,
  order_id              uuid not null references orders(id) on delete cascade,
  customer_email        text not null,
  amount_discounted_aud integer not null,
  created_at            timestamptz not null default now()
);

ALTER TABLE discount_redemptions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='discount_redemptions' AND policyname='Admins can manage redemptions'
  ) THEN
    CREATE POLICY "Admins can manage redemptions" ON discount_redemptions FOR ALL
      USING (is_admin()) WITH CHECK (is_admin());
  END IF;
END $$;
