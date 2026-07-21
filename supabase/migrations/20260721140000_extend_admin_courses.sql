begin;

alter table public.admin_courses
  add column if not exists deleted_at timestamptz,
  add column if not exists description text,
  add column if not exists teaching_language text not null default 'العربية',
  add column if not exists updated_at timestamptz not null default now();

create index if not exists admin_courses_deleted_at_idx
  on public.admin_courses (deleted_at);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists admin_courses_set_updated_at
  on public.admin_courses;

create trigger admin_courses_set_updated_at
before update on public.admin_courses
for each row
execute function public.set_updated_at();

commit;
