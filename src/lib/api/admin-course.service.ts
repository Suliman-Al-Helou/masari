import "server-only";

import { dbAdmin } from "@/lib/db/server-only";
import type {
  AdminCourse,
  AdminCourseDetails,
  AdminCourseFilters,
  AdminCoursePage,
  AdminCourseReviewItem,
  AdminCourseReviewStatus,
  AdminCourseSort,
} from "@/types/admin";
import type {
  CreateAdminCourseInput,
  UpdateAdminCourseInput,
} from "@/schemas/admin-course.schema";
import {
    createMockAdminCourse,
  findMockAdminCourse,
  listMockAdminCourses,
  updateMockAdminCourse,
} from "@/lib/mocks/admin-courses.mock";

const USE_MOCK_DATA =
  process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";
  
export class AdminCourseServiceError extends Error {
  constructor(
    message: string,
    readonly status = 400,
  ) {
    super(message);
    this.name = "AdminCourseServiceError";
  }
}

type CourseOverviewRow = {
  id: string;
  name: string;
  code: string;

  description: string | null;
  teaching_language: string;

  credits: number;
  category: string;
  semester: string;
  year: string;
  university: string;
  major: string;

  created_at: string;
  updated_at: string;
  deleted_at: string | null;

  average_rating: number | string | null;
  reviews_count: number | string | null;

  rating_distribution: Record<"1" | "2" | "3" | "4" | "5", number> | null;

  average_difficulty: number | string | null;
  average_workload: number | string | null;
  average_content_quality: number | string | null;
  retake_percent: number | string | null;
};

function toNullableNumber(
  value: number | string | null | undefined,
): number | null {
  if (value == null) return null;

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : null;
}

function mapCourse(row: CourseOverviewRow): AdminCourse {
  return {
    id: row.id,
    name: row.name,
    code: row.code,

    description: row.description,
    teaching_language: row.teaching_language,

    credits: row.credits,
    category: row.category,
    semester: row.semester,
    year: row.year,
    university: row.university,
    major: row.major,

    created_at: row.created_at,
    updated_at: row.updated_at,
    deleted_at: row.deleted_at,

    average_rating: toNullableNumber(row.average_rating),

    reviews_count: Number(row.reviews_count ?? 0),

    rating_distribution: row.rating_distribution ?? {
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 0,
      "5": 0,
    },

    average_difficulty: toNullableNumber(row.average_difficulty),

    average_workload: toNullableNumber(row.average_workload),

    average_content_quality: toNullableNumber(row.average_content_quality),

    retake_percent: toNullableNumber(row.retake_percent),

    prerequisite_ids: [],
    prerequisites: [],
  };
}


function sanitizeSearch(value: string): string {
  return value.replace(/[,%()]/g, " ").trim();
}

