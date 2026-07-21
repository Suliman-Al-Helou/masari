begin;

create table if not exists public.admin_course_prerequisites (
  id uuid primary key default gen_random_uuid(),

  course_id uuid not null
    references public.admin_courses(id)
    on delete cascade,

  prerequisite_course_id uuid not null
    references public.admin_courses(id)
    on delete cascade,

  created_at timestamptz not null default now(),

  constraint admin_course_prerequisites_no_self
    check (course_id <> prerequisite_course_id),

  constraint admin_course_prerequisites_unique
    unique (course_id, prerequisite_course_id)
);

create index if not exists admin_course_prerequisites_course_id_idx
  on public.admin_course_prerequisites(course_id);

create index if not exists admin_course_prerequisites_prerequisite_id_idx
  on public.admin_course_prerequisites(prerequisite_course_id);

grant select, insert, update, delete
  on public.admin_course_prerequisites
  to service_role;

commit;
