"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { Plus, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
  useQueryStates,
} from "nuqs";

import AsyncErrorState from "@/components/share/AsyncErrorState";
import { AddCourseForm } from "./AddCourseForm";
import { CourseDeleteConfirm } from "./CourseDeleteConfirm";
import { CoursesEmptyState } from "./CoursesEmptyState";
import { CoursesFilters } from "./CoursesFilters";
import { CoursesGroupedTable } from "./CoursesGroupedTable";
import { CoursesMasterDetail } from "./CoursesMasterDetail";
import { CoursesPagination } from "./CoursesPagination";
import { CoursesTableSkeleton } from "./CoursesTableSkeleton";
import {
  CoursesViewSwitcher,
  type CoursesViewMode,
} from "./CoursesViewSwitcher";
import { EditCourseForm } from "./EditCourseForm";
import {
  useAdminCourse,
  useAdminCourses,
  useDeleteAdminCourse,
  useRestoreAdminCourse,
} from "@/lib/hooks/admin/query/useAdminCourses";
import { useToast } from "@/lib/context/ToastContext";
import { ADMIN_COURSE_SORTS } from "@/schemas/admin-course.schema";
import type { AdminCourse, AdminCourseSort } from "@/types/admin";

const VIEW_STORAGE_KEY = "masari:admin:courses:view";
const VIEW_CHANGE_EVENT = "masari:courses-view-change";

function subscribeToStoredView(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(VIEW_CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(VIEW_CHANGE_EVENT, callback);
  };
}

function getStoredView(): CoursesViewMode {
  const saved = window.localStorage.getItem(VIEW_STORAGE_KEY);
  return saved === "details" ? "details" : "table";
}

interface CoursesPageClientProps {
  isSuperAdmin: boolean;
}

