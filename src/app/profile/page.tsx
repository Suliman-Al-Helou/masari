"use client";
import ChipsRow from "@/components/profile/ChipsRow";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { getProfile, updateProfile } from "@/lib/api/api";
import { useToast } from "@/lib/context/ToastContext";
import { Save, Pencil, X } from "lucide-react";
import AutocompleteInput from "@/components/profile/AutocompleteInput";
import {
  UNIVERSITIES,
  MAJORS,
  SEMESTERS,
  getYearsForMajor,
} from "@/lib/constants/academic";
import { supabase } from "@/lib/db/client";

// AutocompleteInput و ChipsRow — بدون تغيير

const PROFILE_COVER_IMAGE = "/images/background-profile.png";

export default function ProfilePage() {
  const { user, refreshProfile } = useAuth();
  const { Success, Error } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    university: "",
    major: "",
    year: "",
    semester: "",
    total_credits: 132,
    degree_type: "",
  });

  useEffect(() => {
    if (!user) return;
    getProfile(user.id).then(({ data }) => {
      const parts = data?.semester?.split(" - ") ?? [];
      setForm({
        full_name:
          data?.full_name?.trim() || user.user_metadata?.full_name || "",
        email: user.email || "",
        university: data?.university || "",
        major: data?.major || "",
        year: parts[0] || "",
        semester: parts[1] || "",
        total_credits: data?.total_credits || 132,
        degree_type: data?.degree_type || "",
      });
      setLoading(false);
    });
  }, [user]);

 const handleSave = async () => {
  if (!user) return;

  const normalizedName = form.full_name.trim();

  if (normalizedName.length < 2) {
    Error(
      "الاسم غير صحيح",
      "الاسم يجب أن يتكون من حرفين على الأقل",
    );

    return;
  }

  setSaving(true);

  try {
    const [
      { error: dbError },
      { error: authError },
    ] = await Promise.all([
      updateProfile(user.id, {
        full_name: normalizedName,
        university: form.university,
        major: form.major,
        semester:
          form.year === "خريج"
            ? "خريج"
            : `${form.year} - ${form.semester}`,
        total_credits: Number(form.total_credits),
        degree_type: form.degree_type,
      }),

      supabase.auth.updateUser({
        data: {
          full_name: normalizedName,
        },
      }),
    ]);

    if (dbError || authError) {
      Error(
        "حدث خطأ",
        "تعذر تحديث بيانات الحساب",
      );

      return;
    }

    await refreshProfile();

    setForm((current) => ({
      ...current,
      full_name: normalizedName,
    }));

    Success("تم الحفظ ✅", "تم تحديث بياناتك");

    setEditMode(false);
  } catch {
    Error(
      "حدث خطأ",
      "تعذر تحديث بيانات الحساب",
    );
  } finally {
    setSaving(false);
  }
};

  const initials = form.full_name
    ? form.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
    : "؟";
  const semesterLabel =
    form.year === "خريج"
      ? "خريج 🎓"
      : form.year && form.semester
        ? `${form.year} — ${form.semester}`
        : "—";

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="w-9 h-9 border-4 border-border border-t-primary rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-12 " dir="rtl">
      {/* HERO */}
      <div className="relative h-55 rounded-t-2xl overflow-hidden">
        {PROFILE_COVER_IMAGE ? (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${PROFILE_COVER_IMAGE})` }}
          />
        ) : (
          <div className="absolute inset-0 bg-[linear-gradient(135deg,hsl(var(--primary))_0%,hsl(255_70%_35%)_100%)]" />
        )}
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
          <span
            className="select-none font-black text-white/10 leading-none"
            style={{
              fontSize: "6rem",
              fontFamily: "var(--font-main)",
              letterSpacing: "-4px",
              animation: "masariFloat 6s ease-in-out infinite",
            }}
          >
            مساري
          </span>
        </div>
        <div className="absolute -top-8 -left-8 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-6 right-8 w-24 h-24 rounded-full bg-white/5 blur-xl" />
      </div>

      {/* AVATAR */}
      <div className="flex justify-center relative z-10 -mt-20">
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center text-white font-black text-2xl shadow-xl"
          style={{
            background:
              "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(255 70% 35%) 100%)",
            border: "4px solid hsl(var(--card))",
            animation: "avatarPop 0.5s cubic-bezier(0.34,1.56,0.64,1) both",
          }}
        >
          {initials}
        </div>
      </div>

      {/* IDENTITY */}
      <div className="bg-card text-center px-6 pt-3 pb-5 flex flex-col items-center gap-2">
        <h1 className="text-xl font-black text-foreground">
          {form.full_name || "مستخدم"}
        </h1>
        <p className="text-xs text-muted-foreground" dir="ltr">
          {form.email}
        </p>
        <div className="flex flex-wrap gap-1.5 justify-center mt-1">
          {form.degree_type && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
              {form.degree_type}
            </span>
          )}
          {form.major && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-info/10 text-info">
              {form.major}
            </span>
          )}
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-success/10 text-success">
            {semesterLabel}
          </span>
        </div>
      </div>

      {/* EDIT TOGGLE */}
      <div className="bg-card border-t border-border px-6 py-3 flex justify-center">
        <button
          onClick={() => setEditMode(!editMode)}
          className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-bold transition-all ${editMode ? "bg-muted text-muted-foreground" : "bg-primary text-white hover:opacity-90"}`}
        >
          {editMode ? (
            <>
              <X size={14} />
              إلغاء التعديل
            </>
          ) : (
            <>
              <Pencil size={14} />
              تعديل البيانات
            </>
          )}
        </button>
      </div>

      {/* CONTENT */}
      <div className="bg-card border-t border-border rounded-b-2xl px-6 py-5">
        {!editMode ? (
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "الجامعة", value: form.university },
              { label: "التخصص", value: form.major },
              { label: "المرحلة", value: semesterLabel },
              { label: "الدرجة العلمية", value: form.degree_type },
              { label: "ساعات التخرج", value: `${form.total_credits} ساعة` },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="flex flex-col gap-1 p-3 rounded-xl bg-muted/50 "
              >
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                  {label}
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {value || "—"}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-foreground">
                الاسم الكامل
              </label>
              <input
                value={form.full_name}
                placeholder="أدخل اسمك الكامل"
                onChange={(e) =>
                  setForm({ ...form, full_name: e.target.value })
                }
                className="w-full px-3 py-2.5 border border-border rounded-xl text-sm bg-background text-foreground focus:outline-none focus:border-primary transition-colors"
                style={{ fontFamily: "var(--font-main)" }}
              />
            </div>
            <AutocompleteInput
              label="الجامعة"
              placeholder="ابحث أو اكتب اسم جامعتك"
              value={form.university}
              onChange={(v) => setForm({ ...form, university: v })}
              suggestions={UNIVERSITIES}
            />
            <AutocompleteInput
              label="التخصص"
              placeholder="ابحث أو اكتب تخصصك"
              value={form.major}
              onChange={(v) =>
                setForm({ ...form, major: v, year: "", semester: "" })
              }
              suggestions={MAJORS}
            />
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-foreground">
                السنة الدراسية
              </label>

              <ChipsRow
                options={[...getYearsForMajor(form.major), "خريج 🎓"]}
                value={form.year === "خريج" ? "خريج 🎓" : form.year}
                onChange={(v) => {
                  const isGrad = v === "خريج 🎓";
                  setForm({
                    ...form,
                    year: isGrad ? "خريج" : v,
                    semester: isGrad ? "—" : "",
                  });
                }}
              />
            </div>
            {form.year && form.year !== "خريج" && (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-foreground">
                  الفصل الدراسي
                </label>
                <ChipsRow
                  options={SEMESTERS}
                  value={form.semester}
                  onChange={(v) => setForm({ ...form, semester: v })}
                />
              </div>
            )}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-foreground">
                الدرجة العلمية
              </label>
              <ChipsRow
                options={["بكالوريوس", "دبلوم"]}
                value={form.degree_type}
                onChange={(v) => setForm({ ...form, degree_type: v })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-foreground">
                ساعات التخرج
              </label>
              <input
                type="number"
                min={60}
                max={200}
                value={form.total_credits}
                onChange={(e) =>
                  setForm({
                    ...form,
                    total_credits: parseInt(e.target.value) || 0,
                  })
                }
                className="w-32 px-3 py-2 border border-border rounded-xl text-center text-base font-bold bg-background text-foreground focus:outline-none focus:border-primary"
                style={{ fontFamily: "var(--font-main)" }}
              />
              <span className="text-xs text-muted-foreground">
                عادةً بين 120 و 160 ساعة
              </span>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center justify-center gap-2 w-full py-3 bg-primary text-white rounded-2xl text-sm font-bold disabled:opacity-50 hover:opacity-90 transition-opacity mt-2"
              style={{ fontFamily: "var(--font-main)" }}
            >
              <Save size={16} />
              {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes masariFloat{0%,100%{transform:translateY(0px) scale(1);opacity:0.10;}50%{transform:translateY(-8px) scale(1.03);opacity:0.15;}}
        @keyframes avatarPop{from{transform:scale(0.5);opacity:0;}to{transform:scale(1);opacity:1;}}
      `}</style>
    </div>
  );
}
