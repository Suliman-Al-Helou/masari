"use client";

import { useState, useEffect, useMemo } from "react";
import { BookOpen, PlusCircle, MinusCircle, Loader2 } from "lucide-react";
import AcademicProgress from "@/components/academic-path/AcademicProgress";
import { getCourses, addCourse, deleteCourse } from "@/lib/api/api";
import { getCourseCatalog } from "@/lib/api/course-catalog";
import { useAuth } from "@/lib/context/AuthContext";
import { useToast } from "@/lib/context/ToastContext";
import { SEMESTERS } from "@/lib/constants/academic";
import { getProfile } from "@/lib/api/api";
import Link from "next/link";
import type { Course, UserProfile, CourseStatus } from "@/types";
import { AdminCourse } from "@/types/admin";
export default function AcademicPathPage() {
  const { user } = useAuth();
  const { Success, Error, Info } = useToast();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSem, setSelectedSem] = useState(SEMESTERS[0]);
  const [semCourses, setSemCourses] = useState<AdminCourse[]>([]);
  const [semLoading, setSemLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // تأكيد السحب
  const [confirmRemove, setConfirmRemove] = useState<Course | null>(null);
  const [removing, setRemoving] = useState(false);

  // حالة الإضافة — مفتاحه كود المادة
  const [adding, setAdding] = useState<Record<string, boolean>>({});

  // جلب مواد المستخدم + البروفايل
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        setLoading(true);
        const [data, { data: prof }] = await Promise.all([
          getCourses(user.id),
          getProfile(user.id),
        ]);
        setCourses(data ?? []);
        setProfile(prof);
      } catch {
        Error("خطأ", "تعذّر تحميل البيانات");
      } finally {
        setLoading(false);
      }
    })();
  }, [user, Error]);

  // جلب مواد الأدمن عند تغيير الفصل
  useEffect(() => {
    if (!profile) return;
    (async () => {
      setSemLoading(true);
      try {
        const data = await getCourseCatalog({
          university: profile.university ?? undefined,
          major: profile.major ?? undefined,
          semester: selectedSem,
        });
        setSemCourses(data);
      } catch {
        Error("خطأ", "تعذّر تحميل مواد الفصل");
      } finally {
        setSemLoading(false);
      }
    })();
  }, [selectedSem, profile, Error]);

  // الكودات المضافة مسبقاً
  const enrolledCodes = useMemo(
    () => new Set(courses.map((c) => c.code)),
    [courses],
  );

  // إضافة مادة
  const handleEnroll = async (ac: AdminCourse) => {
    if (!user) return;
    setAdding((p) => ({ ...p, [ac.code]: true }));
    try {
      const newCourse = await addCourse({
        user_id: user.id,
        admin_course_id: ac.id,
        name: ac.name,
        code: ac.code,
        credits: ac.credits,
        category: ac.category ?? "متطلب تخصص",
        status: "قيد الدراسة",
        semester: selectedSem,
        year: ac.year ?? undefined,
        university: ac.university ?? undefined,
        major: ac.major ?? undefined,
      });
      setCourses((p) => [newCourse, ...p]);
      Success("تمت الإضافة ✅", `${ac.name} أُضيفت للفصل الحالي`);
    } catch {
      Error("خطأ", "تعذّرت الإضافة");
    } finally {
      setAdding((p) => ({ ...p, [ac.code]: false }));
    }
  };

  // سحب مادة
  const handleRemove = async () => {
    if (!confirmRemove) return;
    const found = courses.find((c) => c.code === confirmRemove.code);
    if (!found) return;
    setRemoving(true);
    try {
      await deleteCourse(found.id);
      setCourses((p) => p.filter((c) => c.id !== found.id));
      Info("تم السحب", `تم سحب ${found.name} من فصلك`);
      setConfirmRemove(null);
    } catch {
      Error("خطأ", "تعذّر سحب المادة");
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6" dir="rtl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">المسار الدراسي</h1>
        <p className="text-sm text-muted-foreground mt-1">
          اختر الفصل وأضف موادك — يمكنك سحب أي مادة في أي وقت
        </p>
      </div>

      {!loading && (
        <AcademicProgress
          courses={courses}
          totalCredits={profile?.total_credits ?? 132}
        />
      )}

      {/* اختيار الفصل */}
      <div className="flex items-center gap-2 flex-wrap">
        {SEMESTERS.map((sem) => (
          <button
            key={sem}
            onClick={() => setSelectedSem(sem)}
            className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${
              selectedSem === sem
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-card border border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
            }`}
          >
            {sem}
          </button>
        ))}
      </div>

      {/* جدول المواد */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {/* رأس الجدول */}
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 bg-muted/40 border-b border-border text-xs font-semibold text-muted-foreground">
          <span>اسم المادة</span>
          <span className="text-center">الرمز</span>
          <span className="text-center">الساعات</span>
          <span className="text-center">التصنيف</span>
          <span className="text-center">الحالة</span>
        </div>

        {/* صفوف المواد */}
        {semLoading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="w-6 h-6 text-primary/40 animate-spin" />
          </div>
        ) : semCourses.length === 0 ? (
          <div className="py-16 text-center">
            <BookOpen className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              لا توجد مواد محددة لـ {selectedSem} في تخصصك
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              تواصل مع الأدمن لإضافة مواد هذا الفصل
            </p>
          </div>
        ) : (
          semCourses.map((ac, i) => {
            const enrolled = enrolledCodes.has(ac.code);
            const isAdding = adding[ac.code];
            const myCourse = courses.find((c) => c.code === ac.code);

            return (
              <div
                key={ac.id}
                className={`grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3.5 items-center
                  text-sm transition-colors
                  ${i % 2 === 0 ? "bg-background" : "bg-muted/20"}
                  ${enrolled ? "border-r-2 border-primary" : ""}
                `}
              >
                {/* الاسم */}
                {/* الاسم */}
                {myCourse ? (
                  <Link
                    href={`/course/${myCourse.id}`}
                    className="font-medium text-foreground truncate hover:text-primary hover:underline transition-colors"
                  >
                    {ac.name}
                  </Link>
                ) : (
                  <span className="font-medium text-foreground truncate">
                    {ac.name}
                  </span>
                )}

                {/* الرمز */}
                <span
                  className="text-center font-mono text-xs text-muted-foreground"
                  dir="ltr"
                >
                  {ac.code}
                </span>

                {/* الساعات */}
                <span className="text-center text-muted-foreground">
                  {ac.credits}
                </span>

                {/* التصنيف */}
                <span className="text-center">
                  <span className="text-[11px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    {ac.category ?? "—"}
                  </span>
                </span>

                {/* زر الإضافة / السحب */}
                <div className="flex justify-center">
                  {enrolled ? (
                    <button
                      onClick={() =>
                        setConfirmRemove(
                          myCourse ?? {
                            ...ac,
                            status: "قيد الدراسة" as CourseStatus,
                            grade: null,
                          },
                        )
                      }
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg
                                 bg-emerald-500/10 text-emerald-600 hover:bg-destructive/10
                                 hover:text-destructive transition-colors group"
                      title="سحب المادة"
                    >
                      <MinusCircle className="w-3.5 h-3.5" />
                      <span className="group-hover:hidden">مضافة</span>
                      <span className="hidden group-hover:inline">سحب</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleEnroll(ac)}
                      disabled={isAdding}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg
                                 bg-primary/10 text-primary hover:bg-primary/20
                                 disabled:opacity-50 transition-colors"
                    >
                      {isAdding ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <PlusCircle className="w-3.5 h-3.5" />
                      )}
                      {isAdding ? "..." : "إضافة"}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* مواد المستخدم المضافة في هذا الفصل */}
      {courses.filter((c) => c.semester === selectedSem).length > 0 && (
        <div className="text-xs text-muted-foreground text-center">
          لديك {courses.filter((c) => c.semester === selectedSem).length} مادة
          مضافة من {selectedSem}
        </div>
      )}

      {/* ── تأكيد السحب ── */}
      {confirmRemove && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => !removing && setConfirmRemove(null)}
        >
          <div
            className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm mx-4 shadow-xl"
            dir="rtl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                <MinusCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  تأكيد سحب المادة
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  هذا الإجراء سيزيل المادة من فصلك
                </p>
              </div>
            </div>

            <div className="bg-muted/50 rounded-xl px-4 py-3 mb-4">
              <p className="text-sm font-medium text-foreground">
                {confirmRemove.name}
              </p>
              <p
                className="text-xs text-muted-foreground mt-0.5 font-mono"
                dir="ltr"
              >
                {confirmRemove.code}
              </p>
            </div>

            <p className="text-xs text-amber-600 mb-5">
              ⚠️ سيتم إزالة هذه المادة من مسارك الدراسي. يمكنك إعادة إضافتها
              لاحقاً.
            </p>

            <div className="flex gap-2.5">
              <button
                onClick={handleRemove}
                disabled={removing}
                className="flex-1 py-2.5 rounded-xl bg-destructive text-destructive-foreground
                           text-sm font-medium disabled:opacity-50 hover:opacity-90 transition-opacity"
              >
                {removing ? "جاري السحب..." : "نعم، اسحب المادة"}
              </button>
              <button
                onClick={() => setConfirmRemove(null)}
                disabled={removing}
                className="flex-1 py-2.5 rounded-xl border border-border text-sm
                           text-foreground hover:bg-muted transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
