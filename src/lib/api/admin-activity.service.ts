import "server-only";

import { dbAdmin } from "@/lib/db/server-only";
import type {
  MajorDistribution,
  UniversityDistribution,
  StudentDistributionData,
  StudentDistributionFilters,
  AdminCourse,
  AdminCourseReview,
  AdminDoctorReview,
  AdminStats,
  AdminStatMetric,
  PlatformActivityFilters,
  PlatformActivityTrendData,
  AdminActivity,
  AdminUsersStatus,
} from "@/types/admin";
import { USER_ROLES } from "@/lib/constants/roles";

// هذا الملف فقط: منطق يحتاج صلاحية dbAdmin (تتجاوز RLS).
// يُستدعى حصراً من Route Handlers، ممنوع استيراده من أي كود 'use client'.

// Returns the latest important activities across the platform.
export async function getAdminRecentActivities(): Promise<AdminActivity[]> {
  const [
    joinedResult,
    deletedResult,
    coursesResult,
    doctorsResult,
    courseReviewsResult,
    doctorReviewsResult,
  ] = await Promise.all([
    dbAdmin
      .from("profiles")
      .select("id, full_name, created_at")
      .eq("role", "student")
      .order("created_at", { ascending: false })
      .limit(20),

    dbAdmin
      .from("profiles")
      .select("id, full_name, deleted_at")
      .not("deleted_at", "is", null)
      .order("deleted_at", { ascending: false })
      .limit(20),

    dbAdmin
      .from("admin_courses")
      .select("id, name, code, created_at")
      .order("created_at", { ascending: false })
      .limit(20),

    dbAdmin
      .from("doctors")
      .select("id, name, created_at")
      .order("created_at", { ascending: false })
      .limit(20),

    dbAdmin
      .from("course_reviews")
      .select(
        `
        id,
        created_at,
        profiles (full_name),
        courses (name)
      `,
      )
      .order("created_at", { ascending: false })
      .limit(20),

    dbAdmin
      .from("doctor_reviews")
      .select(
        `
        id,
        created_at,
        profiles (full_name),
        doctors (name)
      `,
      )
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const requestError = [
    joinedResult.error,
    deletedResult.error,
    coursesResult.error,
    doctorsResult.error,
    courseReviewsResult.error,
    doctorReviewsResult.error,
  ].find(Boolean);

  if (requestError) {
    throw requestError;
  }

  const activities: AdminActivity[] = [];

  for (const user of joinedResult.data ?? []) {
    activities.push({
      id: `student-${user.id}`,
      type: "student_joined",
      title: "انضم طالب جديد",
      actorName: user.full_name ?? "مستخدم بدون اسم",
      href: "/admin/users",
      createdAt: user.created_at,
    });
  }

  for (const user of deletedResult.data ?? []) {
    if (!user.deleted_at) continue;

    activities.push({
      id: `deleted-${user.id}`,
      type: "user_deleted",
      title: "تم تعطيل حساب مستخدم",
      actorName: user.full_name ?? "مستخدم بدون اسم",
      href: "/admin/users",
      createdAt: user.deleted_at,
    });
  }

  for (const course of coursesResult.data ?? []) {
    activities.push({
      id: `course-${course.id}`,
      type: "course_created",
      title: "تمت إضافة مادة جديدة",
      description: `${course.name} — ${course.code}`,
      href: "/admin/courses",
      createdAt: course.created_at,
    });
  }

  for (const doctor of doctorsResult.data ?? []) {
    activities.push({
      id: `doctor-${doctor.id}`,
      type: "doctor_created",
      title: "تمت إضافة دكتور جديد",
      actorName: doctor.name,
      href: "/admin/doctors",
      createdAt: doctor.created_at,
    });
  }

  for (const review of courseReviewsResult.data ?? []) {
    const profile = Array.isArray(review.profiles)
      ? review.profiles[0]
      : review.profiles;

    const course = Array.isArray(review.courses)
      ? review.courses[0]
      : review.courses;

    activities.push({
      id: `course-review-${review.id}`,
      type: "course_review_created",
      title: "تمت إضافة تقييم مادة",
      actorName: profile?.full_name ?? "مستخدم بدون اسم",
      description: course?.name ?? undefined,
      href: "/admin/reviews",
      createdAt: review.created_at,
    });
  }

  for (const review of doctorReviewsResult.data ?? []) {
    const profile = Array.isArray(review.profiles)
      ? review.profiles[0]
      : review.profiles;

    const doctor = Array.isArray(review.doctors)
      ? review.doctors[0]
      : review.doctors;

    activities.push({
      id: `doctor-review-${review.id}`,
      type: "doctor_review_created",
      title: "تمت إضافة تقييم دكتور",
      actorName: profile?.full_name ?? "مستخدم بدون اسم",
      description: doctor?.name ?? undefined,
      href: "/admin/reviews",
      createdAt: review.created_at,
    });
  }

  return activities
    .sort(
      (first, second) =>
        new Date(second.createdAt).getTime() -
        new Date(first.createdAt).getTime(),
    )
    .slice(0, 20);
}
// =============================================
// المستخدمين
// =============================================

interface GetAdminUsersParams {
  search?: string;
  status?: AdminUsersStatus;
}

// =============================================
// إحصائيات Dashboard
// =============================================
type DashboardMetricKey = Exclude<keyof AdminStats, "totalStudents">;
// Its a Row in AdminStats Array (Because AdminStats Is an Array Of AdminStatMetric)
type DashboardMetricRow = {
  metric: DashboardMetricKey;
  value: number;
  current_count: number;
  previous_count: number;
  trend_data: number[];
};
function calculateChangePercent(
  currentCount: number,
  previousCount: number,
): number | null {
  // لا توجد نسبة صحيحة عند عدم وجود بيانات في الفترة السابقة
  if (previousCount === 0) {
    return currentCount === 0 ? 0 : null;
  }

  return Number(
    (((currentCount - previousCount) / previousCount) * 100).toFixed(1),
  );
}

// get users , tasks , notes , courses , messages count with trend data for admin stats
export async function getAdminStats(): Promise<AdminStats> {
  // Get PostgreSQL Function
  const { data, error } = await dbAdmin.rpc("get_admin_dashboard_stats");

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as DashboardMetricRow[];
  const metrics = new Map(rows.map((row) => [row.metric, row]));

  function getMetric(key: DashboardMetricKey): AdminStatMetric {
    const row = metrics.get(key);

    if (!row) {
      throw new Error(`Missing dashboard metric: ${key}`);
    }

    const currentCount = Number(row.current_count);
    const previousCount = Number(row.previous_count);

    return {
      // الطلاب: عدد المنضمين خلال آخر 7 أيام
      // باقي البطاقات: الإجمالي الكامل
      value: key === "students" ? currentCount : Number(row.value),

      changePercent: calculateChangePercent(currentCount, previousCount),

      trendData: row.trend_data.map(Number),
    };
  }
  const studentsRow = metrics.get("students");
  if (!studentsRow) {
    throw new Error("Missing dashboard metric: students");
  }
  return {
    totalStudents: Number(studentsRow.value),
    students: getMetric("students"),
    courses: getMetric("courses"),
    tasks: getMetric("tasks"),
    notes: getMetric("notes"),
    messages: getMetric("messages"),
  };
}
// يحسب كم طالب بكل تخصص، ويرجع أعلى 8 تخصصات (للرسم البياني بالـ Dashboard)
export async function getMajorDistribution(): Promise<MajorDistribution[]> {
  const { data, error } = await dbAdmin
    .from("profiles")
    .select("major")
    .eq("role", USER_ROLES.STUDENT)
    .not("major", "is", null);
  if (error) throw error;

  const counts: Record<string, number> = {};
  (data ?? []).forEach(({ major }) => {
    if (major) counts[major] = (counts[major] ?? 0) + 1;
  });

  return Object.entries(counts)
    .map(([major, count]) => ({ major, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
}

// نفس فكرة التخصصات، بس حسب الجامعة، أعلى 6 جامعات
export async function getUniversityDistribution(): Promise<
  UniversityDistribution[]
> {
  const { data, error } = await dbAdmin
    .from("profiles")
    .select("university")
    .eq("role", USER_ROLES.STUDENT)
    .not("university", "is", null);
  if (error) throw error;

  const counts: Record<string, number> = {};
  (data ?? []).forEach(({ university }) => {
    if (university) counts[university] = (counts[university] ?? 0) + 1;
  });

  return Object.entries(counts)
    .map(([university, count]) => ({ university, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
}
const DISTRIBUTION_LIMIT = 6;

type StudentDistributionRow = {
  university: string | null;
  major: string | null;
};

// يحول أسماء الجامعات أو التخصصات إلى أعداد ونسب
function buildDistributionItems(labels: Array<string | null>, total: number) {
  const counts = new Map<string, number>();

  labels.forEach((label) => {
    const key = label ?? "غير محدد";
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, DISTRIBUTION_LIMIT)
    .map(([label, count]) => ({
      label,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }));
}

export async function getStudentDistribution(
  filters: StudentDistributionFilters = {},
): Promise<StudentDistributionData> {
  const university = filters.university?.trim();
  const major = filters.major?.trim();

  let query = dbAdmin
    .from("profiles")
    .select("university, major")
    .eq("role", USER_ROLES.STUDENT)
    .is("deleted_at", null);

  if (university) {
    query = query.eq("university", university);
  } else if (major) {
    query = query.eq("major", major);
  }

  const { data, error } = await query;

  if (error) throw error;

  const rows = (data ?? []) as StudentDistributionRow[];
  const total = rows.length;

  // عند اختيار الجامعة والتخصص معًا
  if (university && major) {
    const selectedCount = rows.filter((row) => row.major === major).length;

    const otherCount = total - selectedCount;

    const items = [
      { label: major, count: selectedCount },
      { label: "بقية تخصصات الجامعة", count: otherCount },
    ]
      .filter((item) => item.count > 0)
      .map((item) => ({
        ...item,
        percentage: total > 0 ? Math.round((item.count / total) * 100) : 0,
      }));

    return {
      groupBy: "comparison",
      total,
      items,
    };
  }

  const groupBy = university ? "major" : "university";

  return {
    groupBy,
    total,
    items: buildDistributionItems(
      rows.map((row) => (groupBy === "major" ? row.major : row.university)),
      total,
    ),
  };
}
// =============================================
// إدارة المواد (دالة واحدة موحّدة بدل اثنتين مكررتين)
// =============================================

// جلب المواد مع فلاتر اختيارية (جامعة/تخصص/سنة/فصل/بحث نصي). كل فلتر يُضاف فقط لو مُرسل
export async function getAdminCourses(options?: {
  university?: string;
  major?: string;
  year?: string;
  semester?: string;
  search?: string;
}): Promise<AdminCourse[]> {
  let query = dbAdmin
    .from("admin_courses")
    .select("*")
    .order("created_at", { ascending: false });

  if (options?.university) query = query.eq("university", options.university);
  if (options?.major) query = query.eq("major", options.major);
  if (options?.year) query = query.eq("year", options.year);
  if (options?.semester) query = query.eq("semester", options.semester);
  if (options?.search?.trim())
    query = query.or(
      `name.ilike.%${options.search.trim()}%,code.ilike.%${options.search.trim()}%`,
    );

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as AdminCourse[];
}

// إنشاء مادة جديدة، يرجع المادة المُنشأة (مع id و created_at من قاعدة البيانات)
export async function createAdminCourse(course: {
  name: string;
  code: string;
  credits: number;
  category: string;
  semester?: string;
  year?: string;
  university?: string;
  major?: string;
}): Promise<AdminCourse> {
  const { data, error } = await dbAdmin
    .from("admin_courses")
    .insert(course)
    .select()
    .single();
  if (error) throw error;
  return data as AdminCourse;
}

// حذف مادة حسب id
export async function deleteAdminCourse(id: string): Promise<void> {
  const { error } = await dbAdmin.from("admin_courses").delete().eq("id", id);
  if (error) throw error;
}

// =============================================
// مراجعات المواد
// =============================================

// جلب كل مراجعات المواد، مع اسم الطالب واسم المادة (Join)
export async function adminGetAllCourseReviews(): Promise<AdminCourseReview[]> {
  const { data, error } = await dbAdmin
    .from("course_reviews")
    .select(
      `
      id, rating_overall, rating_difficulty, rating_workload, would_retake, comment, created_at,
      profiles (full_name, university),
      courses (name, code)
    `,
    )
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as AdminCourseReview[];
}

// حذف مراجعة مادة حسب id
export async function adminDeleteCourseReview(id: string): Promise<void> {
  const { error } = await dbAdmin.from("course_reviews").delete().eq("id", id);
  if (error) throw error;
}

// =============================================
// مراجعات الدكاترة
// =============================================

// جلب كل مراجعات الدكاترة، مع اسم الطالب، اسم الدكتور، واسم المادة (Join)
export async function adminGetAllDoctorReviews(): Promise<AdminDoctorReview[]> {
  const { data, error } = await dbAdmin
    .from("doctor_reviews")
    .select(
      `
      id, rating, comment, created_at,
      profiles (full_name, university),
      doctors (name, title),
      courses (name, code)
    `,
    )
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as AdminDoctorReview[];
}

// حذف مراجعة دكتور حسب id
export async function adminDeleteDoctorReview(id: string): Promise<void> {
  const { error } = await dbAdmin.from("doctor_reviews").delete().eq("id", id);
  if (error) throw error;
}

// Database row returned by the activity trend function
type PlatformActivityTrendRow = {
  current_day: string;
  previous_day: string;
  current_count: number | string;
  previous_count: number | string;
};

// Fetches platform activity for the current and previous periods
export async function getPlatformActivityTrend(
  filters: PlatformActivityFilters,
): Promise<PlatformActivityTrendData> {
  const { data, error } = await dbAdmin.rpc(
    "get_admin_platform_activity_trend",
    {
      p_metric: filters.metric,
      p_period: filters.period,
    },
  );

  if (error) {
    throw new Error(error.message);
  }

  // Converts database rows to chart points
  const points = ((data ?? []) as PlatformActivityTrendRow[]).map((row) => ({
    currentDate: row.current_day,
    previousDate: row.previous_day,
    currentCount: Number(row.current_count),
    previousCount: Number(row.previous_count),
  }));

  // Calculates the total activity for both periods
  const currentTotal = points.reduce(
    (total, point) => total + point.currentCount,
    0,
  );

  const previousTotal = points.reduce(
    (total, point) => total + point.previousCount,
    0,
  );

  // Calculates the percentage change between both periods
  const changePercent =
    previousTotal === 0
      ? currentTotal === 0
        ? 0
        : null
      : Number(
          (((currentTotal - previousTotal) / previousTotal) * 100).toFixed(1),
        );

  return {
    metric: filters.metric,
    period: filters.period,
    currentTotal,
    previousTotal,
    changePercent,
    points,
  };
}
