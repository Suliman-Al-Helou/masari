'use client';

import { MessageCircle, GraduationCap, Building2 } from 'lucide-react';
import {getInitials } from '@/lib/utils';
import { Student } from '@/types';

interface StudentCardProps {
  student: Student;
  onChat: (student: Student) => void;
  unreadCount?: number;
  isActive?: boolean;
}

const AVATAR_COLORS = [
  'bg-blue-100 text-blue-700',
  'bg-emerald-100 text-emerald-700',
  'bg-purple-100 text-purple-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-indigo-100 text-indigo-700',
  'bg-teal-100 text-teal-700',
  'bg-orange-100 text-orange-700',
];

function getColor(id: string) {
  const idx = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return AVATAR_COLORS[idx % AVATAR_COLORS.length];
}

export default function StudentCard({ student, onChat, unreadCount = 0, isActive = false }: StudentCardProps) {
  const initials = getInitials(student.full_name);
  const avatarColor = getColor(student.id);

  return (
    <div
      className={`rounded-2xl bg-card border p-5 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200 hover:-translate-y-0.5 cursor-default ${
        isActive ? 'border-primary/40 shadow-md shadow-primary/10' : 'border-border/50'
      }`}
    >
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className={`relative w-14 h-14 rounded-full flex items-center justify-center shrink-0 font-bold text-lg ${avatarColor}`}>
          {initials}
          {/* online dot */}
          <span className="absolute bottom-0 left-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-background rounded-full" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-foreground truncate">{student.full_name}</h4>

          {student.major && (
            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1 truncate">
              <GraduationCap className="w-3 h-3 shrink-0" />
              {student.major}
              {student.semester ? ` · ${student.semester}` : ''}
            </p>
          )}

          {student.university && (
            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1 truncate">
              <Building2 className="w-3 h-3 shrink-0" />
              {student.university}
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={() => onChat(student)}
          className={`relative flex-1 flex items-center justify-center gap-1.5 text-xs rounded-xl py-2 px-3 font-medium transition-colors ${
            isActive
              ? 'bg-primary text-primary-foreground'
              : 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20'
          }`}
        >
          <MessageCircle className="w-3.5 h-3.5" />
          {isActive ? 'المحادثة مفتوحة' : 'مراسلة'}
          {unreadCount > 0 && !isActive && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-destructive text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
