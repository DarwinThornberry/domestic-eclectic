-- Update Southern Buoy printer email to 2026 contact address
ALTER TABLE settings ALTER COLUMN printer_email SET DEFAULT 'crew@southernbuoy.com.au';
UPDATE settings
  SET printer_email = 'crew@southernbuoy.com.au'
  WHERE id = 1 AND printer_email = 'southernbuoy@gmail.com';
