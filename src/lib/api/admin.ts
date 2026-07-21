import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { api } from "@/lib/api/fetcher";
import type {
  AdminStats,
  AdminActivity,
  UniversityDistribution,
  MajorDistribution,
  AdminCourse,
  CreateAdminCourseInput,
  AdminCourseReview,
  AdminDoctorReview,
  AdminProfile,
  StudentDistributionFilters,
  StudentDistributionData,
  PlatformActivityFilters,
  PlatformActivityTrendData,
  AdminUsersStatus,
  AdminDoctor,
  AdminDoctorFilters,
  CreateAdminDoctorInput,
  AdminDoctorReviewDetails,
  AdminCourseDetails,
  AdminCourseFilters,
  AdminCoursePage,
  AdminCourseReviewStatus,
  UpdateAdminCourseInput,
} from "@/types/admin";
import { getPlatformActivityMock } from "@/lib/mocks/platform-activity.mock";
import {
  getAdminDoctorsMock,
  getAdminDoctorReviewDetailsMock,
} from "@/lib/mocks/admin-doctors.mock";
const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";
// هذا الملف: نقطة الاتصال الوحيدة بين واجهة الأدمن (Components) والـ API.
// ممنوع أي Component يستدعي supabase مباشرة — يستدعي دوال هذا الملف فقط.

// =============================================
// إحصائيات Dashboard
// =============================================
export async function getAdminStats(): Promise<AdminStats> {
  return api.get<AdminStats>(API_ENDPOINTS.admin.stats);
}

// =============================================
// المستخدمين
// =============================================

// جلب كل المستخدمين، مع بحث اختياري بالاسم (يُبنى كـ Query String)
export async function getAllUsers(params?: {
  search?: string;
  status?: AdminUsersStatus;
}): Promise<AdminProfile[]> {
  const query = new URLSearchParams();
  const search = params?.search?.trim();

  if (search) {
    query.set("search", search);
  }

  query.set("status", params?.status ?? "active");

  return api.get<AdminProfile[]>(
    `${API_ENDPOINTS.admin.users}?${query.toString()}`,
  );
}
// تغيير دور مستخدم (طالب ⇆ أدمن)
export async function updateUserRole(
  userId: string,
  role: "student" | "admin",
): Promise<void> {
  return api.patch<void>(API_ENDPOINTS.admin.userRole(userId), { role });
}

// حذف مستخدم (Soft delete من جهة السيرفر)
export async function deleteUser(userId: string): Promise<void> {
  return api.delete<void>(API_ENDPOINTS.admin.user(userId));
}
// Restores a disabled account.
export async function restoreUser(userId: string): Promise<void> {
  return api.patch<void>(API_ENDPOINTS.admin.restoreUser(userId), {});
}

// Saves or clears the optional disable reason.
export async function updateUserDeletionNote(
  userId: string,
  note: string,
): Promise<void> {
  return api.patch<void>(API_ENDPOINTS.admin.userDeletionNote(userId), {
    note,
  });
}

// =============================================
// التوزيعات (Charts بالـ Dashboard)
// =============================================
export async function getMajorDistribution(): Promise<MajorDistribution[]> {
  return api.get<MajorDistribution[]>(API_ENDPOINTS.admin.majorDistribution);
}

export async function getUniversityDistribution(): Promise<
  UniversityDistribution[]
> {
  return api.get<UniversityDistribution[]>(
    API_ENDPOINTS.admin.universityDistribution,
  );
}

// =============================================
// آخر الأنشطة
// =============================================
export async function getAdminRecentActivities(): Promise<AdminActivity[]> {
  return api.get<AdminActivity[]>(API_ENDPOINTS.admin.recentActivity);
}

// =============================================
// فتلرة الجامعات والتخصصات
// =============================================

export async function getStudentDistribution(
  filters: StudentDistributionFilters = {},
): Promise<StudentDistributionData> {
  const params = new URLSearchParams();

  if (filters.university) {
    params.set("university", filters.university);
  }

  if (filters.major) {
    params.set("major", filters.major);
  }

  const query = params.toString();

  return api.get<StudentDistributionData>(
    `${API_ENDPOINTS.admin.studentDistribution}${query ? `?${query}` : ""}`,
  );
}

// جلب المواد مع فلاتر اختيارية، تُبنى كـ Query String (?university=...&major=...)
function adminCourseSearchParams(filters: AdminCourseFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.university) params.set("university", filters.university);
  if (filters.major) params.set("major", filters.major);
  if (filters.semester) params.set("semester", filters.semester);
  if (filters.year) params.set("year", filters.year);
  if (filters.search) params.set("search", filters.search);
  if (filters.sort) params.set("sort", filters.sort);
  if (filters.status) params.set("status", filters.status);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.pageSize) params.set("pageSize", String(filters.pageSize));
  return params;
}

export async function getAdminCoursesPage(
  filters: AdminCourseFilters = {},
): Promise<AdminCoursePage> {
  const params = adminCourseSearchParams(filters);
  const query = params.toString();

  return api.get<AdminCoursePage>(
    `${API_ENDPOINTS.admin.courses}${query ? `?${query}` : ""}`,
  );
}

