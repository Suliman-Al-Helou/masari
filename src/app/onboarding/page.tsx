"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { updateProfile } from "@/lib/api/api";

import { useToast } from "@/lib/context/ToastContext";
import {
  UNIVERSITIES,
  getMajorsForUniversity,
  getYearsForMajor,
  SEMESTERS,
  getDepartmentsForUniversity,
} from "@/lib/constants/academic";
import {
  GraduationCap,
  BookOpen,
  Building2,
  CalendarDays,
  Hash,
} from "lucide-react";

// باقي الكود كما هو بدون أي تغيير
const STEPS = [
  { id: 1, title: "جامعتك", icon: "🏛️" },
  { id: 2, title: "تخصصك", icon: "📚" },
  { id: 3, title: "مسارك", icon: "🎯" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const {Success , Error} = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    university: "",
    universityCustom: "",
    major: "",
    majorCustom: "",
    year: "",
    semester: "",
    total_credits: 132,
    degree_type: "",
  });

  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || "أهلاً";

  const handleFinish = async () => {
    if (!user) return;
    setLoading(true);

    const { error } = await updateProfile(user.id, {
      university:
        form.university === "أخرى" ? form.universityCustom : form.university,
      major: form.major === "أخرى" ? form.majorCustom : form.major,
      semester:
        form.year === "خريج" ? "خريج" : `${form.year} - ${form.semester}`,
      total_credits: form.total_credits,
      onboarded: true,
    });

    setLoading(false);

    if (error) {
      Error("حدث خطأ", "حاول مرة أخرى");
    } else {
      Success("تم! 🎉", "مرحباً بك في مساري");
      router.push("/");
    }
  };

  const canNext = () => {
    if (step === 1)
      return (
        form.university && (form.university !== "أخرى" || form.universityCustom)
      );
    if (step === 2)
      return form.major && (form.major !== "أخرى" || form.majorCustom);
    if (step === 3)
      return (
        form.year &&
        (form.year === "خريج" || form.semester) &&
        Number(form.total_credits) > 0 &&
        form.degree_type
      );
    return false;
  };

  return (
    <div className="ob-root" dir="rtl">
      <div className="ob-card">
        {/* Header */}
        <div className="ob-header">
          <div className="ob-logo">م</div>
          <h1 className="ob-title">أهلاً {firstName}! 👋</h1>
          <p className="ob-subtitle">خلينا نعرف عنك أكثر عشان نخصص تجربتك</p>
        </div>

        {/* Progress */}
        <div className="ob-progress">
          {STEPS.map((s) => (
            <div
              key={s.id}
              className={`ob-step ${step === s.id ? "ob-step-active" : ""} ${step > s.id ? "ob-step-done" : ""}`}
            >
              <div className="ob-step-circle">{step > s.id ? "✓" : s.icon}</div>
              <span className="ob-step-label">{s.title}</span>
            </div>
          ))}
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div className="ob-body">
            <h2 className="ob-step-title">
              <Building2 className="ob-step-icon" />
              في أي جامعة تدرس؟
            </h2>
            <div className="ob-grid">
              {UNIVERSITIES.map((u) => (
                <button
                  key={u}
                  onClick={() =>
                    setForm({
                      ...form,
                      university: u,
                      major: "",
                      majorCustom: "",
                    })
                  }
                  className={`ob-option ${form.university === u ? "ob-option-selected" : ""}`}
                >
                  {u}
                </button>
              ))}
            </div>
            {form.university === "أخرى" && (
              <input
                type="text"
                placeholder="اكتب اسم جامعتك"
                value={form.universityCustom}
                onChange={(e) =>
                  setForm({ ...form, universityCustom: e.target.value })
                }
                className="ob-input"
                autoFocus
              />
            )}
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="ob-body">
            <h2 className="ob-step-title">
              <BookOpen className="ob-step-icon" />
              شو تخصصك؟
            </h2>

            {(() => {
              const departments = getDepartmentsForUniversity(form.university);

              if (departments) {
                // عرض مع أقسام
                return Object.entries(departments).map(([dept, majors]) => (
                  <div key={dept} className="ob-dept-group">
                    <p className="ob-dept-label">{dept}</p>
                    <div className="ob-grid">
                      {majors.map((m) => (
                        <button
                          key={m}
                          onClick={() => setForm({ ...form, major: m })}
                          className={`ob-option ${form.major === m ? "ob-option-selected" : ""}`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                ));
              }

              // عرض عادي بدون أقسام
              return (
                <div className="ob-grid">
                  {getMajorsForUniversity(form.university).map((m) => (
                    <button
                      key={m}
                      onClick={() => setForm({ ...form, major: m })}
                      className={`ob-option ${form.major === m ? "ob-option-selected" : ""}`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              );
            })()}
          </div>
        )}
        {/* Step 3 */}
        {step === 3 && (
          <div className="ob-body">
            <h2 className="ob-step-title">
              <CalendarDays className="ob-step-icon" />
              وين أنت في مسيرتك؟
            </h2>

            <div>
              <p className="ob-sub-label">السنة الدراسية</p>
              <div className="ob-grid">
                {getYearsForMajor(form.major === "أخرى" ? "" : form.major).map(
                  (y) => (
                    <button
                      key={y}
                      onClick={() =>
                        setForm({ ...form, year: y, semester: "" })
                      }
                      className={`ob-option ${form.year === y ? "ob-option-selected" : ""}`}
                    >
                      {y}
                    </button>
                  ),
                )}
                <button
                  onClick={() =>
                    setForm({ ...form, year: "خريج", semester: "—" })
                  }
                  className={`ob-option ob-option-grad ${form.year === "خريج" ? "ob-option-selected" : ""}`}
                >
                  🎓 خريج
                </button>
              </div>
            </div>

            {form.year && form.year !== "خريج" && (
              <div>
                <p className="ob-sub-label">الفصل الدراسي</p>
                <div className="ob-grid">
                  {SEMESTERS.map((s: string) => (
                    <button
                      key={s}
                      onClick={() => setForm({ ...form, semester: s })}
                      className={`ob-option ${form.semester === s ? "ob-option-selected" : ""}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="ob-credits">
              <label className="ob-credits-label">
                <GraduationCap size={16} />
                نوع الدرجة العلمية
              </label>
              <div className="ob-credits-row">
                {["بكالوريوس", "دبلوم"].map((d) => (
                  <button
                    key={d}
                    onClick={() => setForm({ ...form, degree_type: d })}
                    className={`ob-option ${form.degree_type === d ? "ob-option-selected" : ""}`}
                  >
                    {d === "بكالوريوس" ? "🎓 بكالوريوس" : "📋 دبلوم"}
                  </button>
                ))}
              </div>
            </div>

            <div className="ob-credits">
              <label className="ob-credits-label" htmlFor="credits-input">
                <Hash size={16} />
                كم ساعة تحتاج للتخرج؟
              </label>
              <input
                id="credits-input"
                type="number"
                min={60}
                max={200}
                value={form.total_credits}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setForm({ ...form, total_credits: isNaN(val) ? 0 : val });
                }}
                className="ob-input ob-input-number"
                placeholder="مثال: 132"
              />
              <span className="ob-credits-hint">عادةً بين 120 و 160 ساعة</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="ob-actions">
          {step > 1 && (
            <button onClick={() => setStep(step - 1)} className="ob-btn-back">
              → رجوع
            </button>
          )}
          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canNext()}
              className="ob-btn-next"
            >
              التالي ←
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={!canNext() || loading}
              className="ob-btn-next"
            >
              {loading ? "جاري الحفظ..." : "ابدأ مساري 🚀"}
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        .ob-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: hsl(var(--background));
          font-family: var(--font-main);
          padding: 1.5rem;
        }
        .ob-card {
          background: hsl(var(--card));
          border-radius: 24px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
          width: 100%;
          max-width: 560px;
          overflow: hidden;
        }
        .ob-sub-label {
          font-size: 0.85rem;
          font-weight: 600;
          color: hsl(var(--muted-foreground));
          margin-bottom: 0.5rem;
        }
        .ob-header {
          background: hsl(var(--primary));
          padding: 2.5rem 2rem;
          text-align: center;
          color: white;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
        }
        .ob-logo {
          width: 52px;
          height: 52px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          font-weight: 800;
        }
        .ob-title {
          font-size: 1.5rem;
          font-weight: 800;
          margin: 0;
        }
        .ob-subtitle {
          font-size: 0.9rem;
          opacity: 0.85;
          margin: 0;
        }
        .ob-progress {
          display: flex;
          justify-content: center;
          gap: 1rem;
          padding: 1.5rem 2rem;
          border-bottom: 1px solid hsl(var(--border));
        }
        .ob-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.4rem;
          opacity: 0.4;
          transition: opacity 0.2s;
        }
        .ob-step-active,
        .ob-step-done {
          opacity: 1;
        }
        .ob-step-circle {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: hsl(var(--muted));
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          transition: all 0.2s;
        }
        .ob-step-active .ob-step-circle {
          background: hsl(var(--primary) / 0.1);
          border: 2px solid hsl(var(--primary));
        }
        .ob-step-done .ob-step-circle {
          background: hsl(var(--success) / 0.1);
          color: hsl(var(--success));
          font-size: 1rem;
          font-weight: 700;
        }
        .ob-step-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: hsl(var(--muted-foreground));
        }
        .ob-body {
          padding: 1.75rem 2rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .ob-step-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1rem;
          font-weight: 700;
          color: hsl(var(--foreground));
          margin: 0;
        }
        .ob-step-icon {
          width: 20px;
          height: 20px;
          color: hsl(var(--primary));
        }
        .ob-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .ob-option {
          padding: 0.5rem 1rem;
          border: 1.5px solid hsl(var(--border));
          border-radius: 100px;
          font-size: 0.85rem;
          font-family: var(--font-main);
          background: hsl(var(--background));
          color: hsl(var(--foreground));
          cursor: pointer;
          transition: all 0.15s;
        }
        .ob-option:hover {
          border-color: hsl(var(--primary));
          color: hsl(var(--primary));
        }
        .ob-option-selected {
          background: hsl(var(--primary));
          border-color: hsl(var(--primary));
          color: white;
        }
        .ob-option-grad {
          border-color: hsl(var(--success) / 0.4);
          color: hsl(var(--success));
          font-weight: 700;
        }
        .ob-option-grad.ob-option-selected {
          background: hsl(var(--success));
          border-color: hsl(var(--success));
          color: white;
        }
        .ob-input {
          width: 100%;
          padding: 0.65rem 1rem;
          border: 1.5px solid hsl(var(--primary));
          border-radius: 12px;
          font-size: 0.9rem;
          font-family: var(--font-main);
          background: hsl(var(--background));
          color: hsl(var(--foreground));
          box-sizing: border-box;
        }
        .ob-input:focus {
          outline: none;
        }
        .ob-input-number {
          max-width: 180px;
          text-align: center;
          font-size: 1.1rem;
          font-weight: 700;
        }
        .ob-credits {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .ob-credits-label {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: hsl(var(--foreground));
        }
        .ob-credits-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .ob-credits-hint {
          font-size: 0.78rem;
          color: hsl(var(--muted-foreground));
        }
        .ob-actions {
          padding: 1.25rem 2rem 2rem;
          display: flex;
          gap: 0.75rem;
          justify-content: flex-end;
          border-top: 1px solid hsl(var(--border));
        }
        .ob-btn-next {
          padding: 0.75rem 2rem;
          background: hsl(var(--primary));
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 0.95rem;
          font-family: var(--font-main);
          font-weight: 700;
          cursor: pointer;
          transition: opacity 0.2s;
        }
        .ob-btn-next:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .ob-btn-next:hover:not(:disabled) {
          opacity: 0.9;
        }
        .ob-btn-back {
          padding: 0.75rem 1.5rem;
          background: transparent;
          color: hsl(var(--muted-foreground));
          border: 1.5px solid hsl(var(--border));
          border-radius: 12px;
          font-size: 0.9rem;
          font-family: var(--font-main);
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .ob-btn-back:hover {
          background: hsl(var(--muted));
        }
        @media (max-width: 480px) {
          .ob-header {
            padding: 2rem 1.5rem;
          }
          .ob-body {
            padding: 1.5rem;
          }
          .ob-actions {
            padding: 1rem 1.5rem 1.5rem;
          }
        }
        .ob-dept-group {
          margin-bottom: 1.5rem;
        }
        .ob-dept-label {
          font-weight: 600;
          color: hsl(var(--primary));
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
          border-right: 3px solid hsl(var(--primary));
          padding-right: 0.5rem;
        }
      `}</style>
    </div>
  );
}
