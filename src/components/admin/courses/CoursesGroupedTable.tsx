"use client";

import { Fragment, useState } from "react";
import {
  ChevronDown,
  Eye,
  Pencil,
  RotateCcw,
  Star,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import type { AdminCourse } from "@/types/admin";
import { CourseExpandedStats } from "./CourseExpandedStats";

interface CoursesGroupedTableProps {
  courses: AdminCourse[];
  isSuperAdmin: boolean;
  onEdit: (course: AdminCourse) => void;
  onDelete: (course: AdminCourse) => void;
  onRestore: (course: AdminCourse) => void;
  onView: (course: AdminCourse) => void;
}

type CourseGroups = Record<string, Record<string, AdminCourse[]>>;

function groupCourses(courses: AdminCourse[]): CourseGroups {
  return courses.reduce<CourseGroups>((groups, course) => {
    const university = course.university ?? "جامعة غير محددة";
    const major = course.major ?? "تخصص غير محدد";
    groups[university] ??= {};
    groups[university][major] ??= [];
    groups[university][major].push(course);
    return groups;
  }, {});
}

export function CoursesGroupedTable({
  courses,
  isSuperAdmin,
  onEdit,
  onDelete,
  onRestore,
  onView,
}: CoursesGroupedTableProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const reduceMotion = useReducedMotion();
  const groups = groupCourses(courses);

  const toggle = (courseId: string) => {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(courseId)) next.delete(courseId);
      else next.add(courseId);
      return next;
    });
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[850px] text-sm">
          <thead className="bg-muted/40 text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-right font-medium">المادة</th>
              <th className="px-4 py-3 text-right font-medium">الساعات</th>
              <th className="px-4 py-3 text-right font-medium">التصنيف</th>
              <th className="px-4 py-3 text-right font-medium">المستوى</th>
              <th className="px-4 py-3 text-right font-medium">التقييمات</th>
              <th className="px-4 py-3 text-right font-medium">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(groups).map(([university, majors]) => (
              <Fragment key={university}>
                <tr className="border-t border-border bg-primary/5">
                  <th colSpan={6} className="px-4 py-3 text-right font-semibold text-foreground">
                    {university}
                  </th>
                </tr>
                {Object.entries(majors).map(([major, majorCourses]) => (
                  <Fragment key={`${university}-${major}`}>
                    <tr className="border-t border-border bg-muted/20">
                      <th colSpan={6} className="px-6 py-2 text-right text-xs font-medium text-muted-foreground">
                        {major}
                      </th>
                    </tr>
                    {majorCourses.map((course) => {
                      const isExpanded = expanded.has(course.id);
                      return (
                        <Fragment key={course.id}>
                          <tr className="border-t border-border transition-colors hover:bg-muted/20">
                            <td className="px-4 py-3">
                              <div className="font-medium text-foreground">{course.name}</div>
                              <span dir="ltr" className="text-xs text-muted-foreground">
                                {course.code}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">{course.credits}</td>
                            <td className="px-4 py-3 text-muted-foreground">{course.category ?? "—"}</td>
                            <td className="px-4 py-3 text-muted-foreground">{course.year ?? "—"}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1.5">
                                <Star aria-hidden="true" className="h-4 w-4 fill-warning text-warning" />
                                <span className="font-medium text-foreground">
                                  {course.average_rating ?? "—"}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  ({course.reviews_count})
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1">
                                {course.deleted_at ? (
                                  isSuperAdmin && (
                                    <button
                                      type="button"
                                      onClick={() => onRestore(course)}
                                      aria-label={`استعادة ${course.name}`}
                                      title="استعادة المادة"
                                      className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-success hover:bg-success/10"
                                    >
                                      <RotateCcw aria-hidden="true" className="h-4 w-4" />
                                    </button>
                                  )
                                ) : (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => toggle(course.id)}
                                      aria-expanded={isExpanded}
                                      aria-controls={`course-stats-${course.id}`}
                                      aria-label={`فتح ملخص ${course.name}`}
                                      className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-primary"
                                    >
                                      <ChevronDown
                                        aria-hidden="true"
                                        className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                                      />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => onView(course)}
                                      aria-label={`عرض آراء ${course.name}`}
                                      title="عرض التفاصيل والآراء"
                                      className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-muted-foreground hover:bg-primary/10 hover:text-primary"
                                    >
                                      <Eye aria-hidden="true" className="h-4 w-4" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => onEdit(course)}
                                      aria-label={`تعديل ${course.name}`}
                                      title="تعديل المادة"
                                      className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-muted-foreground hover:bg-primary/10 hover:text-primary"
                                    >
                                      <Pencil aria-hidden="true" className="h-4 w-4" />
                                    </button>
                                    {isSuperAdmin && (
                                      <button
                                        type="button"
                                        onClick={() => onDelete(course)}
                                        aria-label={`حذف ${course.name}`}
                                        title="حذف المادة"
                                        className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                      >
                                        <Trash2 aria-hidden="true" className="h-4 w-4" />
                                      </button>
                                    )}
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                          <AnimatePresence initial={false}>
                            {isExpanded && !course.deleted_at && (
                              <motion.tr
                                key={`${course.id}-details`}
                                id={`course-stats-${course.id}`}
                                initial={reduceMotion ? false : { opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={reduceMotion ? undefined : { opacity: 0 }}
                              >
                                <td colSpan={6} className="p-0">
                                  <CourseExpandedStats
                                    course={course}
                                    onViewReviews={() => onView(course)}
                                  />
                                </td>
                              </motion.tr>
                            )}
                          </AnimatePresence>
                        </Fragment>
                      );
                    })}
                  </Fragment>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
