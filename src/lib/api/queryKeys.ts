// // مصدر واحد لكل مفاتيح React Query. ممنوع كتابة queryKey كمصفوفة يدوية بأي Component.
// import type {
//   StudentDistributionFilters,
//   PlatformActivityFilters,
//   AdminUsersStatus,
//   AdminDoctorFilters,
//   AdminCourseFilters,
// } from "@/types/admin";
// export const queryKeys = {
//   admin: {
//     all: () => ["admin", "users"] as const,
//     users: (search: string, status: AdminUsersStatus) =>
//       ["admin", "users", { search, status }] as const,
//     stats: () => ["admin", "stats"] as const,
//     doctorsAll: () => ["admin", "doctors"] as const,
//     doctors: (filters: AdminDoctorFilters = {}) =>
//       ["admin", "doctors", filters] as const,
//     coursesAll: () => ["admin", "courses"] as const,
//     courses: (filters: AdminCourseFilters = {}) =>
//       ["admin", "courses", filters] as const,
//     course: (courseId: string) => ["admin", "courses", courseId] as const,
//     courseReviewDetails: (
//       courseId: string,
//       options?: { sort?: string; status?: string },
//     ) => ["admin", "courses", courseId, "reviews", options] as const,
//     doctorReviewDetails: (doctorId: string, courseCode?: string) =>
//       [
//         "admin",
//         "doctors",
//         doctorId,
//         "reviews",
//         { courseCode: courseCode ?? null },
//       ] as const,
//     courseReviews: () => ["admin", "course-reviews"] as const,
//     doctorReviews: () => ["admin", "doctor-reviews"] as const,
//     majorDistribution: () => ["admin", "major-distribution"] as const,
//     universityDistribution: () => ["admin", "university-distribution"] as const,
//     recentActivity: () => ["admin", "recent-activity"] as const,
//     platformActivity: (filters: PlatformActivityFilters) =>
//       ["admin", "platform-activity", filters] as const,
//     studentDistribution: (filters: StudentDistributionFilters = {}) =>
//       ["admin", "student-distribution", filters] as const,
//   },
// } as const;

// مصدر واحد لكل مفاتيح React Query. ممنوع كتابة queryKey كمصفوفة يدوية بأي Component.
import type {
  AdminCourseFilters,
  AdminDoctorFilters,
  AdminUsersStatus,
  PlatformActivityFilters,
  StudentDistributionFilters,
} from "@/types/admin";

export const queryKeys = {
  admin: {
    all: () => ["admin", "users"] as const,
    users: (search: string, status: AdminUsersStatus) =>
      ["admin", "users", { search, status }] as const,
    stats: () => ["admin", "stats"] as const,
    doctorsAll: () => ["admin", "doctors"] as const,
    doctors: (filters: AdminDoctorFilters = {}) =>
      ["admin", "doctors", filters] as const,
    coursesAll: () => ["admin", "courses"] as const,
    courses: (filters: AdminCourseFilters = {}) =>
      ["admin", "courses", filters] as const,
    course: (courseId: string) =>
      ["admin", "courses", courseId] as const,
    courseReviewDetails: (
      courseId: string,
      options?: { sort?: string; status?: string },
    ) =>
      [
        "admin",
        "courses",
        courseId,
        "reviews",
        options,
      ] as const,
    doctorReviewDetails: (
      doctorId: string,
      courseCode?: string,
    ) =>
      [
        "admin",
        "doctors",
        doctorId,
        "reviews",
        { courseCode: courseCode ?? null },
      ] as const,
    courseReviews: () =>
      ["admin", "course-reviews"] as const,
    doctorReviews: () =>
      ["admin", "doctor-reviews"] as const,
    majorDistribution: () =>
      ["admin", "major-distribution"] as const,
    universityDistribution: () =>
      ["admin", "university-distribution"] as const,
    recentActivity: () =>
      ["admin", "recent-activity"] as const,
    platformActivity: (
      filters: PlatformActivityFilters,
    ) =>
      ["admin", "platform-activity", filters] as const,
    studentDistribution: (
      filters: StudentDistributionFilters = {},
    ) =>
      [
        "admin",
        "student-distribution",
        filters,
      ] as const,
  },

  classroom: {
    all: () => ["google-classroom"] as const,
    status: () =>
      ["google-classroom", "status"] as const,
    tasks: () =>
      ["google-classroom", "tasks"] as const,
    task: (taskId: string) =>
      ["google-classroom", "tasks", taskId] as const,
  },
} as const;