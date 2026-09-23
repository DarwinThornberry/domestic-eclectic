-- Studio profile photo shown on the public About page
ALTER TABLE settings
  ADD COLUMN IF NOT EXISTS about_photo_url text;