export async function getAdminCourses(options?: {
  university?: string;
  major?: string;
  search?: string;
}): Promise<AdminCourse[]> {
  const page = await getAdminCoursesPage({
    ...options,
    page: 1,
    pageSize: 100,
    sort: "name_asc",
  });

  return page.items;
}

// إنشاء مادة جديدة (CreateAdminCourseInput = AdminCourse بدون id و created_at)
export async function createAdminCourse(
  course: CreateAdminCourseInput,
): Promise<AdminCourse> {
  return api.post<AdminCourse>(API_ENDPOINTS.admin.courses, course);
}

export async function getAdminCourse(id: string): Promise<AdminCourse> {
  return api.get<AdminCourse>(API_ENDPOINTS.admin.adminCourse(id));
}

export async function updateAdminCourse(
  id: string,
  input: UpdateAdminCourseInput,
): Promise<AdminCourse> {
  return api.patch<AdminCourse>(API_ENDPOINTS.admin.adminCourse(id), input);
}

export async function updateAdminDoctorCourses(
  doctorId: string,
  courseIds: string[],
): Promise<void> {
  return api.patch<void>(API_ENDPOINTS.admin.doctorCourses(doctorId), {
    course_ids: courseIds,
  });
}
// حذف مادة حسب id
export async function deleteAdminCourse(id: string): Promise<void> {
  return api.delete(API_ENDPOINTS.admin.adminCourse(id));
}

export async function restoreAdminCourse(id: string): Promise<AdminCourse> {
  return api.patch<AdminCourse>(API_ENDPOINTS.admin.restoreCourse(id), {});
}

export async function getAdminCourseReviewDetails(
  courseId: string,
  options: { sort?: "newest" | "highest"; status?: string } = {},
): Promise<AdminCourseDetails> {
  const params = new URLSearchParams();
  if (options.sort) params.set("sort", options.sort);
  if (options.status) params.set("status", options.status);
  const query = params.toString();

  return api.get<AdminCourseDetails>(
    `${API_ENDPOINTS.admin.courseReviewDetails(courseId)}${
      query ? `?${query}` : ""
    }`,
  );
}

export async function moderateAdminCourseReview(
  reviewId: string,
  status: AdminCourseReviewStatus,
): Promise<void> {
  return api.patch<void>(API_ENDPOINTS.admin.adminCourseReview(reviewId), {
    status,
  });
}

// =============================================
// مراجعات المواد
// =============================================
export async function adminGetAllCourseReviews(): Promise<AdminCourseReview[]> {
  return api.get<AdminCourseReview[]>(API_ENDPOINTS.admin.courseReviews);
}

export async function adminDeleteCourseReview(id: string): Promise<void> {
  return api.delete(API_ENDPOINTS.admin.adminCourseReview(id));
}

// =============================================
// إدارة الدكاترة
// =============================================

export async function getAdminDoctors(
  filters: AdminDoctorFilters = {},
): Promise<AdminDoctor[]> {
  if (useMockData) {
    return getAdminDoctorsMock(filters);
  }
  const params = new URLSearchParams();

  if (filters.university) {
    params.set("university", filters.university);
  }

  if (filters.major) {
    params.set("major", filters.major);
  }

  const query = params.toString();

  return api.get<AdminDoctor[]>(
    `${API_ENDPOINTS.admin.doctors}${query ? `?${query}` : ""}`,
  );
}

export async function getAdminDoctorReviewDetails(
  doctorId: string,
  courseCode?: string,
): Promise<AdminDoctorReviewDetails> {
  if (useMockData) {
  return getAdminDoctorReviewDetailsMock(doctorId, courseCode);
}
  const params = new URLSearchParams();

  if (courseCode) {
    params.set("courseCode", courseCode);
  }

  const query = params.toString();

  return api.get<AdminDoctorReviewDetails>(
    `${API_ENDPOINTS.admin.doctorReviewDetails(doctorId)}${
      query ? `?${query}` : ""
    }`,
  );
}

export async function createAdminDoctor(
  input: CreateAdminDoctorInput,
): Promise<AdminDoctor> {
  return api.post<AdminDoctor>(API_ENDPOINTS.admin.doctors, input);
}

export async function deleteAdminDoctor(id: string): Promise<void> {
  return api.delete<void>(API_ENDPOINTS.admin.adminDoctor(id));
}
// =============================================
// مراجعات الدكاترة
// =============================================
export async function adminGetAllDoctorReviews(): Promise<AdminDoctorReview[]> {
  return api.get<AdminDoctorReview[]>(API_ENDPOINTS.admin.doctorReviews);
}

export async function adminDeleteDoctorReview(id: string): Promise<void> {
  return api.delete(API_ENDPOINTS.admin.adminDoctorReview(id));
}

// Fetches platform activity using the selected filters
export async function getPlatformActivityTrend(
  filters: PlatformActivityFilters,
): Promise<PlatformActivityTrendData> {
  //Mock Da
  if (useMockData) {
    return getPlatformActivityMock(filters);
  }
  const params = new URLSearchParams({
    metric: filters.metric,
    period: String(filters.period),
  });

  return api.get<PlatformActivityTrendData>(
    `${API_ENDPOINTS.admin.platformActivity}?${params.toString()}`,
  );
}
