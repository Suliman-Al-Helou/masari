// "use client";

// import {
//   useState,
//   useRef,
//   useEffect,
//   useCallback,
// } from "react";
// import {
//   Menu,
//   Bell,
//   Moon,
//   Sun,
//   LogOut,
//   User,
//   CheckCircle,
//   MessageCircle,
// } from "lucide-react";
// import { useRouter } from "next/navigation";
// import { useAuth } from "@/lib/hooks/useAuth";
// import { getDashboardStats, getUnreadCount } from "@/lib/api/api";
// import { useTheme } from "@/lib/context/ThemeContext";
// interface TopBarProps {
//   user: { full_name: string };
//   onMenuToggle: () => void;
//   onLogout: () => void;
// }

// // ── Type ──
// interface Notification {
//   id: string;
//   type: "task" | "message";
//   text: string;
//   time: string;
//   read: boolean;
// }

// function timeAgo(dateStr: string): string {
//   const diff = Date.now() - new Date(dateStr).getTime();
//   const mins = Math.floor(diff / 60000);
//   if (mins < 1) return "الآن";
//   if (mins < 60) return `منذ ${mins} دقيقة`;
//   const hrs = Math.floor(mins / 60);
//   if (hrs < 24) return `منذ ${hrs} ساعة`;
//   return `منذ ${Math.floor(hrs / 24)} يوم`;
// }

// export default function TopBar({ user, onMenuToggle, onLogout }: TopBarProps) {
//   const [dropdownOpen, setDropdownOpen] = useState(false);
//   const [notifOpen, setNotifOpen] = useState(false);
//   const [notifications, setNotifications] = useState<Notification[]>([]);
//   const { isDark, toggleTheme } = useTheme();
//   const dropdownRef = useRef<HTMLDivElement>(null);
//   const notifRef = useRef<HTMLDivElement>(null);
//   const router = useRouter();
//   const { user: authUser } = useAuth();

//   const unreadCount = notifications.filter((n) => !n.read).length;

//   const initials = user?.full_name
//     ? user.full_name
//         .split(" ")
//         .map((n: string) => n[0])
//         .join("")
//         .slice(0, 2)
//     : "؟";

//   // ── جلب الإشعارات الحقيقية ──
//   const fetchNotifications = useCallback(async () => {
//     if (!authUser) return;
//     try {
//       const [stats, unread] = await Promise.all([
//         getDashboardStats(authUser.id),
//         getUnreadCount(authUser.id),
//       ]);

//       const notifs: Notification[] = [];

//       // إشعارات المهام العاجلة
//       stats.urgentTasks?.forEach((task) => {
//         notifs.push({
//           id: `task-${task.id}`,
//           type: "task",
//           text: `مهمة عاجلة: ${task.title}`,
//           time: task.due_date ? timeAgo(task.due_date) : "قريباً",
//           read: false,
//         });
//       });

//       // إشعارات الامتحان القادم
//       if (
//         stats.daysToExam !== null &&
//         stats.daysToExam <= 3 &&
//         stats.nextExamTitle
//       ) {
//         notifs.push({
//           id: "exam-soon",
//           type: "task",
//           text: `امتحان ${stats.nextExamTitle} بعد ${stats.daysToExam} ${stats.daysToExam === 1 ? "يوم" : "أيام"}`,
//           time: "قريباً",
//           read: false,
//         });
//       }

//       // إشعارات الرسائل غير المقروءة
//       Object.entries(unread).forEach(([senderId, count]) => {
//         if (count > 0) {
//           notifs.push({
//             id: `msg-${senderId}`,
//             type: "message",
//             text: `لديك ${count} ${count === 1 ? "رسالة" : "رسائل"} غير مقروءة`,
//             time: "الآن",
//             read: false,
//           });
//         }
//       });

//       setNotifications(notifs);
//     } catch {
//       /* silent */
//     }
//   }, [authUser]);

