"use client";

import { useState } from "react";
import { ArrowRight, Search, Star } from "lucide-react";

import type { AdminCourse } from "@/types/admin";
import { CourseDetailsPanel } from "./CourseDetailsPanel";

interface CoursesMasterDetailProps {
  courses: AdminCourse[];
  initialCourseId?: string | null;
  isSuperAdmin: boolean;
  onEdit: (course: AdminCourse) => void;
  onDelete: (course: AdminCourse) => void;
  onSelectedCourseChange?: (courseId: string) => void;
}

export function CoursesMasterDetail({
  courses,
  initialCourseId,
  isSuperAdmin,
  onEdit,
  onDelete,
  onSelectedCourseChange,
}: CoursesMasterDetailProps) {
  const [search, setSearch] = useState("");
  const [mobileDetails, setMobileDetails] = useState(Boolean(initialCourseId));
  const selectedId = courses.some((course) => course.id === initialCourseId)
    ? initialCourseId
    : courses[0]?.id ?? null;

  const filtered = courses.filter((course) => {
    const value = search.trim().toLocaleLowerCase("ar");
    return (
      !value ||
      course.name.toLocaleLowerCase("ar").includes(value) ||
      course.code.toLocaleLowerCase("en").includes(value)
    );
  });
  const selected = courses.find((course) => course.id === selectedId) ?? null;

  const selectCourse = (courseId: string) => {
    setMobileDetails(true);
    onSelectedCourseChange?.(courseId);
  };

  return (
    <div className="grid min-h-[680px] overflow-hidden rounded-2xl border border-border bg-card xl:grid-cols-[340px_1fr]">
      <aside
        className={`${mobileDetails ? "hidden xl:block" : "block"} border-l border-border`}
        aria-label="قائمة المواد"
      >
        <div className="border-b border-border p-3">
          <div className="relative">
            <Search aria-hidden="true" className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="ابحث في المواد الظاهرة"
              className="h-11 w-full rounded-xl border border-border bg-background pr-10 pl-3 text-sm outline-none focus:border-primary"
            />
          </div>
        </div>
        <div className="max-h-[620px] overflow-y-auto">
          {filtered.map((course) => {
            const active = course.id === selectedId;
            return (
              <button
                key={course.id}
                type="button"
                onClick={() => selectCourse(course.id)}
                aria-current={active ? "true" : undefined}
                className={`relative flex w-full items-center gap-3 border-b border-border px-4 py-3 text-right transition ${
                  active ? "bg-primary/10" : "hover:bg-muted/30"
                }`}
              >
                {active && <span className="absolute inset-y-2 right-0 w-1 rounded-l bg-primary" />}
                <span dir="ltr" className="w-14 shrink-0 text-xs font-medium text-muted-foreground">
                  {course.code}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-foreground">
                    {course.name}
                  </span>
                  <span className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <Star aria-hidden="true" className="h-3.5 w-3.5 fill-warning text-warning" />
                    {course.average_rating ?? "—"} ({course.reviews_count})
                  </span>
                </span>
                <span className="text-xs text-muted-foreground">{course.credits} س</span>
              </button>
            );
          })}
        </div>
      </aside>

      <main className={`${mobileDetails ? "block" : "hidden xl:block"} min-w-0`}>
        <button
          type="button"
          onClick={() => setMobileDetails(false)}
          className="m-4 inline-flex min-h-11 items-center gap-2 rounded-xl border border-border px-3 text-sm text-foreground xl:hidden"
        >
          <ArrowRight aria-hidden="true" className="h-4 w-4" />
          العودة إلى المواد
        </button>
        {selected ? (
          <CourseDetailsPanel
            key={selected.id}
            course={selected}
            isSuperAdmin={isSuperAdmin}
            onEdit={() => onEdit(selected)}
            onDelete={() => onDelete(selected)}
          />
        ) : (
          <div className="flex min-h-[500px] items-center justify-center text-sm text-muted-foreground">
            اختر مادة لعرض تفاصيلها.
          </div>
        )}
      </main>
    </div>
  );
}
