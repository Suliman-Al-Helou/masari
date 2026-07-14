import { z } from "zod";

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "البريد الإلكتروني مطلوب")
  .email("البريد الإلكتروني غير صحيح")
  .max(254, "البريد الإلكتروني طويل جدًا");

const passwordSchema = z
  .string()
  .min(1, "كلمة المرور مطلوبة")
  .min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل")
  .max(128, "كلمة المرور طويلة جدًا");

export const signUpSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(1, "الاسم الكامل مطلوب")
      .min(2, "الاسم يجب أن يتكون من حرفين على الأقل")
      .max(80, "الاسم طويل جدًا")
      .refine(
        (value) => /[\p{L}]/u.test(value),
        "الاسم يجب أن يحتوي على أحرف",
      ),

    email: emailSchema,
    password: passwordSchema,

    confirmPassword: z
      .string()
      .min(1, "تأكيد كلمة المرور مطلوب"),
  })
  .refine(
    (values) =>
      values.password === values.confirmPassword,
    {
      message: "كلمتا المرور غير متطابقتين",
      path: ["confirmPassword"],
    },
  );

export const signInSchema = z.object({
  email: emailSchema,

  password: z
    .string()
    .min(1, "كلمة المرور مطلوبة"),
});

export const resetPasswordSchema = z.object({
  email: emailSchema,
});

export type SignUpFormValues = z.infer<
  typeof signUpSchema
>;

export type SignInFormValues = z.infer<
  typeof signInSchema
>;

export type ResetPasswordFormValues = z.infer<
  typeof resetPasswordSchema
>;