//   useEffect(() => {
//     fetchNotifications();
//     const interval = setInterval(fetchNotifications, 60_000);
//     return () => clearInterval(interval);
//   }, [fetchNotifications]);

//   // أغلق عند الضغط برا (بدون تغيير)
//   useEffect(() => {
//     const handler = (e: MouseEvent) => {
//       if (
//         dropdownRef.current &&
//         !dropdownRef.current.contains(e.target as Node)
//       )
//         setDropdownOpen(false);
//       if (notifRef.current && !notifRef.current.contains(e.target as Node))
//         setNotifOpen(false);
//     };
//     document.addEventListener("mousedown", handler);
//     return () => document.removeEventListener("mousedown", handler);
//   }, []);

//   const markAllRead = () =>
//     setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

//   // باقي الـ JSX بدون أي تغيير ↓
//   return (
//     <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-xl border-b border-border/50">
//       <div className="flex items-center justify-between px-4 lg:px-8 h-16">
//         <div className="flex items-center gap-3">
//           <button
//             onClick={onMenuToggle}
//             className="lg:hidden p-2 rounded-xl hover:bg-muted transition-colors"
//           >
//             <Menu className="w-5 h-5 text-foreground" />
//           </button>
//           <h2 className="text-lg font-bold text-foreground hidden sm:block">
//             لوحة المتعلم
//           </h2>
//         </div>

//         <div className="flex items-center gap-2">
//           <div className="relative" ref={notifRef}>
//             <button
//               onClick={() => {
//                 setNotifOpen(!notifOpen);
//                 setDropdownOpen(false);
//               }}
//               className="relative p-2 rounded-xl hover:bg-muted transition-colors"
//             >
//               <Bell className="w-5 h-5 text-muted-foreground" />
//               {unreadCount > 0 && (
//                 <span className="absolute top-1 right-1 w-4 h-4 bg-destructive rounded-full text-[10px] text-white flex items-center justify-center font-bold">
//                   {unreadCount}
//                 </span>
//               )}
//             </button>

//             {notifOpen && (
//               <div
//                 className="absolute left-0 top-12 w-72 bg-card border border-border rounded-2xl shadow-xl overflow-hidden z-50"
//                 dir="rtl"
//               >
//                 <div className="flex items-center justify-between px-4 py-3 border-b border-border">
//                   <span className="font-bold text-sm text-foreground">
//                     الإشعارات
//                   </span>
//                   {unreadCount > 0 && (
//                     <button
//                       onClick={markAllRead}
//                       className="text-xs text-primary hover:underline"
//                     >
//                       تعيين الكل كمقروء
//                     </button>
//                   )}
//                 </div>
//                 <div className="max-h-72 overflow-y-auto divide-y divide-border">
//                   {notifications.length === 0 ? (
//                     <p className="text-center text-sm text-muted-foreground py-8">
//                       لا توجد إشعارات
//                     </p>
//                   ) : (
//                     notifications.map((n) => (
//                       <div
//                         key={n.id}
//                         className={`flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors ${!n.read ? "bg-primary/5" : ""}`}
//                       >
//                         <div
//                           className={`mt-0.5 w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${n.type === "message" ? "bg-blue-100 text-blue-600" : "bg-amber-100 text-amber-600"}`}
//                         >
//                           {n.type === "message" ? (
//                             <MessageCircle className="w-3.5 h-3.5" />
//                           ) : (
//                             <CheckCircle className="w-3.5 h-3.5" />
//                           )}
//                         </div>
//                         <div className="flex-1 min-w-0">
//                           <p className="text-xs text-foreground leading-relaxed">
//                             {n.text}
//                           </p>
//                           <p className="text-[10px] text-muted-foreground mt-1">
//                             {n.time}
//                           </p>
//                         </div>
//                         {!n.read && (
//                           <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
//                         )}
//                       </div>
//                     ))
//                   )}
//                 </div>
//               </div>
//             )}
//           </div>

