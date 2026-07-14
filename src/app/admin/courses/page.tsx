"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  CheckCircle,
  Trash2,
  GraduationCap,
  Building2,
  BookMarked,
  Search,
  Loader2,
} from "lucide-react";
import { useToast } from "@/lib/context/ToastContext";
import {
  getAdminCourses,
  createAdminCourse,
  deleteAdminCourse,
} from "@/lib/api/admin";
import {
  UNIVERSITIES,
  getMajorsForUniversity,
  MAJORS,
} from "@/lib/constants/academic";
import CustomSelect from "@/components/admin/CustomSelect";


const CATEGORIES = ["متطلب جامعة", "متطلب كلية", "متطلب تخصص", "اختياري"];

const YEARS = [
  "السنة الأولى",
  "السنة الثانية",
  "السنة الثالثة",
  "السنة الرابعة",
  "السنة الخامسة",
];

const SEMESTERS = ["الفصل الأول", "الفصل الثاني", "الفصل الصيفي"];

const EMPTY_FORM = {
  name: "",
  code: "",
  credits: "",
  category: "",
  semester: "",
  year: "",
  university: "",
  major: "",
};

const PAGE_SIZE = 20;

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md border border-border text-[10px] text-muted-foreground">
      {children}
    </span>
  );
}

export default function AdminCoursesPage() {
  const qc = useQueryClient();
  const { Success, Error, Info } = useToast();

  const [filterUniversity, setFilterUniversity] = useState("");
  const [filterMajor, setFilterMajor] = useState("");
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [success, setSuccess] = useState(false);
  const [page, setPage] = useState(1);

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ["admin", "courses", filterUniversity, filterMajor, search],
    queryFn: () =>
      getAdminCourses({
        university: filterUniversity || undefined,
        major: filterMajor || undefined,
        search: search || undefined,
      }),
    staleTime: 1000 * 30,
  });

  const paginated = useMemo(() => {
    const sorted = [...courses].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
    return sorted.slice(0, page * PAGE_SIZE);
  }, [courses, page]);

  const createMutation = useMutation({
    mutationFn: () =>
      createAdminCourse({
        name: form.name,
        code: form.code,
        credits: Number(form.credits),
        category: form.category,
        semester: form.semester || null,
        year: form.year || null,
        university: form.university || null,
        major: form.major || null,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "courses"] });
      setForm(EMPTY_FORM);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
      Success("تمت الإضافة", "تم إضافة المادة بنجاح ✅");
    },
    onError: () => {
      Error("خطأ", "فشل في إضافة المادة");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAdminCourse(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "courses"] });
      Info("تم الحذف", "تم حذف المادة");
    },
  });

  const majorsForForm = useMemo(
    () => (form.university ? getMajorsForUniversity(form.university) : []),
    [form.university],
  );

  const majorsForFilter = useMemo(
    () =>
      filterUniversity ? getMajorsForUniversity(filterUniversity) : MAJORS,
    [filterUniversity],
  );

  const handleFormUniversityChange = (v: string) => {
    setForm((prev) => ({ ...prev, university: v, major: "" }));
  };

  const handleFilterUniversityChange = (v: string) => {
    setFilterUniversity(v);
    setFilterMajor("");
    setPage(1);
  };

  const handleFilterMajorChange = (v: string) => {
    setFilterMajor(v);
    setPage(1);
  };

  const handleSearchChange = (v: string) => {
    setSearch(v);
    setPage(1);
  };

  const canSubmit =
    form.name.trim() &&
    form.code.trim() &&
    form.credits &&
    !createMutation.isPending;

  const setField = (key: keyof typeof EMPTY_FORM) => (v: string) =>
    setForm((prev) => ({ ...prev, [key]: v }));

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          إضافة مادة دراسية
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          أضف مواد دراسية لقاعدة البيانات المشتركة
        </p>
      </div>

      {/* فلاتر */}
      <div className="flex flex-wrap gap-3 bg-muted/40 rounded-2xl p-4 border border-border/40">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Building2 className="w-4 h-4" />
          <span className="text-sm font-medium">تصفية العرض:</span>
        </div>
        <div className=" w-full md:w-50 ">
          <CustomSelect
            value={filterUniversity}
            onChange={handleFilterUniversityChange}
            placeholder="كل الجامعات"
            options={UNIVERSITIES}
          />
        </div>
        <div className=" w-full md:w-50">
          <CustomSelect
            value={filterMajor}
            onChange={handleFilterMajorChange}
            placeholder="كل التخصصات"
            options={majorsForFilter}
          />
        </div>
        <div className="flex-1 min-w-40 relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="ابحث باسم المادة أو الرمز..."
            className="w-full h-10 pr-9 pl-3 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      {/* نموذج الإضافة */}
      <div className="bg-card border border-border/50 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-primary" />
          </div>
          <h2 className="font-bold text-foreground">بيانات المادة</h2>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                اسم المادة <span className="text-destructive">*</span>
              </label>
              <input
                value={form.name}
                onChange={(e) => setField("name")(e.target.value)}
                placeholder="مثال: هياكل البيانات"
                className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                رمز المادة <span className="text-destructive">*</span>
              </label>
              <input
                value={form.code}
                onChange={(e) => setField("code")(e.target.value.toUpperCase())}
                placeholder="مثال: CS301"
                dir="ltr"
                className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                عدد الساعات <span className="text-destructive">*</span>
              </label>
              <input
                type="number"
                min={1}
                max={6}
                value={form.credits}
                onChange={(e) => setField("credits")(e.target.value)}
                placeholder="3"
                className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                الفصل الدراسي
              </label>
              <CustomSelect
                value={form.semester}
                onChange={setField("semester")}
                placeholder="اختر الفصل"
                options={SEMESTERS}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                السنة الدراسية
              </label>
              <CustomSelect
                value={form.year}
                onChange={setField("year")}
                placeholder="اختر السنة"
                options={YEARS}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                التصنيف
              </label>
              <CustomSelect
                value={form.category}
                onChange={setField("category")}
                placeholder="اختر التصنيف"
                options={CATEGORIES}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                الجامعة
              </label>
              <CustomSelect
                value={form.university}
                onChange={handleFormUniversityChange}
                placeholder="اختر الجامعة"
                options={UNIVERSITIES}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                التخصص
              </label>
              <CustomSelect
                key={form.university}
                value={form.major}
                onChange={setField("major")}
                placeholder={
                  form.university ? "اختر التخصص" : "اختر الجامعة أولاً"
                }
                options={majorsForForm}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => canSubmit && createMutation.mutate()}
              disabled={!canSubmit}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {createMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              إضافة المادة
            </button>
            {success && (
              <div className="flex items-center gap-1.5 text-success text-sm font-medium animate-in fade-in duration-300">
                <CheckCircle className="w-4 h-4" />
                تمت الإضافة!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* قائمة المواد */}
      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-6 h-6 text-primary/40 animate-spin" />
        </div>
      ) : paginated.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-foreground text-sm">
              آخر المواد المضافة
            </h3>
            <span className="text-xs text-muted-foreground">
              {courses.length} مادة إجمالاً
            </span>
          </div>

          <div className="space-y-2">
            {paginated.map((course) => (
              <div
                key={course.id}
                className="flex items-center gap-3 bg-card border border-border/50 rounded-xl px-4 py-3 hover:bg-muted/20 transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm truncate">
                    {course.name}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    <span
                      className="text-[10px] text-muted-foreground font-mono"
                      dir="ltr"
                    >
                      {course.code}
                    </span>
                    <Badge>{course.credits} ساعات</Badge>
                    {course.semester && <Badge>{course.semester}</Badge>}
                    {course.year && <Badge>{course.year}</Badge>}
                    {course.category && <Badge>{course.category}</Badge>}
                    {course.university && (
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Building2 className="w-3 h-3" />
                        {course.university}
                      </span>
                    )}
                    {course.major && (
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <BookMarked className="w-3 h-3" />
                        {course.major}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => deleteMutation.mutate(course.id)}
                  disabled={deleteMutation.isPending}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                  title="حذف المادة"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* تحميل المزيد */}
          {paginated.length < courses.length && (
            <button
              onClick={() => setPage((p) => p + 1)}
              className="w-full py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:bg-muted/40 transition-colors"
            >
              تحميل المزيد ({courses.length - paginated.length} متبقية)
            </button>
          )}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <GraduationCap className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">لا توجد مواد بعد. أضف أول مادة! 🎓</p>
        </div>
      )}
    </div>
  );
}
