'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';

interface AdminGuardProps {
  children: React.ReactNode;
}

type Status = 'checking' | 'authorized' | 'unauthorized';

export default function AdminGuard({ children }: AdminGuardProps) {
  // isAdmin مأخوذة من AuthContext مباشرة — لا حاجة لـ DB call إضافية
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [status, setStatus] = useState<Status>('checking');

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace('/login');
      return;
    }

    if (isAdmin) {
      setStatus('authorized');
    } else {
      setStatus('unauthorized');
      setTimeout(() => router.replace('/'), 3000);
    }
  }, [user, isAdmin, loading, router]);

  // ── شاشة التحميل ──
  if (loading || status === 'checking') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Shield className="w-6 h-6 text-primary animate-pulse" />
          </div>
          <p className="text-sm text-muted-foreground font-medium">
            جاري التحقق من الصلاحيات...
          </p>
        </div>
      </div>
    );
  }

  // ── غير مصرح له ──
  if (status === 'unauthorized') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center max-w-sm px-6">
          <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center">
            <Shield className="w-8 h-8 text-destructive" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground mb-1">
              ليس لديك صلاحية الوصول
            </h2>
            <p className="text-sm text-muted-foreground">
              هذه الصفحة مخصصة للمديرين فقط. سيتم تحويلك تلقائياً...
            </p>
          </div>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-primary/30 animate-bounce"
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}