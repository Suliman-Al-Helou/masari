// src/components/academic-path/AcademicProgress.tsx
"use client";

import { useState } from "react";
import { TrendingUp, BookCheck, BookOpen, Clock, ChevronRight, X } from "lucide-react";
import { calculateGPA } from "@/lib/gpa";
import type {Course} from '@/types';

type PanelType = "completed" | "inProgress" | "planned" | null;

// ── حساب حمل الساعات ──
function getCourseLoadInfo(hours: number) {
  if (hours < 12)
    return {
      color: "text-destructive",
      bar: "bg-destructive",
      bg: "bg-destructive/10",
      border: "border-destructive/30",
      label: "أقل من الحد الأدنى للتسجيل",
    };
  if (hours <= 18)
    return {
      color: "text-emerald-600",
      bar: "bg-emerald-500",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/30",
      label: "عدد ساعات مناسب ✓",
    };
  if (hours <= 22)
    return {
      color: "text-amber-600",
      bar: "bg-amber-500",
      bg: "bg-amber-500/10",
      border: "border-amber-500/30",
      label: "حمل ثقيل — يحتاج مجهود كبير",
    };
  return {
    color: "text-destructive",
    bar: "bg-destructive",
    bg: "bg-destructive/10",
    border: "border-destructive/30",
    label: "تجاوزت الحد المسموح (22 ساعة)",
  };
}

