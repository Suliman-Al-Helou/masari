import { Clock, FileText, BookOpen, Code, CheckCircle, HelpCircle } from 'lucide-react';

type Task = {
  id: string;
  title: string;
  course_code?: string;
  type?: string;
  due_date?: string;
  priority?: string;
};

const TYPE_ICONS: Record<string, React.ElementType> = {
  'واجب': FileText,
  'امتحان': BookOpen,
  'مشروع': Code,
  'مكتمل': CheckCircle,
  'أخرى': HelpCircle,
};

function daysUntil(dateStr?: string) {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function formatDue(days: number | null) {
  if (days === null) return '';
  if (days < 0) return 'انتهى الموعد';
  if (days === 0) return 'اليوم';
  if (days === 1) return 'غداً';
  return `${days} أيام`;
}

interface UpcomingTasksProps {
  tasks: Task[];
}

export default function UpcomingTasks({ tasks }: UpcomingTasksProps) {
  return (
    <div className="rounded-2xl bg-card border border-border/50 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-foreground">المهام القادمة</h3>
        <span className="flex items-center gap-1 text-xs bg-muted text-muted-foreground px-3 py-1 rounded-lg">
          <Clock className="w-3 h-3" />
          هذا الأسبوع
        </span>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground/50 text-sm">
          لا توجد مهام قادمة هذا الأسبوع 🎉
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => {
            const days = daysUntil(task.due_date);
            const isUrgent = days !== null && days <= 1;
            const Icon = TYPE_ICONS[task.type ?? ''] ?? HelpCircle;

            return (
              <div
                key={task.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                  isUrgent ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
                  <p className="text-xs text-muted-foreground">{task.course_code ?? ''}</p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="text-[10px] border border-border rounded-lg px-2 py-1 text-muted-foreground">
                    {task.type ?? 'أخرى'}
                  </span>
                  {days !== null && (
                    <span className={`text-[10px] font-medium ${isUrgent ? 'text-destructive' : 'text-muted-foreground'}`}>
                      {formatDue(days)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
