-- Newsletter subscribers: ongoing Studio Notes signups from the site footer.
-- Separate from launch_signups (which was pre-launch only).

create table public.newsletter_subscribers (
  id         uuid primary key default uuid_generate_v4(),
  email      text unique not null,
  source     text,
  created_at timestamptz not null default now()
);

alter table public.newsletter_subscribers enable row level security;

create policy "Anyone can subscribe to newsletter"
  on public.newsletter_subscribers
  for insert
  with check (true);

create policy "Admins can view newsletter subscribers"
  on public.newsletter_subscribers
  for select
  using (public.is_admin());
