'use client';

// src/components/semester-plan/SemesterPlanHeader.tsx

import { Plus } from 'lucide-react';

interface SemesterPlanHeaderProps {
  onAddClick: () => void;
}

export default function SemesterPlanHeader({ onAddClick }: SemesterPlanHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">مخطط الفصل</h1>
        <p className="text-sm text-muted-foreground mt-1">نظّم مهامك وواجباتك الأكاديمية</p>
      </div>
      <button
        onClick={onAddClick}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 active:scale-[0.98] transition-all"
      >
        <Plus className="w-4 h-4" />
        مهمة جديدة
      </button>
    </div>
  );
}