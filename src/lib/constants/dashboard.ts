// src/lib/constants/dashboard.ts
// البيانات الثابتة فقط — لا types هون
import { GraduationCap, BookOpen, Clock, FileText, Code, CheckCircle, Target, Calendar } from 'lucide-react'
import type { Course, Note, Task } from '@/types'
import  {TASK_STATUS_DB}from "@/lib/constants/task-status"
// ─────────────────────────────────────────
// إحصائيات الهيدر
// ─────────────────────────────────────────
export const STATS = [
  { label: 'ساعة مكتملة',  value: '+200', icon: GraduationCap, color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
  { label: 'مادة ناجحة',   value: '12',   icon: BookOpen,      color: 'bg-blue-50 text-blue-600 border-blue-200' },
  { label: 'طالب مسجل',    value: '+500', icon: Clock,         color: 'bg-purple-50 text-purple-600 border-purple-200' },
]

export const QUICK_STATS = [
  { label: 'مادة مسجلة',         value: '14', icon: BookOpen,  color: 'bg-primary/10 text-primary' },
  { label: 'واجبات قيد الانتظار', value: '3',  icon: Target,   color: 'bg-warning/10 text-warning' },
  { label: 'يوم حتى الامتحان',   value: '8',  icon: Calendar,  color: 'bg-info/10 text-info' },
]

export const PROGRESS = 42

// ─────────────────────────────────────────
// المواد — مصدر واحد فقط
// ─────────────────────────────────────────
export const COURSES: Course[] = [
  { id: '1', name: 'خوارزميات',       code: 'CS301',   credits: 3, category: 'متطلب تخصص',  status: 'قيد الدراسة', grade: null  },
  { id: '2', name: 'رياضيات 1',       code: 'MATH101', credits: 3, category: 'متطلب جامعة', status: 'مكتملة',      grade: 'B+' },
  { id: '3', name: 'مقدمة CS',        code: 'CS101',   credits: 3, category: 'متطلب تخصص',  status: 'قيد الدراسة', grade: null  },
  { id: '4', name: 'قواعد البيانات',  code: 'CS201',   credits: 3, category: 'متطلب تخصص',  status: 'قيد الدراسة', grade: null  },
  { id: '5', name: 'شبكات الحاسوب',  code: 'CS401',   credits: 3, category: 'متطلب تخصص',  status: 'متبقية',      grade: null  },
  { id: '6', name: 'هندسة البرمجيات', code: 'CS402',  credits: 3, category: 'متطلب تخصص',  status: 'مخطط لها',    grade: null  },
  { id: '7', name: 'اللغة العربية',   code: 'AR101',   credits: 2, category: 'متطلب جامعة', status: 'مكتملة',      grade: 'A-' },
  { id: '8', name: 'فيزياء 1',        code: 'PHY101',  credits: 3, category: 'متطلب كلية',  status: 'متبقية',      grade: null  },
]

// بدل MOCK_COURSES_MAP — اشتق منه مباشرة
export const getCourseByCode = (code: string) =>
  COURSES.find(c => c.code === code) ?? null

export const getCourseById = (id: string) =>
  COURSES.find(c => c.id === id) ?? null

// ─────────────────────────────────────────
// المهام العاجلة
// ─────────────────────────────────────────
export const URGENT_TASKS: Task[] = [
  {
    id: '1',
    title:' واجب خوارزميات',
    type: 'واجب',
    course_code: 'CS301',
    priority: 'عالي',
    status:TASK_STATUS_DB.PENDING,
    due_date: new Date(Date.now() + 1000 * 60 * 60 * 10).toISOString(),
  },
  {
    id: '2',
    title: 'اختبار قواعد البيانات',
    course_code: 'CS201',
    type:'امتحان',
    priority: 'عالي',
    status:TASK_STATUS_DB.PENDING ,
    due_date: new Date(Date.now() + 1000 * 60 * 60 * 30).toISOString(),
  },
  
]

// ─────────────────────────────────────────
// الملاحظات
// ─────────────────────────────────────────
export const NOTES: Record<string, Note[]> = {
  CS301: [
    { id: '1', title: 'ملخص المحاضرة الأولى', content: 'الخوارزميات هي مجموعة من الخطوات...', course_code: 'CS301', tags: ['ملخص', 'مهم'], link: 'https://example.com', created_date: '2024-01-15' },
    { id: '2', title: 'تعقيد الخوارزميات',    content: 'Big O notation يستخدم لوصف الأداء...', course_code: 'CS301', tags: ['Big O'],          link: null,                  created_date: '2024-01-20' },
  ],
}

// ─────────────────────────────────────────
// إعدادات العرض — ألوان الحالة والتصنيف
// ─────────────────────────────────────────
export const STATUS_CONFIG: Record<string, { color: string }> = {
  'مكتملة':      { color: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  'قيد الدراسة': { color: 'bg-blue-50 text-blue-700 border border-blue-200' },
  'متبقية':      { color: 'bg-slate-50 text-slate-600 border border-slate-200' },
  'مخطط لها':    { color: 'bg-purple-50 text-purple-700 border border-purple-200' },
}
export const CATEGORY_COLORS: Record<string, string> = {
  'متطلب جامعة': 'bg-primary/10 text-primary',
  'متطلب كلية':  'bg-info/10 text-info',
  'متطلب تخصص':  'bg-success/10 text-success',
  'اختياري':     'bg-warning/10 text-warning',
}