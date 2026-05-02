import { Clock } from 'lucide-react';
import { TASKS } from '@/lib/constants/dashboard';

export default function UpcomingTasks() {
  return (
    <div className="rounded-2xl bg-card border border-border/50 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-foreground">المهام القادمة</h3>
        <span className="flex items-center gap-1 text-xs bg-muted text-muted-foreground px-3 py-1 rounded-lg">
          <Clock className="w-3 h-3" />
          هذا الأسبوع
        </span>
      </div>

      <div className="space-y-3">
        {TASKS.map((task, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
          >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
              task.urgent
                ? 'bg-destructive/10 text-destructive'
                : 'bg-primary/10 text-primary'
            }`}>
              <task.icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
              <p className="text-xs text-muted-foreground">{task.course}</p>
            </div>
            <span className="text-[10px] border border-border rounded-lg px-2 py-1 shrink-0 text-muted-foreground">
              {task.type}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}