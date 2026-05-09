'use client';

import { Calendar } from 'lucide-react';
import { Task } from '@/lib/constants/semester-plan';
import TaskCard from './TaskCard';

interface TaskListProps {
  tasks: Task[];
  loading: boolean;
  onStatusChange: (id: string, status: Task['status']) => void;
  onDelete: (id: string) => void;
}

function LoadingSpinner() {
  return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-20">
      <Calendar className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
      <p className="text-muted-foreground">لا توجد مهام في هذا القسم</p>
    </div>
  );
}

export default function TaskList({ tasks, loading, onStatusChange, onDelete }: TaskListProps) {
  if (loading) return <LoadingSpinner />;
  if (tasks.length === 0) return <EmptyState />;

  return (
    <div className="space-y-3">
      {tasks.map(task => (
        <TaskCard
          key={task.id}
          task={task}
          onStatusChange={onStatusChange}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
