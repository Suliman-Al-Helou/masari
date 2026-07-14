"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import Field from "@/components/ui/Field";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import {
  signUpSchema,
  type SignUpFormValues,
} from "@/schemas/auth.schema";

interface SignUpFormProps {
  loading: boolean;
  onSubmit: (
    name: string,
    email: string,
    password: string,
  ) => void | Promise<void>;
  onSwitchToSignIn: () => void;
}

export default function SignUpForm({
  loading,
  onSubmit,
  onSwitchToSignIn,
}: SignUpFormProps) {
  const {
    register,
    handleSubmit,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    mode: "onBlur",
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const submitForm = async (
    values: SignUpFormValues,
  ) => {
    await onSubmit(
      values.fullName,
      values.email,
      values.password,
    );
  };

  return (
    <form
      onSubmit={handleSubmit(submitForm)}
      className="flex flex-col gap-4"
      noValidate
    >
      <Field
        label="الاسم الكامل"
        error={errors.fullName?.message ?? ""}
        touched={Boolean(errors.fullName)}
      >
        <Input
          id="signup-full-name"
          type="text"
          autoComplete="name"
          placeholder="سليمان الأحمد"
          required
          hasError={Boolean(errors.fullName)}
          aria-invalid={Boolean(errors.fullName)}
          {...register("fullName")}
        />
      </Field>

      <Field
        label="البريد الإلكتروني"
        error={errors.email?.message ?? ""}
        touched={Boolean(errors.email)}
      >
        <Input
          id="signup-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="example@university.edu"
          required
          hasError={Boolean(errors.email)}
          aria-invalid={Boolean(errors.email)}
          {...register("email")}
        />
      </Field>

      <Field
        label="كلمة المرور"
        error={errors.password?.message ?? ""}
        touched={Boolean(errors.password)}
      >
        <Input
          id="signup-password"
          type="password"
          autoComplete="new-password"
          placeholder="8 أحرف على الأقل"
          required
          hasError={Boolean(errors.password)}
          aria-invalid={Boolean(errors.password)}
          {...register("password")}
        />
      </Field>

      <Field
        label="تأكيد كلمة المرور"
        error={
          errors.confirmPassword?.message ?? ""
        }
        touched={Boolean(errors.confirmPassword)}
      >
        <Input
          id="signup-confirm-password"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          required
          hasError={Boolean(
            errors.confirmPassword,
          )}
          aria-invalid={Boolean(
            errors.confirmPassword,
          )}
          {...register("confirmPassword")}
        />
      </Field>

      <div className="flex flex-col items-center gap-4">
        <Button
          type="submit"
          isLoading={loading || isSubmitting}
          disabled={loading || isSubmitting}
          variant="primary"
          className="w-full"
          size="md"
        >
          إنشاء الحساب
        </Button>

        <p className="text-xs">
          عندك حساب؟{" "}
          <Button
            type="button"
            onClick={onSwitchToSignIn}
          >
            سجّل دخولك
          </Button>
        </p>
      </div>
    </form>
  );
}

SignUpForm.displayName = "SignUpForm";