'use client';

import { Users } from 'lucide-react';
import { Student } from '@/lib/constants/students';
import StudentCard from './StudentCard';

interface StudentsGridProps {
  students: Student[];
  loading: boolean;
  onChat: (student: Student) => void;
  unreadCounts: Record<string, number>;
  activeStudentId?: string | null;
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-2xl bg-card border border-border/50 p-5 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded-lg w-3/4" />
              <div className="h-3 bg-muted rounded-lg w-1/2" />
              <div className="h-3 bg-muted rounded-lg w-2/3" />
            </div>
          </div>
          <div className="h-9 bg-muted rounded-xl mt-4" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ hasSearch }: { hasSearch: boolean }) {
  return (
    <div className="text-center py-20">
      <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
      <p className="text-muted-foreground font-medium">
        {hasSearch ? 'لا يوجد طلاب مطابقون للبحث' : 'لا يوجد طلاب في الشبكة بعد'}
      </p>
      <p className="text-xs text-muted-foreground/60 mt-1">
        {!hasSearch && 'ادعُ زملاءك للانضمام عبر الزر في الأعلى'}
      </p>
    </div>
  );
}

export default function StudentsGrid({
  students, loading, onChat, unreadCounts, activeStudentId
}: StudentsGridProps) {
  if (loading) return <LoadingSkeleton />;
  if (students.length === 0) return <EmptyState hasSearch={false} />;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {students.map(student => (
        <StudentCard
          key={student.id}
          student={student}
          onChat={onChat}
          unreadCount={unreadCounts[student.id] ?? 0}
          isActive={activeStudentId === student.id}
        />
      ))}
    </div>
  );
}
