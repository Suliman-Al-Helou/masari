// src/lib/constants/semester-plan.ts

import { FileText, Code, BookOpen, CheckCircle, AlertTriangle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────
export type TaskType = 'واجب' | 'امتحان' | 'مشروع' | 'تسليم' | 'أخرى';
export type TaskStatus = 'قيد الانتظار' | 'قيد التنفيذ' | 'مكتمل';
export type TaskPriority = 'عادي' | 'متوسط' | 'عالي';
export type TabValue = 'all' | TaskStatus;

export interface Task {
  id: string;
  title: string;
  type: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: string;
  course_code?: string;
}

export interface TaskForm {
  title: string;
  type: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string;
  course_code: string;
}

// ─── Config Maps ─────────────────────────────────────────
export const TYPE_ICONS: Record<TaskType, LucideIcon> = {
  'واجب': FileText,
  'امتحان': AlertTriangle,
  'مشروع': Code,
  'تسليم': CheckCircle,
  'أخرى': BookOpen,
};

export const STATUS_STYLES: Record<TaskStatus, string> = {
  'قيد الانتظار': 'bg-slate-100 text-slate-600 border-slate-200',
  'قيد التنفيذ':  'bg-info/10 text-info border-info/20',
  'مكتمل':        'bg-success/10 text-success border-success/20',
};

export const PRIORITY_STYLES: Record<TaskPriority, string> = {
  'عادي':  'bg-slate-100 text-slate-500',
  'متوسط': 'bg-warning/10 text-warning',
  'عالي':  'bg-red-50 text-red-600',
};

export const TABS: { label: string; value: TabValue }[] = [
  { label: 'الكل',          value: 'all' },
  { label: 'قيد الانتظار', value: 'قيد الانتظار' },
  { label: 'قيد التنفيذ',  value: 'قيد التنفيذ' },
  { label: 'مكتمل',        value: 'مكتمل' },
];

export const TASK_TYPES: TaskType[] = ['واجب', 'امتحان', 'مشروع', 'تسليم', 'أخرى'];
export const TASK_PRIORITIES: TaskPriority[] = ['عادي', 'متوسط', 'عالي'];

export const DEFAULT_FORM: TaskForm = {
  title: '',
  type: 'واجب',
  status: 'قيد الانتظار',
  priority: 'عادي',
  due_date: '',
  course_code: '',
};

// ─── Status cycle ─────────────────────────────────────────
export function nextStatus(current: TaskStatus): TaskStatus {
  if (current === 'قيد الانتظار') return 'قيد التنفيذ';
  if (current === 'قيد التنفيذ')  return 'مكتمل';
  return 'قيد الانتظار';
}

// ─── Mock Data (يُستبدل بـ API لاحقاً) ───────────────────
export const MOCK_TASKS: Task[] = [
  { id: '1', title: 'تسليم مشروع قواعد البيانات', type: 'مشروع', status: 'قيد التنفيذ', priority: 'عالي', due_date: '2026-05-15', course_code: 'CS301' },
  { id: '2', title: 'واجب رياضيات - الفصل الثالث', type: 'واجب', status: 'قيد الانتظار', priority: 'متوسط', due_date: '2026-05-10', course_code: 'MATH201' },
  { id: '3', title: 'امتحان منتصف الفصل - شبكات', type: 'امتحان', status: 'قيد الانتظار', priority: 'عالي', due_date: '2026-05-20', course_code: 'CS302' },
  { id: '4', title: 'قراءة الفصل الخامس - خوارزميات', type: 'أخرى', status: 'مكتمل', priority: 'عادي', course_code: 'CS401' },
  { id: '5', title: 'تقرير مادة اللغة الإنجليزية', type: 'تسليم', status: 'مكتمل', priority: 'متوسط', due_date: '2026-05-01', course_code: 'ENG101' },
];