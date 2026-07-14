// مصدر واحد لكل مفاتيح React Query. ممنوع كتابة queryKey كمصفوفة يدوية بأي Component.
import type {
  StudentDistributionFilters,
  PlatformActivityFilters,
} from "@/types/admin";
export const queryKeys = {
  admin: {
    all: () => ["admin", "users"] as const,
    users: (search?: string) => ["admin", "users", search] as const,
    stats: () => ["admin", "stats"] as const,
    majorDistribution: () => ["admin", "major-distribution"] as const,
    universityDistribution: () => ["admin", "university-distribution"] as const,
    recentActivity: () => ["admin", "recent-activity"] as const,
    platformActivity: (filters: PlatformActivityFilters) =>
      ["admin", "platform-activity", filters] as const,
    studentDistribution: (filters: StudentDistributionFilters = {}) =>
      ["admin", "student-distribution", filters] as const,
    courses: (filters?: Record<string, string>) =>
      ["admin", "courses", filters] as const,
    courseReviews: () => ["admin", "course-reviews"] as const,
    doctorReviews: () => ["admin", "doctor-reviews"] as const,
  },
} as const;
