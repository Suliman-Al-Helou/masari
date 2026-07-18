"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { BookOpen, Check, Loader2, X } from "lucide-react";

import type { AdminCourse, AdminDoctor } from "@/types/admin";
import AsyncErrorState from "@/components/share/AsyncErrorState";
type DoctorWithCourses = AdminDoctor & {
  courses: Array<{
    code: string;
    name: string;
  }>;
};
interface EditDoctorCoursesFormProps {
  doctor: DoctorWithCourses;
  courses: AdminCourse[];
  isCoursesLoading: boolean;
  isCoursesError: boolean;
  isCoursesRetrying: boolean;
  onRetryCourses: () => void;
  onClose: () => void;
  onSave: (courseIds: string[]) => Promise<void>;
}

export function EditDoctorCoursesForm({
  doctor,
  courses,
  isCoursesLoading,
  isCoursesError,
  isCoursesRetrying,
  onRetryCourses,
  onClose,
  onSave,
}: EditDoctorCoursesFormProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const availableCourses = useMemo(
    () =>
      courses.filter(
        (course) =>
          course.university === doctor.university &&
          course.major === doctor.major,
      ),
    [courses, doctor.university, doctor.major],
  );

  const initialCourseIds = useMemo(
    () =>
      availableCourses
        .filter((course) =>
          doctor.courses.some(
            (doctorCourse) => doctorCourse.code === course.code,
          ),
        )
        .map((course) => course.id),
    [availableCourses, doctor.courses],
  );

  const [selectedCourseIds, setSelectedCourseIds] = useState<Set<string>>(
    new Set(),
  );

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const initialIdsKey = initialCourseIds.slice().sort().join(",");

  useEffect(() => {
    setSelectedCourseIds(new Set(initialCourseIds));
  }, [doctor.id, initialIdsKey]);

  useEffect(() => {
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSaving) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSaving, onClose]);

  const toggleCourse = (courseId: string) => {
    setSaveError("");

    setSelectedCourseIds((current) => {
      const next = new Set(current);

      if (next.has(courseId)) {
        next.delete(courseId);
      } else {
        next.add(courseId);
      }

      return next;
    });
  };

  const currentIdsKey = Array.from(selectedCourseIds).sort().join(",");
  const hasChanges = currentIdsKey !== initialIdsKey;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!hasChanges || isSaving) {
      return;
    }

    setIsSaving(true);
    setSaveError("");

    try {
      await onSave(Array.from(selectedCourseIds));
      onClose();
    } catch {
      setSaveError("تعذر حفظ مواد الدكتور. حاول مرة أخرى.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 px-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSaving) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-doctor-courses-title"
        aria-describedby="edit-doctor-courses-description"
        dir="rtl"
        className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xl"
      >
        {/* رأس النافذة */}
        <header className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <BookOpen aria-hidden="true" className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <h2
                id="edit-doctor-courses-title"
                className="truncate text-base font-bold text-foreground"
              >
                إدارة مواد الدكتور
              </h2>

              <p
                id="edit-doctor-courses-description"
                className="mt-1 truncate text-xs text-muted-foreground"
              >
                {doctor.name} · {doctor.university} · {doctor.major}
              </p>
            </div>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            disabled={isSaving}
            aria-label="إغلاق نافذة إدارة المواد"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50"
          >
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  المواد المتاحة
                </h3>

                <p className="mt-1 text-xs text-muted-foreground">
                  حدد جميع المواد التي يدرّسها الدكتور.
                </p>
              </div>

              <span className="rounded-md border border-primary/20 bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                {selectedCourseIds.size} محددة
              </span>
            </div>

            {isCoursesLoading ? (
              <div
                role="status"
                className="flex min-h-40 items-center justify-center gap-2 rounded-xl border border-border bg-muted/30 text-sm text-muted-foreground"
              >
                <Loader2
                  aria-hidden="true"
                  className="h-4 w-4 animate-spin motion-reduce:animate-none"
                />
                جاري تحميل المواد...
              </div>
            ) : isCoursesError ? (
              <AsyncErrorState
                title="تعذر تحميل المواد"
                description="تحقق من الاتصال ثم حاول مرة أخرى."
                onRetry={onRetryCourses}
                isRetrying={isCoursesRetrying}
                className="min-h-40 rounded-xl border border-destructive/30 bg-destructive/5 p-5"
              />
         ) : availableCourses.length === 0 ? (
  <div className="flex min-h-40 items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 px-4 text-center">
    <p className="text-sm text-muted-foreground">
      لا توجد مواد مرتبطة بهذه الجامعة والتخصص.
    </p>
  </div>
) : (
  <div className="grid gap-2 sm:grid-cols-2">
    {availableCourses.map((course) => {
      const isSelected = selectedCourseIds.has(course.id);

      return (
        <button
          key={course.id}
          type="button"
          aria-pressed={isSelected}
          onClick={() => toggleCourse(course.id)}
          className={`flex min-h-14 items-center justify-between gap-3 rounded-xl border px-4 py-3 text-start transition-colors ${
            isSelected
              ? "border-primary bg-primary/10 text-primary"
              : "border-border bg-background text-foreground"
          }`}
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{course.name}</p>

            <p
              dir="ltr"
              className="mt-1 text-start font-mono text-xs text-muted-foreground"
            >
              {course.code}
            </p>
          </div>

          <span
            aria-hidden="true"
            className={`flex h-6 w-6 items-center justify-center rounded-md border ${
              isSelected
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border"
            }`}
          >
            {isSelected && <Check className="h-4 w-4" />}
          </span>
        </button>
      );
    })}
  </div>
)}

            {saveError && (
              <p
                role="alert"
                className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
              >
                {saveError}
              </p>
            )}
          </div>

          {/* أزرار الإجراءات */}
          <footer className="flex flex-col-reverse gap-2 border-t border-border p-5 sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="inline-flex h-11 flex-1 items-center justify-center rounded-xl border border-border text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50"
            >
              إلغاء
            </button>

            <button
              type="submit"
              disabled={
                !hasChanges ||
                isSaving ||
                isCoursesLoading ||
                availableCourses.length === 0
              }
              aria-busy={isSaving}
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40"
            >
              {isSaving ? (
                <>
                  <Loader2
                    aria-hidden="true"
                    className="h-4 w-4 animate-spin motion-reduce:animate-none"
                  />
                  جاري الحفظ...
                </>
              ) : (
                "حفظ التغييرات"
              )}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}
