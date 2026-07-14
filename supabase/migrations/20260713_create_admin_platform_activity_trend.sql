-- Path: supabase/migrations/20260713_create_admin_platform_activity_trend.sql

-- Returns daily platform activity for the current and previous periods
create or replace function public.get_admin_platform_activity_trend(
  p_metric text,
  p_period integer
)
returns table (
  current_day date,
  previous_day date,
  current_count bigint,
  previous_count bigint
)
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Validate the requested metric
  if p_metric not in (
    'all',
    'students',
    'courses',
    'tasks',
    'notes',
    'messages'
  ) then
    raise exception 'Invalid activity metric';
  end if;

  -- Validate the requested period
  if p_period not in (7, 30, 90) then
    raise exception 'Invalid activity period';
  end if;

  return query
  with activity_events as (
    -- Student registration events
    select profiles.created_at::date as activity_day
    from public.profiles
    where p_metric in ('all', 'students')
      and profiles.role = 'student'
      and profiles.deleted_at is null

    union all

    -- Course creation events
    select admin_courses.created_at::date
    from public.admin_courses
    where p_metric in ('all', 'courses')

    union all

    -- Task creation events
    select tasks.created_at::date
    from public.tasks
    where p_metric in ('all', 'tasks')

    union all

    -- Note creation events
    select notes.created_date::date
    from public.notes
    where p_metric in ('all', 'notes')
      and notes.created_date is not null

    union all

    -- Message creation events
    select messages.created_at::date
    from public.messages
    where p_metric in ('all', 'messages')
  ),
  daily_counts as (
    -- Groups activity events by day
    select
      activity_day,
      count(*)::bigint as activity_count
    from activity_events
    where activity_day >= current_date - ((p_period * 2) - 1)
      and activity_day <= current_date
    group by activity_day
  ),
  chart_days as (
    -- Generates every chart day including days with no activity
    select
      current_date - (p_period - 1 - day_index)::integer as current_day,
      current_date - (p_period * 2 - 1 - day_index)::integer as previous_day
    from generate_series(0, p_period - 1) as day_index
  )
  select
    chart_days.current_day,
    chart_days.previous_day,
    coalesce(current_activity.activity_count, 0)::bigint as current_count,
    coalesce(previous_activity.activity_count, 0)::bigint as previous_count
  from chart_days
  left join daily_counts as current_activity
    on current_activity.activity_day = chart_days.current_day
  left join daily_counts as previous_activity
    on previous_activity.activity_day = chart_days.previous_day
  order by chart_days.current_day;
end;
$$;

-- Prevents direct access to the database function
revoke all on function public.get_admin_platform_activity_trend(text, integer)
from public;

-- Allows only the server service role to execute the function
grant execute on function public.get_admin_platform_activity_trend(text, integer)
to service_role;