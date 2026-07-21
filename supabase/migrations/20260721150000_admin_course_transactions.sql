-- إضافة المادة ومتطلباتها داخل Transaction واحدة
create or replace function public.create_admin_course_with_prerequisites(
  p_course jsonb,
  p_prerequisite_ids uuid[] default '{}'::uuid[]
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_course_id uuid;
  v_university text;
  v_major text;
begin
  v_university := p_course->>'university';
  v_major := p_course->>'major';

  insert into public.admin_courses (
    name,
    code,
    description,
    teaching_language,
    credits,
    category,
    semester,
    year,
    university,
    major
  )
  values (
    p_course->>'name',
    p_course->>'code',
    p_course->>'description',
    coalesce(p_course->>'teaching_language', 'العربية'),
    (p_course->>'credits')::integer,
    p_course->>'category',
    p_course->>'semester',
    p_course->>'year',
    v_university,
    v_major
  )
  returning id into v_course_id;

  -- منع تكرار نفس المتطلب
  if cardinality(p_prerequisite_ids) <>
    (
      select count(distinct prerequisite_id)
      from unnest(p_prerequisite_ids) as prerequisite_id
    )
  then
    raise exception 'يوجد متطلب مكرر'
      using errcode = '22023';
  end if;

  -- التحقق أن المتطلبات موجودة وغير محذوفة
  if exists (
    select 1
    from unnest(p_prerequisite_ids) as selected(prerequisite_id)
    left join public.admin_courses as prerequisite
      on prerequisite.id = selected.prerequisite_id
      and prerequisite.deleted_at is null
    where prerequisite.id is null
  )
  then
    raise exception 'إحدى المواد المطلوبة غير موجودة أو محذوفة'
      using errcode = '23503';
  end if;

  -- التحقق أن المتطلبات من الجامعة والتخصص نفسيهما
  if exists (
    select 1
    from unnest(p_prerequisite_ids) as selected(prerequisite_id)
    join public.admin_courses as prerequisite
      on prerequisite.id = selected.prerequisite_id
    where prerequisite.university is distinct from v_university
       or prerequisite.major is distinct from v_major
  )
  then
    raise exception 'المتطلب يجب أن يكون من الجامعة والتخصص نفسيهما'
      using errcode = '22023';
  end if;

  insert into public.admin_course_prerequisites (
    course_id,
    prerequisite_course_id
  )
  select
    v_course_id,
    prerequisite_id
  from unnest(p_prerequisite_ids) as prerequisite_id;

  return v_course_id;
end;
$$;


-- تعديل المادة ومتطلباتها داخل Transaction واحدة
create or replace function public.update_admin_course_with_prerequisites(
  p_course_id uuid,
  p_course jsonb,
  p_prerequisite_ids uuid[] default null
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_university text;
  v_major text;
begin
  if not exists (
    select 1
    from public.admin_courses
    where id = p_course_id
      and deleted_at is null
  )
  then
    raise exception 'المادة غير موجودة'
      using errcode = 'P0002';
  end if;

  update public.admin_courses
  set
    name = case
      when p_course ? 'name'
        then p_course->>'name'
      else name
    end,

    code = case
      when p_course ? 'code'
        then p_course->>'code'
      else code
    end,

    description = case
      when p_course ? 'description'
        then p_course->>'description'
      else description
    end,

    teaching_language = case
      when p_course ? 'teaching_language'
        then p_course->>'teaching_language'
      else teaching_language
    end,

    credits = case
      when p_course ? 'credits'
        then (p_course->>'credits')::integer
      else credits
    end,

    category = case
      when p_course ? 'category'
        then p_course->>'category'
      else category
    end,

    semester = case
      when p_course ? 'semester'
        then p_course->>'semester'
      else semester
    end,

    year = case
      when p_course ? 'year'
        then p_course->>'year'
      else year
    end,

    university = case
      when p_course ? 'university'
        then p_course->>'university'
      else university
    end,

    major = case
      when p_course ? 'major'
        then p_course->>'major'
      else major
    end

  where id = p_course_id
    and deleted_at is null

  returning university, major
  into v_university, v_major;

  -- null يعني أن المتطلبات لم تتغير
  if p_prerequisite_ids is not null then
    if p_course_id = any(p_prerequisite_ids) then
      raise exception 'لا يمكن أن تكون المادة متطلبًا لنفسها'
        using errcode = '22023';
    end if;

    if cardinality(p_prerequisite_ids) <>
      (
        select count(distinct prerequisite_id)
        from unnest(p_prerequisite_ids) as prerequisite_id
      )
    then
      raise exception 'يوجد متطلب مكرر'
        using errcode = '22023';
    end if;

    if exists (
      select 1
      from unnest(p_prerequisite_ids) as selected(prerequisite_id)
      left join public.admin_courses as prerequisite
        on prerequisite.id = selected.prerequisite_id
        and prerequisite.deleted_at is null
      where prerequisite.id is null
    )
    then
      raise exception 'إحدى المواد المطلوبة غير موجودة أو محذوفة'
        using errcode = '23503';
    end if;

    if exists (
      select 1
      from unnest(p_prerequisite_ids) as selected(prerequisite_id)
      join public.admin_courses as prerequisite
        on prerequisite.id = selected.prerequisite_id
      where prerequisite.university is distinct from v_university
         or prerequisite.major is distinct from v_major
    )
    then
      raise exception 'المتطلب يجب أن يكون من الجامعة والتخصص نفسيهما'
        using errcode = '22023';
    end if;

    delete from public.admin_course_prerequisites
    where course_id = p_course_id;

    insert into public.admin_course_prerequisites (
      course_id,
      prerequisite_course_id
    )
    select
      p_course_id,
      prerequisite_id
    from unnest(p_prerequisite_ids) as prerequisite_id;
  end if;

  return p_course_id;
end;
$$;


-- منع استدعائها مباشرة من المتصفح
revoke all
on function public.create_admin_course_with_prerequisites(jsonb, uuid[])
from public, anon, authenticated;

revoke all
on function public.update_admin_course_with_prerequisites(uuid, jsonb, uuid[])
from public, anon, authenticated;

grant execute
on function public.create_admin_course_with_prerequisites(jsonb, uuid[])
to service_role;

grant execute
on function public.update_admin_course_with_prerequisites(uuid, jsonb, uuid[])
to service_role;

notify pgrst, 'reload schema';