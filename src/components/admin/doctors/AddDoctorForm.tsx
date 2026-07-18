"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/lib/context/ToastContext";
import { UNIVERSITIES, getMajorsForUniversity } from "@/lib/constants/academic";
import { createAdminDoctor, getAdminCourses } from "@/lib/api/admin";
import CustomSelect from "@/components/ui/CustomSelect";
import { queryKeys } from "@/lib/api/queryKeys";
import { Search } from "lucide-react";

function normalizeCourseSearch(value: string): string {
  return value.trim().toLocaleLowerCase("ar").replace(/\s+/g, " ");
}
// ─── فورم الإضافة ─────────────────────────────────────────────────────────────
export function AddDoctorForm({ onSuccess }: { onSuccess: () => void }) {
  const queryClient = useQueryClient();
  const { Success, Error } = useToast();
  const [courseSearch, setCourseSearch] = useState("");
  const [form, setForm] = useState({
    name: "",
    university: "",
    major: "",
    course_ids: [] as string[],
  });

  const set = (k: keyof typeof form, v: string) =>
    setForm((p) => ({ ...p, [k]: v }));

  const availableMajors = useMemo(
    () => (form.university ? getMajorsForUniversity(form.university) : []),
    [form.university],
  );

  const {
    data: courses = [],
    isLoading: isCoursesLoading,
    isError: isCoursesError,
    refetch: refetchCourses,
  } = useQuery({
    queryKey: queryKeys.admin.courses({
      university: form.university,
      major: form.major,
    }),
    queryFn: () =>
      getAdminCourses({
        university: form.university,
        major: form.major,
      }),
    enabled: Boolean(form.university && form.major),
    staleTime: 1000 * 60 * 5,
  });

  // Keep filtering locally in case the API returns all courses.
  const availableCourses = useMemo(
    () =>
      courses.filter(
        (course) =>
          course.university === form.university && course.major === form.major,
      ),
    [courses, form.university, form.major],
  );
  const filteredCourses = useMemo(() => {
    const query = normalizeCourseSearch(courseSearch);

    if (!query) {
      return availableCourses;
    }

    return availableCourses.filter((course) =>
      normalizeCourseSearch(`${course.name} ${course.code}`).includes(query),
    );
  }, [availableCourses, courseSearch]);

  const selectedCourses = useMemo(
    () =>
      availableCourses.filter((course) => form.course_ids.includes(course.id)),
    [availableCourses, form.course_ids],
  );
  const handleUniversityChange = (university: string) => {
    setForm((previous) => ({
      ...previous,
      university,
      major: "",
      course_ids: [],
    }));

    setCourseSearch("");
  };

  // عند تغيير التخصص نمسح المادة
  const handleMajorChange = (major: string) => {
    setForm((previous) => ({
      ...previous,
      major,
      course_ids: [],
    }));

    setCourseSearch("");
  };

  // عند اختيار مادة نملأ الاسم والكود معاً
  const handleCourseToggle = (courseId: string) => {
    setForm((previous) => ({
      ...previous,
      course_ids: previous.course_ids.includes(courseId)
        ? previous.course_ids.filter((id) => id !== courseId)
        : [...previous.course_ids, courseId],
    }));
  };

  const mutation = useMutation({
    meta: { silent: true },

    mutationFn: () =>
      createAdminDoctor({
        name: form.name.trim(),
        university: form.university,
        major: form.major,
        course_ids: form.course_ids,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.doctorsAll(),
      });
      Success("تمت الإضافة ✅", `د. ${form.name} أُضيف بنجاح`);
      setForm({
        name: "",
        university: "",
        major: "",
        course_ids: [],
      });
      onSuccess();
    },
    onError: () => Error("خطأ", "فشل في إضافة الدكتور، حاول مجدداً"),
  });

  const steps = [
    { label: "الاسم", done: !!form.name.trim() },
    { label: "الجامعة", done: !!form.university },
    { label: "التخصص", done: !!form.major },
    { label: "المادة", done: form.course_ids.length > 0 },
  ];

  const canSubmit =
    form.name.trim() &&
    form.university &&
    form.major &&
    form.course_ids.length > 0;

  return (
    <div className="bg-card border border-border rounded-2xl overflow-visible">
      {/* شريط التقدم */}
      <div className="flex border-b border-border">
        {steps.map((s, i) => (
          <div
            key={s.label}
            className="flex-1 flex items-center gap-1.5 px-3 py-2.5"
          >
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold flex-shrink-0 transition-colors ${
                s.done
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {s.done ? (
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
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                i + 1
              )}
            </div>
            <span
              className={`text-xs hidden sm:block ${s.done ? "text-foreground font-medium" : "text-muted-foreground"}`}
            >
              {s.label}
            </span>
          </div>
        ))}
      </div>
      <div className="p-5 space-y-4">
        <p className="text-xs text-muted-foreground">
          أضف دكتوراً جديداً وارتبطه بجامعة وتخصص ومادة محددة.
        </p>

        {/* اسم الدكتور */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">
            اسم الدكتور <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="مثال: د. محمد أبو خضير"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              className="w-full bg-background border border-border rounded-xl pr-10 pl-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        {/* الصف الثاني: الجامعة + التخصص */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* الجامعة */}
          <div className="space-y-1.5">
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
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </span>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  الجامعة <span className="text-destructive">*</span>
                </label>
                <CustomSelect
                  value={form.university}
                  onChange={handleUniversityChange}
                  options={UNIVERSITIES}
                  placeholder="اختر الجامعة"
                  ariaLabel="اختيار الجامعة"
                />
              </div>
            </div>
          </div>

          {/* التخصص */}
          <div className="space-y-1.5">
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
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
              </span>
              {/* التخصص */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  التخصص <span className="text-destructive">*</span>
                </label>

                <CustomSelect
                  value={form.major}
                  onChange={handleMajorChange}
                  options={availableMajors}
                  placeholder={
                    form.university ? "اختر التخصص" : "اختر الجامعة أولاً"
                  }
                  ariaLabel="اختيار التخصص"
                  disabled={!form.university}
                />
              </div>
            </div>
          </div>
        </div>

        {/* المادة */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">
            المادة الدراسية <span className="text-destructive">*</span>
          </label>
          {form.university && form.major && (
            <div className="space-y-2">
              <div className="relative">
                <label htmlFor="add-doctor-course-search" className="sr-only">
                  البحث باسم المادة أو كودها
                </label>

                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                />

                <input
                  id="add-doctor-course-search"
                  type="search"
                  value={courseSearch}
                  onChange={(event) => setCourseSearch(event.target.value)}
                  placeholder="ابحث باسم المادة أو كودها..."
                  autoComplete="off"
                  disabled={
                    isCoursesLoading ||
                    isCoursesError ||
                    availableCourses.length === 0
                  }
                  className="h-11 w-full rounded-xl border border-border bg-background ps-11 pe-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              {form.course_ids.length > 0 && (
                <p className="text-xs text-primary">
                  تم تحديد {form.course_ids.length} مادة
                </p>
              )}
            </div>
          )}
          {!form.university || !form.major ? (
            <div className="bg-muted/40 border border-dashed border-border rounded-xl px-4 py-3 flex items-center gap-2 text-muted-foreground">
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
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span className="text-xs">
                اختر الجامعة والتخصص أولاً لتظهر المواد المتاحة
              </span>
            </div>
          ) : isCoursesLoading ? (
            <div
              role="status"
              className="rounded-xl border border-border bg-muted/40 px-4 py-3 text-xs text-muted-foreground"
            >
              جاري تحميل المواد...
            </div>
          ) : isCoursesError ? (
            <div
              role="alert"
              className="flex items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3"
            >
              <span className="text-xs text-destructive">
                تعذر تحميل المواد
              </span>

              <button
                type="button"
                onClick={() => refetchCourses()}
                className="text-xs font-medium text-destructive underline underline-offset-2"
              >
                إعادة المحاولة
              </button>
            </div>
          ) : availableCourses.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
              لا توجد مواد مضافة لهذا التخصص في الجامعة المختارة
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
              لا توجد مادة مطابقة لعبارة البحث.
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {filteredCourses.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  aria-pressed={form.course_ids.includes(c.id)}
                  onClick={() => handleCourseToggle(c.id)}
                  className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition-colors ${
                    form.course_ids.includes(c.id)
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground hover:border-primary/50 hover:text-primary"
                  }`}
                >
                  <span
                    dir="ltr"
                    className={`rounded-md px-1.5 py-0.5 font-mono text-[10px] ${
                      form.course_ids.includes(c.id)
                        ? "bg-primary-foreground/20"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {c.code}
                  </span>

                  {c.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* معاينة */}
        {canSubmit && (
          <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold flex-shrink-0">
              {form.name
                .replace(/^د\.|^دكتور\s*/i, "")
                .trim()
                .split(" ")
                .map((w) => w[0])
                .slice(0, 2)
                .join("")}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {form.name}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                {form.university} · {form.major} ·{" "}
                {selectedCourses.map((course) => course.name).join("، ")}{" "}
              </p>
            </div>
            <svg
              width="14"
              height="14"
              className="text-primary flex-shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        )}

        {/* زر الإضافة */}
        <button
          onClick={() => mutation.mutate()}
          disabled={!canSubmit || mutation.isPending}
          className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold disabled:opacity-40 hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
        >
          {mutation.isPending ? (
            <>
              <svg
                className="animate-spin"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              جاري الإضافة...
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
              إضافة الدكتور
            </>
          )}
        </button>
      </div>
    </div>
  );
}
