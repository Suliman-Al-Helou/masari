"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { z } from "zod";

import CustomSelect from "@/components/ui/CustomSelect";
import { getMajorsForUniversity, UNIVERSITIES } from "@/lib/constants/academic";
import { createAdminCourseSchema } from "@/schemas/admin-course.schema";
import type { AdminCourse, CreateAdminCourseInput } from "@/types/admin";
import { useEffect } from "react";
const CATEGORIES = ["إجباري", "اختياري"];
const SEMESTERS = ["الفصل الأول", "الفصل الثاني", "الفصل الصيفي"];
const YEARS = [
  "السنة الأولى",
  "السنة الثانية",
  "السنة الثالثة",
  "السنة الرابعة",
  "السنة الخامسة",
];
const LANGUAGES = ["العربية", "الإنجليزية", "العربية والإنجليزية"];

type CourseFormInput = z.input<typeof createAdminCourseSchema>;
type CourseFormOutput = z.output<typeof createAdminCourseSchema>;

interface CourseFormProps {
  courses: AdminCourse[];
  initialCourse?: AdminCourse;
  submitLabel: string;
  isPending: boolean;
  onSubmit: (input: CreateAdminCourseInput) => Promise<void>;
  onCancel: () => void;
}

function defaultValues(course?: AdminCourse): CourseFormInput {
  return {
    name: course?.name ?? "",
    code: course?.code ?? "",
    credits: course?.credits ?? 3,
    category: course?.category ?? "إجباري",
    semester: course?.semester ?? "الفصل الأول",
    year: course?.year ?? "",
    university: course?.university ?? "",
    major: course?.major ?? "",
    description: course?.description ?? "",
    teaching_language: course?.teaching_language ?? "",
    prerequisite_ids: course?.prerequisite_ids ?? [],
  };
}

