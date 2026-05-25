-- Add customer phone number collected at Stripe checkout
-- Required by Southern Buoy for delivery/courier contact
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_phone TEXT NULL;
