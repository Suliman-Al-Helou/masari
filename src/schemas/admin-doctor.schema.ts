import { z } from "zod";

export const createAdminDoctorSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "اسم الدكتور قصير جدًا")
    .max(120, "اسم الدكتور طويل جدًا"),

  university: z.string().trim().min(1, "الجامعة مطلوبة").max(120),

  major: z.string().trim().min(1, "التخصص مطلوب").max(120),
  course_ids: z
    .array(z.string().uuid("معرّف المادة غير صحيح"))
    .min(1, "يجب اختيار مادة واحدة على الأقل")
    .max(20, "لا يمكن اختيار أكثر من 20 مادة"),
});

export type CreateAdminDoctorInput = z.infer<typeof createAdminDoctorSchema>;

export const updateAdminDoctorCoursesSchema = z.object({
  course_ids: z
    .array(z.string().uuid("معرّف المادة غير صحيح"))
    .max(30, "لا يمكن إضافة أكثر من 30 مادة")
    .refine(
      (courseIds) => new Set(courseIds).size === courseIds.length,
      "لا يمكن تكرار المادة",
    ),
});

export type UpdateAdminDoctorCoursesInput = z.infer<
  typeof updateAdminDoctorCoursesSchema
>;