export default function CoursesPageClient({
  isSuperAdmin,
}: CoursesPageClientProps) {
  const reduceMotion = useReducedMotion();
  const { Success, Error: showError } = useToast();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [courseToDelete, setCourseToDelete] = useState<AdminCourse | null>(null);
  const view = useSyncExternalStore<CoursesViewMode>(
    subscribeToStoredView,
    getStoredView,
    () => "table",
  );

  const [filters, setFilters] = useQueryStates({
    university: parseAsString.withDefault(""),
    major: parseAsString.withDefault(""),
    q: parseAsString.withDefault(""),
    sort: parseAsStringEnum<AdminCourseSort>([...ADMIN_COURSE_SORTS]).withDefault(
      "created_desc",
    ),
    status: parseAsStringEnum<"active" | "deleted">([
      "active",
      "deleted",
    ]).withDefault("active"),
    page: parseAsInteger.withDefault(1),
    course: parseAsString,
  });
  useEffect(() => {
    if (!isSuperAdmin && filters.status === "deleted") {
      void setFilters({ status: "active", page: 1 });
    }
  }, [filters.status, isSuperAdmin, setFilters]);

  const queryFilters = {
    university: filters.university || undefined,
    major: filters.major || undefined,
    search: filters.q || undefined,
    sort: filters.sort,
    status: filters.status,
    page: filters.page,
    pageSize: 10,
  } as const;
  const coursesQuery = useAdminCourses(queryFilters);
  const catalogQuery = useAdminCourses(
    { page: 1, pageSize: 100, sort: "name_asc", status: "active" },
    { enabled: showAddForm || Boolean(editingCourseId) },
  );
  const editingQuery = useAdminCourse(editingCourseId);
  const deleteMutation = useDeleteAdminCourse();
  const restoreMutation = useRestoreAdminCourse();

  const pageData = coursesQuery.data;
  const courses = useMemo(() => pageData?.items ?? [], [pageData?.items]);
  const formCourses = catalogQuery.data?.items ?? courses;
  const hasFilters = Boolean(filters.university || filters.major || filters.q);

  useEffect(() => {
    if (
      view === "details" &&
      courses.length > 0 &&
      !filters.course &&
      filters.status === "active"
    ) {
      void setFilters({ course: courses[0].id });
    }
  }, [courses, filters.course, filters.status, setFilters, view]);

  const changeView = (next: CoursesViewMode) => {
    window.localStorage.setItem(VIEW_STORAGE_KEY, next);
    window.dispatchEvent(new Event(VIEW_CHANGE_EVENT));
    if (next === "details" && courses[0]) {
      void setFilters({ course: filters.course ?? courses[0].id });
    }
  };

  const clearFilters = () => {
    void setFilters({
      university: "",
      major: "",
      q: "",
      sort: "created_desc",
      page: 1,
      course: null,
    });
  };

  const requestEdit = (course: AdminCourse) => {
    setShowAddForm(false);
    setEditingCourseId(course.id);
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  };

  const requestView = (course: AdminCourse) => {
    changeView("details");
    void setFilters({ course: course.id });
  };

  const removeCourse = async () => {
    if (!courseToDelete) return;
    try {
      await deleteMutation.mutateAsync(courseToDelete.id);
      Success("تم حذف المادة", "نُقلت المادة إلى المواد المحذوفة ويمكن استعادتها");
      setCourseToDelete(null);
      void setFilters({ course: null });
    } catch (error) {
      showError(
        "تعذر حذف المادة",
        error instanceof globalThis.Error ? error.message : undefined,
      );
    }
  };

  const restoreCourse = async (course: AdminCourse) => {
    try {
      await restoreMutation.mutateAsync(course.id);
      Success("تمت استعادة المادة", `${course.name} عادت إلى المواد النشطة`);
    } catch (error) {
      showError(
        "تعذر استعادة المادة",
        error instanceof globalThis.Error ? error.message : undefined,
      );
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">إدارة المواد</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {pageData ? `${pageData.total} مادة` : "جاري تحميل المواد..."}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingCourseId(null);
            setShowAddForm((current) => !current);
          }}
          aria-expanded={showAddForm}
          className={`inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-medium transition ${
            showAddForm
              ? "border border-border text-foreground hover:bg-muted"
              : "bg-primary text-primary-foreground hover:opacity-90"
          }`}
        >
          {showAddForm ? (
            <X aria-hidden="true" className="h-4 w-4" />
          ) : (
            <Plus aria-hidden="true" className="h-4 w-4" />
          )}
          {showAddForm ? "إغلاق" : "إضافة مادة"}
        </button>
      </header>

      <AnimatePresence initial={false} mode="wait">
        {showAddForm && (
          <motion.div
            key="add-course-form"
            initial={reduceMotion ? false : { opacity: 0, height: 0, y: -8 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, height: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <AddCourseForm
              courses={formCourses}
              onSuccess={() => {
                setShowAddForm(false);
                void setFilters({ page: 1, status: "active" });
              }}
              onCancel={() => setShowAddForm(false)}
            />
          </motion.div>
        )}

        {editingCourseId && (
          <motion.div
            key={`edit-${editingCourseId}`}
            initial={reduceMotion ? false : { opacity: 0, height: 0, y: -8 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, height: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            {editingQuery.isLoading ? (
              <div className="h-72 animate-pulse rounded-2xl bg-muted motion-reduce:animate-none" />
            ) : editingQuery.data ? (
              <EditCourseForm
                course={editingQuery.data}
                courses={formCourses}
                onSuccess={() => setEditingCourseId(null)}
                onCancel={() => setEditingCourseId(null)}
              />
            ) : (
              <AsyncErrorState
                title="تعذر تحميل بيانات المادة"
                description="أعد المحاولة قبل التعديل."
                onRetry={editingQuery.refetch}
                isRetrying={editingQuery.isFetching}
                className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5"
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <CoursesFilters
        key={filters.q}
        appliedSearch={filters.q}
        university={filters.university}
        major={filters.major}
        sort={filters.sort}
        status={filters.status}
        isSuperAdmin={isSuperAdmin}
        onApplySearch={(value) =>
          void setFilters({ q: value, page: 1, course: null })
        }
        onUniversityChange={(university) =>
          void setFilters({ university, major: "", page: 1, course: null })
        }
        onMajorChange={(major) => void setFilters({ major, page: 1, course: null })}
        onSortChange={(sort) => void setFilters({ sort, page: 1 })}
        onStatusChange={(status) => {
          void setFilters({ status, page: 1, course: null });
          if (status === "deleted") changeView("table");
        }}
        onClear={clearFilters}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          {coursesQuery.isFetching && !coursesQuery.isLoading
            ? "جاري تحديث النتائج..."
            : "يتم تطبيق البحث عند الضغط على بحث أو Enter"}
        </p>
        {filters.status === "active" && (
          <CoursesViewSwitcher value={view} onChange={changeView} />
        )}
      </div>

      {coursesQuery.isLoading ? (
        <CoursesTableSkeleton />
      ) : coursesQuery.isError ? (
        <AsyncErrorState
          title="تعذر تحميل المواد"
          description="تحقق من الاتصال ثم حاول مرة أخرى."
          onRetry={coursesQuery.refetch}
          isRetrying={coursesQuery.isFetching}
          className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6"
        />
      ) : courses.length === 0 ? (
        <CoursesEmptyState
          hasFilters={hasFilters}
          canAdd={filters.status === "active"}
          onAdd={() => setShowAddForm(true)}
          onClear={clearFilters}
        />
      ) : view === "table" || filters.status === "deleted" ? (
        <CoursesGroupedTable
          courses={courses}
          isSuperAdmin={isSuperAdmin}
          onEdit={requestEdit}
          onDelete={setCourseToDelete}
          onRestore={restoreCourse}
          onView={requestView}
        />
      ) : (
        <CoursesMasterDetail
          courses={courses}
          initialCourseId={filters.course}
          isSuperAdmin={isSuperAdmin}
          onEdit={requestEdit}
          onDelete={setCourseToDelete}
          onSelectedCourseChange={(course) => void setFilters({ course })}
        />
      )}

      {pageData && (
        <CoursesPagination
          page={pageData.page}
          totalPages={pageData.totalPages}
          total={pageData.total}
          pageSize={pageData.pageSize}
          onChange={(page) => void setFilters({ page, course: null })}
        />
      )}

      <AnimatePresence>
        {courseToDelete && (
          <CourseDeleteConfirm
            course={courseToDelete}
            isPending={deleteMutation.isPending}
            onConfirm={removeCourse}
            onCancel={() => setCourseToDelete(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
