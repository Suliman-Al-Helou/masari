'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/lib/context/ToastContext';
import { getDoctors, createDoctor, deleteDoctor } from '@/lib/api/reviews';
import { UNIVERSITIES, MAJORS } from '@/lib/constants/academic';
import type { Doctor } from '@/lib/api/reviews';

// ─── ثوابت المواد لكل تخصص ──────────────────────────────────────────────────
// يمكنك توسيع هذا القاموس لاحقاً أو جلبه من Supabase
const COURSES_BY_MAJOR: Record<string, { name: string; code: string }[]> = {
  'علم الحاسب': [
    { name: 'برمجة 1', code: 'CS101' },
    { name: 'برمجة 2', code: 'CS102' },
    { name: 'هياكل البيانات', code: 'CS201' },
    { name: 'خوارزميات', code: 'CS301' },
    { name: 'قواعد البيانات', code: 'CS303' },
    { name: 'شبكات الحاسوب', code: 'CS401' },
    { name: 'نظم التشغيل', code: 'CS402' },
    { name: 'الذكاء الاصطناعي', code: 'CS450' },
  ],
  'هندسة البرمجيات': [
    { name: 'برمجة 1', code: 'SE101' },
    { name: 'هندسة البرمجيات 1', code: 'SE201' },
    { name: 'هندسة البرمجيات 2', code: 'SE301' },
    { name: 'اختبار البرمجيات', code: 'SE401' },
    { name: 'إدارة المشاريع', code: 'SE402' },
  ],
  'هندسة الحاسوب': [
    { name: 'دوائر منطقية', code: 'CE201' },
    { name: 'معمارية الحاسوب', code: 'CE301' },
    { name: 'معالجات دقيقة', code: 'CE401' },
  ],
  'نظم المعلومات': [
    { name: 'قواعد البيانات', code: 'IS201' },
    { name: 'تحليل الأنظمة', code: 'IS301' },
    { name: 'أمن المعلومات', code: 'IS401' },
  ],
  'إدارة الأعمال': [
    { name: 'مبادئ الإدارة', code: 'BA101' },
    { name: 'إدارة الموارد البشرية', code: 'BA201' },
    { name: 'إدارة الإنتاج', code: 'BA301' },
  ],
  'المحاسبة': [
    { name: 'محاسبة مالية 1', code: 'ACC101' },
    { name: 'محاسبة مالية 2', code: 'ACC102' },
    { name: 'محاسبة تكاليف', code: 'ACC201' },
    { name: 'مراجعة وتدقيق', code: 'ACC301' },
  ],
  'الطب': [
    { name: 'تشريح 1', code: 'MED101' },
    { name: 'فسيولوجيا', code: 'MED102' },
    { name: 'باثولوجيا', code: 'MED201' },
    { name: 'داخلية 1', code: 'MED301' },
  ],
  'الصيدلة': [
    { name: 'كيمياء صيدلانية 1', code: 'PHARM101' },
    { name: 'فارماكولوجي 1', code: 'PHARM201' },
    { name: 'صيدلة إكلينيكية', code: 'PHARM301' },
  ],
};

const DEFAULT_COURSES = [
  { name: 'مادة عامة 1', code: 'GEN101' },
  { name: 'مادة عامة 2', code: 'GEN102' },
];

// ─── نوع الدكتور الموسّع ─────────────────────────────────────────────────────
// ملاحظة: تأكد من إضافة العمودين course_code و course_name في جدول doctors بـ Supabase
type DoctorExtended = Doctor & {
  course_code?: string | null;
  course_name?: string | null;
};

