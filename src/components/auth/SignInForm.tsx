import { rules, useFormField } from "@/lib/hooks/useFormField";
import Field from "@/components/ui/Field";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useMemo } from "react";

type Props = {
  loading: boolean;
  onSubmit: (email: string, password: string) => void;
  onForgot: () => void;
  onSwitchToSignUp: () => void;
};

export default function SignInForm({
  loading,
  onSubmit,
  onForgot,
  onSwitchToSignUp,
}: Props) {
  const siEmail = useFormField();
  const siPassword = useFormField();

  const emailHasError = useMemo(
    () => siEmail.touched && siEmail.error,
    [siEmail.touched, siEmail.error],
  );

  const passwordHasError = useMemo(
    () => siPassword.touched && siPassword.error,
    [siPassword.touched, siPassword.error],
  );
  // ── Sign In ──
  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = [
      siEmail.validate([rules.required("البريد"), rules.email()]),
      siPassword.validate([rules.required("كلمة المرور")]),
    ].every(Boolean);
    if (!ok) return;

    onSubmit(siEmail.value, siPassword.value);
  };
  return (
    <form onSubmit={handleSignIn} className="flex flex-col gap-4" noValidate>
      <Field
    
        label="البريد الإلكتروني"
        error={siEmail.error}
        touched={siEmail.touched}
      >
        <Input
          type="email"
          placeholder="example@university.edu"
          value={siEmail.value}
          onChange={siEmail.onChange}
          onBlur={siEmail.onBlur}
          hasError={!!emailHasError}
          aria-invalid={!!emailHasError}
          aria-describedby={emailHasError ? "email-error" : undefined}
        />
      </Field>
      <Field
        label="كلمة المرور"
        error={siPassword.error}
        touched={siPassword.touched}
        hint={
          <Button
            type="button"
            className={
              "text-xs font-semibold hover:text-primary/80 text-primary"
            }
            onClick={onForgot}
          >
            نسيت كلمة المرور؟
          </Button>
        }
      >
        <Input
          type="password"
          placeholder="••••••••"
          value={siPassword.value}
          onChange={siPassword.onChange}
          onBlur={siPassword.onBlur}
          hasError={!!passwordHasError}
          aria-invalid={!!passwordHasError}
          aria-describedby={passwordHasError ? "password-error" : undefined}
        />
      </Field>
      <div className="flex flex-col gap-2 items-center">
        <Button
          type="submit"
          isLoading={loading}
          variant={"primary"}
          className={"w-full"}
          size={"md"}
        >
          تسجيل الدخول
        </Button>
        <p className="text-[12px]">
          ما عندك حساب؟ <Button onClick={onSwitchToSignUp}>أنشئ حساباً</Button>
        </p>
      </div>
    </form>
  );
}
SignInForm.displayName = "SignInForm";
