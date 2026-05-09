'use client';

import { UserPlus, Users } from 'lucide-react';

interface StudentsHeaderProps {
  count: number;
  totalInMajor: number;
  currentMajor?: string | null;
  onInviteClick: () => void;
}

export default function StudentsHeader({ count, totalInMajor, currentMajor, onInviteClick }: StudentsHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Users className="w-6 h-6 text-primary" />
          شبكة الطلاب
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          تواصل مع زملائك في الجامعة
        </p>
        <div className="flex gap-2 mt-2 flex-wrap">
          {count > 0 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary">
              {count} طالب في الشبكة
            </span>
          )}
          {currentMajor && totalInMajor > 0 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-700">
              {totalInMajor} زميل في {currentMajor}
            </span>
          )}
        </div>
      </div>

      <button
        onClick={onInviteClick}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 active:scale-[0.98] transition-all"
      >
        <UserPlus className="w-4 h-4" />
        دعوة زميل
      </button>
    </div>
  );
}
