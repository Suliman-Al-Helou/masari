'use client';

import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { STATUS_CONFIG, CATEGORY_COLORS } from '@/lib/constants/dashboard';

type Course = {
  id: string;
  name: string;
  code: string;
  credits: number;
  category: string;
  status: string;
  grade: string | null;
};

interface Props {
  course: Course;
  onClick: (course: Course) => void;
}

export default function CourseCard({ course, onClick }: Props) {
  const statusStyle = STATUS_CONFIG[course.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG['متبقية'];
  const categoryColor = CATEGORY_COLORS[course.category as keyof typeof CATEGORY_COLORS] ?? 'bg-gray-100 text-gray-600';

  return (
    <div
      className="group w-full text-right block rounded-2xl bg-card border border-border/50 p-5
                 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30
                 hover:shadow-lg hover:shadow-primary/10 cursor-pointer"
      onClick={() => onClick(course)}
    >
      <div className="flex items-start justify-between mb-3">
        <span className={`text-[11px] px-2.5 py-1 rounded-lg ${statusStyle.color}`}>
          {course.status}
        </span>
        <span className="text-xs text-muted-foreground font-mono" dir="ltr">{course.code}</span>
      </div>

      <h4 className="font-bold text-foreground group-hover:text-primary transition-colors duration-300 mb-2 text-sm leading-snug">
        {course.name}
      </h4>

      <div className="flex items-center justify-between mt-3">
        <span className={`text-[11px] px-2 py-0.5 rounded-md ${categoryColor}`}>
          {course.category}
        </span>
        <span className="text-xs text-muted-foreground">{course.credits} ساعات</span>
      </div>

      {/* Grade + link to notes */}
      <div className="flex items-center justify-between mt-2">
        {course.grade && (
          <div className="text-xs font-bold text-primary" dir="ltr">{course.grade}</div>
        )}
        <Link
          href={`/course/${course.id}`}
          onClick={e => e.stopPropagation()}
          className="mr-auto flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition-colors px-2 py-1 rounded-lg hover:bg-primary/10"
        >
          <ExternalLink className="w-3 h-3" />
          الملاحظات
        </Link>
      </div>
    </div>
  );
}
