'use client';

// src/components/semester-plan/AddTaskDialog.tsx

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { TaskForm, DEFAULT_FORM, TASK_TYPES, TASK_PRIORITIES } from '@/lib/constants/semester-plan';

interface AddTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (form: TaskForm) => void;
}

export default function AddTaskDialog({ open, onOpenChange, onAdd }: AddTaskDialogProps) {
  const [form, setForm] = useState<TaskForm>(DEFAULT_FORM);

  if (!open) return null;

  const handleSubmit = () => {
    if (!form.title.trim()) return;
    onAdd(form);
    setForm(DEFAULT_FORM);
    onOpenChange(false);
  };

  const field = (label: string, children: React.ReactNode) => (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">{label}</label>
      {children}
    </div>
  );

  const inputClass = "w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all";
  const selectClass = inputClass;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="bg-card border border-border rounded-2xl p-6 shadow-xl"
        style={{ width: 'min(440px, calc(100vw - 2rem))' }}
        dir="rtl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <Plus className="w-4 h-4 text-primary" />
            </div>
            <h2 className="font-bold text-foreground">إضافة مهمة جديدة</h2>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {field('عنوان المهمة',
            <input
              className={inputClass}
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="مثال: تسليم الواجب الثالث"
            />
          )}

          <div className="grid grid-cols-2 gap-4">
            {field('النوع',
              <select
                className={selectClass}
                value={form.type}
                onChange={e => setForm({ ...form, type: e.target.value as TaskForm['type'] })}
              >
                {TASK_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            )}
            {field('الأولوية',
              <select
                className={selectClass}
                value={form.priority}
                onChange={e => setForm({ ...form, priority: e.target.value as TaskForm['priority'] })}
              >
                {TASK_PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {field('رمز المادة',
              <input
                className={inputClass}
                value={form.course_code}
                onChange={e => setForm({ ...form, course_code: e.target.value })}
                placeholder="CS301"
                dir="ltr"
              />
            )}
            {field('تاريخ الاستحقاق',
              <input
                type="date"
                className={inputClass}
                value={form.due_date}
                onChange={e => setForm({ ...form, due_date: e.target.value })}
                dir="ltr"
              />
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={!form.title.trim()}
            className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 active:scale-[0.98] transition-all"
          >
            إضافة المهمة
          </button>
        </div>
      </div>
    </div>
  );
}