'use client';

import { useState, useRef, useEffect } from 'react';
import { Menu, Bell, Settings, LogOut, User } from 'lucide-react';

interface TopBarProps {
  user: { full_name: string };
  onMenuToggle: () => void;
  onLogout: () => void;
}

export default function TopBar({ user, onMenuToggle, onLogout }: TopBarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const initials = user?.full_name
    ? user.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)
    : '؟';

  // أغلق الـ dropdown لو ضغط برا
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-xl border-b border-border/50">
      <div className="flex items-center justify-between px-4 lg:px-8 h-16">

        {/* Right side */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-xl hover:bg-muted transition-colors"
          >
            <Menu className="w-5 h-5 text-foreground" />
          </button>
          <h2 className="text-lg font-bold text-foreground hidden sm:block">
            لوحة المتعلم
          </h2>
        </div>

        {/* Left side */}
        <div className="flex items-center gap-3">
          <button className="relative p-2 rounded-xl hover:bg-muted transition-colors">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
          </button>
          <button className="p-2 rounded-xl hover:bg-muted transition-colors">
            <Settings className="w-5 h-5 text-muted-foreground" />
          </button>

          {/* Avatar + Dropdown */}
          <div className="relative pr-2 border-r border-border" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 p-1 rounded-xl hover:bg-muted transition-colors"
            >
              <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-content: center justify-center">
                <span className="text-primary-foreground text-sm font-bold">
                  {initials}
                </span>
              </div>
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute left-0 top-12 w-52 bg-card border border-border rounded-2xl shadow-xl overflow-hidden z-50">
                
                {/* معلومات المستخدم */}
                <div className="px-4 py-3 border-b border-border bg-muted/50">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <span className="text-primary-foreground text-xs font-bold">{initials}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">{user.full_name}</p>
                      <p className="text-xs text-muted-foreground">طالب</p>
                    </div>
                  </div>
                </div>

                {/* الإعدادات */}
                <div className="p-1">
                  <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted rounded-xl transition-colors">
                    <User className="w-4 h-4 text-muted-foreground" />
                    الملف الشخصي
                  </button>
                  <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted rounded-xl transition-colors">
                    <Settings className="w-4 h-4 text-muted-foreground" />
                    الإعدادات
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