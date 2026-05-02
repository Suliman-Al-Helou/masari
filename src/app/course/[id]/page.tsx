'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, BookOpen, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { MOCK_COURSES_MAP, STATUS_CONFIG, CATEGORY_COLORS } from '@/lib/constants/dashboard';
import CourseNotes from '@/components/courses/CourseNotes';

const STATUS_ICONS = {
  'مكتملة': CheckCircle,
  'قيد الدراسة': Clock,
  'متبقية': AlertCircle,
  'مخطط لها': BookOpen,
};

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const course = MOCK_COURSES_MAP[id];

  if (!course) {
    return (
      <div className="text-center py-40">
        <p className="text-muted-foreground">المادة غير موجودة</p>
        <Link
          href="/academic-path"
          className="inline-flex items-center gap-2 mt-4 border border-border px-4 py-2 rounded-xl text-sm hover:bg-muted transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          العودة للمسار
        </Link>
      </div>
    );
  }

  const statusStyle = STATUS_CONFIG[course.status as keyof typeof STATUS_CONFIG]
    ?? STATUS_CONFIG['متبقية'];
  const StatusIcon = STATUS_ICONS[course.status as keyof typeof STATUS_ICONS]
    ?? AlertCircle;

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Back */}
      <Link
        href="/academic-path"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowRight className="w-4 h-4" />
        العودة للمسار الدراسي
      </Link>

      {/* Course header */}
      <div className="rounded-2xl bg-card border border-border/50 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{course.name}</h1>
            <p className="text-muted-foreground text-sm mt-1" dir="ltr">{course.code}</p>
          </div>
          <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm w-fit ${statusStyle.color}`}>
            <StatusIcon className="w-4 h-4" />
            {course.status}
          </span>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          <span className="text-xs border border-border px-3 py-1 rounded-lg text-muted-foreground">
            {course.credits} ساعات معتمدة
          </span>
          {course.category && (
            <span className={`text-xs px-3 py-1 rounded-lg ${CATEGORY_COLORS[course.category] ?? ''}`}>
              {course.category}
            </span>
          )}
          {course.grade && (
            <span className="text-xs px-3 py-1 rounded-lg bg-primary/10 text-primary">
              العلامة: {course.grade}
            </span>
          )}
        </div>
      </div>

      {/* Notes */}
      <CourseNotes courseCode={course.code} courseName={course.name} />

    </div>
  );
}