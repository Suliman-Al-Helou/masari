create or replace function public.get_admin_dashboard_stats()
returns table (
  metric text,
  value bigint,
  current_count bigint,
  previous_count bigint,
  trend_data bigint[]
)
language sql
security definer
set search_path = public
set timezone = 'UTC'
as $$
  with bounds as (
    select
      current_date as today,
      current_date - 6 as current_start,
      current_date - 13 as previous_start,
      current_date + 1 as tomorrow
  ),

  -- الأيام السبعة الحالية المستخدمة في رسم Sparkline
  days as (
    select generate_series(
      (select current_start from bounds),
      (select today from bounds),
      interval '1 day'
    )::date as day
  ),

  -- جميع الأحداث المنشأة خلال آخر 14 يومًا
  events as (
    select
      'students'::text as metric,
      created_at::date as day
    from profiles, bounds
    where role = 'student'
      and deleted_at is null
      and created_at >= previous_start
      and created_at < tomorrow

    union all

    select
      'courses',
      created_at::date
    from courses, bounds
    where created_at >= previous_start
      and created_at < tomorrow

    union all

    select
      'tasks',
      created_at::date
    from tasks, bounds
    where created_at >= previous_start
      and created_at < tomorrow

    union all

    select
      'notes',
      created_date
    from notes, bounds
    where created_date is not null
      and created_date >= previous_start
      and created_date < tomorrow

    union all

    select
      'messages',
      created_at::date
    from messages, bounds
    where created_at >= previous_start
      and created_at < tomorrow
  ),

  -- عدد السجلات لكل يوم ولكل نوع
  daily as (
    select
      metric,
      day,
      count(*)::bigint as count
    from events
    group by metric, day
  ),

  -- الإجمالي الكامل لكل نوع
  totals as (
    select
      'students'::text as metric,
      count(*)::bigint as value
    from profiles
    where role = 'student'
      and deleted_at is null

    union all

    select 'courses', count(*)::bigint
    from courses

    union all

    select 'tasks', count(*)::bigint
    from tasks

    union all

    select 'notes', count(*)::bigint
    from notes

    union all

    select 'messages', count(*)::bigint
    from messages
  )

  select
    totals.metric,
    totals.value,

    -- آخر 7 أيام
    coalesce((
      select sum(daily.count)
      from daily, bounds
      where daily.metric = totals.metric
        and daily.day >= bounds.current_start
        and daily.day < bounds.tomorrow
    ), 0)::bigint as current_count,

    -- الـ7 أيام السابقة
    coalesce((
      select sum(daily.count)
      from daily, bounds
      where daily.metric = totals.metric
        and daily.day >= bounds.previous_start
        and daily.day < bounds.current_start
    ), 0)::bigint as previous_count,

    -- سبع قيم، قيمة لكل يوم، تستخدم في رسم التموج
    array(
      select coalesce(daily.count, 0)::bigint
      from days
      left join daily
        on daily.metric = totals.metric
        and daily.day = days.day
      order by days.day
    ) as trend_data

  from totals;
$$;

-- الدالة متاحة فقط عبر Service Role
revoke all
on function public.get_admin_dashboard_stats()
from public;

revoke execute
on function public.get_admin_dashboard_stats()
from anon, authenticated;

grant execute
on function public.get_admin_dashboard_stats()
to service_role;