//           <button
//             onClick={toggleTheme}
//             title={isDark ? "الوضع النهاري" : "الوضع الليلي"}
//           >
//             {isDark ? (
//               <Sun className="w-5 h-5 text-amber-400" />
//             ) : (
//               <Moon className="w-5 h-5 text-muted-foreground" />
//             )}
//           </button>

//           <div
//             className="relative pr-2 border-r border-border"
//             ref={dropdownRef}
//           >
//             <button
//               onClick={() => {
//                 setDropdownOpen(!dropdownOpen);
//                 setNotifOpen(false);
//               }}
//               className="flex items-center gap-2 p-1 rounded-xl hover:bg-muted transition-colors"
//             >
//               <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
//                 <span className="text-primary-foreground text-sm font-bold">
//                   {initials}
//                 </span>
//               </div>
//             </button>

//             {dropdownOpen && (
//               <div
//                 className="absolute left-0 top-12 w-52 bg-card border border-border rounded-2xl shadow-xl overflow-hidden z-50"
//                 dir="rtl"
//               >
//                 <div className="px-4 py-3 border-b border-border bg-muted/50">
//                   <div className="flex items-center gap-2">
//                     <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
//                       <span className="text-primary-foreground text-xs font-bold">
//                         {initials}
//                       </span>
//                     </div>
//                     <div className="min-w-0">
//                       <p className="text-sm font-bold text-foreground truncate">
//                         {user.full_name}
//                       </p>
//                       <p className="text-xs text-muted-foreground">طالب</p>
//                     </div>
//                   </div>
//                 </div>
//                 <div className="p-1">
//                   <button
//                     onClick={() => {
//                       setDropdownOpen(false);
//                       router.push("/profile");
//                     }}
//                     className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted rounded-xl transition-colors"
//                   >
//                     <User className="w-4 h-4 text-muted-foreground" />
//                     الملف الشخصي
//                   </button>
//                 </div>
//                 <div className="p-1 border-t border-border">
//                   <button
//                     onClick={() => {
//                       setDropdownOpen(false);
//                       onLogout();
//                     }}
//                     className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
//                   >
//                     <LogOut className="w-4 h-4" />
//                     تسجيل الخروج
//                   </button>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// }
"use client";

