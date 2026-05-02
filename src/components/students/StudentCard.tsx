'use client';

// src/components/students/StudentCard.tsx

import { Mail } from 'lucide-react';
import { Student, getInitials } from '@/lib/constants/students';

interface StudentCardProps {
  student: Student;
}

export default function StudentCard({ student }: StudentCardProps) {
  const initials = getInitials(student.full_name);
  const isAdmin = student.role === 'admin';

  return (
    <div className="rounded-2xl bg-card border border-border/50 p-5 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200 hover:-translate-y-0.5">
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <span className="text-primary font-bold text-lg">{initials}</span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-foreground truncate">
            {student.full_name || 'بدون اسم'}
          </h4>
          <p className="text-xs text-muted-foreground truncate" dir="ltr">
            {student.email}
          </p>
          {student.major && (
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              {student.major} {student.year ? `· السنة ${student.year}` : ''}
            </p>
          )}
          <span
            className={`inline-block mt-1.5 text-[10px] px-2 py-0.5 rounded-full border font-medium
              ${isAdmin
                ? 'bg-warning/10 text-warning border-warning/20'
                : 'bg-primary/10 text-primary border-primary/20'
              }`}
          >
            {isAdmin ? 'مشرف' : 'طالب'}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={() => window.open(`mailto:${student.email}`)}
          className="flex-1 flex items-center justify-center gap-1.5 text-xs border border-border rounded-xl py-2 px-3 hover:bg-muted transition-colors"
        >
          <Mail className="w-3 h-3" />
          مراسلة
        </button>
      </div>
    </div>
  );
}