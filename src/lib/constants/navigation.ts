// src/lib/constants/navigation.ts
import { Home, BookOpen, Calendar, Users, HeadphonesIcon } from "lucide-react";

export const NAV_ITEMS = [
  { label: "الرئيسية", icon: Home, path: "/" },
  { label: "المسار الدراسي", icon: BookOpen, path: "/academic-path" },
  { label: "مخطط الفصل", icon: Calendar, path: "/semester-plan" },
  { label: "شبكة الطلاب", icon: Users, path: "/students" },
  { label: "مركز الدعم", icon: HeadphonesIcon, path: "/support" },
];

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
];
