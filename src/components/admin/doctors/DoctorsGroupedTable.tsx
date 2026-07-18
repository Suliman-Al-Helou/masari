"use client";

import { Fragment, useState } from "react";
import {
  BookOpen,
  Building2,
  ChevronDown,
  Eye,
  Pencil,
  Star,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { AdminDoctor } from "@/types/admin";

import { DoctorSpecialtyIcon } from "./DoctorSpecialtyIcon";
import { DoctorTableExpandedDetails } from "./DoctorTableExpandedDetails";

interface DoctorsGroupedTableProps {
  grouped: Record<string, AdminDoctor[]>;
  isLoading: boolean;
  hasActiveFilters: boolean;
  canAdd: boolean;
  onAdd: () => void;
  onDelete: (doctor: AdminDoctor) => void;
  onEdit: (doctor: AdminDoctor) => void;
  onView: (doctor: AdminDoctor, courseCode?: string) => void;
}

function formatDate(date: string): string {
  return new Intl.DateTimeFormat("ar", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

function formatCoursesCount(count: number): string {
  if (count === 0) return "لا توجد مواد";
  if (count === 1) return "مادة واحدة";
  if (count === 2) return "مادتان";
  if (count <= 10) return `${count} مواد`;
  return `${count} مادة`;
}

function getDoctorInitial(name: string): string {
  return name.replace(/^د\.?\s*/u, "").trim().charAt(0) || "د";
}

function DoctorsTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="h-14 animate-pulse border-b border-border bg-muted/40 motion-reduce:animate-none" />
      <div className="divide-y divide-border">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex h-20 items-center gap-4 px-5">
            <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-muted motion-reduce:animate-none" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-36 animate-pulse rounded bg-muted motion-reduce:animate-none" />
              <div className="h-3 w-24 animate-pulse rounded bg-muted motion-reduce:animate-none" />
            </div>
            <div className="hidden h-3 w-28 animate-pulse rounded bg-muted md:block motion-reduce:animate-none" />
            <div className="hidden h-9 w-24 animate-pulse rounded-xl bg-muted lg:block motion-reduce:animate-none" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DoctorsGroupedTable({
  grouped,
  isLoading,
  hasActiveFilters,
  canAdd,
  onAdd,
  onDelete,
  onEdit,
  onView,
}: DoctorsGroupedTableProps) {
  const shouldReduceMotion = useReducedMotion();
  const [collapsedUniversities, setCollapsedUniversities] = useState<Set<string>>(
    new Set(),
  );
  const [expandedDoctorId, setExpandedDoctorId] = useState<string | null>(null);

  const transition = {
    duration: shouldReduceMotion ? 0.01 : 0.28,
    ease: [0.22, 1, 0.36, 1] as const,
  };

  const universities = Object.entries(grouped);

  const toggleUniversity = (university: string) => {
    setCollapsedUniversities((current) => {
      const next = new Set(current);
      next.has(university) ? next.delete(university) : next.add(university);
      return next;
    });
  };

  const toggleDoctor = (doctorId: string) => {
    setExpandedDoctorId((current) => (current === doctorId ? null : doctorId));
  };

  if (isLoading) return <DoctorsTableSkeleton />;

  if (universities.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card px-6 py-16 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <Building2 aria-hidden="true" className="h-5 w-5" />
        </div>
        <h2 className="text-sm font-semibold text-foreground">لا يوجد دكاترة</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          {hasActiveFilters ? "جرّب تغيير الفلاتر المستخدمة" : "ابدأ بإضافة أول دكتور"}
        </p>
        {!hasActiveFilters && canAdd && (
          <button
            type="button"
            onClick={onAdd}
            className="mt-4 min-h-11 rounded-xl px-4 text-sm font-medium text-primary hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            إضافة دكتور جديد
          </button>
        )}
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={250}>
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {universities.map(([university, doctors]) => {
          const isCollapsed = collapsedUniversities.has(university);

          return (
            <section
              key={university}
              aria-labelledby={`university-${university}`}
              className="border-b border-border last:border-b-0"
            >
              <button
                type="button"
                onClick={() => toggleUniversity(university)}
                aria-expanded={!isCollapsed}
                aria-controls={`university-doctors-${university}`}
                className="flex min-h-14 w-full items-center justify-between gap-4 bg-muted/20 px-5 text-start transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <Building2 aria-hidden="true" className="h-5 w-5 shrink-0 text-muted-foreground" />
                  <h2
                    id={`university-${university}`}
                    className="truncate text-base font-bold text-foreground"
                  >
                    {university}
                  </h2>
                  <span className="text-xs text-muted-foreground">
                    {doctors.length} دكتور
                  </span>
                </div>
                <ChevronDown
                  aria-hidden="true"
                  className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 motion-reduce:transition-none ${
                    isCollapsed ? "rotate-90" : "rotate-180"
                  }`}
                />
              </button>

              <AnimatePresence initial={false}>
                {!isCollapsed && (
                  <motion.div
                    id={`university-doctors-${university}`}
                    key={`university-content-${university}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={transition}
                    className="overflow-hidden"
                  >
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[1120px] border-collapse">
                        <thead>
                          <tr className="border-y border-border bg-background/30 text-xs text-muted-foreground">
                            <th scope="col" className="px-5 py-3 text-start font-medium">الدكتور</th>
                            <th scope="col" className="px-4 py-3 text-start font-medium">التخصص</th>
                            <th scope="col" className="px-4 py-3 text-start font-medium">الجامعة</th>
                            <th scope="col" className="px-4 py-3 text-start font-medium">تاريخ الإضافة</th>
                            <th scope="col" className="px-4 py-3 text-start font-medium">التقييم</th>
                            <th scope="col" className="px-4 py-3 text-start font-medium">المواد</th>
                            <th scope="col" className="w-52 px-4 py-3 text-start font-medium">الإجراءات</th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-border">
                          {doctors.map((doctor) => {
                            const isExpanded = expandedDoctorId === doctor.id;
                            const courses = doctor.courses ?? [];

                            return (
                              <Fragment key={doctor.id}>
                                <tr className="transition-colors hover:bg-muted/20">
                                  <td className="px-5 py-3">
                                    <div className="flex items-center gap-3">
                                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-sm font-bold text-primary">
                                        {getDoctorInitial(doctor.name)}
                                      </span>
                                      <p className="max-w-52 truncate text-sm font-bold text-foreground">
                                        {doctor.name}
                                      </p>
                                    </div>
                                  </td>

                                  <td className="px-4 py-3">
                                    <div className="flex max-w-64 items-center gap-2.5">
                                      <DoctorSpecialtyIcon major={doctor.major} className="h-9 w-9" />
                                      <span className="truncate text-sm text-foreground">{doctor.major}</span>
                                    </div>
                                  </td>

                                  <td className="px-4 py-3 text-sm text-foreground">{doctor.university}</td>
                                  <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(doctor.created_at)}</td>

                                  <td className="px-4 py-3">
                                    {doctor.average_rating != null ? (
                                      <div className="flex items-start gap-2">
                                        <Star aria-hidden="true" className="mt-0.5 h-4 w-4 fill-warning text-warning" />
                                        <span>
                                          <span className="block text-sm font-bold tabular-nums text-foreground">
                                            {doctor.average_rating.toFixed(1)}
                                          </span>
                                          <span className="block text-xs text-muted-foreground">
                                            {doctor.reviews_count} تقييم
                                          </span>
                                        </span>
                                      </div>
                                    ) : (
                                      <span className="text-xs text-muted-foreground">لا يوجد تقييم</span>
                                    )}
                                  </td>

                                  <td className="px-4 py-3">
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <button
                                          type="button"
                                          onClick={() => toggleDoctor(doctor.id)}
                                          aria-expanded={isExpanded}
                                          aria-controls={`doctor-details-${doctor.id}`}
                                          className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-primary/25 bg-primary/10 px-3 text-xs font-medium text-primary transition-colors hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                        >
                                          <BookOpen aria-hidden="true" className="h-4 w-4" />
                                          {formatCoursesCount(courses.length)}
                                        </button>
                                      </TooltipTrigger>
                                      <TooltipContent side="top">اضغط لعرض المواد وملخص التقييمات</TooltipContent>
                                    </Tooltip>
                                  </td>

                                  <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                      <button
                                        type="button"
                                        onClick={() => toggleDoctor(doctor.id)}
                                        aria-expanded={isExpanded}
                                        aria-controls={`doctor-details-${doctor.id}`}
                                        aria-label={isExpanded ? `إغلاق ملخص ${doctor.name}` : `فتح ملخص ${doctor.name}`}
                                        className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                      >
                                        <ChevronDown
                                          aria-hidden="true"
                                          className={`h-4 w-4 transition-transform duration-300 motion-reduce:transition-none ${isExpanded ? "rotate-180" : ""}`}
                                        />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => onView(doctor)}
                                        aria-label={`عرض تفاصيل ${doctor.name}`}
                                        className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                      >
                                        <Eye aria-hidden="true" className="h-4 w-4" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => onEdit(doctor)}
                                        aria-label={`إدارة مواد ${doctor.name}`}
                                        className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-primary/25 text-primary transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                      >
                                        <Pencil aria-hidden="true" className="h-4 w-4" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => onDelete(doctor)}
                                        aria-label={`حذف ${doctor.name}`}
                                        className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive"
                                      >
                                        <Trash2 aria-hidden="true" className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>

                                <AnimatePresence initial={false}>
                                  {isExpanded && (
                                    <motion.tr
                                      key={`doctor-details-${doctor.id}`}
                                      id={`doctor-details-${doctor.id}`}
                                      initial={{ opacity: 0 }}
                                      animate={{ opacity: 1 }}
                                      exit={{ opacity: 0 }}
                                      transition={transition}
                                    >
                                      <td colSpan={7} className="bg-background/40 p-0">
                                        <motion.div
                                          initial={{ height: 0 }}
                                          animate={{ height: "auto" }}
                                          exit={{ height: 0 }}
                                          transition={transition}
                                          className="overflow-hidden"
                                        >
                                          <DoctorTableExpandedDetails doctor={doctor} onView={onView} />
                                        </motion.div>
                                      </td>
                                    </motion.tr>
                                  )}
                                </AnimatePresence>
                              </Fragment>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>
          );
        })}
      </div>
    </TooltipProvider>
  );
}