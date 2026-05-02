'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { useAuth } from '@/lib/hooks/useAuth';
import { useToast } from '@/lib/context/ToastContext';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isLoadingAuth, logout } = useAuth();
  const toast = useToast();
  const router = useRouter();

  // لو لسا بتحمّل — لا تعرض شيء
  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground font-medium">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  // لو مش مسجّل — حوّله للـ login
  if (!user) {
    router.push('/login');
    return null;
  }

  const handleLogout = async () => {
    await logout();
    toast.info('تم تسجيل الخروج', 'نراك قريباً 👋');
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="lg:mr-64 min-h-screen flex flex-col">
        <TopBar
          user={{ full_name: user.user_metadata?.full_name || user.email || 'مستخدم' }}
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