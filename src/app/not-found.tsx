'use client';

import { usePathname } from 'next/navigation';
import { Home } from 'lucide-react';

export default function NotFound() {
  const pathname = usePathname();
  const pageName = pathname.substring(1);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background" dir="rtl">
      <div className="max-w-md w-full text-center space-y-6">

        <div className="space-y-2">
          <h1 className="text-7xl font-light text-muted-foreground/30">404</h1>
          <div className="h-0.5 w-16 bg-border mx-auto" />
        </div>

        <div className="space-y-3">
          <h2 className="text-2xl font-bold text-foreground">الصفحة غير موجودة</h2>
          <p className="text-muted-foreground">
            الصفحة{' '}
            <span className="font-medium text-foreground">"{pageName}"</span>{' '}
            غير موجودة
          </p>
        </div>

        <button
          onClick={() => window.location.href = '/'}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Home className="w-4 h-4" />
          العودة للرئيسية
        </button>

      </div>
    </div>
  );
}