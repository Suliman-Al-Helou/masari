begin;

create or replace view public.admin_course_overview
with (security_invoker = true)
as
select
  course.id,
  course.name,
  course.code,
  course.credits,
  course.category,
  course.semester,
  course.year,
  course.university,
  course.major,
  course.created_at,
  course.deleted_at,

  coalesce(
    round(
      avg(review.rating_overall)
        filter (where review.status = 'published'),
      2
    ),
    0::numeric
  ) as average_rating,

  (
    count(review.id)
      filter (where review.status = 'published')
  )::integer as reviews_count,

  course.description,
  course.teaching_language,
  course.updated_at,

  jsonb_build_object(
    '1', count(review.id) filter (
      where review.status = 'published'
        and round(review.rating_overall) = 1
    ),
    '2', count(review.id) filter (
      where review.status = 'published'
        and round(review.rating_overall) = 2
    ),
    '3', count(review.id) filter (
      where review.status = 'published'
        and round(review.rating_overall) = 3
    ),
    '4', count(review.id) filter (
      where review.status = 'published'
        and round(review.rating_overall) = 4
    ),
    '5', count(review.id) filter (
      where review.status = 'published'
        and round(review.rating_overall) = 5
    )
  ) as rating_distribution,

  round(
    avg(review.rating_difficulty)
      filter (where review.status = 'published'),
    2
  ) as average_difficulty,

  round(
    avg(review.rating_workload)
      filter (where review.status = 'published'),
    2
  ) as average_workload,

  round(
    avg(review.content_quality)
      filter (where review.status = 'published'),
    2
  ) as average_content_quality,

  round(
    (
      100.0
      * count(review.id) filter (
          where review.status = 'published'
            and review.would_retake is true
        )
      / nullif(
          count(review.id) filter (
            where review.status = 'published'
          ),
          0
        )
    ),
    2
  ) as retake_percent

from public.admin_courses as course
left join public.course_reviews as review
  on review.admin_course_id = course.id

group by course.id;

grant select
  on public.admin_course_overview
  to authenticated, service_role;

commit;

notify pgrst, 'reload schema';
