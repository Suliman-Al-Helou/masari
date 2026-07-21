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
  description: string | null;
  teaching_language: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  reviews_count: number;
  rating_distribution: Record<1 | 2 | 3 | 4 | 5, number>;
  average_rating: number | null;
  average_difficulty: number | null;
  average_workload: number | null;
  average_content_quality: number | null;
  retake_percent: number | null;
  prerequisite_ids?: string[];
  prerequisites?: AdminCoursePrerequisite[];
};

export type AdminCoursePrerequisite = Pick<
  AdminCourse,
  "id" | "name" | "code"
>;

export type AdminCourseSort =
  | "created_desc"
  | "name_asc"
  | "code_asc"
  | "rating_desc"
  | "rating_asc"
  | "reviews_desc";

export type AdminCourseFilters = {
  university?: string;
  major?: string;
  semester?: string;
  year?: string;
  search?: string;
  sort?: AdminCourseSort;
  status?: "active" | "deleted";
  page?: number;
  pageSize?: number;
};

export type AdminCoursePage = {
  items: AdminCourse[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type AdminCourseReviewStatus = "published" | "hidden" | "rejected";

export type AdminCourseReviewItem = {
  id: string;
  rating_overall: number | null;
  rating_difficulty: number | null;
  rating_workload: number | null;
  content_quality: number | null;
  would_retake: boolean;
  review: string | null;
  tips: string | null;
  semester_taken: string | null;
  status: AdminCourseReviewStatus;
  created_at: string;
  student: {
    full_name: string;
    university: string | null;
  } | null;
};

export type AdminCourseDetails = {
  course: AdminCourse;
  reviews: AdminCourseReviewItem[];
  rating_distribution: Record<1 | 2 | 3 | 4 | 5, number>;
};

export type {
  CreateAdminCourseInput,
  UpdateAdminCourseInput,
} from "@/schemas/admin-course.schema";
export type AdminCourseReview = {
  id: string;
  admin_course_id: string | null;
  course_code: string;
  university: string | null;
  rating_overall: number;
  rating_difficulty: number;
  rating_workload: number;
  content_quality: number | null;
  status: AdminCourseReviewStatus;
  would_retake: boolean;
  review: string | null;
  created_at: string;
  profiles: {
    full_name: string;
    university: string | null;
  } | null;
  courses: {
    name: string;
    code: string | null;
  } | null;
};

export type AdminDoctorReview = {
  id: string;
  course_code: string;
  rating_overall: number;
  rating_clarity: number;
  rating_fairness: number;
  would_retake: boolean;
  review: string | null;
  created_at: string;
  profiles: {
    full_name: string;
    university: string | null;
  } | null;
  doctors: {
    name: string;
    title: string | null;
  } | null;
  courses: {
    name: string;
    code: string | null;
  } | null;
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
