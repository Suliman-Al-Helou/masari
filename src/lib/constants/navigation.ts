import {
  BookOpen,
  Calendar,
  GraduationCap,
  HeadphonesIcon,
  Home,
  LayoutDashboard,
  PlusCircle,
  Star,
  Users,
} from "lucide-react";

import type { NavigationGroup } from "@/types/navigation";

export const STUDENT_NAV_GROUPS = [
  {
    label: "الرئيسية",
    items: [
      {
        label: "الرئيسية",
        href: "/",
        icon: Home,
        match: "exact",
      },
      {
        label: "المسار الدراسي",
        href: "/academic-path",
        icon: BookOpen,
        match: "prefix",
      },
      {
        label: "مخطط الفصل",
        href: "/semester-plan",
        icon: Calendar,
        match: "prefix",
      },
      {
        label: "شبكة الطلاب",
        href: "/students",
        icon: GraduationCap,
        match: "prefix",
      },
      {
        label: "مركز الدعم",
        href: "/support",
        icon: HeadphonesIcon,
        match: "prefix",
      },
    ],
  },
] satisfies readonly NavigationGroup[];

export const ADMIN_NAV_GROUPS = [
  {
    items: [
      {
        label: "نظرة عامة",
        href: "/admin",
        icon: LayoutDashboard,
        match: "exact",
      },
      {
        label: "المستخدمون",
        href: "/admin/users",
        icon: Users,
        match: "prefix",
      },
    ],
  },
  {
    label: "المحتوى",
    items: [
      {
        label: "المواد",
        href: "/admin/courses",
        icon: PlusCircle,
        match: "prefix",
      },
      {
        label: "الدكاترة",
        href: "/admin/doctors",
        icon: PlusCircle,
        match: "prefix",
      },
      {
        label: "التقييمات",
        href: "/admin/reviews",
        icon: Star,
        match: "prefix",
      },
    ],
  },
] satisfies readonly NavigationGroup[];

// مؤقتًا حتى نعدّل Sidebar الطالب في الخطوة التالية
export const NAV_GROUPS = STUDENT_NAV_GROUPS;
export const FEATURES = [
  {
    label: "دليل المسار",
    icon: BookOpen,
    path: "/academic-path",
    color: "bg-primary/10 text-primary",
  },
  {
    label: "مخطط الفصل الذكي",
    icon: Calendar,
    path: "/semester-plan",
    color: "bg-info/10 text-info",
  },
  {
    label: "شبكة الطلاب",
    icon: Users,
    path: "/students",
    color: "bg-warning/10 text-warning",
  },
  {
    label: "الدعم",
    icon: HeadphonesIcon,
    path: "/support",
    color: "bg-destructive/10 text-destructive",
  },
] as const;