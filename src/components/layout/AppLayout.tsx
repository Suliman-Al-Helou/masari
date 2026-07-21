"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "@/lib/hooks/useAuth";
import { useToast } from "@/lib/context/ToastContext";
import { useResponsiveSidebar } from "@/lib/hooks/useResponsiveSidebar";
import dynamic from "next/dynamic";
// to Not Reload Sidebar and TopBar In Every Page just Page You Refresh
const Sidebar = dynamic(() => import("./Sidebar"), {
  ssr: false,
});

const TopBar = dynamic(() => import("./TopBar"), {
  ssr: false,
});
interface AppLayoutProps {
  children: React.ReactNode;
}

const NO_LAYOUT_ROUTES = new Set([
  "/login",
  "/register",
  "/verify-email",
  "/onboarding",
]);

function isAdminPath(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

export default function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();

  const { user, profile, logout, loading: authLoading } = useAuth();

  const { Success, Info } = useToast();
  const welcomedRef = useRef(false);

  const { isOpen, desktopExpanded, toggle, closeMobile } =
    useResponsiveSidebar();

  const hideLayout = NO_LAYOUT_ROUTES.has(pathname) || isAdminPath(pathname);
  const isAuthEntryRoute =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/verify-email";
  const isPublicLanding = pathname === "/" && !user && !authLoading;

  // إغلاق قائمة الموبايل بعد تغيير الصفحة
  useEffect(() => {
    closeMobile();
  }, [pathname, closeMobile]);

  // رسالة الترحيب مرة واحدة في الجلسة
useEffect(() => {
  if (!user) {
    welcomedRef.current = false;
    return;
  }

  if (
    isAuthEntryRoute ||
    !profile ||
    authLoading ||
    welcomedRef.current
  ) {
    return;
  }

  const welcomed = sessionStorage.getItem("welcomed");

  if (!welcomed) {
    const fullName =
      profile.full_name ??
      user.user_metadata?.full_name ??
      user.user_metadata?.fullname;

    const firstName =
      typeof fullName === "string"
        ? fullName.split(" ")[0]
        : "بك";

    Success(`مرحباً ${firstName}! 👋`);

    sessionStorage.setItem("welcomed", "true");
  }

  welcomedRef.current = true;
}, [
  isAuthEntryRoute,
  user,
  profile,
  authLoading,
  Success,
]);
  const handleLogout = useCallback(async () => {
    sessionStorage.removeItem("welcomed");

    await logout();

    Info("تم تسجيل الخروج", "نراك قريباً 👋");

    router.replace("/");
  }, [logout, Info, router]);

  // صفحات الأدمن والعامة لها Layout خاص
  if (hideLayout || isPublicLanding) {
    return <>{children}</>;
  }
  const userName =
    profile?.full_name ??
    user?.user_metadata?.full_name ??
    user?.user_metadata?.fullname ??
    user?.email ??
    null;
  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        variant="student"
        isOpen={isOpen}
        onToggle={toggle}
        onLogout={handleLogout}
        userName={userName}
        userMajor={profile?.major ?? null}
      />

      <div
        className={`flex min-h-screen flex-col motion-safe:transition-[margin] motion-safe:duration-300 ${
          desktopExpanded ? "lg:mr-64" : "lg:mr-20"
        }`}
      >
        <TopBar
          onMenuToggle={toggle}
          user={{
            full_name:
              profile?.full_name ??
              user?.user_metadata?.full_name ??
              user?.user_metadata?.fullname ??
              user?.email ??
              "مستخدم",
          }}
          onLogout={handleLogout}
        />

        <main className="min-w-0 flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
