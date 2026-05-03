"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { getProfile } from "@/lib/api";

const PUBLIC_ROUTES = ["/login", "/verify-email"];
const ONBOARDING_ROUTE = "/onboarding";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isPublic = PUBLIC_ROUTES.includes(pathname);
  const isOnboarding = pathname === ONBOARDING_ROUTE;

  useEffect(() => {
    if (loading) return;

    // مش مسجّل ومش في صفحة عامة
    if (!user && !isPublic) {
      router.push("/login");
      return;
    }

    // مسجّل في صفحة login
    if (user && pathname === "/login") {
      router.push("/");
      return;
    }

    // مسجّل — تحقق هل أكمل الـ onboarding
    if (user && !isOnboarding && !isPublic) {
      getProfile(user.id).then(({ data, error }) => {
        console.log("Profile data:", data, "Error:", error); // للتشخيص
        if (!error && data && data.onboarded !== true) {
          router.push("/onboarding");
        }
      });
    }
  }, [user, loading, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground font-medium">
            جاري التحميل...
          </p>
        </div>
      </div>
    );
  }

  if (isPublic || isOnboarding) return <>{children}</>;
  if (!user) return null;
  return <>{children}</>;
}
