// ============================================================
// src/types/index.ts
// Central types file — import all types from here only
// ============================================================
import type { LucideIcon } from "lucide-react";

// ─────────────────────────────────────────
// Auth & User
// ─────────────────────────────────────────
export type UserRole = "student" | "admin";

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
};

// ─────────────────────────────────────────
// Navigation (Sidebar)
// ─────────────────────────────────────────
export type {
  NavigationGroup,
  NavigationItem,
  NavigationMatch,
} from "./navigation";

// ─────────────────────────────────────────
// Notifications (TopBar)
// ─────────────────────────────────────────
export type NotificationType = "info" | "success" | "warning" | "error";

export type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  isRead: boolean;
  createdAt: string;
};

// ─────────────────────────────────────────
// API — Generic Responses
// ─────────────────────────────────────────
export type ApiResponse<T> = {
  data: T;
  success: boolean;
  message?: string;
};

export type PaginatedResponse<T> = ApiResponse<T[]> & {
  total: number;
  page: number;
  pageSize: number;
};

// ─────────────────────────────────────────
// Courses
// ─────────────────────────────────────────
export type CourseStatus = "مكتملة" | "قيد الدراسة" | "متبقية" | "مخطط لها";

export type Course = {
  id: string;
  name: string;
  code: string;
  credits: number;
  category: string;
  status: CourseStatus;
  grade: string | null;
  semester?: string | null; // ← أضف
  year?: string | null;
};

// ─────────────────────────────────────────
// Notes
// ─────────────────────────────────────────
export type Note = {
  id: string;
  title: string;
  content: string;
  course_code: string;
  tags: string[];
  link: string | null;
  created_date: string;
};

// ─────────────────────────────────────────
// Tasks
// ─────────────────────────────────────────
export type TaskType = "واجب" | "امتحان" | "مشروع" | "تسليم" | "أخرى";
export type TaskStatus = "pending" | "in_progress" | "done";
export type TaskPriority = "عادي" | "متوسط" | "عالي";
export type TabValue = "all" | TaskStatus;

export type Task = {
  id: string;
  title: string;
  type: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: string;
  course_code?: string;
};

export type TaskForm = {
  title: string;
  type: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string;
  course_code: string;
};

// ─────────────────────────────────────────
// Students & Network
// ─────────────────────────────────────────
export type Student = {
  id: string;
  full_name: string;
  major: string | null;
  university: string | null;
  semester: string | null;
  show_in_network?: boolean;
  email?: string;
  role?: UserRole;
  year?: number;
};

export type UserProfile = {
  id: string;
  full_name: string;
  university: string | null;
  major: string | null;
  semester: string | null;
  total_credits: number;
  onboarded: boolean;
  degree_type: string | null;
};

// ─────────────────────────────────────────
// Support Center
// ─────────────────────────────────────────
export type FAQ = {
  q: string;
  a: string;
};

export type SupportCategory = {
  label: string;
  icon: LucideIcon;
  color: string;
};

export type SupportForm = {
  subject: string;
  message: string;
  category: string;
};
