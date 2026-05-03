"use client";

import { useState } from "react";
import { X, Plus } from "lucide-react";
import { STATUS_CONFIG, CATEGORY_COLORS } from "@/lib/constants/dashboard";
import { useToast } from "@/lib/context/ToastContext";

type Course = {
  id: string;
  name: string;
  code: string;
  credits: number;
  category: string;
  status: string;
  grade: string | null;
};

const EMPTY_FORM = {
  name: "",
  code: "",
  credits: 3,
  category: "متطلب تخصص",
  status: "متبقية",
};

interface Props {
  // ✅ شلنا "grade" من الـ Omit عشان نقدر نمرر grade: null
  onAdd: (course: Omit<Course, "id">) => void;
}

export default function AddCourseDialog({ onAdd }: Props) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const toast = useToast();

  const handleSubmit = () => {
    if (!form.name || !form.code) {
      toast.error('بيانات ناقصة', 'يرجى تعبئة اسم المادة والرمز');
      return;
    }
    onAdd({ ...form, grade: null });
    toast.success('تمت إضافة المادة', `تم إضافة ${form.name} إلى مسارك الدراسي`);
    setForm(EMPTY_FORM);
    setOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
      >
        <Plus className="w-4 h-4" />
        إضافة مادة
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-card rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl" dir="rtl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-foreground text-lg">إضافة مادة جديدة</h3>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">اسم المادة</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="مثال: خوارزميات"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">رمز المادة</label>
                  <input
                    type="text"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    placeholder="CS301"
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">الساعات</label>
                  <input
                    type="number"
                    value={form.credits}
                    onChange={(e) => setForm({ ...form, credits: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">التصنيف</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    {Object.keys(CATEGORY_COLORS).map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">الحالة</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    {Object.keys(STATUS_CONFIG).map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                className="w-full bg-primary text-primary-foreground py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
              >
                إضافة
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}