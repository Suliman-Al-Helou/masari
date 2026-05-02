'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/lib/context/ToastContext';
import { useFormField, rules } from '@/lib/hooks/useFormField';

type Tab = 'signin' | 'signup';

// مكون حقل موحّد
function Field({
  label, error, touched, hint, children,
}: {
  label: string; error: string; touched: boolean; hint?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div className="lp-field">
      <div className="lp-label-row">
        <label>{label}</label>
        {hint}
      </div>
      {children}
      {touched && error && <span className="lp-field-error">⚠ {error}</span>}
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const toast  = useToast();
  const [tab, setTab]           = useState<Tab>('signin');
  const [loading, setLoading]   = useState(false);
  const [showReset, setShowReset] = useState(false);

  // Sign In fields
  const siEmail    = useFormField();
  const siPassword = useFormField();

  // Sign Up fields
  const suName     = useFormField();
  const suEmail    = useFormField();
  const suPassword = useFormField();
  const suConfirm  = useFormField();

  // Reset field
  const resetEmail = useFormField();

  const switchTab = (t: Tab) => { setTab(t); setShowReset(false); };

  // ── Sign In ──
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = [
      siEmail.validate([rules.required('البريد'), rules.email()]),
      siPassword.validate([rules.required('كلمة المرور')]),
    ].every(Boolean);
    if (!ok) return;

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: siEmail.value, password: siPassword.value,
    });
    setLoading(false);

    if (error) toast.error('فشل تسجيل الدخول', 'البريد الإلكتروني أو كلمة المرور غير صحيحة');
    else { toast.success('مرحباً بك! 👋'); router.push('/'); }
  };

  // ── Sign Up ──
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = [
      suName.validate([rules.required('الاسم')]),
      suEmail.validate([rules.required('البريد'), rules.email()]),
      suPassword.validate([rules.required('كلمة المرور'), rules.minLength(6)]),
      suConfirm.validate([rules.required('التأكيد'), rules.match(suPassword.value, 'كلمة المرور')]),
    ].every(Boolean);
    if (!ok) return;

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: suEmail.value, password: suPassword.value,
      options: { data: { full_name: suName.value } },
    });
    setLoading(false);

    if (error) toast.error('فشل إنشاء الحساب', 'حاول مرة أخرى أو تواصل مع الدعم');
    else toast.success('تم إنشاء الحساب!', 'تحقق من بريدك الإلكتروني لتأكيد الحساب');
  };

  // ── Reset ──
  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = resetEmail.validate([rules.required('البريد'), rules.email()]);
    if (!ok) return;

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.value, {
      redirectTo: `${window.location.origin}/login`,
    });
    setLoading(false);

    if (error) toast.error('فشل الإرسال', 'تأكد من البريد الإلكتروني وحاول مرة أخرى');
    else { toast.success('تم الإرسال!', 'تحقق من بريدك الإلكتروني'); setShowReset(false); }
  };

  return (
    <div className="lp-root" dir="rtl">
      <div className="lp-bg-blob lp-blob1" />
      <div className="lp-bg-blob lp-blob2" />

      <div className="lp-wrap">
        {/* Brand */}
        <div className="lp-brand">
          <div className="lp-logo">م</div>
          <h1 className="lp-name">مساري</h1>
          <p className="lp-tagline">رفيقك الأكاديمي طوال رحلتك الجامعية</p>
          <div className="lp-pills">
            {['🎯 تتبع مسارك الدراسي','📅 خطط فصلك بذكاء','📝 نظّم مهامك','👥 تواصل مع زملائك'].map(f => (
              <span key={f} className="lp-pill">{f}</span>
            ))}
          </div>
        </div>

        {/* Form Side */}
        <div className="lp-form-side">
          <div className="lp-card">
            <div className="lp-tabs">
              {(['signin','signup'] as Tab[]).map(t => (
                <button key={t} className={`lp-tab ${tab===t?'lp-tab-on':''}`} onClick={() => switchTab(t)}>
                  {t === 'signin' ? 'تسجيل الدخول' : 'إنشاء حساب'}
                </button>
              ))}
            </div>

            {/* Sign In */}
            {tab === 'signin' && !showReset && (
              <form onSubmit={handleSignIn} className="lp-form" noValidate>
                <Field label="البريد الإلكتروني" error={siEmail.error} touched={siEmail.touched}>
                  <input type="email" placeholder="example@university.edu"
                    value={siEmail.value} onChange={siEmail.onChange} onBlur={siEmail.onBlur}
                    className={`lp-input ${siEmail.touched && siEmail.error ? 'lp-input-err' : ''}`} />
                </Field>
                <Field label="كلمة المرور" error={siPassword.error} touched={siPassword.touched}
                  hint={
                    <button type="button" className="lp-forgot"
                      onClick={() => setShowReset(true)}>نسيت كلمة المرور؟</button>
                  }>
                  <input type="password" placeholder="••••••••"
                    value={siPassword.value} onChange={siPassword.onChange} onBlur={siPassword.onBlur}
                    className={`lp-input ${siPassword.touched && siPassword.error ? 'lp-input-err' : ''}`} />
                </Field>
                <button type="submit" disabled={loading} className="lp-btn">
                  {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
                </button>
                <p className="lp-hint">ما عندك حساب؟ <button type="button" onClick={() => switchTab('signup')}>أنشئ حساباً</button></p>
              </form>
            )}

            {/* Reset */}
            {tab === 'signin' && showReset && (
              <form onSubmit={handleReset} className="lp-form" noValidate>
                <p className="lp-reset-info">أدخل بريدك وسنرسل لك رابط إعادة تعيين كلمة المرور</p>
                <Field label="البريد الإلكتروني" error={resetEmail.error} touched={resetEmail.touched}>
                  <input type="email" placeholder="example@university.edu"
                    value={resetEmail.value} onChange={resetEmail.onChange} onBlur={resetEmail.onBlur}
                    className={`lp-input ${resetEmail.touched && resetEmail.error ? 'lp-input-err' : ''}`} />
                </Field>
                <button type="submit" disabled={loading} className="lp-btn">
                  {loading ? 'جاري الإرسال...' : 'إرسال رابط الاستعادة'}
                </button>
                <p className="lp-hint"><button type="button" onClick={() => setShowReset(false)}>← رجوع لتسجيل الدخول</button></p>
              </form>
            )}

            {/* Sign Up */}
            {tab === 'signup' && (
              <form onSubmit={handleSignUp} className="lp-form" noValidate>
                <Field label="الاسم الكامل" error={suName.error} touched={suName.touched}>
                  <input type="text" placeholder="سليمان الأحمد"
                    value={suName.value} onChange={suName.onChange} onBlur={suName.onBlur}
                    className={`lp-input ${suName.touched && suName.error ? 'lp-input-err' : ''}`} />
                </Field>
                <Field label="البريد الإلكتروني" error={suEmail.error} touched={suEmail.touched}>
                  <input type="email" placeholder="example@university.edu"
                    value={suEmail.value} onChange={suEmail.onChange} onBlur={suEmail.onBlur}
                    className={`lp-input ${suEmail.touched && suEmail.error ? 'lp-input-err' : ''}`} />
                </Field>
                <Field label="كلمة المرور" error={suPassword.error} touched={suPassword.touched}>
                  <input type="password" placeholder="6 أحرف على الأقل"
                    value={suPassword.value} onChange={suPassword.onChange} onBlur={suPassword.onBlur}
                    className={`lp-input ${suPassword.touched && suPassword.error ? 'lp-input-err' : ''}`} />
                </Field>
                <Field label="تأكيد كلمة المرور" error={suConfirm.error} touched={suConfirm.touched}>
                  <input type="password" placeholder="••••••••"
                    value={suConfirm.value} onChange={suConfirm.onChange} onBlur={suConfirm.onBlur}
                    className={`lp-input ${suConfirm.touched && suConfirm.error ? 'lp-input-err' : ''}`} />
                </Field>
                <button type="submit" disabled={loading} className="lp-btn">
                  {loading ? 'جاري إنشاء الحساب...' : 'إنشاء الحساب'}
                </button>
                <p className="lp-hint">عندك حساب؟ <button type="button" onClick={() => switchTab('signin')}>سجّل دخولك</button></p>
              </form>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .lp-root {
          min-height: 100vh; display: flex; align-items: center; justify-content: center;
          background: hsl(var(--background)); font-family: var(--font-main);
          padding: 1rem; position: relative; overflow: hidden;
        }
        .lp-bg-blob { position: fixed; border-radius: 50%; filter: blur(90px); opacity: 0.13; pointer-events: none; z-index: 0; }
        .lp-blob1 { width: 480px; height: 480px; background: hsl(var(--primary)); top: -120px; right: -80px; }
        .lp-blob2 { width: 360px; height: 360px; background: hsl(var(--info)); bottom: -80px; left: -80px; }
        .lp-wrap {
          display: flex; width: 100%; max-width: 860px;
          border-radius: 24px; overflow: hidden;
          box-shadow: 0 20px 70px rgba(0,0,0,0.13); position: relative; z-index: 1;
        }
        .lp-brand {
          flex: 1; background: hsl(var(--primary)); padding: 3rem 2.5rem;
          display: flex; flex-direction: column; gap: 1rem; color: white;
        }
        .lp-logo {
          width: 58px; height: 58px; background: rgba(255,255,255,0.18);
          border-radius: 14px; display: flex; align-items: center; justify-content: center;
          font-size: 1.75rem; font-weight: 800;
        }
        .lp-name { font-size: 2.25rem; font-weight: 800; margin: 0; }
        .lp-tagline { font-size: 0.95rem; opacity: 0.85; margin: 0; line-height: 1.6; }
        .lp-pills { display: flex; flex-direction: column; gap: 0.6rem; margin-top: 0.5rem; }
        .lp-pill { background: rgba(255,255,255,0.12); padding: 0.55rem 1rem; border-radius: 10px; font-size: 0.875rem; }
        .lp-form-side {
          flex: 1; background: hsl(var(--card));
          display: flex; align-items: center; justify-content: center; padding: 2.5rem 2rem;
        }
        .lp-card { width: 100%; max-width: 340px; }
        .lp-tabs {
          display: flex; gap: 0.5rem; margin-bottom: 1.75rem;
          border-bottom: 2px solid hsl(var(--border)); padding-bottom: 0;
        }
        .lp-tab {
          flex: 1; padding: 0.65rem 0.5rem; font-size: 0.9rem;
          font-family: var(--font-main); font-weight: 600;
          border: none; background: transparent; cursor: pointer;
          color: hsl(var(--muted-foreground));
          border-bottom: 2px solid transparent; margin-bottom: -2px; transition: all 0.2s;
        }
        .lp-tab-on { color: hsl(var(--primary)); border-bottom-color: hsl(var(--primary)); }
        .lp-form { display: flex; flex-direction: column; gap: 1rem; }
        .lp-field { display: flex; flex-direction: column; gap: 0.35rem; }
        .lp-field label { font-size: 0.875rem; font-weight: 600; color: hsl(var(--foreground)); }
        .lp-label-row { display: flex; align-items: center; justify-content: space-between; }
        .lp-forgot {
          background: none; border: none; font-family: var(--font-main);
          font-size: 0.78rem; color: hsl(var(--primary)); cursor: pointer; padding: 0; font-weight: 500;
        }
        .lp-forgot:hover { text-decoration: underline; }
        .lp-input {
          width: 100%; padding: 0.65rem 0.875rem;
          border: 1.5px solid hsl(var(--border)); border-radius: 10px;
          font-size: 0.9rem; font-family: var(--font-main);
          background: hsl(var(--background)); color: hsl(var(--foreground));
          transition: border-color 0.2s; direction: ltr; text-align: right; box-sizing: border-box;
        }
        .lp-input:focus { outline: none; border-color: hsl(var(--primary)); }
        .lp-input-err { border-color: hsl(var(--destructive)) !important; }
        .lp-field-error { font-size: 0.78rem; color: hsl(var(--destructive)); margin-top: 0.1rem; }
        .lp-btn {
          width: 100%; padding: 0.75rem; background: hsl(var(--primary)); color: white;
          border: none; border-radius: 10px; font-size: 0.95rem;
          font-family: var(--font-main); font-weight: 700; cursor: pointer;
          transition: opacity 0.2s, transform 0.1s; margin-top: 0.25rem;
        }
        .lp-btn:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
        .lp-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .lp-hint { text-align: center; font-size: 0.85rem; color: hsl(var(--muted-foreground)); margin: 0; }
        .lp-hint button {
          background: none; border: none; color: hsl(var(--primary));
          font-family: var(--font-main); font-weight: 600; cursor: pointer; font-size: 0.85rem;
        }
        .lp-reset-info { font-size: 0.875rem; color: hsl(var(--muted-foreground)); line-height: 1.6; margin: 0; }
        @media (max-width: 600px) {
          .lp-brand { display: none; }
          .lp-form-side { padding: 2rem 1.5rem; }
          .lp-wrap { border-radius: 16px; }
        }
      `}</style>
    </div>
  );
}