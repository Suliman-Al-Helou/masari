// src/components/academic-path/AcademicProgress.tsx
'use client';

import { useState } from 'react';
import { Download, TrendingUp } from 'lucide-react';
import { STATUS_CONFIG } from '@/lib/constants/dashboard';
import { calculateGPA } from '@/lib/gpa';
import { useAuth } from '@/lib/hooks/useAuth';
import { getProfile } from '@/lib/api';

type Course = {
  name: string;
  code: string;
  credits: number;
  category: string;
  status: string;
  grade: string | null;
};

export default function AcademicProgress({ courses }: { courses: Course[] }) {
  const { user } = useAuth();
  const [exporting, setExporting] = useState(false);

  const completed = courses.filter(c => c.status === 'مكتملة').length;
  const progress = Math.round((completed / (courses.length || 1)) * 100);
  const { gpa, completedCredits, gradedCredits } = calculateGPA(courses);

  const handleExport = async () => {
    if (!user) return;
    setExporting(true);
    try {
      const { data: profile } = await getProfile(user.id);
      const { exportTranscriptPDF } = await import('@/lib/exportTranscript');
      await exportTranscriptPDF(courses, profile ?? {});
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setExporting(false);
    }
  };

  // لون GPA
  const gpaColor = gpa === null ? 'text-muted-foreground'
    : gpa >= 3.5 ? 'text-emerald-600'
    : gpa >= 2.5 ? 'text-blue-600'
    : gpa >= 2.0 ? 'text-amber-600'
    : 'text-destructive';

  return (
    <div className="rounded-2xl bg-card border border-border/50 p-6 space-y-5">

      {/* Row 1: Progress + GPA + Export */}
      <div className="flex items-start justify-between gap-4">

        {/* Progress */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-foreground">نسبة الإكمال</h3>
            <span className="text-sm font-bold text-primary">{progress}%</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1.5">
            {completedCredits} ساعة مكتملة من أصل {courses.reduce((s, c) => s + c.credits, 0)} ساعة
          </p>
        </div>

        {/* GPA Box */}
        <div className="flex flex-col items-center bg-muted/50 rounded-2xl px-5 py-3 min-w-[90px]">
          <div className="flex items-center gap-1 mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[11px] text-muted-foreground font-medium">المعدل</span>
          </div>
          <span className={`text-2xl font-bold ${gpaColor}`}>
            {gpa !== null ? gpa.toFixed(2) : '—'}
          </span>
          <span className="text-[10px] text-muted-foreground mt-0.5">
            {gradedCredits > 0 ? `من ${gradedCredits} ساعة` : 'لا توجد علامات'}
          </span>
        </div>
      </div>

      {/* Row 2: Status counts */}
      <div className="flex justify-around">
        {Object.keys(STATUS_CONFIG).map(status => (
          <div key={status} className="text-center">
            <p className="text-xl font-bold text-foreground">
              {courses.filter(c => c.status === status).length}
            </p>
            <p className="text-[11px] text-muted-foreground">{status}</p>
          </div>
        ))}
      </div>

      {/* Row 3: Export button */}
      <button
        onClick={handleExport}
        disabled={exporting || courses.filter(c => c.status === 'مكتملة').length === 0}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl
                   border border-border hover:bg-muted transition-colors text-sm font-medium
                   text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Download className="w-4 h-4" />
        {exporting ? 'جاري التصدير...' : 'تصدير السجل الأكاديمي PDF'}
      </button>
    </div>
  );
}