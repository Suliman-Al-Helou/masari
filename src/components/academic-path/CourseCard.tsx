import { CheckCircle, Clock, AlertCircle, BookOpen } from 'lucide-react';
import { STATUS_CONFIG, CATEGORY_COLORS } from '@/lib/constants/dashboard';
import Link from 'next/link';
type Course = {
  id: string;
  name: string;
  code: string;
  credits: number;
  category: string;
  status: string;
  grade: string | null;
};

const STATUS_ICONS = {
  'مكتملة': CheckCircle,
  'قيد الدراسة': Clock,
  'متبقية': AlertCircle,
  'مخطط لها': BookOpen,
};

export default function CourseCard({ course }: { course: Course }) {
  const statusStyle = STATUS_CONFIG[course.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG['متبقية'];
  const StatusIcon = STATUS_ICONS[course.status as keyof typeof STATUS_ICONS] ?? AlertCircle;

  return (
   <Link 
  href={`/course/${course.id}`}
  className="block rounded-2xl bg-card border border-border/50 p-5 hover:shadow-lg hover:shadow-primary/5 transition-all cursor-pointer"
>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-bold text-foreground">{course.name}</h4>
          <p className="text-xs text-muted-foreground mt-0.5">{course.code}</p>
        </div>
        <span className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg ${statusStyle.color}`}>
          <StatusIcon className="w-3 h-3" />
          {course.status}
        </span>
      </div>
      <div className="flex items-center gap-2 mt-3 flex-wrap">
        <span className="text-[10px] border border-border px-2 py-1 rounded-lg text-muted-foreground">
          {course.credits} ساعات
        </span>
        {course.category && (
          <span className={`text-[10px] px-2 py-1 rounded-lg ${CATEGORY_COLORS[course.category] ?? ''}`}>
            {course.category}
          </span>
        )}
      </div>
      {course.grade && (
        <p className="text-sm font-bold text-primary mt-3">العلامة: {course.grade}</p>
      )}
 </Link> 
  );
}