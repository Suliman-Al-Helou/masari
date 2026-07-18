import type {
  PlatformActivityFilters,
  PlatformActivityMetric,
  PlatformActivityPeriod,
} from "@/schemas/admin-dashboard.schema";

export type {
  PlatformActivityFilters,
  PlatformActivityMetric,
  PlatformActivityPeriod,
};
export type AdminUsersStatus = "active" | "deleted";

export type AdminProfile = {
  id: string;
  full_name: string;
  email?: string;
  university: string | null;
  major: string | null;
  semester: string | null;
  role: "student" | "admin";
  onboarded: boolean;
  show_in_network: boolean;
  created_at: string;
  deleted_at: string | null;
  deletion_note: string | null;
  is_super_admin: boolean;
};

//* Stats Card Contain This Types
export interface AdminStatMetric {
  value: number;
  changePercent: number | null;
  trendData: number[];
}

//* stats of admin page
export interface AdminStats {
  totalStudents: number;
  students: AdminStatMetric;
  courses: AdminStatMetric;
  tasks: AdminStatMetric;
  notes: AdminStatMetric;
  messages: AdminStatMetric;
}

//* AdminActivity Feed Contain This Types
export type AdminActivityType =
  | "student_joined"
  | "course_created"
  | "doctor_created"
  | "course_review_created"
  | "doctor_review_created"
  | "user_deleted";

//* AdminActivity interface
export interface AdminActivity {
  id: string;
  type: AdminActivityType;
  title: string;
  description?: string;
  href?: string;
  actorName?: string;
  createdAt: string;
}

//* Number of students in each major
export type MajorDistribution = {
  major: string;
  count: number;
};

//* Number of students in each university
export type UniversityDistribution = {
  university: string;
  count: number;
};

//* Filters students by university or major
export type StudentDistributionFilters = {
  university?: string;
  major?: string;
};

//* Defines how student data is grouped
export type StudentDistributionGroupBy = "university" | "major" | "comparison";

//* Represents a single item in the distribution chart
export type StudentDistributionItem = {
  label: string;
  count: number;
  percentage: number;
};

//* Represents the final student distribution data
export type StudentDistributionData = {
  groupBy: StudentDistributionGroupBy;
  total: number;
  items: StudentDistributionItem[];
};

export type CreateAdminCourseInput = Omit<AdminCourse, "id" | "created_at">;

export type AdminCourse = {
  id: string;
  name: string;
  code: string;
  credits: number;
  category: string;
  semester: string | null;
  year: string | null;
  university: string | null;
  major: string | null;
  created_at: string;
};

export type AdminCourseReview = {
  id: string;
  rating: number;
  workload: number;
  difficulty: number;
  comment: string | null;
  created_at: string;
  profiles: { full_name: string; university: string | null };
  courses: { name: string; code: string | null };
};

export type AdminDoctorReview = {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  profiles: { full_name: string; university: string | null };
  doctors: { name: string; title: string | null };
  courses: { name: string; code: string | null };
};

export type NoteRow = {
  id: string;
  title: string;
  created_date: string | null;
  profiles: { full_name: string }[] | null;
};

export type TaskRow = {
  id: string;
  title: string;
  created_at: string;
  profiles: { full_name: string }[] | null;
};

export type CourseRow = {
  id: string;
  name: string;
  created_at: string;
  profiles: { full_name: string }[] | null;
};

//* A single comparison point in the activity chart
export interface PlatformActivityPoint {
  currentDate: string;
  previousDate: string;
  currentCount: number;
  previousCount: number;
}

//* Platform activity trend chart data
export interface PlatformActivityTrendData {
  metric: PlatformActivityMetric;
  period: PlatformActivityPeriod;
  currentTotal: number;
  previousTotal: number;
  changePercent: number | null;
  points: PlatformActivityPoint[];
}

export type AdminDoctorCourse = {
  id: string;
  code: string;
  name: string;
};
//Doctore Type
export type AdminDoctor = {
  id: string;
  name: string;
  university: string;
  major: string;
  courses: AdminDoctorCourse[];
  average_rating: number | null;
  reviews_count: number;
  created_at: string;
};
export type AdminDoctorReviewItem = {
  id: string;
  course_code: string;
  rating_overall: number;
  rating_clarity: number;
  rating_fairness: number;
  would_retake: boolean;
  review: string | null;
  created_at: string;
  student: {
    full_name: string;
    university: string | null;
  };
};

export type AdminDoctorReviewStats = {
  count: number;
  avg_overall: number;
  avg_clarity: number;
  avg_fairness: number;
  retake_percent: number;
};

export type AdminDoctorReviewDetails = {
  doctor: AdminDoctor;
  selected_course: AdminDoctorCourse | null;
  stats: AdminDoctorReviewStats;
  reviews: AdminDoctorReviewItem[];
};

export type { CreateAdminDoctorInput } from "@/schemas/admin-doctor.schema";

export type AdminDoctorFilters = {
  university?: string;
  major?: string;
};