import {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useCallback,
} from "react";
import {
  Bell,
  Moon,
  Sun,
  LogOut,
  User,
  CheckCircle,
  MessageCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { getDashboardStats, getUnreadCount } from "@/lib/api/api";
import { useTheme } from "@/lib/context/ThemeContext";
interface TopBarProps {
  user: { full_name: string };
  onLogout: () => void;
}

// ── Type ──
interface Notification {
  id: string;
  type: "task" | "message";
  text: string;
  time: string;
  read: boolean;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "الآن";
  if (mins < 60) return `منذ ${mins} دقيقة`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `منذ ${hrs} ساعة`;
  return `منذ ${Math.floor(hrs / 24)} يوم`;
}

export default function TopBar({ user, onLogout }: TopBarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { isDark, toggleTheme } = useTheme();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { user: authUser } = useAuth();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const initials = user?.full_name
    ? user.full_name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .slice(0, 2)
    : "؟";

  // ── جلب الإشعارات الحقيقية ──
  const fetchNotifications = useCallback(async () => {
    if (!authUser) return;
    try {
      const [stats, unread] = await Promise.all([
        getDashboardStats(authUser.id),
        getUnreadCount(authUser.id),
      ]);

      const notifs: Notification[] = [];

      // إشعارات المهام العاجلة
      stats.urgentTasks?.forEach((task) => {
        notifs.push({
          id: `task-${task.id}`,
          type: "task",
          text: `مهمة عاجلة: ${task.title}`,
          time: task.due_date ? timeAgo(task.due_date) : "قريباً",
          read: false,
        });
      });

      // إشعارات الامتحان القادم
      if (
        stats.daysToExam !== null &&
        stats.daysToExam <= 3 &&
        stats.nextExamTitle
      ) {
        notifs.push({
          id: "exam-soon",
          type: "task",
          text: `امتحان ${stats.nextExamTitle} بعد ${stats.daysToExam} ${stats.daysToExam === 1 ? "يوم" : "أيام"}`,
          time: "قريباً",
          read: false,
        });
      }

      // إشعارات الرسائل غير المقروءة
      Object.entries(unread).forEach(([senderId, count]) => {
        if (count > 0) {
          notifs.push({
            id: `msg-${senderId}`,
            type: "message",
            text: `لديك ${count} ${count === 1 ? "رسالة" : "رسائل"} غير مقروءة`,
            time: "الآن",
            read: false,
          });
        }
      });

      setNotifications(notifs);
    } catch {
      /* silent */
    }
  }, [authUser]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60_000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // أغلق عند الضغط برا (بدون تغيير)
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      )
        setDropdownOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node))
        setNotifOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  // باقي الـ JSX بدون أي تغيير ↓
  return (
    <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-xl border-b border-border/50">
      <div className="flex items-center justify-between px-4 lg:px-8 h-16">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-foreground hidden sm:block">
            لوحة المتعلم
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => {
                setNotifOpen(!notifOpen);
                setDropdownOpen(false);
              }}
              className="relative p-2 rounded-xl hover:bg-muted transition-colors"
            >
              <Bell className="w-5 h-5 text-muted-foreground" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-destructive rounded-full text-[10px] text-white flex items-center justify-center font-bold">
                  {unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div
                className="absolute left-0 top-12 w-72 bg-card border border-border rounded-2xl shadow-xl overflow-hidden z-50"
                dir="rtl"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <span className="font-bold text-sm text-foreground">
                    الإشعارات
                  </span>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-xs text-primary hover:underline"
                    >
                      تعيين الكل كمقروء
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-border">
                  {notifications.length === 0 ? (
                    <p className="text-center text-sm text-muted-foreground py-8">
                      لا توجد إشعارات
                    </p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors ${!n.read ? "bg-primary/5" : ""}`}
                      >
                        <div
                          className={`mt-0.5 w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${n.type === "message" ? "bg-blue-100 text-blue-600" : "bg-amber-100 text-amber-600"}`}
                        >
                          {n.type === "message" ? (
                            <MessageCircle className="w-3.5 h-3.5" />
                          ) : (
                            <CheckCircle className="w-3.5 h-3.5" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-foreground leading-relaxed">
                            {n.text}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-1">
                            {n.time}
                          </p>
                        </div>
                        {!n.read && (
                          <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={toggleTheme}
            title={isDark ? "الوضع النهاري" : "الوضع الليلي"}
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-muted-foreground" />
            )}
          </button>

          <div
            className="relative pr-2 border-r border-border"
            ref={dropdownRef}
          >
            <button
              onClick={() => {
                setDropdownOpen(!dropdownOpen);
                setNotifOpen(false);
              }}
              className="flex items-center gap-2 p-1 rounded-xl hover:bg-muted transition-colors"
            >
              <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground text-sm font-bold">
                  {initials}
                </span>
              </div>
            </button>

            {dropdownOpen && (
              <div
                className="absolute left-0 top-12 w-52 bg-card border border-border rounded-2xl shadow-xl overflow-hidden z-50"
                dir="rtl"
              >
                <div className="px-4 py-3 border-b border-border bg-muted/50">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                      <span className="text-primary-foreground text-xs font-bold">
                        {initials}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">
                        {user.full_name}
                      </p>
                      <p className="text-xs text-muted-foreground">طالب</p>
                    </div>
                  </div>
                </div>
                <div className="p-1">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      router.push("/profile");
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted rounded-xl transition-colors"
                  >
                    <User className="w-4 h-4 text-muted-foreground" />
                    الملف الشخصي
                  </button>
                </div>
                <div className="p-1 border-t border-border">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      onLogout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    تسجيل الخروج
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