function getCourseSort(sort: AdminCourseSort): {
  column: string;
  ascending: boolean;
} {
  const options: Record<
    AdminCourseSort,
    { column: string; ascending: boolean }
  > = {
    created_desc: { column: "created_at", ascending: false },
    name_asc: { column: "name", ascending: true },
    code_asc: { column: "code", ascending: true },
    rating_desc: { column: "average_rating", ascending: false },
    rating_asc: { column: "average_rating", ascending: true },
    reviews_desc: { column: "reviews_count", ascending: false },
  };

  return options[sort];
}
const COURSE_OVERVIEW_SELECT = `
  id,
  name,
  code,
  description,
  teaching_language,
  credits,
  category,
  semester,
  year,
  university,
  major,
  created_at,
  updated_at,
  deleted_at,
  average_rating,
  reviews_count,
  rating_distribution,
  average_difficulty,
  average_workload,
  average_content_quality,
  retake_percent
`;
export async function listAdminCourses(
  filters: AdminCourseFilters,
): Promise<AdminCoursePage> {

    if (USE_MOCK_DATA) {
    return listMockAdminCourses(filters);
  }
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 10;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = dbAdmin
    .from("admin_course_overview")
    .select(COURSE_OVERVIEW_SELECT, {
      count: "exact",
    });

  query =
    filters.status === "deleted"
      ? query.not("deleted_at", "is", null)
      : query.is("deleted_at", null);

  if (filters.university) query = query.eq("university", filters.university);
  if (filters.major) query = query.eq("major", filters.major);
  if (filters.semester) query = query.eq("semester", filters.semester);
  if (filters.year) query = query.eq("year", filters.year);

  if (filters.search) {
    const search = sanitizeSearch(filters.search);
    if (search) {
      query = query.or(
        `name.ilike.%${search}%,code.ilike.%${search}%,university.ilike.%${search}%,major.ilike.%${search}%`,
      );
    }
  }

  const selectedSort = getCourseSort(filters.sort ?? "created_desc");
  query = query.order(selectedSort.column, {
    ascending: selectedSort.ascending,
    nullsFirst: false,
  });

  const { data, error, count } = await query.range(from, to);
  if (error) throw error;

  const total = count ?? 0;
  return {
items: (data ?? []).map((row) =>
  mapCourse(row as CourseOverviewRow),
),    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

async function getPrerequisites(courseId: string) {
  const { data: links, error: linksError } = await dbAdmin
    .from("admin_course_prerequisites")
    .select("prerequisite_course_id")
    .eq("course_id", courseId);

  if (linksError) throw linksError;
  const ids = (links ?? []).map(
    (link) => link.prerequisite_course_id as string,
  );

  if (ids.length === 0) return { ids, courses: [] };

  const { data, error } = await dbAdmin
    .from("admin_courses")
    .select("id, name, code")
    .in("id", ids)
    .order("name", { ascending: true });

  if (error) throw error;
  return { ids, courses: data ?? [] };
}

export async function getAdminCourse(courseId: string): Promise<AdminCourse> {
  const [{ data, error }, prerequisites] = await Promise.all([
    dbAdmin
      .from("admin_course_overview")
      .select(COURSE_OVERVIEW_SELECT)
      .eq("id", courseId)
      .maybeSingle(),
    getPrerequisites(courseId),
  ]);

  if (error) throw error;
  if (!data) throw new AdminCourseServiceError("المادة غير موجودة", 404);

  return {
...mapCourse(data as CourseOverviewRow),
    prerequisite_ids: prerequisites.ids,
    prerequisites: prerequisites.courses,
  };
}

export async function createManagedCourse(
  input: CreateAdminCourseInput,
): Promise<AdminCourse> {
  if (USE_MOCK_DATA) {
return createMockAdminCourse({
  ...input,
  category: input.category ?? "غير محدد",
});  }

  const { data: courseId, error } = await dbAdmin.rpc(
    "create_admin_course_with_prerequisites",
    {
      p_name: input.name,
      p_code: input.code,
      p_description: input.description ?? null,
      p_teaching_language:
        input.teaching_language ?? "العربية",
      p_credits: input.credits,
      p_category: input.category,
      p_semester: input.semester,
      p_year: input.year,
      p_university: input.university,
      p_major: input.major,
      p_prerequisite_ids:
        input.prerequisite_ids ?? [],
    },
  );

  if (error) {
    if (error.code === "23505") {
      throw new AdminCourseServiceError(
        "رمز المادة مستخدم داخل هذا التخصص",
        409,
      );
    }

    if (
      error.code === "23503" ||
      error.code === "22023"
    ) {
      throw new AdminCourseServiceError(
        "إحدى المواد المطلوبة غير صالحة",
        400,
      );
    }

    throw error;
  }

  if (!courseId) {
    throw new AdminCourseServiceError(
      "تعذر إنشاء المادة",
      500,
    );
  }

  return getAdminCourse(courseId);
}
export async function updateManagedCourse(
  courseId: string,
  input: UpdateAdminCourseInput,
): Promise<AdminCourse> {
  if (USE_MOCK_DATA) {
const mockInput = {
  ...input,
  category:
    input.category === undefined
      ? undefined
      : input.category ?? "غير محدد",
};

const course = updateMockAdminCourse(
  courseId,
  mockInput,
);
    if (!course) {
      throw new AdminCourseServiceError(
        "المادة غير موجودة",
        404,
      );
    }

    return course;
  }

  const {
    prerequisite_ids: prerequisiteIds,
    ...course
  } = input;

  const { data: updatedCourseId, error } = await dbAdmin.rpc(
    "update_admin_course_with_prerequisites",
    {
      p_course_id: courseId,
      p_course: course,
      p_prerequisite_ids:
        prerequisiteIds === undefined
          ? null
          : prerequisiteIds,
    },
  );

  if (error) {
    if (error.code === "23505") {
      throw new AdminCourseServiceError(
        "رمز المادة مستخدم داخل هذا التخصص",
        409,
      );
    }

    if (error.code === "P0002") {
      throw new AdminCourseServiceError(
        "المادة غير موجودة",
        404,
      );
    }

    if (
      error.code === "22023" ||
      error.code === "23503"
    ) {
      throw new AdminCourseServiceError(
        error.message,
        400,
      );
    }

    throw error;
  }

  if (!updatedCourseId) {
    throw new AdminCourseServiceError(
      "تعذر تعديل المادة",
      500,
    );
  }

  return getAdminCourse(updatedCourseId);
}
export async function softDeleteManagedCourse(courseId: string): Promise<void> {
  const { data, error } = await dbAdmin
    .from("admin_courses")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", courseId)
    .is("deleted_at", null)
    .select("id")
    .maybeSingle();

  if (error) throw error;
  if (!data)
    throw new AdminCourseServiceError("المادة محذوفة أو غير موجودة", 404);
}

export async function restoreManagedCourse(
  courseId: string,
): Promise<AdminCourse> {
  const { data, error } = await dbAdmin
    .from("admin_courses")
    .update({ deleted_at: null })
    .eq("id", courseId)
    .not("deleted_at", "is", null)
    .select("id")
    .maybeSingle();

  if (error) {
    if (error.code === "23505") {
      throw new AdminCourseServiceError(
        "لا يمكن الاستعادة لوجود مادة نشطة بالرمز نفسه",
        409,
      );
    }
    throw error;
  }

  if (!data) throw new AdminCourseServiceError("المادة غير محذوفة", 404);
  return getAdminCourse(courseId);
}

export async function getManagedCourseReviews(
  courseId: string,
  options: { sort: "newest" | "highest"; status?: AdminCourseReviewStatus },
): Promise<AdminCourseDetails> {
  const coursePromise = getAdminCourse(courseId);

  let query = dbAdmin
    .from("course_reviews")
    .select(
      `
    id,
    rating_overall,
    rating_difficulty,
    rating_workload,
    content_quality,
    would_retake,
    review,
    tips,
    semester_taken,
    status,
    created_at,
    profiles!course_reviews_user_id_fkey(
      full_name,
      university
    )
  `,
    )
    .eq("admin_course_id", courseId);

  if (options.status) query = query.eq("status", options.status);

  query =
    options.sort === "highest"
      ? query.order("rating_overall", { ascending: false, nullsFirst: false })
      : query.order("created_at", { ascending: false });

  const publishedRatingsPromise = dbAdmin
    .from("course_reviews")
    .select("rating_overall")
    .eq("admin_course_id", courseId)
    .eq("status", "published");

  const [course, { data, error }, publishedRatings] = await Promise.all([
    coursePromise,
    query,
    publishedRatingsPromise,
  ]);
  if (error) throw error;
  if (publishedRatings.error) throw publishedRatings.error;

  const reviews: AdminCourseReviewItem[] = (data ?? []).map((row) => ({
    id: row.id,
    rating_overall: row.rating_overall,
    rating_difficulty: row.rating_difficulty,
    rating_workload: row.rating_workload,
    content_quality: row.content_quality,
    would_retake: row.would_retake,
    review: row.review,
    tips: row.tips,
    semester_taken: row.semester_taken,
    status: row.status as AdminCourseReviewStatus,
    created_at: row.created_at,
    student: Array.isArray(row.profiles)
      ? (row.profiles[0] ?? null)
      : row.profiles,
  }));

  const ratingDistribution: Record<1 | 2 | 3 | 4 | 5, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };
  (publishedRatings.data ?? []).forEach(({ rating_overall: rating }) => {
    const rounded = Math.round(rating ?? 0);
    if (rounded >= 1 && rounded <= 5) {
      ratingDistribution[rounded as 1 | 2 | 3 | 4 | 5] += 1;
    }
  });

  return { course, reviews, rating_distribution: ratingDistribution };
}

export async function moderateManagedCourseReview(
  reviewId: string,
  status: AdminCourseReviewStatus,
  moderatorId: string,
): Promise<void> {
  const { data, error } = await dbAdmin
    .from("course_reviews")
    .update({
      status,
      moderated_by: moderatorId,
      moderated_at: new Date().toISOString(),
    })
    .eq("id", reviewId)
    .select("id")
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new AdminCourseServiceError("التقييم غير موجود", 404);
}

export async function permanentlyDeleteManagedCourseReview(
  reviewId: string,
): Promise<void> {
  const { data, error } = await dbAdmin
    .from("course_reviews")
    .delete()
    .eq("id", reviewId)
    .select("id")
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new AdminCourseServiceError("التقييم غير موجود", 404);
}
