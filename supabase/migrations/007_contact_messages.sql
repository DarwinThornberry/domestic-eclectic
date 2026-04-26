-- Contact messages: stores submissions from the public /contact form.

create table public.contact_messages (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null,
  email      text not null,
  message    text not null,
  is_read    boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

create policy "Anyone can submit a contact message"
  on public.contact_messages
  for insert
  with check (true);

create policy "Admins can view contact messages"
  on public.contact_messages
  for select
  using (public.is_admin());

create policy "Admins can update contact messages"
  on public.contact_messages
  for update
  using (public.is_admin())
  with check (public.is_admin());
