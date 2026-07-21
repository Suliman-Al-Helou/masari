"use client";

import { CourseForm } from "./CourseForm";
import { useUpdateAdminCourse } from "@/lib/hooks/admin/query/useAdminCourses";
import { useToast } from "@/lib/context/ToastContext";
import type { AdminCourse, CreateAdminCourseInput } from "@/types/admin";

interface EditCourseFormProps {
  course: AdminCourse;
  courses: AdminCourse[];
  onSuccess: () => void;
  onCancel: () => void;
}

export function EditCourseForm({
  course,
  courses,
  onSuccess,
  onCancel,
}: EditCourseFormProps) {
  const mutation = useUpdateAdminCourse();
  const { Success, Error: showError } = useToast();

  const submit = async (input: CreateAdminCourseInput) => {
    try {
      await mutation.mutateAsync({ id: course.id, input });
      Success("تم تعديل المادة", "حُفظت بيانات المادة بنجاح");
      onSuccess();
    } catch (error) {
      showError(
        "تعذر تعديل المادة",
        error instanceof globalThis.Error ? error.message : undefined,
      );
    }
  };

  return (
    <CourseForm
      courses={courses}
      initialCourse={course}
      submitLabel="حفظ التعديلات"
      isPending={mutation.isPending}
      onSubmit={submit}
      onCancel={onCancel}
    />
  );
}
