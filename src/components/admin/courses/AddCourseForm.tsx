"use client";

import { CourseForm } from "./CourseForm";
import { useCreateAdminCourse } from "@/lib/hooks/admin/query/useAdminCourses";
import { useToast } from "@/lib/context/ToastContext";
import type { AdminCourse, CreateAdminCourseInput } from "@/types/admin";

interface AddCourseFormProps {
  courses: AdminCourse[];
  onSuccess: () => void;
  onCancel: () => void;
}

export function AddCourseForm({
  courses,
  onSuccess,
  onCancel,
}: AddCourseFormProps) {
  const mutation = useCreateAdminCourse();
  const { Success, Error: showError } = useToast();

  const submit = async (input: CreateAdminCourseInput) => {
    try {
      await mutation.mutateAsync(input);
      Success("تمت إضافة المادة", `${input.name} أصبحت متاحة في دليل المواد`);
      onSuccess();
    } catch (error) {
      showError(
        "تعذر إضافة المادة",
        error instanceof globalThis.Error ? error.message : undefined,
      );
    }
  };

  return (
    <CourseForm
      courses={courses}
      submitLabel="حفظ المادة"
      isPending={mutation.isPending}
      onSubmit={submit}
      onCancel={onCancel}
    />
  );
}
