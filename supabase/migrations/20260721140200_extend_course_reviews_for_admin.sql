begin;

alter table public.course_reviews
  add column if not exists admin_course_id uuid,
  add column if not exists content_quality integer,
  add column if not exists status text,
  add column if not exists moderated_by uuid,
  add column if not exists moderated_at timestamptz;

-- Existing reviews were visible before moderation existed.
update public.course_reviews
set status = 'published'
where status is null;

alter table public.course_reviews
  alter column status set default 'published',
  alter column status set not null;

-- Link old reviews only when code + university identifies one course.
with unique_course_pairs as (
  select
    lower(trim(code)) as code_key,
    lower(trim(university)) as university_key
  from public.admin_courses
  group by
    lower(trim(code)),
    lower(trim(university))
  having count(*) = 1
),
course_map as (
  select
    course.id,
    lower(trim(course.code)) as code_key,
    lower(trim(course.university)) as university_key
  from public.admin_courses as course
  inner join unique_course_pairs as unique_pair
    on unique_pair.code_key = lower(trim(course.code))
   and unique_pair.university_key = lower(trim(course.university))
)
update public.course_reviews as review
set admin_course_id = course.id
from course_map as course
where review.admin_course_id is null
  and lower(trim(review.course_code)) = course.code_key
  and lower(trim(review.university)) = course.university_key;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'course_reviews_admin_course_id_fkey'
  ) then
    alter table public.course_reviews
      add constraint course_reviews_admin_course_id_fkey
      foreign key (admin_course_id)
      references public.admin_courses(id)
      on delete set null;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'course_reviews_moderated_by_fkey'
  ) then
    alter table public.course_reviews
      add constraint course_reviews_moderated_by_fkey
      foreign key (moderated_by)
      references public.profiles(id)
      on delete set null;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'course_reviews_content_quality_check'
  ) then
    alter table public.course_reviews
      add constraint course_reviews_content_quality_check
      check (
        content_quality is null
        or content_quality between 1 and 5
      );
  end if;
end
$$;

create index if not exists course_reviews_admin_course_id_idx
  on public.course_reviews(admin_course_id);

create index if not exists course_reviews_admin_course_status_idx
  on public.course_reviews(admin_course_id, status);

create index if not exists course_reviews_moderated_by_idx
  on public.course_reviews(moderated_by);

commit;
