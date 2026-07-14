// =============================================
// Last Activites for Admin
// =============================================
import "server-only";

import { dbAdmin } from "@/lib/db/server-only";
import type { AdminActivity } from "@/types/admin";

const SOURCE_LIMIT = 10;
const ACTIVITY_LIMIT = 12;

type StudentRow = {
  id: string;
  full_name: string | null;
  university: string | null;
  major: string | null;
  created_at: string;
};

type DeletedUserRow = {
  id: string;
  full_name: string | null;
  deleted_at: string;
};

type AdminCourseRow = {
  id: string;
  name: string;
  code: string;
  created_at: string;
};

type DoctorRow = {
  id: string;
  name: string;
  university: string;
  created_at: string;
};

type CourseReviewRow = {
  id: string;
  course_code: string;
  rating_overall: number | null;
  created_at: string;
  profile: {
    full_name: string | null;
  } | null;
};

type DoctorReviewRow = {
  id: string;
  rating_overall: number | null;
  created_at: string;
  profile: {
    full_name: string | null;
  } | null;
  doctor: {
    name: string;
  } | null;
};

/**
 * Returns the latest activities that are relevant to the admin dashboard.
 */
export async function getAdminRecentActivities(): Promise<AdminActivity[]> {
  const [
    studentsResult,
    coursesResult,
    doctorsResult,
    courseReviewsResult,
    doctorReviewsResult,
    deletedUsersResult,
  ] = await Promise.all([
    // Latest students who joined the platform
    dbAdmin
      .from("profiles")
      .select("id, full_name, university, major, created_at")
      .eq("role", "student")
      .not("created_at", "is", null)
      .order("created_at", { ascending: false })
      .limit(SOURCE_LIMIT),

    // Latest courses added by the admin
    dbAdmin
      .from("admin_courses")
      .select("id, name, code, created_at")
      .not("created_at", "is", null)
      .order("created_at", { ascending: false })
      .limit(SOURCE_LIMIT),

    // Latest doctors added to the platform
    dbAdmin
      .from("doctors")
      .select("id, name, university, created_at")
      .not("created_at", "is", null)
      .order("created_at", { ascending: false })
      .limit(SOURCE_LIMIT),

    // Latest course reviews with the student name
    dbAdmin
      .from("course_reviews")
      .select(`
        id,
        course_code,
        rating_overall,
        created_at,
        profile:profiles!course_reviews_user_id_fkey (
          full_name
        )
      `)
      .not("created_at", "is", null)
      .order("created_at", { ascending: false })
      .limit(SOURCE_LIMIT),

    // Latest doctor reviews with the student and doctor names
    dbAdmin
      .from("doctor_reviews")
      .select(`
        id,
        rating_overall,
        created_at,
        profile:profiles!doctor_reviews_user_id_fkey (
          full_name
        ),
        doctor:doctors!doctor_reviews_doctor_id_fkey (
          name
        )
      `)
      .not("created_at", "is", null)
      .order("created_at", { ascending: false })
      .limit(SOURCE_LIMIT),

    // Latest soft-deleted users
    dbAdmin
      .from("profiles")
      .select("id, full_name, deleted_at")
      .not("deleted_at", "is", null)
      .order("deleted_at", { ascending: false })
      .limit(SOURCE_LIMIT),
  ]);

  const results = [
    studentsResult,
    coursesResult,
    doctorsResult,
    courseReviewsResult,
    doctorReviewsResult,
    deletedUsersResult,
  ];

  // Stop the request if any database query fails
  const failedResult = results.find((result) => result.error);

  if (failedResult?.error) {
    throw new Error(failedResult.error.message);
  }

  const students = (studentsResult.data ?? []) as StudentRow[];
  const courses = (coursesResult.data ?? []) as AdminCourseRow[];
  const doctors = (doctorsResult.data ?? []) as DoctorRow[];

  const courseReviews = (courseReviewsResult.data ??
    []) as unknown as CourseReviewRow[];

  const doctorReviews = (doctorReviewsResult.data ??
    []) as unknown as DoctorReviewRow[];

  const deletedUsers = (deletedUsersResult.data ??
    []) as DeletedUserRow[];

  const activities: AdminActivity[] = [
    ...students.map((student) => ({
      id: `student-${student.id}`,
      type: "student_joined" as const,
      title: "انضم طالب جديد",
      description: [student.university, student.major]
        .filter(Boolean)
        .join(" • "),
      actorName: student.full_name ?? "طالب جديد",
      createdAt: student.created_at,
      href: "/admin/users",
    })),

    ...courses.map((course) => ({
      id: `course-${course.id}`,
      type: "course_created" as const,
      title: "تمت إضافة مادة جديدة",
      description: `${course.name} • ${course.code}`,
      createdAt: course.created_at,
      href: "/admin/courses",
    })),

    ...doctors.map((doctor) => ({
      id: `doctor-${doctor.id}`,
      type: "doctor_created" as const,
      title: "تمت إضافة دكتور جديد",
      description: doctor.university,
      actorName: doctor.name,
      createdAt: doctor.created_at,
      href: "/admin/doctors",
    })),

    ...courseReviews.map((review) => ({
      id: `course-review-${review.id}`,
      type: "course_review_created" as const,
      title: "تمت إضافة تقييم مادة",
      description:
        review.rating_overall !== null
          ? `${review.course_code} • التقييم ${review.rating_overall}/5`
          : review.course_code,
      actorName: review.profile?.full_name ?? "طالب",
      createdAt: review.created_at,
      href: "/admin/reviews",
    })),

    ...doctorReviews.map((review) => ({
      id: `doctor-review-${review.id}`,
      type: "doctor_review_created" as const,
      title: "تمت إضافة تقييم دكتور",
      description:
        review.rating_overall !== null
          ? `${review.doctor?.name ?? "دكتور"} • التقييم ${review.rating_overall}/5`
          : review.doctor?.name,
      actorName: review.profile?.full_name ?? "طالب",
      createdAt: review.created_at,
      href: "/admin/reviews",
    })),

    ...deletedUsers.map((user) => ({
      id: `deleted-user-${user.id}`,
      type: "user_deleted" as const,
      title: "تم تعطيل حساب مستخدم",
      actorName: user.full_name ?? "مستخدم",
      createdAt: user.deleted_at,
      href: "/admin/users",
    })),
  ];

  // Merge all sources, sort by date, then return the latest activities
  return activities
    .sort(
      (first, second) =>
        new Date(second.createdAt).getTime() -
        new Date(first.createdAt).getTime(),
    )
    .slice(0, ACTIVITY_LIMIT);
}