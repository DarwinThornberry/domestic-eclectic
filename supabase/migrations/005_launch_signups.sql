create table public.launch_signups (
  id         uuid primary key default uuid_generate_v4(),
  email      text unique not null,
  source     text,
  created_at timestamptz default now()
);

alter table public.launch_signups enable row level security;

create policy "Anyone can sign up"
  on public.launch_signups
  for insert
  with check (true);

create policy "Admins can view signups"
  on public.launch_signups
  for select
  using (public.is_admin());
