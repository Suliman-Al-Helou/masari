import { z } from "zod";

export const ADMIN_COURSE_SORTS = [
  "created_desc",
  "name_asc",
  "code_asc",
  "rating_desc",
  "rating_asc",
  "reviews_desc",
] as const;

export const COURSE_REVIEW_STATUSES = [
  "published",
  "hidden",
  "rejected",
] as const;

const nullableText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .nullable()
    .transform((value) => value || null);

export const adminCourseListQuerySchema = z.object({
  university: z.string().trim().max(150).optional(),
  major: z.string().trim().max(150).optional(),
  semester: z.string().trim().max(80).optional(),
  year: z.string().trim().max(80).optional(),
  search: z.string().trim().max(100).optional(),
  sort: z.enum(ADMIN_COURSE_SORTS).default("created_desc"),
  status: z.enum(["active", "deleted"]).default("active"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(7).max(100).default(10),
});

export const courseCatalogQuerySchema = adminCourseListQuerySchema.pick({
  university: true,
  major: true,
  semester: true,
  year: true,
});

export const createAdminCourseSchema = z.object({
  name: z.string().trim().min(2).max(120),
  code: z
    .string()
    .trim()
    .min(2)
    .max(30)
    .regex(/^[A-Za-z0-9-]+$/, "رمز المادة يقبل الأحرف والأرقام والشرطة فقط")
    .transform((value) => value.toUpperCase()),
  credits: z.coerce.number().int().min(1).max(6),
  category: nullableText(80),
  semester: nullableText(80),
  year: nullableText(80),
  university: z.string().trim().min(2).max(150),
  major: z.string().trim().min(2).max(150),
  description: nullableText(2_000),
  teaching_language: nullableText(50),
  prerequisite_ids: z.array(z.string().uuid()).max(20).default([]),
});

export const updateAdminCourseSchema = createAdminCourseSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  "يجب إرسال حقل واحد على الأقل",
);

export const courseIdSchema = z.string().uuid("معرف المادة غير صالح");

export const courseReviewsQuerySchema = z.object({
  sort: z.enum(["newest", "highest"]).default("newest"),
  status: z.enum(["all", ...COURSE_REVIEW_STATUSES]).default("all"),
});

export const moderateCourseReviewSchema = z.object({
  status: z.enum(COURSE_REVIEW_STATUSES),
});

export type AdminCourseListQuery = z.infer<typeof adminCourseListQuerySchema>;
export type CreateAdminCourseInput = z.infer<typeof createAdminCourseSchema>;
export type UpdateAdminCourseInput = z.infer<typeof updateAdminCourseSchema>;
export type CourseReviewStatus = (typeof COURSE_REVIEW_STATUSES)[number];
