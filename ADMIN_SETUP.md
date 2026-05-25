# Admin Setup — Domestic Eclectic

How to create the first admin user and get the studio running.

---

## Step 1 — Add your environment variables

Create a file called `.env.local` in the project root (next to `package.json`) with the following:

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Resend (for emails)
RESEND_API_KEY=re_...
EMAIL_FROM=Domestic Eclectic <studio@yourdomain.com>

# Site
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
ADMIN_EMAIL=your@email.com
PRINTER_EMAIL=crew@southernbuoy.com.au
```

You can find these values in:
- Supabase: your project → Settings → API
- Stripe: dashboard.stripe.com → Developers → API keys
- Resend: resend.com → API Keys

---

## Step 2 — Run the database migrations

1. Go to your Supabase dashboard → **SQL Editor**
2. Open `supabase/migrations/001_initial_schema.sql` and paste the entire contents into the editor. Click **Run**.
3. Open `supabase/migrations/002_phase4.sql` and run that too.

---

## Step 3 — Create the storage buckets

1. In Supabase, go to **Storage** in the left sidebar
2. Click **New bucket**
   - Name: `artwork-public` → tick "Public bucket" → Create
3. Click **New bucket** again
   - Name: `artwork-hires` → leave "Public bucket" OFF (this is private) → Create

---

## Step 4 — Create your admin account

You need to create Lara's account first, then add her to the admins table.

### Option A — Using the Supabase dashboard (recommended)

1. Go to Supabase → **Authentication** → **Users**
2. Click **Invite user** (or **Add user**)
3. Enter Lara's email and a temporary password
4. Click **Create user**
5. Copy the **User UID** (the long ID shown in the user list)
6. Go to **SQL Editor** and run:

```sql
INSERT INTO admins (id, email, is_active)
VALUES (
  'paste-the-uid-here',
  'laras@email.com',
  true
);
```

Lara can then sign in at `/login` and change her password via **Forgot password**.

### Option B — Using the seed script

Run this in your terminal from the project folder:

```bash
node scripts/seed-admin.js your@email.com yourpassword
```

(You'll need to create this script — see below, or use Option A instead.)

---

## Step 5 — Sign in

Go to `https://yoursite.com/login` (or `http://localhost:3000/login` in development).

Enter the email and password. You'll be taken to the studio dashboard.

---

## Adding Lara as an admin (if her account already exists)

If Lara already has a Supabase Auth account but isn't an admin:

1. Go to Supabase → **Authentication** → **Users**
2. Find Lara's account and copy her UID
3. Go to **SQL Editor** and run:

```sql
INSERT INTO admins (id, email, is_active)
VALUES ('her-uid-here', 'lara@email.com', true);
```

---

## Removing admin access

To revoke access without deleting the account:

```sql
UPDATE admins SET is_active = false WHERE email = 'someone@email.com';
```

---

## Where emails go

| Email | Trigger | Recipient |
|---|---|---|
| Order confirmed | Customer pays | Customer |
| New order notification | Customer pays | You (ADMIN_EMAIL) |
| Print order | Click "Send to printer" in admin | Southern Buoy (PRINTER_EMAIL) |
| Shipped | Click "Mark as shipped" in admin | Customer |

---

## Testing locally

For local testing with Stripe webhooks, install the Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the webhook signing secret it prints and add it as `STRIPE_WEBHOOK_SECRET` in `.env.local`.
