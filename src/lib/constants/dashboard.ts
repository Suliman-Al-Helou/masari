// src/lib/constants/dashboard.ts
import {
  GraduationCap,
  BookOpen,
  Clock,
  FileText,
  Code,
  CheckCircle,
  Target,
  Calendar,
} from "lucide-react";

export type Note = {
  id: string;
  title: string;
  content: string;
  course_code: string;
  tags: string[];
  link: string | null;
  created_date: string;
};

export type Course = {
  id: string;
  name: string;
  code: string;
  credits: number;
  category: string;
  status: string;
  grade: string | null;
};

export const STATS = [
  {
    label: "ساعة مكتملة",
    value: "+200",
    icon: GraduationCap,
    color: "bg-emerald-50 text-emerald-600 border-emerald-200",
  },
  {
    label: "مادة ناجحة",
    value: "12",
    icon: BookOpen,
    color: "bg-blue-50 text-blue-600 border-blue-200",
  },
  {
    label: "طالب مسجل",
    value: "+500",
    icon: Clock,
    color: "bg-purple-50 text-purple-600 border-purple-200",
  },
];

export const COURSES = [
  {
    name: "خوارزميات",
    code: "CS301",
    color: "bg-primary text-primary-foreground",
  },
  { name: "رياضيات 1", code: "MATH101", color: "bg-info text-info-foreground" },
  {
    name: "مقدمة CS",
    code: "CS101",
    color: "bg-success text-success-foreground",
  },
  {
    name: "قواعد البيانات",
    code: "CS201",
    color: "bg-warning text-warning-foreground",
  },
];

export const TASKS = [
  {
    title: "تسليمات أولية",
    type: "واجب",
    course: "خوارزميات",
    icon: FileText,
    urgent: true,
  },
  {
    title: "مشروع خوارزميات",
    type: "مشروع",
    course: "CS301",
    icon: Code,
    urgent: false,
  },
  {
    title: "اختبار قواعد البيانات",
    type: "امتحان",
    course: "CS201",
    icon: CheckCircle,
    urgent: true,
  },
];

export const QUICK_STATS = [
  {
    label: "مادة مسجلة",
    value: "14",
    icon: BookOpen,
    color: "bg-primary/10 text-primary",
  },
  {
    label: "واجبات قيد الانتظار",
    value: "3",
    icon: Target,
    color: "bg-warning/10 text-warning",
  },
  {
    label: "يوم حتى الامتحان",
    value: "8",
    icon: Calendar,
    color: "bg-info/10 text-info",
  },
];

export const PROGRESS = 42;

// أضف هذا لـ src/lib/constants/dashboard.ts

export const ACADEMIC_COURSES = [
  {
    id: "1",
    name: "خوارزميات",
    code: "CS301",
    credits: 3,
    category: "متطلب تخصص",
    status: "مكتملة",
    grade: "A",
  },
  {
    id: "2",
    name: "رياضيات 1",
    code: "MATH101",
    credits: 3,
    category: "متطلب جامعة",
    status: "مكتملة",
    grade: "B+",
  },
  {
    id: "3",
    name: "مقدمة CS",
    code: "CS101",
    credits: 3,
    category: "متطلب تخصص",
    status: "قيد الدراسة",
    grade: null,
  },
  {
    id: "4",
    name: "قواعد البيانات",
    code: "CS201",
    credits: 3,
    category: "متطلب تخصص",
    status: "قيد الدراسة",
    grade: null,
  },
  {
    id: "5",
    name: "شبكات الحاسوب",
    code: "CS401",
    credits: 3,
    category: "متطلب تخصص",
    status: "متبقية",
    grade: null,
  },
  {
    id: "6",
    name: "هندسة البرمجيات",
    code: "CS402",
    credits: 3,
    category: "متطلب تخصص",
    status: "مخطط لها",
    grade: null,
  },
  {
    id: "7",
    name: "اللغة العربية",
    code: "AR101",
    credits: 2,
    category: "متطلب جامعة",
    status: "مكتملة",
    grade: "A-",
  },
  {
    id: "8",
    name: "فيزياء 1",
    code: "PHY101",
    credits: 3,
    category: "متطلب كلية",
    status: "متبقية",
    grade: null,
  },
];

export const STATUS_CONFIG = {
  مكتملة: { color: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  "قيد الدراسة": { color: "bg-blue-50 text-blue-700 border border-blue-200" },
  متبقية: { color: "bg-slate-50 text-slate-600 border border-slate-200" },
  "مخطط لها": {
    color: "bg-purple-50 text-purple-700 border border-purple-200",
  },
} as const;

export const CATEGORY_COLORS: Record<string, string> = {
  "متطلب جامعة": "bg-primary/10 text-primary",
  "متطلب كلية": "bg-info/10 text-info",
  "تخصص": "bg-success/10 text-success",
  اختياري: "bg-warning/10 text-warning",
};

export const URGENT_TASKS = [
  {
    id: "1",
    title: "تسليم مشروع خوارزميات",
    course_code: "CS301",
    priority: "عالي",
    status: "قيد الانتظار",
    due_date: new Date(Date.now() + 1000 * 60 * 60 * 10).toISOString(), // بعد 10 ساعات
  },
  {
    id: "2",
    title: "اختبار قواعد البيانات",
    course_code: "CS201",
    priority: "عالي",
    status: "قيد الانتظار",
    due_date: new Date(Date.now() + 1000 * 60 * 60 * 30).toISOString(), // بعد 30 ساعة
  },
];

export const MOCK_NOTES: Record<string, Note[]> = {
  CS301: [
    {
      id: "1",
      title: "ملخص المحاضرة الأولى",
      content: "الخوارزميات هي مجموعة من الخطوات المحددة لحل مشكلة معينة...",
      course_code: "CS301",
      tags: ["ملخص", "مهم"],
      link: "https://example.com",
      created_date: "2024-01-15",
    },
    {
      id: "2",
      title: "تعقيد الخوارزميات",
      content: "Big O notation يستخدم لوصف أداء الخوارزمية...",
      course_code: "CS301",
      tags: ["Big O"],
      link: null,
      created_date: "2024-01-20",
    },
  ],
};

export const MOCK_COURSES_MAP: Record<string, Course> = {
  "1": {
    id: "1",
    name: "خوارزميات",
    code: "CS301",
    credits: 3,
    category: "متطلب تخصص",
    status: "قيد الدراسة",
    grade: null,
  },
  "2": {
    id: "2",
    name: "رياضيات 1",
    code: "MATH101",
    credits: 3,
    category: "متطلب جامعة",
    status: "مكتملة",
    grade: "B+",
  },
  "3": {
    id: "3",
    name: "مقدمة CS",
    code: "CS101",
    credits: 3,
    category: "متطلب تخصص",
    status: "قيد الدراسة",
    grade: null,
  },
  "4": {
    id: "4",
    name: "قواعد البيانات",
    code: "CS201",
    credits: 3,
    category: "متطلب تخصص",
    status: "قيد الدراسة",
    grade: null,
  },
};
