'use client';

import { useState } from 'react';
import { UserPlus, X, Send, CheckCircle2, Loader2, Copy } from 'lucide-react';

interface InviteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInvite: (email: string) => Promise<{ token: string } | null>;
}

export default function InviteDialog({ open, onOpenChange, onInvite }: InviteDialogProps) {
  const [email, setEmail] = useState('');
  const [loading, setSaving] = useState(false);
  const [result, setResult] = useState<{ token: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const inviteLink = result
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/register?invite=${result.token}`
    : '';

  const handleSubmit = async () => {
    if (!email.trim() || loading) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('البريد الإلكتروني غير صحيح');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await onInvite(email.trim());
      if (res) setResult(res);
    } catch {
      setError('تعذّر إرسال الدعوة، حاول مجدداً');
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => { setEmail(''); setResult(null); setError(null); }, 300);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm mx-4 shadow-xl"
        dir="rtl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <UserPlus className="w-4 h-4 text-primary" />
            </div>
            <h2 className="font-bold text-foreground">دعوة طالب للانضمام</h2>
          </div>
          <button onClick={handleClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {result ? (
          /* ── نجاح: عرض الرابط ── */
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-2 py-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-500" />
              <p className="font-bold text-foreground">تم إنشاء رابط الدعوة!</p>
              <p className="text-xs text-muted-foreground text-center">
                أرسل هذا الرابط لـ <span className="font-medium text-foreground">{email}</span>
              </p>
            </div>

            <div className="flex gap-2">
              <div className="flex-1 px-3 py-2 rounded-xl border border-border bg-muted text-xs text-muted-foreground truncate" dir="ltr">
                {inviteLink}
              </div>
              <button
                onClick={handleCopy}
                className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors flex items-center gap-1 ${
                  copied ? 'bg-emerald-100 text-emerald-700' : 'bg-primary text-primary-foreground hover:opacity-90'
                }`}
              >
                {copied ? <><CheckCircle2 className="w-3.5 h-3.5" /> تم</> : <><Copy className="w-3.5 h-3.5" /> نسخ</>}
              </button>
            </div>

            <button onClick={handleClose} className="w-full py-2.5 rounded-xl border border-border text-sm hover:bg-muted transition-colors">
              إغلاق
            </button>
          </div>
        ) : (
          /* ── النموذج ── */
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">
              أدخل بريد زميلك وسيصله رابط للانضمام لمنصة مساري
            </p>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">البريد الإلكتروني</label>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(null); }}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder="student@university.edu"
                dir="ltr"
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
              {error && <p className="text-xs text-destructive">{error}</p>}
            </div>

            <button
              onClick={handleSubmit}
              disabled={!email || loading}
              className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium disabled:opacity-40 hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> جاري الإنشاء...</>
                : <><Send className="w-4 h-4" /> إنشاء رابط الدعوة</>
              }
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
