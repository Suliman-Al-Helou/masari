// "use client";

// import { useCallback, useEffect } from "react";
// import { usePathname, useRouter } from "next/navigation";
// import { Menu, Moon, Shield, Sun } from "lucide-react";

// import Sidebar from "@/components/layout/Sidebar";
// import { useAuth } from "@/lib/hooks/useAuth";
// import { useResponsiveSidebar } from "@/lib/hooks/useResponsiveSidebar";
// import { useTheme } from "@/lib/context/ThemeContext";

// interface AdminLayoutClientProps {
//   children: React.ReactNode;
// }

// export default function AdminLayoutClient({
//   children,
// }: AdminLayoutClientProps) {
//   const pathname = usePathname();
//   const router = useRouter();

//   const { user, profile, logout } = useAuth();
//   const { isDark, toggleTheme } = useTheme();

//   const { isOpen, desktopExpanded, toggle, openMobile, closeMobile } =
//     useResponsiveSidebar();

//   // إغلاق قائمة الموبايل بعد تغيير الصفحة
//   useEffect(() => {
//     closeMobile();
//   }, [pathname, closeMobile]);

//   const handleLogout = useCallback(async () => {
//     await logout();
//     router.replace("/");
//   }, [logout, router]);

//   const adminName =
//     profile?.full_name ??
//     user?.user_metadata?.full_name ??
//     user?.user_metadata?.fullname ??
//     user?.email ??
//     null;
//   return (
//     <div dir="rtl" className="min-h-screen bg-background">
//       <Sidebar
//         variant="admin"
//         isOpen={isOpen}
//         onToggle={toggle}
//         onLogout={handleLogout}
//         // userName={adminName}
//         // userMajor={null}
//       />

//       <div
//         className={`min-h-screen motion-safe:transition-[margin] motion-safe:duration-300 ${
//           desktopExpanded ? "lg:mr-64" : "lg:mr-20"
//         }`}
//       >
//         <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card/95 px-4 backdrop-blur lg:px-6">
//           <div className="flex items-center gap-3">
//             <button
//               type="button"
//               onClick={openMobile}
//               aria-label="فتح القائمة الجانبية"
//               aria-controls="dashboard-sidebar"
//               className="flex h-11 w-11 items-center justify-center rounded-xl text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary lg:hidden"
//             >
//               <Menu aria-hidden="true" className="h-5 w-5" />
//             </button>

//             <div className="flex items-center gap-2">
//               <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
//                 <Shield aria-hidden="true" className="h-4 w-4 text-primary" />
//               </div>

//               <div>
//                 <p className="text-sm font-bold text-foreground">
//                   لوحة الإدارة
//                 </p>

//                 <p className="text-[11px] text-muted-foreground">
//                   إدارة المنصة
//                 </p>
//               </div>
//             </div>
//           </div>

//           <button
//             type="button"
//             onClick={toggleTheme}
//             aria-label={isDark ? "تفعيل الوضع النهاري" : "تفعيل الوضع الليلي"}
//             title={isDark ? "الوضع النهاري" : "الوضع الليلي"}
//             className="flex h-11 w-11 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
//           >
//             {isDark ? (
//               <Sun aria-hidden="true" className="h-5 w-5 text-amber-400" />
//             ) : (
//               <Moon aria-hidden="true" className="h-5 w-5" />
//             )}
//           </button>
//         </header>

//         <main className="min-w-0 overflow-x-hidden">
//           <div className="mx-auto w-full max-w-7xl p-4 lg:p-6">{children}</div>
//         </main>
//       </div>
//     </div>
//   );
// }
"use client";

import { useCallback, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Moon, Shield, Sun } from "lucide-react";

import Sidebar from "@/components/layout/Sidebar";
import { useAuth } from "@/lib/hooks/useAuth";
import { useResponsiveSidebar } from "@/lib/hooks/useResponsiveSidebar";
import { useTheme } from "@/lib/context/ThemeContext";

interface AdminLayoutClientProps {
  children: React.ReactNode;
}

export default function AdminLayoutClient({
  children,
}: AdminLayoutClientProps) {
  const pathname = usePathname();
  const router = useRouter();

  const { user, profile, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const { isOpen, desktopExpanded, toggle, closeMobile } =
    useResponsiveSidebar();

  // إغلاق قائمة الموبايل بعد تغيير الصفحة
  useEffect(() => {
    closeMobile();
  }, [pathname, closeMobile]);

  const handleLogout = useCallback(async () => {
    await logout();
    router.replace("/");
  }, [logout, router]);
  const adminName =
    profile?.full_name ??
    user?.user_metadata?.full_name ??
    user?.user_metadata?.fullname ??
    user?.email ??
    null;
  return (
    <div dir="rtl" className="min-h-screen bg-background">
      <Sidebar
        variant="admin"
        isOpen={isOpen}
        onToggle={toggle}
        onLogout={handleLogout}
        userName={adminName}
        userMajor={null}
      />

      <div
        className={`min-h-screen motion-safe:transition-[margin] motion-safe:duration-300 ${
          desktopExpanded ? "lg:mr-64" : "lg:mr-20"
        }`}
      >
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card/95 px-4 backdrop-blur lg:px-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                <Shield aria-hidden="true" className="h-4 w-4 text-primary" />
              </div>

              <div>
                <p className="text-sm font-bold text-foreground">
                  لوحة الإدارة
                </p>

                <p className="text-[11px] text-muted-foreground">
                  إدارة المنصة
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? "تفعيل الوضع النهاري" : "تفعيل الوضع الليلي"}
            title={isDark ? "الوضع النهاري" : "الوضع الليلي"}
            className="flex h-11 w-11 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {isDark ? (
              <Sun aria-hidden="true" className="h-5 w-5 text-amber-400" />
            ) : (
              <Moon aria-hidden="true" className="h-5 w-5" />
            )}
          </button>
        </header>

        <main className="min-w-0 overflow-x-hidden">
          <div
            className={`mx-auto w-full p-4
    motion-safe:transition-[max-width]
    motion-safe:duration-300 lg:p-6 ${
      desktopExpanded ? "max-w-7xl" : "max-w-full"
    }`}
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
