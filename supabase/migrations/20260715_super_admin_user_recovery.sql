-- Adds the fields required by super-admin user recovery.
alter table public.profiles
  add column if not exists is_super_admin boolean not null default false,
  add column if not exists deleted_at timestamptz,
  add column if not exists deletion_note text;

-- Marks the configured primary administrator.
update public.profiles
set is_super_admin = true,
    role = 'admin'
where id = '50d95764-27f8-43ec-9476-b519638809eb';

-- Keeps disabled-user lookups fast as the table grows.
create index if not exists profiles_deleted_at_idx
  on public.profiles (deleted_at)
  where deleted_at is not null;
