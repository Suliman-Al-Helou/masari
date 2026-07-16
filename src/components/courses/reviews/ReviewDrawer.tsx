'use client';

import { useState, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft, Check, Loader2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/hooks/useAuth';
import { useToast } from '@/lib/context/ToastContext';
import { addDoctorReview, getUserDoctorReview, Doctor } from '@/lib/api/reviews';

// ── الثوابت ──
const EMOJIS = [
  { e: '😤', label: 'سيئ جداً',  min: 0  },
  { e: '😕', label: 'ضعيف',      min: 20 },
  { e: '😐', label: 'مقبول',     min: 40 },
  { e: '🙂', label: 'جيد',       min: 55 },
  { e: '😊', label: 'جيد جداً',  min: 70 },
  { e: '🤩', label: 'ممتاز',     min: 85 },
] as const;

const TAGS = [
  { label: 'ملتزم',        emoji: '📚' },
  { label: 'مفيد',         emoji: '💡' },
  { label: 'منظم',         emoji: '⏰' },
  { label: 'واضح',         emoji: '🗣️' },
  { label: 'متعاون',       emoji: '🤝' },
  { label: 'خبير',         emoji: '🎓' },
  { label: 'ممل',          emoji: '😴' },
  { label: 'صعب',          emoji: '🧠' },
  { label: 'كثير واجبات',  emoji: '📝' },
] as const;

function getEmojiForPct(p: number) {
  if (p < 20) return '😤';
  if (p < 40) return '😕';
  if (p < 55) return '😐';
  if (p < 70) return '🙂';
  if (p < 85) return '😊';
  return '🤩';
}

function getPlaceholder(pct: number) {
  if (pct >= 70) return 'شو أكثر شي عجبك في هذا الدكتور؟';
  if (pct >= 40) return 'شاركنا تجربتك مع هذا الدكتور...';
  return 'شو تتمنى يتحسن؟';
}

// ── الأفاتار بالألوان ──
const AVATAR_COLORS = [
  { bg: 'bg-primary/10',     text: 'text-primary'     },
  { bg: 'bg-success/10',     text: 'text-success'     },
  { bg: 'bg-warning/10',     text: 'text-warning'     },
  { bg: 'bg-destructive/10', text: 'text-destructive' },
  { bg: 'bg-info/10',        text: 'text-info'        },
];

function getAvatarColor(name: string) {
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

function getInitials(name: string) {
  return name.replace('د.', '').trim().split(' ').slice(0, 2).map(w => w[0]).join('');
}

// ── Step Indicator ──
function StepIndicator({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-2 mb-5">
      {[1, 2, 3].map((s) => (
        <div
          key={s}
          className={`w-2 h-2 rounded-full transition-all duration-300
            ${s < step ? 'bg-success' : s === step ? 'bg-primary scale-125' : 'bg-border'}`}
        />
      ))}
      <span className="text-xs text-muted-foreground mr-1">خطوة {step} من 3</span>
    </div>
  );
}

// ══════════════════════════════════════════════
// Main Component
// ══════════════════════════════════════════════

interface ReviewDrawerProps {
  doctor:     Doctor;
  courseCode: string;
  open:       boolean;
  onClose:    () => void;
}

type ReviewState = {
  pct:          number;
  selectedEmoji: string | null;
  selectedTags:  string[];
  comment:       string;
};

const INITIAL_STATE: ReviewState = {
  pct:           75,
  selectedEmoji: null,
  selectedTags:  [],
  comment:       '',
};

export default function ReviewDrawer({ doctor, courseCode, open, onClose }: ReviewDrawerProps) {
  const { user }   = useAuth();
  const {Success,Error}      = useToast();
  const qc         = useQueryClient();

  const [step,      setStep]      = useState(1);
  const [state,     setState]     = useState<ReviewState>(INITIAL_STATE);
  const [submitted, setSubmitted] = useState(false);

  // إغلاق بـ Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Reset عند فتح
  useEffect(() => {
    if (open) { setStep(1); setState(INITIAL_STATE); setSubmitted(false); }
  }, [open, doctor.id]);

  const mutation = useMutation({
    mutationFn: () => addDoctorReview({
      user_id:         user!.id,
      doctor_id:       doctor.id,
      course_code:     courseCode,
      rating_overall:  state.pct,
      rating_clarity:  state.pct,      // نستخدم نفس القيمة — يمكن تفصيلها لاحقاً
      rating_fairness: state.pct,
      would_retake:    state.pct >= 60,
      review:          state.comment || undefined,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['doctor-reviews', doctor.id] });
      qc.invalidateQueries({ queryKey: ['doctors'] });
      setSubmitted(true);
      Success('تم التقييم!', `شكراً — تقييمك ${state.pct}% سيساعد الطلاب الآخرين`);
    },
    onError: () => Error('خطأ', 'فشل في إرسال التقييم'),
  });

  const setField = <K extends keyof ReviewState>(k: K, v: ReviewState[K]) =>
    setState(prev => ({ ...prev, [k]: v }));

  const toggleTag = (tag: string) => {
    const has = state.selectedTags.includes(tag);
    if (has) setField('selectedTags', state.selectedTags.filter(t => t !== tag));
    else if (state.selectedTags.length < 3) setField('selectedTags', [...state.selectedTags, tag]);
  };

  const avatarColor = getAvatarColor(doctor.name);
  const displayEmoji = state.selectedEmoji ?? getEmojiForPct(state.pct);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border rounded-t-3xl shadow-2xl
        animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto">

        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${avatarColor.bg} ${avatarColor.text}`}>
              {getInitials(doctor.name)}
            </div>
            <div>
              <p className="font-bold text-sm text-foreground">{doctor.name}</p>
              <p className="text-xs text-muted-foreground">{doctor.major}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5 max-w-lg mx-auto">

          {/* ── حالة النجاح ── */}
          {submitted ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">🎉</div>
              <h3 className="text-lg font-bold text-foreground mb-2">شكراً على تقييمك!</h3>
              <p className="text-sm text-muted-foreground mb-6">
                تقييمك {state.pct}% {displayEmoji} سيساعد الطلاب الآخرين
              </p>
              {state.selectedTags.length > 0 && (
                <div className="flex justify-center gap-2 flex-wrap mb-6">
                  {state.selectedTags.map(tag => (
                    <span key={tag} className="text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                      {TAGS.find(t => t.label === tag)?.emoji} {tag}
                    </span>
                  ))}
                </div>
              )}
              <button onClick={onClose} className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium">
                إغلاق
              </button>
            </div>
          ) : (
            <>
              <StepIndicator step={step} />

              {/* ── الخطوة ١ — Emoji Slider ── */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">تقييمك العام</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-foreground">{state.pct}</span>
                      <span className="text-sm text-muted-foreground">%</span>
                    </div>
                  </div>

                  {/* Emoji كبير */}
                  <div className="text-center text-5xl py-2 transition-all duration-200">
                    {displayEmoji}
                  </div>

                  {/* Slider */}
                  <div className="space-y-2">
                    <div className="relative h-2 bg-border rounded-full overflow-hidden">
                      <div
                        className="absolute top-0 right-0 h-full rounded-full bg-gradient-to-l from-primary to-success transition-all duration-75"
                        style={{ width: `${state.pct}%` }}
                      />
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={state.pct}
                      onChange={(e) => setField('pct', Number(e.target.value))}
                      className="w-full accent-primary"
                    />
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>0%</span><span>50%</span><span>100%</span>
                    </div>
                  </div>

                  {/* label الحالي */}
                  <p className="text-center text-sm text-muted-foreground">
                    {EMOJIS.findLast(em => state.pct >= em.min)?.label ?? 'سيئ جداً'}
                  </p>
                </div>
              )}

              {/* ── الخطوة ٢ — Emoji + Tags ── */}
              {step === 2 && (
                <div className="space-y-5">
                  {/* Emoji Picker */}
                  <div>
                    <p className="text-sm font-medium text-foreground mb-3">دقّق تقييمك</p>
                    <div className="grid grid-cols-6 gap-2">
                      {EMOJIS.map(({ e, label }) => (
                        <button
                          key={e}
                          onClick={() => setField('selectedEmoji', state.selectedEmoji === e ? null : e)}
                          title={label}
                          className={`h-11 rounded-xl text-2xl flex items-center justify-center border transition-all duration-150
                            ${state.selectedEmoji === e
                              ? 'border-primary bg-primary/10 scale-110 shadow-sm'
                              : 'border-border bg-background hover:border-primary/40 hover:scale-105'
                            }`}
                        >
                          {e}
                        </button>
                      ))}
                    </div>
                    {state.selectedEmoji && (
                      <p className="text-xs text-muted-foreground mt-2 text-center">
                        {EMOJIS.find(x => x.e === state.selectedEmoji)?.label}
                      </p>
                    )}
                  </div>

                  {/* Tags */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium text-foreground">اختر ما ينطبق</p>
                      <span className="text-xs text-muted-foreground">{state.selectedTags.length}/3</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {TAGS.map(({ label, emoji }) => {
                        const selected = state.selectedTags.includes(label);
                        const disabled = !selected && state.selectedTags.length >= 3;
                        return (
                          <button
                            key={label}
                            onClick={() => toggleTag(label)}
                            disabled={disabled}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all duration-150
                              ${selected
                                ? 'bg-primary/10 border-primary text-primary'
                                : disabled
                                  ? 'border-border text-muted-foreground/40 cursor-not-allowed'
                                  : 'border-border text-foreground hover:border-primary/40 hover:bg-muted'
                              }`}
                          >
                            <span>{emoji}</span>
                            <span>{label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* ── الخطوة ٣ — تعليق ── */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">تعليقك (اختياري)</p>
                    <span className="text-sm">{displayEmoji} {state.pct}%</span>
                  </div>
                  <div>
                    <textarea
                      value={state.comment}
                      onChange={(e) => setField('comment', e.target.value.slice(0, 280))}
                      placeholder={getPlaceholder(state.pct)}
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                    />
                    <p className="text-xs text-muted-foreground text-left mt-1">
                      {state.comment.length} / 280
                    </p>
                  </div>

                  {/* ملخص التقييم */}
                  <div className="bg-muted/50 rounded-xl p-4 space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">ملخص تقييمك</p>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{displayEmoji}</span>
                      <div>
                        <p className="font-bold text-foreground">{state.pct}%</p>
                        <p className="text-xs text-muted-foreground">
                          {EMOJIS.findLast(em => state.pct >= em.min)?.label}
                        </p>
                      </div>
                    </div>
                    {state.selectedTags.length > 0 && (
                      <div className="flex gap-1.5 flex-wrap">
                        {state.selectedTags.map(tag => (
                          <span key={tag} className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                            {TAGS.find(t => t.label === tag)?.emoji} {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── أزرار التنقل ── */}
              <div className="flex gap-3 mt-6">
                {step > 1 && (
                  <button
                    onClick={() => setStep(s => s - 1)}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:bg-muted transition-colors"
                  >
                    <ArrowRight className="w-4 h-4" />
                    رجوع
                  </button>
                )}
                {step < 3 ? (
                  <button
                    onClick={() => setStep(s => s + 1)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    التالي
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => mutation.mutate()}
                    disabled={mutation.isPending}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-all"
                  >
                    {mutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    إرسال التقييم
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* Safe area للموبايل */}
        <div className="h-6" />
      </div>
    </>
  );
}