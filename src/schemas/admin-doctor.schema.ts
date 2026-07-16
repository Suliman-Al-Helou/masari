import { z } from "zod";

export const createAdminDoctorSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "اسم الدكتور قصير جدًا")
    .max(120, "اسم الدكتور طويل جدًا"),

  university: z
    .string()
    .trim()
    .min(1, "الجامعة مطلوبة")
    .max(120),

  major: z
    .string()
    .trim()
    .min(1, "التخصص مطلوب")
    .max(120),

  course_code: z
    .string()
    .trim()
    .min(1, "المادة مطلوبة")
    .max(30),
});

export type CreateAdminDoctorInput = z.infer<
  typeof createAdminDoctorSchema
>;