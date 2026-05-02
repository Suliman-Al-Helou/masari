'use client';

import { Sparkles } from 'lucide-react';

interface WelcomeCardProps {
  user?: { full_name?: string };
}

export default function WelcomeCard({ user }: WelcomeCardProps) {
  const name = user?.full_name || 'الطالب';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'صباح الخير' : hour < 18 ? 'مساء الخير' : 'مساء النور';

  return (
    <div className="relative overflow-hidden rounded-2xl bg-primary p-6 lg:p-8 text-white">
      {/* Decorative circles */}
      <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
      <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-xl" />

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-white/80 text-sm">{greeting}</span>
          <span className="text-lg">👋</span>
        </div>
        <h2 className="text-2xl lg:text-3xl font-bold mb-2">{name}</h2>

        <div className="flex items-center gap-2 bg-white/15 rounded-xl px-4 py-2.5 w-fit mt-4">
          <Sparkles className="w-4 h-4" />
          <p className="text-sm font-medium">دليلك الذكي في رحلتك الجامعية</p>
        </div>

        <p className="text-white/70 text-xs mt-3 max-w-md leading-relaxed">
          لا تضيع بين المواد والمواعيد. مساري يرسم لك طريقك الأكاديمي خطوة بخطوة.
        </p>
      </div>
    </div>
  );
}