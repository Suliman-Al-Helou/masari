'use client';

import { differenceInDays } from 'date-fns';

type Task = {
  id:          string;
  title:       string;
  type:        string;
  priority?:   string;
  due_date?:   string | null;
  course_code?: string | null;
  status:      string;
};

const TYPE_ICON: Record<string, string> = {
  واجب:    '📝',
  مشروع:  '🗂️',
  امتحان:  '📋',
  مذاكرة: '📖',
};

export default function UpcomingTasks({ tasks }: { tasks: Task[] }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <h2 className="text-base font-medium text-foreground mb-4">المهام القادمة</h2>

      {tasks.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          لا يوجد مهام معلقة 🎉
        </p>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => {
            const daysLeft = task.due_date
              ? differenceInDays(new Date(task.due_date), new Date())
              : null;

            const isOverdue = daysLeft !== null && daysLeft < 0;
            const isUrgent  = daysLeft !== null && daysLeft <= 2 && !isOverdue;

            return (
              <div
                key={task.id}
                className="flex items-center gap-3 p-3 rounded-xl border border-border bg-background"
              >
                {/* أيقونة النوع */}
                <span className="text-base flex-shrink-0">
                  {TYPE_ICON[task.type] ?? '📌'}
                </span>

                {/* العنوان والمادة */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {task.title}
                  </p>
                  {task.course_code && (
                    <p className="text-xs text-muted-foreground" dir="ltr">
                      {task.course_code}
                    </p>
                  )}
                </div>

                {/* الوقت المتبقي */}
                {daysLeft !== null && (
                  <span
                    className={`text-xs font-medium flex-shrink-0 ${
                      isOverdue ? 'text-destructive' :
                      isUrgent  ? 'text-warning' :
                                  'text-muted-foreground'
                    }`}
                  >
                    {isOverdue
                      ? `متأخر ${Math.abs(daysLeft)} يوم`
                      : daysLeft === 0
                      ? 'اليوم'
                      : `${daysLeft} يوم`}
                  </span>
                )}

                {/* نقطة الأولوية */}
                <span
                  className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    task.priority === 'عالي'   ? 'bg-destructive' :
                    task.priority === 'متوسط' ? 'bg-warning' :
                                                 'bg-muted-foreground/30'
                  }`}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}