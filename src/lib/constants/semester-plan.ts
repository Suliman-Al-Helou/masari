// src/lib/constants/semester-plan.ts
import { FileText, Code, BookOpen, CheckCircle, AlertTriangle } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { Task, TaskType, TaskStatus, TaskPriority, TabValue, TaskForm } from '@/types'
import { TASK_STATUS_DB ,TASK_STATUS_LABEL } from './task-status'
// ─── Config Maps ─────────────────────────────────────────
export const TYPE_ICONS: Record<TaskType, LucideIcon> = {
  'واجب':   FileText,
  'امتحان': AlertTriangle,
  'مشروع':  Code,
  'تسليم':  CheckCircle,
  'أخرى':   BookOpen,
}

export const STATUS_STYLES: Record<TaskStatus, string> = {
   [TASK_STATUS_DB.PENDING]: 'bg-slate-100 text-slate-600 border-slate-200',
  [TASK_STATUS_DB.IN_PROGRESS]:  'bg-info/10 text-info border-info/20',
  [TASK_STATUS_DB.DONE]:        'bg-success/10 text-success border-success/20',
}

export const PRIORITY_STYLES: Record<TaskPriority, string> = {
  'عادي':  'bg-slate-100 text-slate-500',
  'متوسط': 'bg-warning/10 text-warning',
  'عالي':  'bg-red-50 text-red-600',
}

export const TABS: { label: string; value: TabValue }[] = [
  { label: 'الكل',          value: 'all' },
  { label: TASK_STATUS_LABEL[TASK_STATUS_DB.PENDING], value: TASK_STATUS_DB.PENDING },
  { label: TASK_STATUS_LABEL[TASK_STATUS_DB.IN_PROGRESS],  value: TASK_STATUS_DB.IN_PROGRESS },
  { label: TASK_STATUS_LABEL[TASK_STATUS_DB.DONE],        value: TASK_STATUS_DB.DONE },
]

export const TASK_TYPES: TaskType[]         = ['واجب', 'امتحان', 'مشروع', 'تسليم', 'أخرى']
export const TASK_PRIORITIES: TaskPriority[] = ['عادي', 'متوسط', 'عالي']

export const DEFAULT_FORM: TaskForm = {
  title: '',
  type: 'واجب',
  status: 'pending',
  priority: 'عادي',
  due_date: '',
  course_code: '',
}

// ─── Helper Function ──────────────────────────────────────
export function nextStatus(current: TaskStatus): TaskStatus {
  if (current === TASK_STATUS_DB.PENDING) return TASK_STATUS_DB.IN_PROGRESS
  if (current === TASK_STATUS_DB.IN_PROGRESS)  return TASK_STATUS_DB.DONE
  return TASK_STATUS_DB.PENDING
}

// ─── Mock Data (يُستبدل بـ API لاحقاً) ───────────────────
export const MOCK_TASKS: Task[] = [
  { id: '1', title: 'تسليم مشروع قواعد البيانات',      type: 'مشروع',  status: TASK_STATUS_DB.IN_PROGRESS,  priority: 'عالي',  due_date: '2026-05-15', course_code: 'CS301'  },
  { id: '2', title: 'واجب رياضيات - الفصل الثالث',     type: 'واجب',   status: TASK_STATUS_DB.PENDING, priority: 'متوسط', due_date: '2026-05-10', course_code: 'MATH201'},
  { id: '3', title: 'امتحان منتصف الفصل - شبكات',      type: 'امتحان', status: TASK_STATUS_DB.PENDING, priority: 'عالي',  due_date: '2026-05-20', course_code: 'CS302'  },
  { id: '4', title: 'قراءة الفصل الخامس - خوارزميات',  type: 'أخرى',   status: TASK_STATUS_DB.DONE,        priority: 'عادي',  course_code: 'CS401'  },
  { id: '5', title: 'تقرير مادة اللغة الإنجليزية',     type: 'تسليم',  status: TASK_STATUS_DB.DONE,        priority: 'متوسط', due_date: '2026-05-01', course_code: 'ENG101' },
]