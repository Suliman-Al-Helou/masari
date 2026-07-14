"use client";
import { AnimatePresence } from "motion/react";
import Motion from "@/components/ui/Motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef, type FormEvent } from "react";
import { supabase } from "@/lib/db/client";
import { useToast } from "@/lib/context/ToastContext";
import { useFormField, rules } from "@/lib/hooks/useFormField";

import SignInForm from "@/components/auth/SignInForm";
import SignUpForm from "@/components/auth/SignUpForm";
import Brand from "@/components/ui/Brand";
import Field from "@/components/ui/Field";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

// داخل الـ component — بعد useState

type Tab = "signin" | "signup";

export default function LoginPage() {
  // toggel between signin and signup
  const router = useRouter();
  const { Success, Error } = useToast();

  //read Path
  const searchParams = useSearchParams();

  const disabledToastShown = useRef(false);
  const disabledReason = searchParams.get("reason");

  useEffect(() => {
    if (disabledReason !== "account-disabled" || disabledToastShown.current)
      return;

    disabledToastShown.current = true;

    // Remove the reason without causing another navigation
    window.history.replaceState(null, "", "/login");
    // Show the reason after AuthGuard redirects the disabled user
    Error("تم تعطيل حسابك", "يرجى التواصل مع إدارة المنصة");

    // Remove the query parameter to prevent showing the toast again
  }, [disabledReason, Error, router]);

  const [loading, setLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);

  const [tab, setTab] = useState<Tab>(
    searchParams.get("tab") === "signup" ? "signup" : "signin",
  );

  // Reset field
  const resetEmail = useFormField();

  const switchTab = (nextTab: Tab) => {
    setTab(nextTab);
    setShowReset(false);
  };

  // ── Sign In ──
 const handleSignIn = async (email: string, password: string) => {
  setLoading(true);

  try {
    const normalizedEmail = email.trim().toLowerCase();

    const {
      data: authData,
      error: authError,
    } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (authError?.code === "user_banned") {
      Error("تم تعطيل حسابك", "يرجى التواصل مع إدارة المنصة");
      return;
    }

    if (authError) {
      console.error("[Login] signIn error:", authError);

      Error("فشل تسجيل الدخول", "البريد أو كلمة المرور غير صحيحة");
      return;
    }

    const userId = authData.user?.id;

    if (!userId) {
      Error("فشل تسجيل الدخول", "لم يتم العثور على جلسة المستخدم");
      return;
    }

    // ننتظر قراءة الـ profile بعد اكتمال signIn
    const {
      data: profile,
      error: profileError,
    } = await supabase
      .from("profiles")
      .select("role, onboarded, deleted_at")
      .eq("id", userId)
      .maybeSingle();

    if (profileError || !profile) {
      console.error("[Login] profile error:", profileError);

      await supabase.auth.signOut();

      Error(
        "تعذر تحميل الحساب",
        "تأكد من وجود Profile للمستخدم ومن سياسات RLS",
      );

      return;
    }

    if (profile.deleted_at) {
      await supabase.auth.signOut();

      Error("تم تعطيل حسابك", "يرجى التواصل مع إدارة المنصة");
      return;
    }

    const callbackUrl = searchParams.get("callbackUrl");

    const safeStudentCallback =
      callbackUrl &&
      callbackUrl.startsWith("/") &&
      !callbackUrl.startsWith("//") &&
      !callbackUrl.startsWith("/admin") &&
      !callbackUrl.startsWith("/login")
        ? callbackUrl
        : null;

    let destination = "/";

    if (profile.role === "admin") {
      destination = "/admin";
    } else if (!profile.onboarded) {
      destination = "/onboarding";
    } else if (safeStudentCallback) {
      destination = safeStudentCallback;
    }

    // هنا فقط ننفذ الانتقال، بعد انتهاء signIn وقراءة profile
    window.location.replace(destination);
  } catch (error) {
    console.error("[Login] unexpected error:", error);

    Error("تعذر تسجيل الدخول", "حدث خطأ غير متوقع، حاول مرة أخرى");
  } finally {
    setLoading(false);
  }
};

  // ── Sign Up ──
  const handleSignUp = async (
    name: string,
    email: string,
    password: string,
  ) => {
    setLoading(true);

    try {
      const normalizedName = name.trim();
      const normalizedEmail = email.trim().toLowerCase();

      const { error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            full_name: normalizedName,
          },
        },
      });

      if (error) {
        Error(
          "فشل إنشاء الحساب",
          "تعذر إنشاء الحساب، تحقق من البيانات وحاول مجددًا",
        );

        return;
      }

      Success(
        "تم إنشاء الحساب بنجاح",
        "تحقق من بريدك الإلكتروني لتفعيل الحساب",
      );

      switchTab("signin");
    } catch {
      Error("تعذر إنشاء الحساب", "حدث خطأ غير متوقع، حاول مرة أخرى");
    } finally {
      setLoading(false);
    }
  };

  // ── Reset ──
  const handleReset = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const ok = resetEmail.validate([rules.required("البريد"), rules.email()]);
    if (!ok) return;

    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(
      resetEmail.value,
      {
        redirectTo: `${window.location.origin}/login`,
      },
    );

    setLoading(false);

    if (error) {
      Error("فشل الإرسال", "تأكد من البريد الإلكتروني وحاول مرة أخرى");
    } else {
      Success("تم الإرسال!", "تحقق من بريدك الإلكتروني");
      setShowReset(false);
    }
  };

  const resetEmailHasError = Boolean(resetEmail.touched && resetEmail.error);

  return (
    <div
      dir="rtl"
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4 text-foreground"
    >
      <div className="pointer-events-none fixed right-[-80px] top-[-120px] z-0 h-[480px] w-[480px] rounded-full bg-primary opacity-[0.13] blur-[90px]" />
      <div className="pointer-events-none fixed bottom-[-80px] left-[-80px] z-0 h-[360px] w-[360px] rounded-full bg-info opacity-[0.13] blur-[90px]" />

      <div className="relative z-10 flex w-full max-w-[860px] overflow-hidden rounded-3xl shadow-[0_20px_70px_rgba(0,0,0,0.13)] max-[600px]:rounded-2xl">
        {/* Brand */}
        <div className="flex-1 max-[600px]:hidden hidden md:flex ">
          <Brand />
        </div>

        {/* Form Side */}
        <div className="flex flex-1 items-center justify-center bg-card px-8 py-10  max-[600px]:px-6 max-[600px]:py-8">
          <div className="w-full md:max-w-[340px]">
            <div className="mb-7 flex gap-2 border-b-2 border-border">
              {(["signin", "signup"] as Tab[]).map((t) => (
                <button
                  type="button"
                  key={t}
                  className={`mb-[-2px] flex-1 border-b-2 px-2 py-[0.65rem] text-sm font-semibold transition-all ${
                    tab === t
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground"
                  }`}
                  onClick={() => switchTab(t)}
                >
                  {t === "signin" ? "تسجيل الدخول" : "إنشاء حساب"}
                </button>
              ))}
            </div>

            {/* Sign In */}
            <AnimatePresence mode="wait">
              {tab === "signin" && !showReset && (
                <Motion key="signin" type="auth-form">
                  <SignInForm
                    loading={loading}
                    onSubmit={handleSignIn}
                    onForgot={() => setShowReset(true)}
                    onSwitchToSignUp={() => switchTab("signup")}
                  />
                </Motion>
              )}

              {/* Reset */}
              {tab === "signin" && showReset && (
                <Motion key="reset" type="auth-form">
                  <form
                    onSubmit={handleReset}
                    className="flex flex-col gap-4"
                    noValidate
                  >
                    <p className="m-0 text-sm leading-relaxed text-muted-foreground">
                      أدخل بريدك وسنرسل لك رابط إعادة تعيين كلمة المرور
                    </p>

                    <Field
                      label="البريد الإلكتروني"
                      error={resetEmail.error}
                      touched={resetEmail.touched}
                    >
                      <Input
                        type="email"
                        placeholder="example@university.edu"
                        value={resetEmail.value}
                        onChange={resetEmail.onChange}
                        onBlur={resetEmail.onBlur}
                        hasError={resetEmailHasError}
                        aria-invalid={resetEmailHasError}
                      />
                    </Field>

                    <Button
                      type="submit"
                      isLoading={loading}
                      variant="primary"
                      size="md"
                      className="w-full"
                    >
                      إرسال رابط الاستعادة
                    </Button>

                    <p className="m-0 text-center text-sm text-muted-foreground">
                      <Button type="button" onClick={() => setShowReset(false)}>
                        ← رجوع لتسجيل الدخول
                      </Button>
                    </p>
                  </form>
                </Motion>
              )}

              {/* Sign Up */}
              {tab === "signup" && (
                <Motion key="signup" type="auth-form">
                  <SignUpForm
                    loading={loading}
                    onSubmit={handleSignUp}
                    onSwitchToSignIn={() => switchTab("signin")}
                  />
                </Motion>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
