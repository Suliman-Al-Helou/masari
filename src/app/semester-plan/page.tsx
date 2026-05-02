'use client';

// src/app/semester-plan/page.tsx

import { useState, useMemo } from 'react';
import { MOCK_TASKS, Task, TabValue } from '@/lib/constants/semester-plan';
import SemesterPlanHeader from '@/components/semester-plan/SemesterPlanHeader';
import SummaryCards from '@/components/semester-plan/SummaryCards';
import TaskTabs from '@/components/semester-plan/TaskTabs';
import TaskList from '@/components/semester-plan/TaskList';
import AddTaskDialog from '@/components/semester-plan/AddTaskDialog';

export default function SemesterPlanPage() {
  const [tab, setTab] = useState<TabValue>('all');
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [addOpen, setAddOpen] = useState(false);
  const [loading] = useState(false); // ← true + API call عند الربط

  const filteredTasks = useMemo(() =>
    tab === 'all' ? tasks : tasks.filter(t => t.status === tab),
    [tasks, tab]
  );

  const handleAdd = (form: Omit<Task, 'id'>) => {
    // TODO: استبدل بـ API call عند ربط الـ backend
    const newTask: Task = { ...form, id: Date.now().toString() };
    setTasks(prev => [newTask, ...prev]);
  };

  const handleStatusChange = (id: string, status: Task['status']) => {
    // TODO: استبدل بـ API call عند ربط الـ backend
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <SemesterPlanHeader onAddClick={() => setAddOpen(true)} />

      <SummaryCards tasks={tasks} />

      <TaskTabs value={tab} onChange={setTab} />

      <TaskList
        tasks={filteredTasks}
        loading={loading}
        onStatusChange={handleStatusChange}
      />

      <AddTaskDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onAdd={handleAdd}
      />
    </div>
  );
}