export default function AcademicProgress({
  courses,
  totalCredits = 132,
}: {
  courses: Course[];
  totalCredits?: number;
}) {
  const [activePanel, setActivePanel] = useState<PanelType>(null);

  const completed = courses.filter((c) => c.status === "مكتملة");
  const inProgress = courses.filter((c) => c.status === "قيد الدراسة");
  const planned = courses.filter((c) => c.status === "مخطط لها");

  const completedCredits = completed.reduce((s, c) => s + c.credits, 0);
  const plannedCredits = planned.reduce((s, c) => s + c.credits, 0);
  const inProgressCredits = inProgress.reduce((s, c) => s + c.credits, 0);
  const remainingCredits = Math.max(0, totalCredits - completedCredits);

  const currentLoad = inProgressCredits;
  const loadInfo = getCourseLoadInfo(currentLoad);
  const loadPercent = Math.min((currentLoad / 22) * 100, 100);

  const overallPercent = Math.round((completedCredits / totalCredits) * 100);
  const { gpa } = calculateGPA(courses);

  const gpaColor =
    gpa === null
      ? "text-muted-foreground"
      : gpa >= 3.5
        ? "text-emerald-600"
        : gpa >= 2.5
          ? "text-blue-600"
          : gpa >= 2.0
            ? "text-amber-600"
            : "text-destructive";

  const togglePanel = (panel: PanelType) =>
    setActivePanel((p) => (p === panel ? null : panel));

  const STAT_CARDS = [
    {
      key: "completed" as PanelType,
      label: "ساعات مكتملة",
      value: completedCredits,
      sub: `${completed.length} مادة`,
      icon: BookCheck,
      color: "text-emerald-600",
      bg: "bg-emerald-500/10",
    },
    {
      key: "inProgress" as PanelType,
      label: "قيد الدراسة",
      value: inProgressCredits,
      sub: `${inProgress.length} مادة`,
      icon: BookOpen,
      color: "text-blue-600",
      bg: "bg-blue-500/10",
    },
    {
      key: "planned" as PanelType,
      label: "ساعات مخططة",
      value: plannedCredits,
      sub: `${planned.length} مادة`,
      icon: Clock,
      color: "text-purple-600",
      bg: "bg-purple-500/10",
    },
    {
      key: null,
      label: "ساعات متبقية",
      value: remainingCredits,
      sub: `من ${totalCredits}`,
      icon: TrendingUp,
      color: "text-muted-foreground",
      bg: "bg-muted/50",
    },
  ];

  // المواد حسب الـ panel
  const panelCourses =
    activePanel === "completed"
      ? completed
      : activePanel === "inProgress"
        ? inProgress
        : activePanel === "planned"
          ? planned
          : [];

  const panelLabel =
    activePanel === "completed"
      ? "المواد المكتملة"
      : activePanel === "inProgress"
        ? "المواد قيد الدراسة"
        : "المواد المخططة";

  return (
    <div className="rounded-2xl bg-card border border-border/50 p-6 space-y-5">

      {/* ── الشريط العلوي: تقدم التخرج + GPA ── */}
      <div className="flex items-start gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">
              التقدم نحو التخرج
            </span>
            <span className="text-sm font-bold text-primary">
              {overallPercent}%
            </span>
          </div>
          <div className="h-2.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-700"
              style={{ width: `${overallPercent}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {completedCredits} من أصل {totalCredits} ساعة مكتملة
          </p>
        </div>

        <div className="flex flex-col items-center bg-muted/50 rounded-2xl px-4 py-2.5 min-w-[80px]">
          <span className="text-[11px] text-muted-foreground mb-1">المعدل</span>
          <span className={`text-2xl font-bold ${gpaColor}`}>
            {gpa !== null ? gpa.toFixed(2) : "—"}
          </span>
        </div>
      </div>

      {/* ── شريط حمل الساعات الحالي ── */}
      {currentLoad > 0 && (
        <div className={`rounded-xl border p-3.5 space-y-2 ${loadInfo.bg} ${loadInfo.border}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground">
              حمل الفصل الحالي
            </span>
            <span className={`text-xs font-bold ${loadInfo.color}`}>
              {currentLoad} ساعة
            </span>
          </div>
          <div className="h-2 bg-background/60 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${loadInfo.bar}`}
              style={{ width: `${loadPercent}%` }}
            />
          </div>
          <p className={`text-xs font-medium ${loadInfo.color}`}>
            {loadInfo.label}
          </p>
        </div>
      )}

      {/* ── البطاقات الأربعة ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {STAT_CARDS.map((card) => (
          <button
            key={card.label}
            onClick={() => card.key && togglePanel(card.key)}
            className={`flex flex-col items-center gap-1.5 p-3.5 rounded-xl border transition-all
              ${card.key ? "cursor-pointer hover:border-primary/40 hover:shadow-sm" : "cursor-default"}
              ${activePanel === card.key && card.key ? "border-primary/50 shadow-sm" : "border-border/50"}
              ${card.bg}
            `}
          >
            <card.icon className={`w-4 h-4 ${card.color}`} />
            <span className={`text-xl font-bold ${card.color}`}>
              {card.value}
            </span>
            <span className="text-[10px] text-muted-foreground text-center leading-tight">
              {card.label}
            </span>
            <span className="text-[10px] text-muted-foreground/60">
              {card.sub}
            </span>
            {card.key && (
              <ChevronRight
                className={`w-3 h-3 text-muted-foreground/40 transition-transform ${
                  activePanel === card.key ? "rotate-90" : ""
                }`}
              />
            )}
          </button>
        ))}
      </div>

      {/* ── Panel التفاصيل ── */}
      {activePanel && panelCourses.length > 0 && (
        <div className="rounded-xl border border-border/50 bg-background overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-muted/30">
            <span className="text-sm font-semibold text-foreground">
              {panelLabel} — {panelCourses.length} مادة
            </span>
            <button
              onClick={() => setActivePanel(null)}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
            >
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </div>

          {/* قائمة المواد */}
          <div className="divide-y divide-border/30 max-h-64 overflow-y-auto">
            {panelCourses.map((course) => (
              <div
                key={course.code}
                className="flex items-center justify-between px-4 py-2.5 hover:bg-muted/20 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {course.name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-mono text-muted-foreground" dir="ltr">
                      {course.code}
                    </span>
                    {course.year && (
                      <span className="text-[10px] text-muted-foreground/60">
                        {course.year}
                      </span>
                    )}
                    {course.grade && (
                      <span className="text-[10px] text-emerald-600 font-medium">
                        {course.grade}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-xs text-muted-foreground shrink-0 mr-2">
                  {course.credits} ساعة
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activePanel && panelCourses.length === 0 && (
        <p className="text-center text-sm text-muted-foreground py-4">
          لا توجد مواد في هذه الفئة
        </p>
      )}
    </div>
  );
}