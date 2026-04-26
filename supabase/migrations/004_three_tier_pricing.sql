-- Three-tier pricing: Small / Medium / Large size bands
-- Each band has its own markup multiplier and a rounding increment (nearest $N).

-- Settings: add per-band markups and rounding
ALTER TABLE settings
  ADD COLUMN IF NOT EXISTS markup_small  numeric NOT NULL DEFAULT 3.5,
  ADD COLUMN IF NOT EXISTS markup_medium numeric NOT NULL DEFAULT 2.8,
  ADD COLUMN IF NOT EXISTS markup_large  numeric NOT NULL DEFAULT 2.2,
  ADD COLUMN IF NOT EXISTS rounding_small  int NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS rounding_medium int NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS rounding_large  int NOT NULL DEFAULT 10;

-- Artworks: per-band custom markups and a price-overrides map
-- price_overrides is a jsonb map of "material:size:framing" → price_in_cents
-- It is checked before any markup calculation, regardless of pricing_mode.
ALTER TABLE artworks
  ADD COLUMN IF NOT EXISTS custom_markup_small  numeric,
  ADD COLUMN IF NOT EXISTS custom_markup_medium numeric,
  ADD COLUMN IF NOT EXISTS custom_markup_large  numeric,
  ADD COLUMN IF NOT EXISTS price_overrides jsonb;

-- Ensure the settings row exists (upsert defaults for the three-tier fields)
INSERT INTO settings (id, markup_small, markup_medium, markup_large,
                      rounding_small, rounding_medium, rounding_large)
VALUES (1, 3.5, 2.8, 2.2, 5, 5, 10)
ON CONFLICT (id) DO UPDATE
  SET markup_small   = COALESCE(settings.markup_small,   3.5),
      markup_medium  = COALESCE(settings.markup_medium,  2.8),
      markup_large   = COALESCE(settings.markup_large,   2.2),
      rounding_small  = COALESCE(settings.rounding_small,  5),
      rounding_medium = COALESCE(settings.rounding_medium, 5),
      rounding_large  = COALESCE(settings.rounding_large,  10);
