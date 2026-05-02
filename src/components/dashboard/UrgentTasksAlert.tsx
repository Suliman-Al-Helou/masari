'use client';

import { useState } from 'react';
import { Bell, CheckCircle2, Clock, ChevronDown, ChevronUp, X } from 'lucide-react';
import { URGENT_TASKS } from '@/lib/constants/dashboard';

type Task = {
  id: string;
  title: string;
  course_code?: string;
  priority: string;
  status: string;
  due_date?: string;
};

function getHoursUntilDue(dueDateStr?: string) {
  if (!dueDateStr) return null;
  return (new Date(dueDateStr).getTime() - Date.now()) / (1000 * 60 * 60);
}

function formatTimeLeft(hours: number) {
  if (hours < 0) return 'انتهى الموعد!';
  if (hours < 1) return 'أقل من ساعة';
  if (hours < 24) return `${Math.floor(hours)} ساعة`;
  return `${Math.floor(hours / 24)} يوم`;
}

export default function UrgentTasksAlert() {
  const [tasks, setTasks] = useState<Task[]>(URGENT_TASKS);
  const [collapsed, setCollapsed] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const urgentTasks = tasks.filter(t => {
    if (t.priority !== 'عالي') return false;
    if (t.status === 'مكتمل') return false;
    const hours = getHoursUntilDue(t.due_date);
    return hours !== null && hours <= 48;
  });

  if (dismissed || urgentTasks.length === 0) return null;

  const handleDone = (id: string) => {
    setTasks(prev =>
      prev.map(t => t.id === id ? { ...t, status: 'مكتمل' } : t)
    );
  };

  const handlePostpone = (id: string) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id !== id) return t;
        const current = t.due_date ? new Date(t.due_date) : new Date();
        current.setDate(current.getDate() + 2);
        return { ...t, due_date: current.toISOString() };
      })
    );
  };

  return (
    <div className="rounded-2xl border border-destructive/30 bg-destructive/5 overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-2 flex-1"
        >
          <div className="relative">
            <Bell className="w-5 h-5 text-destructive" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-destructive text-white text-[8px] font-bold rounded-full flex items-center justify-center">
              {urgentTasks.length}
            </span>
          </div>
          <span className="font-bold text-destructive text-sm">
            {urgentTasks.length === 1
              ? 'مهمة عاجلة تستحق خلال 48 ساعة'
              : `${urgentTasks.length} مهام عاجلة خلال 48 ساعة`}
          </span>
          {collapsed
            ? <ChevronDown className="w-4 h-4 text-destructive mr-auto" />
            : <ChevronUp className="w-4 h-4 text-destructive mr-auto" />}
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="p-1 rounded-lg hover:bg-destructive/10 text-destructive/60 hover:text-destructive transition-colors mr-2"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Task list */}
      {!collapsed && (
        <div className="px-4 pb-4 space-y-2">
          {urgentTasks.map(task => {
            const hours = getHoursUntilDue(task.due_date);
            const isOverdue = hours !== null && hours < 0;
            return (
              <div
                key={task.id}
                className="flex items-center gap-3 bg-card rounded-xl p-3 border border-destructive/20"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground truncate">{task.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {task.course_code && (
                      <span className="text-[10px] border border-border px-2 py-0.5 rounded-lg text-muted-foreground">
                        {task.course_code}
                      </span>
                    )}
                    <span className={`text-[10px] flex items-center gap-0.5 font-medium ${isOverdue ? 'text-destructive' : 'text-amber-600'}`}>
                      <Clock className="w-3 h-3" />
                      {isOverdue ? 'انتهى الموعد!' : `متبقي ${formatTimeLeft(hours!)}`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handlePostpone(task.id)}
                    className="h-7 text-[11px] px-2 rounded-lg border border-amber-300 text-amber-700 hover:bg-amber-50 transition-colors"
                  >
                    تأجيل يومين
                  </button>
                  <button
                    onClick={() => handleDone(task.id)}
                    className="h-7 text-[11px] px-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    منجزة
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}