// ─── حوار تأكيد الحذف ────────────────────────────────────────────────────────
function DeleteConfirm({
  doctor,
  onConfirm,
  onCancel,
  loading,
}: {
  doctor: DoctorExtended;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <div
      style={{ minHeight: 320, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      className="fixed inset-0 z-50"
    >
      <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm mx-4 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">تأكيد الحذف</h3>
            <p className="text-xs text-muted-foreground mt-0.5">هذا الإجراء لا يمكن التراجع عنه</p>
          </div>
        </div>

        <div className="bg-muted/50 rounded-xl px-4 py-3 mb-4">
          <p className="text-sm font-medium text-foreground">{doctor.name}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{doctor.university} · {doctor.major}</p>
        </div>

        <p className="text-xs text-destructive mb-5">
          سيتم حذف الدكتور وجميع تقييماته نهائياً.
        </p>

        <div className="flex gap-2.5">
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-destructive text-destructive-foreground text-sm font-medium disabled:opacity-50 hover:opacity-90 transition-opacity"
          >
            {loading ? 'جاري الحذف...' : 'حذف نهائياً'}
          </button>
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl border border-border text-sm text-foreground hover:bg-muted transition-colors"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── فورم الإضافة ─────────────────────────────────────────────────────────────
function AddDoctorForm({ onSuccess }: { onSuccess: () => void }) {
  const queryClient = useQueryClient();
  const {Success, Error} = useToast();

  const [form, setForm] = useState({
    name: '',
    university: '',
    major: '',
    course_code: '',
    course_name: '',
  });

  const set = (k: keyof typeof form, v: string) =>
    setForm(p => ({ ...p, [k]: v }));

  // عند تغيير التخصص نمسح المادة
  const handleMajorChange = (v: string) => {
    setForm(p => ({ ...p, major: v, course_code: '', course_name: '' }));
  };

  // عند اختيار مادة نملأ الاسم والكود معاً
  const handleCourseChange = (code: string) => {
    const courses = COURSES_BY_MAJOR[form.major] ?? DEFAULT_COURSES;
    const found = courses.find(c => c.code === code);
    setForm(p => ({
      ...p,
      course_code: code,
      course_name: found?.name ?? '',
    }));
  };

  const availableCourses = form.major
    ? (COURSES_BY_MAJOR[form.major] ?? DEFAULT_COURSES)
    : [];

  const mutation = useMutation({
    mutationFn: () =>
      createDoctor({
        name: form.name.trim(),
        university: form.university,
        major: form.major,
        course_code: form.course_code || null,
        course_name: form.course_name || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-doctors'] });
      Success('تمت الإضافة ✅', `د. ${form.name} أُضيف بنجاح`);
      setForm({ name: '', university: '', major: '', course_code: '', course_name: '' });
      onSuccess();
    },
    onError: () => Error('خطأ', 'فشل في إضافة الدكتور، حاول مجدداً'),
  });

  const steps = [
    { label: 'الاسم', done: !!form.name.trim() },
    { label: 'الجامعة', done: !!form.university },
    { label: 'التخصص', done: !!form.major },
    { label: 'المادة', done: !!form.course_code },
  ];

  const canSubmit =
    form.name.trim() && form.university && form.major && form.course_code;

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      {/* شريط التقدم */}
      <div className="flex border-b border-border">
        {steps.map((s, i) => (
          <div
            key={s.label}
            className="flex-1 flex items-center gap-1.5 px-3 py-2.5"
          >
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold flex-shrink-0 transition-colors ${
                s.done
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {s.done ? (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                i + 1
              )}
            </div>
            <span className={`text-xs hidden sm:block ${s.done ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      <div className="p-5 space-y-4">
        <p className="text-xs text-muted-foreground">
          أضف دكتوراً جديداً وارتبطه بجامعة وتخصص ومادة محددة.
        </p>

        {/* اسم الدكتور */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">
            اسم الدكتور <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="مثال: د. محمد أبو خضير"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              className="w-full bg-background border border-border rounded-xl pr-10 pl-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        {/* الصف الثاني: الجامعة + التخصص */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* الجامعة */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              الجامعة <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </span>
              <select
                value={form.university}
                onChange={e => set('university', e.target.value)}
                className="w-full appearance-none bg-background border border-border rounded-xl pr-10 pl-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors cursor-pointer"
              >
                <option value="">اختر الجامعة</option>
                {UNIVERSITIES.map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          {/* التخصص */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              التخصص <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
              </span>
              <select
                value={form.major}
                onChange={e => handleMajorChange(e.target.value)}
                className="w-full appearance-none bg-background border border-border rounded-xl pr-10 pl-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors cursor-pointer"
              >
                <option value="">اختر التخصص</option>
                {MAJORS.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* المادة */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">
            المادة الدراسية <span className="text-destructive">*</span>
          </label>

          {!form.major ? (
            <div className="bg-muted/40 border border-dashed border-border rounded-xl px-4 py-3 flex items-center gap-2 text-muted-foreground">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span className="text-xs">اختر التخصص أولاً لتظهر المواد المتاحة</span>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {availableCourses.map(c => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => handleCourseChange(c.code)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                    form.course_code === c.code
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                      : 'bg-background border-border text-foreground hover:border-primary/50 hover:text-primary'
                  }`}
                >
                  <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded-md ${
                    form.course_code === c.code
                      ? 'bg-white/20 text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {c.code}
                  </span>
                  {c.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* معاينة */}
        {canSubmit && (
          <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold flex-shrink-0">
              {form.name
                .replace(/^د\.|^دكتور\s*/i, '')
                .trim()
                .split(' ')
                .map(w => w[0])
                .slice(0, 2)
                .join('')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{form.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                {form.university} · {form.major} · {form.course_name}{' '}
                <span className="font-mono text-[10px] bg-muted px-1.5 py-0.5 rounded">
                  {form.course_code}
                </span>
              </p>
            </div>
            <svg width="14" height="14" className="text-primary flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        )}

        {/* زر الإضافة */}
        <button
          onClick={() => mutation.mutate()}
          disabled={!canSubmit || mutation.isPending}
          className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold disabled:opacity-40 hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
        >
          {mutation.isPending ? (
            <>
              <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              جاري الإضافة...
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              إضافة الدكتور
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── بطاقة الدكتور ────────────────────────────────────────────────────────────
function DoctorCard({
  doctor,
  onDelete,
}: {
  doctor: DoctorExtended;
  onDelete: () => void;
}) {
  const initials = doctor.name
    .replace(/^د\.|^دكتور\s*/i, '')
    .trim()
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('');

  const joinedAt = new Date(doctor.created_at).toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const AVATAR_COLORS = [
    'bg-blue-100 text-blue-700',
    'bg-emerald-100 text-emerald-700',
    'bg-violet-100 text-violet-700',
    'bg-amber-100 text-amber-700',
    'bg-rose-100 text-rose-700',
    'bg-cyan-100 text-cyan-700',
  ];
  const colorClass =
    AVATAR_COLORS[doctor.name.charCodeAt(0) % AVATAR_COLORS.length];

  return (
    <div className="bg-card border border-border rounded-2xl p-4 flex items-start gap-3 hover:border-primary/30 hover:shadow-sm transition-all group">
      {/* الأحرف الأولى */}
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${colorClass}`}
      >
        {initials}
      </div>

      {/* المعلومات */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">
          {doctor.name}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5 truncate">
          {doctor.major}
        </p>
        {/* شارة المادة */}
        {(doctor as DoctorExtended).course_code && (
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className="inline-flex items-center gap-1 bg-primary/8 text-primary text-[10px] font-medium px-2 py-0.5 rounded-full">
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
              {(doctor as DoctorExtended).course_name ?? (doctor as DoctorExtended).course_code}
            </span>
            <span className="font-mono text-[9px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              {(doctor as DoctorExtended).course_code}
            </span>
          </div>
        )}
        <p className="text-[10px] text-muted-foreground/60 mt-1.5">
          أُضيف {joinedAt}
        </p>
      </div>

      {/* زر الحذف */}
      <button
        onClick={onDelete}
        className="text-muted-foreground/40 hover:text-destructive transition-colors p-1 flex-shrink-0 opacity-0 group-hover:opacity-100"
        title="حذف الدكتور"
        aria-label={`حذف ${doctor.name}`}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14H6L5 6" />
          <path d="M10 11v6M14 11v6" />
          <path d="M9 6V4h6v2" />
        </svg>
      </button>
    </div>
  );
}

// ─── الصفحة الرئيسية ──────────────────────────────────────────────────────────
export default function AdminDoctorsPage() {
  const queryClient = useQueryClient();
  const {Success,Error} = useToast();

  const [search, setSearch] = useState('');
  const [uniFilter, setUniFilter] = useState('');
  const [majorFilter, setMajorFilter] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [toDelete, setToDelete] = useState<DoctorExtended | null>(null);
  const [showForm, setShowForm] = useState(false);

  // ── جلب الدكاترة ──
  const { data: doctors = [], isLoading } = useQuery({
    queryKey: ['admin-doctors', uniFilter, majorFilter],
    queryFn: () =>
      getDoctors({
        university: uniFilter || undefined,
        major: majorFilter || undefined,
      }),
    staleTime: 1000 * 60,
  });

  // المواد المتاحة بناءً على التخصص المختار
  const availableCoursesForFilter = useMemo(() => {
    if (!majorFilter) return [];
    return COURSES_BY_MAJOR[majorFilter] ?? DEFAULT_COURSES;
  }, [majorFilter]);

  // فلتر محلي: بحث + مادة
  const filtered = useMemo(
    () =>
      (doctors as DoctorExtended[]).filter(d => {
        const matchSearch = search.trim()
          ? d.name.includes(search.trim())
          : true;
        const matchCourse = courseFilter
          ? (d as DoctorExtended).course_code === courseFilter
          : true;
        return matchSearch && matchCourse;
      }),
    [doctors, search, courseFilter],
  );

  // تجميع حسب الجامعة
  const grouped = useMemo(
    () =>
      filtered.reduce<Record<string, DoctorExtended[]>>((acc, d) => {
        const key = d.university;
        acc[key] = [...(acc[key] ?? []), d];
        return acc;
      }, {}),
    [filtered],
  );

  // ── حذف ──
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteDoctor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-doctors'] });
      Success('تم الحذف', 'تم حذف الدكتور بنجاح');
      setToDelete(null);
    },
    onError: () => Error('خطأ', 'فشل حذف الدكتور'),
  });

  return (
    <div className="space-y-6" dir="rtl">

      {/* ── رأس الصفحة ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">الدكاترة</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isLoading ? '...' : `${filtered.length} دكتور`}
          </p>
        </div>
        <button
          onClick={() => setShowForm(p => !p)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            showForm
              ? 'border border-border text-muted-foreground hover:bg-muted'
              : 'bg-primary text-primary-foreground hover:opacity-90'
          }`}
        >
          {showForm ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              إغلاق
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              دكتور جديد
            </>
          )}
        </button>
      </div>

      {/* ── فورم الإضافة ── */}
      {showForm && <AddDoctorForm onSuccess={() => setShowForm(false)} />}

      {/* ── فلاتر ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* بحث */}
        <div className="relative">
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="ابحث باسم الدكتور..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-card border border-border rounded-xl pr-10 pl-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* الجامعة */}
        <select
          value={uniFilter}
          onChange={e => setUniFilter(e.target.value)}
          className="bg-card border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors cursor-pointer"
        >
          <option value="">كل الجامعات</option>
          {UNIVERSITIES.map(u => (
            <option key={u} value={u}>{u}</option>
          ))}
        </select>

        {/* التخصص */}
        <select
          value={majorFilter}
          onChange={e => {
            setMajorFilter(e.target.value);
            setCourseFilter('');
          }}
          className="bg-card border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors cursor-pointer"
        >
          <option value="">كل التخصصات</option>
          {MAJORS.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>

        {/* المادة */}
        <select
          value={courseFilter}
          onChange={e => setCourseFilter(e.target.value)}
          disabled={availableCoursesForFilter.length === 0}
          className="bg-card border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="">كل المواد</option>
          {availableCoursesForFilter.map(c => (
            <option key={c.code} value={c.code}>
              {c.name} ({c.code})
            </option>
          ))}
        </select>
      </div>

      {/* فلاتر نشطة */}
      {(uniFilter || majorFilter || courseFilter || search) && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">فلاتر نشطة:</span>
          {[
            { label: uniFilter, clear: () => setUniFilter('') },
            { label: majorFilter, clear: () => { setMajorFilter(''); setCourseFilter(''); } },
            { label: courseFilter, clear: () => setCourseFilter('') },
            { label: search ? `"${search}"` : '', clear: () => setSearch('') },
          ]
            .filter(f => f.label)
            .map((f, i) => (
              <button
                key={i}
                onClick={f.clear}
                className="flex items-center gap-1.5 bg-primary/10 text-primary text-xs px-2.5 py-1 rounded-full hover:bg-primary/20 transition-colors"
              >
                {f.label}
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            ))}
          <button
            onClick={() => { setUniFilter(''); setMajorFilter(''); setCourseFilter(''); setSearch(''); }}
            className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
          >
            مسح الكل
          </button>
        </div>
      )}

      {/* ── القائمة ── */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-muted animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-28 bg-muted rounded animate-pulse" />
                <div className="h-2.5 w-20 bg-muted rounded animate-pulse" />
                <div className="h-2 w-16 bg-muted rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-16 text-center">
          <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
            <svg width="22" height="22" className="text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <p className="text-sm font-medium text-foreground mb-1">لا يوجد دكاترة</p>
          <p className="text-xs text-muted-foreground mb-4">
            {search || uniFilter || majorFilter || courseFilter
              ? 'جرب تغيير الفلاتر'
              : 'ابدأ بإضافة أول دكتور'}
          </p>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="text-sm text-primary hover:underline underline-offset-2 font-medium"
            >
              + إضافة دكتور جديد
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([university, docs]) => (
            <div key={university}>
              {/* عنوان الجامعة */}
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center gap-1.5">
                  <svg width="13" height="13" className="text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                  <p className="text-sm font-semibold text-foreground">{university}</p>
                </div>
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {docs.length}
                </span>
              </div>

              {/* بطاقات الدكاترة */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {docs.map(doctor => (
                  <DoctorCard
                    key={doctor.id}
                    doctor={doctor as DoctorExtended}
                    onDelete={() => setToDelete(doctor as DoctorExtended)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── حوار الحذف ── */}
      {toDelete && (
        <DeleteConfirm
          doctor={toDelete}
          onConfirm={() => deleteMutation.mutate(toDelete.id)}
          onCancel={() => setToDelete(null)}
          loading={deleteMutation.isPending}
        />
      )}
    </div>
  );
}