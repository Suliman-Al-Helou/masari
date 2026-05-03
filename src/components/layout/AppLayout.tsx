'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { useAuth } from '@/lib/hooks/useAuth';
import { useToast } from '@/lib/context/ToastContext';

interface AppLayoutProps {
  children: React.ReactNode;
}

const NO_LAYOUT_ROUTES = ['/login', '/verify-email', '/onboarding'];

export default function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const welcomedRef = useRef(false);

  const isNoLayout = NO_LAYOUT_ROUTES.includes(pathname);
  const isLanding = pathname === '/' && !user;

  // Toast مرحبا — مرة وحدة بالجلسة
  useEffect(() => {
    if (!user) return;
    if (welcomedRef.current) return;

    const welcomed = sessionStorage.getItem('welcomed');
    if (!welcomed) {
      const name = user.user_metadata?.full_name?.split(' ')[0] || 'بك';
      toast.success(`مرحباً ${name}! 👋`);
      sessionStorage.setItem('welcomed', 'true');
    }
    welcomedRef.current = true;
  }, [user]);

  const handleLogout = async () => {
    sessionStorage.removeItem('welcomed'); // ← امسح عشان يرجع يرحب بعد دخول جديد
    await logout();
    toast.info('تم تسجيل الخروج', 'نراك قريباً 👋');
    router.push('/');
  };

  // صفحات بدون layout
  if (isNoLayout || isLanding) return <>{children}</>;

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onLogout={handleLogout}
      />
      <div className="lg:mr-64 min-h-screen flex flex-col">
        <TopBar
          user={{ full_name: user?.user_metadata?.full_name || user?.email || 'مستخدم' }}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          onLogout={handleLogout}
        />
        <main className="flex-1 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}