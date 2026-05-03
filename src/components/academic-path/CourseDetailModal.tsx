'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Pencil, Trash2, Save, XCircle, Hash, Clock4, Tag, Award } from 'lucide-react';
import { STATUS_CONFIG } from '@/lib/constants/dashboard';
import { updateCourse, deleteCourse } from '@/lib/api';
import { useToast } from '@/lib/context/ToastContext';

type Course = {
  id: string;
  name: string;
  code: string;
  credits: number;
  category: string;
  status: string;
  grade: string | null;
};

interface Props {
  course: Course | null;
  onClose: () => void;
  onUpdate: (updated: Course) => void;
  onDelete: (id: string) => void;
}

const ALL_STATUSES = ['متبقية', 'مخطط لها', 'قيد الدراسة', 'مكتملة'];
const ALL_CATEGORIES = ['متطلب تخصص', 'متطلب جامعة', 'متطلب اختياري', 'متطلب إجباري'];

export default function CourseDetailModal({ course, onClose, onUpdate, onDelete }: Props) {
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saving, setSaving] = useState(false);

  // ✅ FIX 1: null مش course — يمنع الفتح التلقائي
  const [form, setForm] = useState<Course | null>(null);

  // ✅ FIX 1: useRef يتابع آخر id عشان useEffect ما يشتغل بدون سبب
  const prevIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (course && course.id !== prevIdRef.current) {
      // مادة جديدة فُتحت
      prevIdRef.current = course.id;
      setForm({ ...course });
      setEditing(false);
      setConfirmDelete(false);
    }
    if (!course) {
      // Modal انغلق — نصفّر كل شي
      prevIdRef.current = null;
      setForm(null);
      setEditing(false);
      setConfirmDelete(false);
    }
  }, [course]);

  // ✅ FIX 2: دالة إغلاق موحّدة
  const handleClose = () => {
    prevIdRef.current = null;
    onClose();
  };

  if (!course || !form) return null;

  const statusStyle =
    STATUS_CONFIG[course.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG['متبقية'];

  const handleSave = async () => {
    if (!form.name.trim() || !form.code.trim()) {
      toast.error('بيانات ناقصة', 'يرجى تعبئة اسم المادة والرمز');
      return;
    }
    try {
      setSaving(true);
      const updated = await updateCourse(form.id, {
        name: form.name,
        code: form.code,
        credits: form.credits,
        category: form.category,
        status: form.status,
        grade: form.grade ?? undefined,
      });
      onUpdate({ ...form, ...updated });
      toast.success('تم الحفظ', `تم تحديث بيانات ${form.name}`);
      setEditing(false);
    } catch {
      toast.error('خطأ', 'تعذّر حفظ التعديلات');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCourse(course.id);
      onDelete(course.id);
      toast.info('تم الحذف', `تم حذف ${course.name} من مسارك`);
      handleClose(); // ✅ handleClose مش onClose مباشرة
    } catch {
      toast.error('خطأ', 'تعذّر حذف المادة');
    }
  };

  return (
    // ✅ FIX 2: confirmDelete يمنع الإغلاق بالضغط على الـ backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={() => { if (!confirmDelete && !editing) handleClose(); }}
    >
      <div
        className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden"
        style={{ width: 'min(480px, calc(100vw - 2rem))' }}
        dir="rtl"
        onClick={e => e.stopPropagation()}
      >

        {/* ── Header: اسم المادة + أزرار + X على نفس السطر ── */}
        {/* ✅ FIX 3: شلنا badge الحالة ورمز المادة من الـ header */}
        <div className="flex items-center gap-3 p-5 border-b border-border">

          {/* اسم المادة — flex-1 يملأ المساحة */}
          <div className="flex-1 text-right">
            {editing ? (
              <input
                className="w-full px-3 py-1.5 rounded-xl border border-border bg-background
                           text-base font-bold text-foreground focus:outline-none
                           focus:ring-2 focus:ring-primary/30"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="اسم المادة"
                autoFocus
              />
            ) : (
              <h3 className="text-base font-bold text-foreground">{course.name}</h3>
            )}
          </div>

          {/* أزرار الإجراءات */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {!editing ? (
              <>
                <button
                  onClick={() => { setEditing(true); setForm({ ...course }); }}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg
                             bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                >
                  <Pencil className="w-3 h-3" />
                  تعديل
                </button>
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg
                             bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  حذف
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg
                             bg-primary text-primary-foreground hover:opacity-90
                             disabled:opacity-50 transition-all"
                >
                  <Save className="w-3 h-3" />
                  {saving ? 'جاري...' : 'حفظ'}
                </button>
                <button
                  onClick={() => { setEditing(false); setForm({ ...course }); }}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg
                             bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
                >
                  <XCircle className="w-3 h-3" />
                  إلغاء
                </button>
              </>
            )}
          </div>

          {/* زر X */}
          <button
            onClick={handleClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg
                       hover:bg-muted transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>

        </div>

        {/* ── Body ── */}
        <div className="p-5 space-y-3">

          {/* رمز المادة */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40">
            <Hash className="w-4 h-4 text-primary flex-shrink-0" />
            <div className="flex-1 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">رمز المادة</span>
              {editing ? (
                <input
                  className="text-sm font-medium text-foreground bg-transparent border-b border-border
                             focus:outline-none focus:border-primary w-24 text-left"
                  value={form.code}
                  onChange={e => setForm({ ...form, code: e.target.value })}
                  dir="ltr"
                />
              ) : (
                <span className="text-sm font-medium text-foreground" dir="ltr">{course.code}</span>
              )}
            </div>
          </div>

          {/* الساعات */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40">
            <Clock4 className="w-4 h-4 text-primary flex-shrink-0" />
            <div className="flex-1 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">الساعات المعتمدة</span>
              {editing ? (
                <input
                  type="number"
                  className="text-sm font-medium text-foreground bg-transparent border-b border-border
                             focus:outline-none focus:border-primary w-16 text-center"
                  value={form.credits}
                  min={1}
                  max={6}
                  onChange={e => setForm({ ...form, credits: Number(e.target.value) })}
                />
              ) : (
                <span className="text-sm font-medium text-foreground">{course.credits} ساعات</span>
              )}
            </div>
          </div>

          {/* التصنيف */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40">
            <Tag className="w-4 h-4 text-primary flex-shrink-0" />
            <div className="flex-1 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">التصنيف</span>
              {editing ? (
                <select
                  className="text-sm font-medium text-foreground bg-background border border-border
                             rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                >
                  {ALL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              ) : (
                <span className="text-sm font-medium text-foreground">{course.category}</span>
              )}
            </div>
          </div>

          {/* الحالة */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40">
            <div className="w-4 h-4 flex-shrink-0 flex items-center justify-center">
              <div className={`w-2 h-2 rounded-full ${
                statusStyle.color.includes('green') ? 'bg-green-500' :
                statusStyle.color.includes('blue') ? 'bg-blue-500' :
                statusStyle.color.includes('yellow') ? 'bg-yellow-500' :
                'bg-gray-400'
              }`} />
            </div>
            <div className="flex-1 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">الحالة</span>
              {editing ? (
                <select
                  className="text-sm font-medium text-foreground bg-background border border-border
                             rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value })}
                >
                  {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              ) : (
                <span className={`text-[11px] px-2.5 py-1 rounded-lg ${statusStyle.color}`}>
                  {course.status}
                </span>
              )}
            </div>
          </div>

          {/* العلامة */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40">
            <Award className="w-4 h-4 text-primary flex-shrink-0" />
            <div className="flex-1 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">العلامة</span>
              {editing ? (
                <input
                  className="text-sm font-bold text-primary bg-transparent border-b border-border
                             focus:outline-none focus:border-primary w-20 text-center"
                  value={form.grade ?? ''}
                  onChange={e => setForm({ ...form, grade: e.target.value || null })}
                  placeholder="A أو 90"
                />
              ) : (
                <span className="text-sm font-bold text-primary">
                  {course.grade ?? (
                    <span className="text-muted-foreground font-normal text-xs">لا توجد علامة</span>
                  )}
                </span>
              )}
            </div>
          </div>

        </div>

        {/* ── تأكيد الحذف ── */}
        {confirmDelete && (
          <div className="mx-5 mb-5 p-4 rounded-xl bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-destructive font-medium mb-3 text-center">
              هل أنت متأكد من حذف &quot;{course.name}&quot;؟
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleDelete}
                className="flex-1 py-2 rounded-xl bg-destructive text-white text-sm font-medium
                           hover:opacity-90 transition-opacity"
              >
                نعم، احذف
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="flex-1 py-2 rounded-xl bg-muted text-muted-foreground text-sm font-medium
                           hover:bg-muted/80 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}