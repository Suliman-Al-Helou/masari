begin;

create extension if not exists pgcrypto;

-- Add synchronization metadata to the existing connection.
alter table public.google_classroom_connections
  add column if not exists last_sync_started_at timestamptz,
  add column if not exists last_synced_at timestamptz,
  add column if not exists last_sync_status text,
  add column if not exists last_sync_error text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname =
      'google_classroom_connections_last_sync_status_check'
      and conrelid =
        'public.google_classroom_connections'::regclass
  ) then
    alter table public.google_classroom_connections
      add constraint
        google_classroom_connections_last_sync_status_check
      check (
        last_sync_status is null
        or last_sync_status in (
          'running',
          'success',
          'error'
        )
      );
  end if;
end;
$$;

-- Store the student's Google Classroom courses.
create table if not exists public.google_classroom_courses (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null
    references auth.users(id)
    on delete cascade,

  google_course_id text not null,
  name text not null,
  section text,
  course_state text,
  alternate_link text,

  google_creation_time timestamptz,
  google_updated_at timestamptz,

  is_active boolean not null default true,
  last_synced_at timestamptz not null default now(),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint google_classroom_courses_user_course_unique
    unique (user_id, google_course_id)
);

-- Store coursework and assignments.
create table if not exists public.google_classroom_tasks (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null
    references auth.users(id)
    on delete cascade,

  course_id uuid not null
    references public.google_classroom_courses(id)
    on delete cascade,

  google_course_id text not null,
  google_coursework_id text not null,

  title text not null,
  description text,

  work_type text,
  classroom_state text,
  alternate_link text,

  max_points numeric,
  due_at timestamptz,

  google_creation_time timestamptz,
  google_updated_at timestamptz,

  task_status text not null,
  associated_with_developer boolean not null default false,
  direct_submission_eligible boolean not null default false,

  is_active boolean not null default true,
  last_synced_at timestamptz not null default now(),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint google_classroom_tasks_user_work_unique
    unique (
      user_id,
      google_course_id,
      google_coursework_id
    ),

  constraint google_classroom_tasks_status_check
    check (
      task_status in (
        'upcoming',
        'overdue',
        'submitted',
        'returned',
        'no_due_date'
      )
    )
);

-- Store the current student's submission state.
create table if not exists public.google_classroom_submissions (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null
    references auth.users(id)
    on delete cascade,

  task_id uuid not null
    references public.google_classroom_tasks(id)
    on delete cascade,

  google_submission_id text not null,

  submission_state text,
  is_late boolean not null default false,

  assigned_grade numeric,
  draft_grade numeric,

  alternate_link text,

  google_creation_time timestamptz,
  google_updated_at timestamptz,

  is_active boolean not null default true,
  last_synced_at timestamptz not null default now(),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint google_classroom_submissions_user_task_unique
    unique (user_id, task_id),

  constraint google_classroom_submissions_google_id_unique
    unique (user_id, google_submission_id)
);

-- Query indexes.
create index if not exists
  google_classroom_courses_user_active_idx
on public.google_classroom_courses (
  user_id,
  is_active
);

create index if not exists
  google_classroom_tasks_user_status_due_idx
on public.google_classroom_tasks (
  user_id,
  task_status,
  due_at
)
where is_active = true;

create index if not exists
  google_classroom_tasks_course_idx
on public.google_classroom_tasks (
  course_id
);

create index if not exists
  google_classroom_submissions_user_state_idx
on public.google_classroom_submissions (
  user_id,
  submission_state
)
where is_active = true;

-- Keep updated_at synchronized automatically.
create or replace function
  public.set_google_classroom_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists
  set_google_classroom_courses_updated_at
on public.google_classroom_courses;

create trigger set_google_classroom_courses_updated_at
before update on public.google_classroom_courses
for each row
execute function public.set_google_classroom_updated_at();

drop trigger if exists
  set_google_classroom_tasks_updated_at
on public.google_classroom_tasks;

create trigger set_google_classroom_tasks_updated_at
before update on public.google_classroom_tasks
for each row
execute function public.set_google_classroom_updated_at();

drop trigger if exists
  set_google_classroom_submissions_updated_at
on public.google_classroom_submissions;

create trigger set_google_classroom_submissions_updated_at
before update on public.google_classroom_submissions
for each row
execute function public.set_google_classroom_updated_at();

-- Protect all synchronized data with RLS.
alter table public.google_classroom_courses
  enable row level security;

alter table public.google_classroom_tasks
  enable row level security;

alter table public.google_classroom_submissions
  enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'google_classroom_courses'
      and policyname =
        'Users can read own Classroom courses'
  ) then
    create policy
      "Users can read own Classroom courses"
    on public.google_classroom_courses
    for select
    to authenticated
    using (
      (select auth.uid()) = user_id
    );
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'google_classroom_tasks'
      and policyname =
        'Users can read own Classroom tasks'
  ) then
    create policy
      "Users can read own Classroom tasks"
    on public.google_classroom_tasks
    for select
    to authenticated
    using (
      (select auth.uid()) = user_id
    );
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename =
        'google_classroom_submissions'
      and policyname =
        'Users can read own Classroom submissions'
  ) then
    create policy
      "Users can read own Classroom submissions"
    on public.google_classroom_submissions
    for select
    to authenticated
    using (
      (select auth.uid()) = user_id
    );
  end if;
end;
$$;

-- The browser can only read its own synchronized records.
revoke all
on public.google_classroom_courses
from anon;

revoke all
on public.google_classroom_tasks
from anon;

revoke all
on public.google_classroom_submissions
from anon;

revoke insert, update, delete
on public.google_classroom_courses
from authenticated;

revoke insert, update, delete
on public.google_classroom_tasks
from authenticated;

revoke insert, update, delete
on public.google_classroom_submissions
from authenticated;

grant select
on public.google_classroom_courses
to authenticated;

grant select
on public.google_classroom_tasks
to authenticated;

grant select
on public.google_classroom_submissions
to authenticated;

grant all
on public.google_classroom_courses
to service_role;

grant all
on public.google_classroom_tasks
to service_role;

grant all
on public.google_classroom_submissions
to service_role;

commit;