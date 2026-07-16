"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/lib/context/ToastContext";
import { UNIVERSITIES, MAJORS } from "@/lib/constants/academic";
import {
  getAdminDoctors,
  deleteAdminDoctor,
  getAdminCourses,
} from "@/lib/api/admin";
import CustomSelect from "@/components/ui/CustomSelect";
import DoctorsGroupedTable from "./DoctorsGroupedTable";
import { DeleteConfirm } from "@/components/admin/doctors/DeleteConfirm";
import type { AdminDoctor } from "@/types/admin";
import { AddDoctorForm } from "@/components/admin/doctors/AddDoctorForm";
import { queryKeys } from "@/lib/api/queryKeys";
type DoctorExtended = AdminDoctor;

// ─── نوع الدكتور الموسّع ─────────────────────────────────────────────────────
// ملاحظة: تأكد من إضافة العمودين course_code و course_name في جدول doctors بـ Supabase

// ─── بطاقة الدكتور ────────────────────────────────────────────────────────────

// ─── الصفحة الرئيسية ──────────────────────────────────────────────────────────
export default function AdminDoctorsPage() {
  const { data: courses = [], isLoading: isCoursesLoading } = useQuery({
    queryKey: queryKeys.admin.courses(),
    queryFn: () => getAdminCourses(),
    staleTime: 1000 * 60 * 5,
  });

  const queryClient = useQueryClient();
  const { Success, Error } = useToast();

  const [search, setSearch] = useState("");
  const [uniFilter, setUniFilter] = useState("");
  const [majorFilter, setMajorFilter] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [toDelete, setToDelete] = useState<DoctorExtended | null>(null);
  const [showForm, setShowForm] = useState(false);

  // ── جلب الدكاترة ──
  const { data: doctors = [], isLoading } = useQuery({
    queryKey: queryKeys.admin.doctors({
      university: uniFilter || undefined,
      major: majorFilter || undefined,
    }),
    queryFn: () =>
      getAdminDoctors({
        university: uniFilter || undefined,
        major: majorFilter || undefined,
      }),
    staleTime: 1000 * 60,
  });

  // المواد المتاحة بناءً على التخصص المختار
  const availableCoursesForFilter = useMemo(() => {
    if (!majorFilter) return [];

    return courses.filter(
      (course) =>
        course.major === majorFilter &&
        (!uniFilter || course.university === uniFilter),
    );
  }, [courses, majorFilter, uniFilter]);

  // فلتر محلي: بحث + مادة
  const filtered = useMemo(
    () =>
      (doctors as DoctorExtended[]).filter((d) => {
        const matchSearch = search.trim()
          ? d.name.includes(search.trim())
          : true;
        const matchCourse = courseFilter
          ? (d as DoctorExtended).course_code === courseFilter
          : true;
        return matchSearch && matchCourse;
      }),
    [doctors, search, courseFilter],
  );

  // تجميع حسب الجامعة
  const grouped = useMemo(
    () =>
      filtered.reduce<Record<string, DoctorExtended[]>>((acc, d) => {
        const key = d.university;
        acc[key] = [...(acc[key] ?? []), d];
        return acc;
      }, {}),
    [filtered],
  );

  // ── حذف ──
const deleteMutation = useMutation({
  meta: { silent: true },

  mutationFn: (id: string) => deleteAdminDoctor(id),

  onSuccess: () => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.admin.doctorsAll(),
    });

    Success("تم الحذف", "تم حذف الدكتور بنجاح");
    setToDelete(null);
  },

  onError: () => {
    Error("خطأ", "فشل حذف الدكتور");
  },
});

  return (
    <div className="space-y-6" dir="rtl">
      {/* ── رأس الصفحة ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">الدكاترة</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isLoading ? "..." : `${filtered.length} دكتور`}
          </p>
        </div>
        <button
          onClick={() => setShowForm((p) => !p)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            showForm
              ? "border border-border text-muted-foreground hover:bg-muted"
              : "bg-primary text-primary-foreground hover:opacity-90"
          }`}
        >
          {showForm ? (
            <>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              إغلاق
            </>
          ) : (
            <>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              دكتور جديد
            </>
          )}
        </button>
      </div>

      {/* ── فورم الإضافة ── */}
      {showForm && <AddDoctorForm onSuccess={() => setShowForm(false)} />}

      {/* ── فلاتر ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* بحث */}
        <div className="relative">
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="ابحث باسم الدكتور..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-card border border-border rounded-xl pr-10 pl-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* الجامعة */}
        <CustomSelect
          value={uniFilter}
          onChange={setUniFilter}
          options={UNIVERSITIES}
          placeholder="كل الجامعات"
          ariaLabel="تصفية الدكاترة حسب الجامعة"
        />

        {/* التخصص */}
        <CustomSelect
          value={majorFilter}
          onChange={(value) => {
            setMajorFilter(value);
            setCourseFilter("");
          }}
          options={MAJORS}
          placeholder="كل التخصصات"
          ariaLabel="تصفية الدكاترة حسب التخصص"
        />

        {/* المادة */}
        <CustomSelect
          value={courseFilter}
          onChange={setCourseFilter}
          options={availableCoursesForFilter.map((course) => ({
            value: course.code,
            label: `${course.name} (${course.code})`,
          }))}
          placeholder={
            isCoursesLoading
              ? "جاري تحميل المواد..."
              : majorFilter
                ? "كل المواد"
                : "اختر التخصص أولاً"
          }
          ariaLabel="تصفية الدكاترة حسب المادة"
          disabled={isCoursesLoading || availableCoursesForFilter.length === 0}
        />
      </div>

      {/* فلاتر نشطة */}
      {(uniFilter || majorFilter || courseFilter || search) && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">فلاتر نشطة:</span>
          {[
            { label: uniFilter, clear: () => setUniFilter("") },
            {
              label: majorFilter,
              clear: () => {
                setMajorFilter("");
                setCourseFilter("");
              },
            },
            { label: courseFilter, clear: () => setCourseFilter("") },
            { label: search ? `"${search}"` : "", clear: () => setSearch("") },
          ]
            .filter((f) => f.label)
            .map((f, i) => (
              <button
                key={i}
                onClick={f.clear}
                className="flex items-center gap-1.5 bg-primary/10 text-primary text-xs px-2.5 py-1 rounded-full hover:bg-primary/20 transition-colors"
              >
                {f.label}
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            ))}
          <button
            onClick={() => {
              setUniFilter("");
              setMajorFilter("");
              setCourseFilter("");
              setSearch("");
            }}
            className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
          >
            مسح الكل
          </button>
        </div>
      )}

      <DoctorsGroupedTable
        grouped={grouped}
        isLoading={isLoading}
        hasActiveFilters={Boolean(
          search || uniFilter || majorFilter || courseFilter,
        )}
        canAdd={!showForm}
        onAdd={() => setShowForm(true)}
        onDelete={setToDelete}
      />

      {/* ── حوار الحذف ── */}
      {toDelete && (
        <DeleteConfirm
          doctor={toDelete}
          onConfirm={() => deleteMutation.mutate(toDelete.id)}
          onCancel={() => setToDelete(null)}
          loading={deleteMutation.isPending}
        />
      )}
    </div>
  );
}
