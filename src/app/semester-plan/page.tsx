'use client';

import { useState, useMemo, useEffect } from 'react';
import { Task, TabValue } from '@/lib/constants/semester-plan';
import { getTasks, addTask, updateTask } from '@/lib/api';
import { useAuth } from '@/lib/context/AuthContext';
import { useToast } from '@/lib/context/ToastContext';
import SemesterPlanHeader from '@/components/semester-plan/SemesterPlanHeader';
import SummaryCards from '@/components/semester-plan/SummaryCards';
import TaskTabs from '@/components/semester-plan/TaskTabs';
import TaskList from '@/components/semester-plan/TaskList';
import AddTaskDialog from '@/components/semester-plan/AddTaskDialog';
import { TaskForm } from '@/lib/constants/semester-plan';

export default function SemesterPlanPage() {
  const { user } = useAuth();
  const toast = useToast();

  const [tab, setTab] = useState<TabValue>('all');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // ── جلب المهام ──
  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      try {
        setLoading(true);
        const data = await getTasks(user.id);
        setTasks((data ?? []) as Task[]);
      } catch {
        toast.error('خطأ', 'تعذّر تحميل المهام');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [user]);

  // ── إضافة مهمة ──
  const handleAdd = async (form: TaskForm) => {
    if (!user) return;
    try {
      const newTask = await addTask({
        user_id: user.id,
        title: form.title,
        type: form.type,
        status: 'pending',
        priority: form.priority,
        due_date: form.due_date || undefined,
        course_code: form.course_code || undefined,
      });
      setTasks(prev => [newTask as Task, ...prev]);
      toast.success('تمت الإضافة', `تم إضافة "${form.title}"`);
    } catch {
      toast.error('خطأ', 'تعذّرت إضافة المهمة');
    }
  };

  // ── تغيير الحالة ──
  const handleStatusChange = async (id: string, status: Task['status']) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
    try {
      await updateTask(id, { status });
    } catch {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, status: t.status } : t));
      toast.error('خطأ', 'تعذّر تحديث الحالة');
    }
  };

  // ── حذف مهمة ──
  const handleDelete = async (id: string) => {
    const deleted = tasks.find(t => t.id === id);
    // optimistic: نحذف فوراً من الـ UI
    setTasks(prev => prev.filter(t => t.id !== id));
    try {
      const { deleteTask } = await import('@/lib/api');
      await deleteTask(id);
      toast.success('تم الحذف', `تم حذف "${deleted?.title ?? 'المهمة'}"`);
    } catch {
      // rollback
      if (deleted) setTasks(prev => [...prev, deleted].sort((a, b) =>
        (a.due_date ?? '').localeCompare(b.due_date ?? '')
      ));
      toast.error('خطأ', 'تعذّر حذف المهمة');
    }
  };

  const filteredTasks = useMemo(() =>
    tab === 'all' ? tasks : tasks.filter(t => t.status === tab),
    [tasks, tab]
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <SemesterPlanHeader onAddClick={() => setAddOpen(true)} />
      <SummaryCards tasks={tasks} />
      <TaskTabs value={tab} onChange={setTab} />
      <TaskList
        tasks={filteredTasks}
        loading={loading}
        onStatusChange={handleStatusChange}
        onDelete={handleDelete}
      />
      <AddTaskDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onAdd={handleAdd}
      />
    </div>
  );
}