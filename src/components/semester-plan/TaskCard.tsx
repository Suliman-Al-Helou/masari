'use client';

// src/components/semester-plan/TaskCard.tsx

import { Clock, CheckCircle } from 'lucide-react';
import { Task, TYPE_ICONS, STATUS_STYLES, PRIORITY_STYLES, nextStatus } from '@/lib/constants/semester-plan';

interface TaskCardProps {
  task: Task;
  onStatusChange: (id: string, status: Task['status']) => void;
}

export default function TaskCard({ task, onStatusChange }: TaskCardProps) {
  const Icon = TYPE_ICONS[task.type] ?? TYPE_ICONS['أخرى'];
  const isDone = task.status === 'مكتمل';

  return (
    <div className="rounded-2xl bg-card border border-border/50 p-4 hover:shadow-md transition-all duration-200">
      <div className="flex items-center gap-4">

        {/* Status toggle button */}
        <button
          onClick={() => onStatusChange(task.id, nextStatus(task.status))}
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
            isDone
              ? 'bg-success/10 text-success'
              : 'bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary'
          }`}
        >
          {isDone
            ? <CheckCircle className="w-5 h-5" />
            : <Icon className="w-5 h-5" />
          }
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={`font-medium ${isDone ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
            {task.title}
          </p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {task.course_code && (
              <span className="text-[10px] px-2 py-0.5 rounded-full border border-border text-muted-foreground">
                {task.course_code}
              </span>
            )}
            {task.type && (
              <span className="text-[10px] px-2 py-0.5 rounded-full border border-border text-muted-foreground">
                {task.type}
              </span>
            )}
            {task.due_date && (
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {task.due_date}
              </span>
            )}
          </div>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${PRIORITY_STYLES[task.priority]}`}>
            {task.priority}
          </span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${STATUS_STYLES[task.status]}`}>
            {task.status}
          </span>
        </div>

      </div>
    </div>
  );
}