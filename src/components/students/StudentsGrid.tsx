'use client';

// src/components/students/StudentsGrid.tsx

import { Users } from 'lucide-react';
import { Student } from '@/lib/constants/students';
import StudentCard from './StudentCard';

interface StudentsGridProps {
  students: Student[];
  loading: boolean;
}

function LoadingSpinner() {
  return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-20">
      <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
      <p className="text-muted-foreground">لا يوجد طلاب مطابقون للبحث</p>
    </div>
  );
}

export default function StudentsGrid({ students, loading }: StudentsGridProps) {
  if (loading) return <LoadingSpinner />;
  if (students.length === 0) return <EmptyState />;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {students.map(student => (
        <StudentCard key={student.id} student={student} />
      ))}
    </div>
  );
}