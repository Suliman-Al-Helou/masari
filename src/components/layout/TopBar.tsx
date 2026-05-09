"use client";

import { useState, useRef, useEffect } from "react";
import { Menu, Bell, Moon, Sun, LogOut, User, CheckCircle, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface TopBarProps {
  user: { full_name: string };
  onMenuToggle: () => void;
  onLogout: () => void;
}

// ── Dark Mode Hook ──
function useDarkMode() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const isDark = saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return { dark, toggle };
}

// ── بيانات وهمية للإشعارات (استبدلها لاحقاً بـ API حقيقي) ──
const MOCK_NOTIFICATIONS = [
  { id: "1", type: "task", text: "موعد تسليم تقرير الكيمياء غداً", time: "منذ ساعة", read: false },
  { id: "2", type: "message", text: "رسالة جديدة من OH Mamy", time: "منذ 30 دقيقة", read: false },
  { id: "3", type: "task", text: "امتحان الفيزياء بعد 3 أيام", time: "منذ يومين", read: true },
];

export default function TopBar({ user, onMenuToggle, onLogout }: TopBarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { dark, toggle: toggleDark } = useDarkMode();

  const unreadCount = notifications.filter(n => !n.read).length;

  const initials = user?.full_name
    ? user.full_name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)
    : "؟";

  // أغلق عند الضغط برا
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setDropdownOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node))
        setNotifOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));

  return (
    <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-xl border-b border-border/50">
      <div className="flex items-center justify-between px-4 lg:px-8 h-16">

        {/* Right side */}
        <div className="flex items-center gap-3">
          <button onClick={onMenuToggle} className="lg:hidden p-2 rounded-xl hover:bg-muted transition-colors">
            <Menu className="w-5 h-5 text-foreground" />
          </button>
          <h2 className="text-lg font-bold text-foreground hidden sm:block">لوحة المتعلم</h2>
        </div>

        {/* Left side */}
        <div className="flex items-center gap-2">

          {/* 🔔 الإشعارات */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => { setNotifOpen(!notifOpen); setDropdownOpen(false); }}
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
              <div className="absolute left-0 top-12 w-72 bg-card border border-border rounded-2xl shadow-xl overflow-hidden z-50" dir="rtl">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <span className="font-bold text-sm text-foreground">الإشعارات</span>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="text-xs text-primary hover:underline">
                      تعيين الكل كمقروء
                    </button>
                  )}
                </div>

                {/* القائمة */}
                <div className="max-h-72 overflow-y-auto divide-y divide-border">
                  {notifications.length === 0 ? (
                    <p className="text-center text-sm text-muted-foreground py-8">لا توجد إشعارات</p>
                  ) : notifications.map(n => (
                    <div key={n.id} className={`flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors ${!n.read ? "bg-primary/5" : ""}`}>
                      <div className={`mt-0.5 w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${n.type === "message" ? "bg-blue-100 text-blue-600" : "bg-amber-100 text-amber-600"}`}>
                        {n.type === "message"
                          ? <MessageCircle className="w-3.5 h-3.5" />
                          : <CheckCircle className="w-3.5 h-3.5" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-foreground leading-relaxed">{n.text}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">{n.time}</p>
                      </div>
                      {!n.read && <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 🌙 الوضع الليلي */}
          <button
            onClick={toggleDark}
            className="p-2 rounded-xl hover:bg-muted transition-colors"
            title={dark ? "الوضع النهاري" : "الوضع الليلي"}
          >
            {dark
              ? <Sun className="w-5 h-5 text-amber-400" />
              : <Moon className="w-5 h-5 text-muted-foreground" />
            }
          </button>

          {/* 👤 Avatar + Dropdown */}
          <div className="relative pr-2 border-r border-border" ref={dropdownRef}>
            <button
              onClick={() => { setDropdownOpen(!dropdownOpen); setNotifOpen(false); }}
              className="flex items-center gap-2 p-1 rounded-xl hover:bg-muted transition-colors"
            >
              <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground text-sm font-bold">{initials}</span>
              </div>
            </button>

            {dropdownOpen && (
              <div className="absolute left-0 top-12 w-52 bg-card border border-border rounded-2xl shadow-xl overflow-hidden z-50" dir="rtl">
                {/* معلومات المستخدم */}
                <div className="px-4 py-3 border-b border-border bg-muted/50">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                      <span className="text-primary-foreground text-xs font-bold">{initials}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">{user.full_name}</p>
                      <p className="text-xs text-muted-foreground">طالب</p>
                    </div>
                  </div>
                </div>

                {/* الملف الشخصي */}
                <div className="p-1">
                  <button
                    onClick={() => { setDropdownOpen(false); router.push("/profile"); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted rounded-xl transition-colors"
                  >
                    <User className="w-4 h-4 text-muted-foreground" />
                    الملف الشخصي
                  </button>
                </div>

                {/* تسجيل الخروج */}
                <div className="p-1 border-t border-border">
                  <button
                    onClick={() => { setDropdownOpen(false); onLogout(); }}
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