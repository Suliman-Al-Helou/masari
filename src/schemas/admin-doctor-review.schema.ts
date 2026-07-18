import { z } from "zod";

export const adminDoctorReviewDetailsSchema = z.object({
  doctorId: z.string().uuid("معرّف الدكتور غير صحيح"),

  courseCode: z
    .string()
    .trim()
    .min(1, "كود المادة مطلوب")
    .max(50, "كود المادة طويل جدًا")
    .optional(),
});