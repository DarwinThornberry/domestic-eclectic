-- Per-artwork size restriction (previously existed only as an untracked column)
-- null/empty = every catalogue size is offered; a set list restricts the storefront to those keys.
ALTER TABLE artworks
  ADD COLUMN IF NOT EXISTS allowed_sizes text[];