export function CourseForm({
  courses,
  initialCourse,
  submitLabel,
  isPending,
  onSubmit,
  onCancel,
}: CourseFormProps) {
  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CourseFormInput, unknown, CourseFormOutput>({
    resolver: zodResolver(createAdminCourseSchema),
    defaultValues: defaultValues(initialCourse),
  });
  useEffect(() => {
    reset(defaultValues(initialCourse));
  }, [initialCourse, reset]);

  const university = useWatch({ control, name: "university" });
  const major = useWatch({ control, name: "major" });
  const majors = university ? getMajorsForUniversity(university) : [];
  const prerequisiteOptions = courses.filter(
    (course) =>
      course.id !== initialCourse?.id &&
      !course.deleted_at &&
      course.university === university &&
      course.major === major,
  );

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5 rounded-2xl border border-border bg-card p-5 sm:p-6"
      noValidate
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="space-y-1.5 text-sm font-medium text-foreground">
          <span>اسم المادة *</span>
          <input
            {...register("name")}
            className="h-11 w-full rounded-xl border border-border bg-background px-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            placeholder="مثال: برمجة 1"
          />
          {errors.name && (
            <span className="block text-xs text-destructive">
              {errors.name.message}
            </span>
          )}
        </label>

        <label className="space-y-1.5 text-sm font-medium text-foreground">
          <span>رمز المادة *</span>
          <input
            {...register("code")}
            dir="ltr"
            className="h-11 w-full rounded-xl border border-border bg-background px-3 text-left uppercase outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            placeholder="CN103"
          />
          {errors.code && (
            <span className="block text-xs text-destructive">
              {errors.code.message}
            </span>
          )}
        </label>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <label className="space-y-1.5 text-sm font-medium text-foreground">
          <span>عدد الساعات *</span>
          <input
            {...register("credits", { valueAsNumber: true })}
            type="number"
            min={1}
            max={6}
            className="h-11 w-full rounded-xl border border-border bg-background px-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </label>

        <Controller
          control={control}
          name="category"
          render={({ field }) => (
            <div className="space-y-1.5">
              <span className="text-sm font-medium text-foreground">
                التصنيف
              </span>
              <CustomSelect
                value={field.value ?? ""}
                onChange={field.onChange}
                options={CATEGORIES}
                placeholder="اختر التصنيف"
                ariaLabel="تصنيف المادة"
              />
            </div>
          )}
        />

        <Controller
          control={control}
          name="teaching_language"
          render={({ field }) => (
            <div className="space-y-1.5">
              <span className="text-sm font-medium text-foreground">
                لغة التدريس
              </span>
              <CustomSelect
                value={field.value ?? ""}
                onChange={field.onChange}
                options={LANGUAGES}
                placeholder="اختر اللغة"
                ariaLabel="لغة تدريس المادة"
              />
            </div>
          )}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Controller
          control={control}
          name="university"
          render={({ field }) => (
            <div className="space-y-1.5">
              <span className="text-sm font-medium text-foreground">
                الجامعة *
              </span>
              <CustomSelect
                value={field.value}
                onChange={(value) => {
                  field.onChange(value);
                  setValue("major", "");
                  setValue("prerequisite_ids", []);
                }}
                options={UNIVERSITIES}
                placeholder="اختر الجامعة"
                ariaLabel="جامعة المادة"
              />
            </div>
          )}
        />

        <Controller
          control={control}
          name="major"
          render={({ field }) => (
            <div className="space-y-1.5">
              <span className="text-sm font-medium text-foreground">
                التخصص *
              </span>
              <CustomSelect
                value={field.value}
                onChange={(value) => {
                  field.onChange(value);
                  setValue("prerequisite_ids", []);
                }}
                options={majors}
                placeholder={university ? "اختر التخصص" : "اختر الجامعة أولًا"}
                ariaLabel="تخصص المادة"
                disabled={!university}
              />
            </div>
          )}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Controller
          control={control}
          name="semester"
          render={({ field }) => (
            <div className="space-y-1.5">
              <span className="text-sm font-medium text-foreground">الفصل</span>
              <CustomSelect
                value={field.value ?? ""}
                onChange={field.onChange}
                options={SEMESTERS}
                placeholder="اختر الفصل"
                ariaLabel="فصل المادة"
              />
            </div>
          )}
        />

        <Controller
          control={control}
          name="year"
          render={({ field }) => (
            <div className="space-y-1.5">
              <span className="text-sm font-medium text-foreground">
                السنة أو المستوى
              </span>
              <CustomSelect
                value={field.value ?? ""}
                onChange={field.onChange}
                options={YEARS}
                placeholder="اختر السنة"
                ariaLabel="مستوى المادة"
              />
            </div>
          )}
        />
      </div>

      <label className="block space-y-1.5 text-sm font-medium text-foreground">
        <span>وصف المادة</span>
        <textarea
          {...register("description")}
          rows={4}
          className="w-full resize-y rounded-xl border border-border bg-background px-3 py-2.5 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          placeholder="اكتب وصفًا مختصرًا لمحتوى المادة"
        />
      </label>

      <Controller
        control={control}
        name="prerequisite_ids"
        render={({ field }) => {
          const selectedIds = field.value ?? [];

          const togglePrerequisite = (courseId: string) => {
            field.onChange(
              selectedIds.includes(courseId)
                ? selectedIds.filter((id) => id !== courseId)
                : [...selectedIds, courseId],
            );
          };

          return (
            <fieldset className="space-y-2" disabled={!university || !major}>
              <legend className="text-sm font-medium text-foreground">
                المتطلبات السابقة
              </legend>

              <div className="max-h-40 overflow-y-auto rounded-xl border border-border bg-background p-2">
                {prerequisiteOptions.length === 0 ? (
                  <p className="px-2 py-3 text-xs text-muted-foreground">
                    لا توجد مواد متاحة داخل هذا التخصص.
                  </p>
                ) : (
                  prerequisiteOptions.map((course) => (
                    <label
                      key={course.id}
                      className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-2 text-sm hover:bg-muted"
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(course.id)}
                        onChange={() => togglePrerequisite(course.id)}
                        className="h-4 w-4 accent-primary"
                      />

                      <span className="flex-1">{course.name}</span>

                      <span dir="ltr" className="text-xs text-muted-foreground">
                        {course.code}
                      </span>
                    </label>
                  ))
                )}
              </div>
            </fieldset>
          );
        }}
      />
      <div className="flex flex-wrap items-center gap-3 border-t border-border pt-4">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending && (
            <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
          )}
          {submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="min-h-11 rounded-xl border border-border px-5 text-sm text-foreground transition hover:bg-muted"
        >
          إلغاء
        </button>
      </div>
    </form>
  );
}
