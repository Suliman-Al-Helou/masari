"use client";

import { Fragment, useState } from "react";
import {
  BookOpen,
  Building2,
  ChevronDown,
  Pencil,
  Star,
  Trash2,
} from "lucide-react";

import type { AdminDoctor } from "@/types/admin";

type DisplayDoctor = AdminDoctor & {
  average_rating?: number | null;
  reviews_count?: number | null;
  courses?: Array<{
    code: string;
    name: string;
  }>;
};

interface DoctorsGroupedTableProps {
  grouped: Record<string, DisplayDoctor[]>;
  isLoading: boolean;
  hasActiveFilters: boolean;
  canAdd: boolean;
  onAdd: () => void;
  onDelete: (doctor: AdminDoctor) => void;
  onEdit?: (doctor: AdminDoctor) => void;
}

function getInitials(name: string): string {
  return name
    .replace(/^د\.|^دكتور\s*/i, "")
    .trim()
    .split(/\s+/)
    .map((word) => word[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("");
}

function formatDate(date: string): string {
  return new Intl.DateTimeFormat("ar", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

function getDoctorCourses(doctor: DisplayDoctor) {
  if (doctor.courses?.length) {
    return doctor.courses;
  }

  if (!doctor.course_code) {
    return [];
  }

  return [
    {
      code: doctor.course_code,
      name: doctor.course_name ?? doctor.course_code,
    },
  ];
}

function DoctorsTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="h-12 animate-pulse border-b border-border bg-muted/40 motion-reduce:animate-none" />

      <div className="divide-y divide-border">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="flex h-16 items-center gap-4 px-5"
          >
            <div className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-muted motion-reduce:animate-none" />

            <div className="flex-1 space-y-2">
              <div className="h-3 w-32 animate-pulse rounded bg-muted motion-reduce:animate-none" />
              <div className="h-2.5 w-20 animate-pulse rounded bg-muted motion-reduce:animate-none" />
            </div>

            <div className="hidden h-3 w-28 animate-pulse rounded bg-muted sm:block motion-reduce:animate-none" />
            <div className="hidden h-3 w-24 animate-pulse rounded bg-muted lg:block motion-reduce:animate-none" />
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
}: DoctorsGroupedTableProps) {
  const [collapsedUniversities, setCollapsedUniversities] = useState<
    Set<string>
  >(new Set());

  const [expandedDoctorId, setExpandedDoctorId] = useState<string | null>(
    null,
  );

  const universities = Object.entries(grouped);

  const toggleUniversity = (university: string) => {
    setCollapsedUniversities((current) => {
      const next = new Set(current);

      if (next.has(university)) {
        next.delete(university);
      } else {
        next.add(university);
      }

      return next;
    });
  };

  const toggleDoctor = (doctorId: string) => {
    setExpandedDoctorId((current) =>
      current === doctorId ? null : doctorId,
    );
  };

  if (isLoading) {
    return <DoctorsTableSkeleton />;
  }

  if (universities.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card px-6 py-16 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <Building2 aria-hidden="true" className="h-5 w-5" />
        </div>

        <h2 className="text-sm font-semibold text-foreground">
          لا يوجد دكاترة
        </h2>

        <p className="mt-1 text-xs text-muted-foreground">
          {hasActiveFilters
            ? "جرّب تغيير الفلاتر المستخدمة"
            : "ابدأ بإضافة أول دكتور"}
        </p>

        {!hasActiveFilters && canAdd && (
          <button
            type="button"
            onClick={onAdd}
            className="mt-4 text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            إضافة دكتور جديد
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      {universities.map(([university, doctors]) => {
        const isCollapsed = collapsedUniversities.has(university);

        return (
          <section
            key={university}
            aria-labelledby={`university-${university}`}
            className="border-b border-border last:border-b-0"
          >
            {/* عنوان الجامعة */}
            <button
              type="button"
              onClick={() => toggleUniversity(university)}
              aria-expanded={!isCollapsed}
              className="flex w-full items-center justify-between gap-4 bg-muted/20 px-4 py-3 text-start transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
            >
              <div className="flex min-w-0 items-center gap-2">
                <Building2
                  aria-hidden="true"
                  className="h-4 w-4 shrink-0 text-muted-foreground"
                />

                <h2
                  id={`university-${university}`}
                  className="truncate text-sm font-semibold text-foreground"
                >
                  {university}
                </h2>

                <span className="text-xs text-muted-foreground">
                  {doctors.length} دكتور
                </span>
              </div>

              <ChevronDown
                aria-hidden="true"
                className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform motion-reduce:transition-none ${
                  isCollapsed ? "rotate-90" : ""
                }`}
              />
            </button>

            {!isCollapsed && (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[860px] border-collapse">
                  <thead>
                    <tr className="border-y border-border bg-background/30 text-xs text-muted-foreground">
                      <th
                        scope="col"
                        className="px-4 py-3 text-start font-medium"
                      >
                        الدكتور
                      </th>

                      <th
                        scope="col"
                        className="px-4 py-3 text-start font-medium"
                      >
                        التخصص
                      </th>

                      <th
                        scope="col"
                        className="px-4 py-3 text-start font-medium"
                      >
                        المادة والكود
                      </th>

                      <th
                        scope="col"
                        className="px-4 py-3 text-start font-medium"
                      >
                        أُضيف في
                      </th>

                      <th
                        scope="col"
                        className="px-4 py-3 text-start font-medium"
                      >
                        التقييم
                      </th>

                      <th
                        scope="col"
                        className="w-28 px-4 py-3 text-start font-medium"
                      >
                        الإجراءات
                      </th>

                      <th scope="col" className="w-12 px-2 py-3">
                        <span className="sr-only">فتح التفاصيل</span>
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-border">
                    {doctors.map((doctor) => {
                      const isExpanded =
                        expandedDoctorId === doctor.id;

                      const courses = getDoctorCourses(doctor);

                      return (
                        <Fragment key={doctor.id}>
                          <tr className="transition-colors hover:bg-muted/20">
                            {/* الدكتور */}
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-xs font-semibold text-foreground">
                                  {getInitials(doctor.name)}
                                </div>

                                <p className="max-w-52 truncate text-sm font-semibold text-foreground">
                                  {doctor.name}
                                </p>
                              </div>
                            </td>

                            {/* التخصص */}
                            <td className="px-4 py-3 text-sm text-foreground">
                              {doctor.major}
                            </td>

                            {/* المادة */}
                            <td className="px-4 py-3">
                              {doctor.course_code ? (
                                <div className="flex items-center gap-2">
                                  <span className="rounded-lg border border-primary/20 bg-primary/10 px-2 py-1 text-xs text-primary">
                                    {doctor.course_name ??
                                      doctor.course_code}
                                  </span>

                                  <span
                                    dir="ltr"
                                    className="rounded-md bg-muted px-2 py-1 font-mono text-[10px] text-muted-foreground"
                                  >
                                    {doctor.course_code}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground">
                                  لا توجد مادة
                                </span>
                              )}
                            </td>

                            {/* التاريخ */}
                            <td className="px-4 py-3 text-xs text-muted-foreground">
                              {formatDate(doctor.created_at)}
                            </td>

                            {/* التقييم */}
                            <td className="px-4 py-3">
                              {doctor.average_rating != null ? (
                                <div className="flex items-center gap-1.5">
                                  <Star
                                    aria-hidden="true"
                                    className="h-4 w-4 fill-amber-400 text-amber-400"
                                  />

                                  <div>
                                    <p className="text-sm font-semibold text-foreground">
                                      {doctor.average_rating.toFixed(1)}
                                    </p>

                                    <p className="text-[10px] text-muted-foreground">
                                      {doctor.reviews_count ?? 0} تقييم
                                    </p>
                                  </div>
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground">
                                  —
                                </span>
                              )}
                            </td>

                            {/* الإجراءات */}
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1">
                                {onEdit && (
                                  <button
                                    type="button"
                                    onClick={() => onEdit(doctor)}
                                    aria-label={`تعديل بيانات ${doctor.name}`}
                                    className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-primary/20 px-2.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                  >
                                    <Pencil
                                      aria-hidden="true"
                                      className="h-3.5 w-3.5"
                                    />

                                    تعديل
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => onDelete(doctor)}
                                  aria-label={`حذف ${doctor.name}`}
                                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive"
                                >
                                  <Trash2
                                    aria-hidden="true"
                                    className="h-4 w-4"
                                  />
                                </button>
                              </div>
                            </td>

                            {/* فتح التفاصيل */}
                            <td className="px-2 py-3">
                              <button
                                type="button"
                                onClick={() => toggleDoctor(doctor.id)}
                                aria-expanded={isExpanded}
                                aria-controls={`doctor-details-${doctor.id}`}
                                aria-label={
                                  isExpanded
                                    ? `إغلاق تفاصيل ${doctor.name}`
                                    : `فتح تفاصيل ${doctor.name}`
                                }
                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                              >
                                <ChevronDown
                                  aria-hidden="true"
                                  className={`h-4 w-4 transition-transform motion-reduce:transition-none ${
                                    isExpanded ? "rotate-180" : ""
                                  }`}
                                />
                              </button>
                            </td>
                          </tr>

                          {/* التفاصيل المفتوحة */}
                          {isExpanded && (
                            <tr id={`doctor-details-${doctor.id}`}>
                              <td
                                colSpan={7}
                                className="bg-background/40 px-5 py-5"
                              >
                                <div className="grid gap-6 lg:grid-cols-2">
                                  <div>
                                    <div className="mb-3 flex items-center gap-2">
                                      <BookOpen
                                        aria-hidden="true"
                                        className="h-4 w-4 text-primary"
                                      />

                                      <h3 className="text-sm font-semibold text-foreground">
                                        المواد التي يدرّسها
                                      </h3>
                                    </div>

                                    {courses.length > 0 ? (
                                      <div className="flex flex-wrap gap-2">
                                        {courses.map((course) => (
                                          <div
                                            key={course.code}
                                            className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2"
                                          >
                                            <span className="text-xs text-foreground">
                                              {course.name}
                                            </span>

                                            <span
                                              dir="ltr"
                                              className="font-mono text-[10px] text-muted-foreground"
                                            >
                                              {course.code}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <p className="text-xs text-muted-foreground">
                                        لم تتم إضافة مواد لهذا الدكتور.
                                      </p>
                                    )}
                                  </div>

                                  <div>
                                    <div className="mb-3 flex items-center gap-2">
                                      <Star
                                        aria-hidden="true"
                                        className="h-4 w-4 text-amber-400"
                                      />

                                      <h3 className="text-sm font-semibold text-foreground">
                                        ملخص التقييمات
                                      </h3>
                                    </div>

                                    {doctor.average_rating != null ? (
                                      <div className="flex items-end gap-2">
                                        <span className="text-3xl font-bold text-foreground">
                                          {doctor.average_rating.toFixed(1)}
                                        </span>

                                        <span className="pb-1 text-xs text-muted-foreground">
                                          من 5 · {doctor.reviews_count ?? 0}{" "}
                                          تقييم
                                        </span>
                                      </div>
                                    ) : (
                                      <p className="text-xs text-muted-foreground">
                                        بيانات التقييم غير متوفرة حاليًا.
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}