'use client';

// src/components/support/ContactForm.tsx

import { useState } from 'react';
import { Send, HeadphonesIcon } from 'lucide-react';
import { DEFAULT_FORM, SupportForm } from '@/lib/constants/support';
import CategoryPicker from './CategoryPicker';

export default function ContactForm() {
  const [form, setForm] = useState<SupportForm>(DEFAULT_FORM);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const isValid = form.subject.trim() && form.message.trim() && form.category;

  const handleSend = async () => {
    if (!isValid) return;
    setSending(true);

    // TODO: استبدل بـ API call حقيقي عند ربط الـ backend
    await new Promise(r => setTimeout(r, 1000)); // محاكاة الإرسال
    console.log('Support request:', form);

    setSent(true);
    setForm(DEFAULT_FORM);
    setSending(false);
    setTimeout(() => setSent(false), 4000);
  };

  const inputClass = "w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all";

  return (
    <div>
      <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
        <HeadphonesIcon className="w-5 h-5 text-primary" />
        تواصل معنا
      </h2>

      <div className="rounded-2xl bg-card border border-border/50 p-6 space-y-5">
        <CategoryPicker
          selected={form.category}
          onChange={cat => setForm({ ...form, category: cat })}
        />

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">الموضوع</label>
          <input
            className={inputClass}
            value={form.subject}
            onChange={e => setForm({ ...form, subject: e.target.value })}
            placeholder="اكتب موضوع الطلب..."
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">الرسالة</label>
          <textarea
            className={`${inputClass} resize-none`}
            value={form.message}
            onChange={e => setForm({ ...form, message: e.target.value })}
            placeholder="اكتب تفاصيل طلبك هنا..."
            rows={5}
          />
        </div>

        {/* Success message */}
        {sent && (
          <div className="px-4 py-3 rounded-xl bg-success/10 text-success text-sm text-center font-medium">
            ✓ تم إرسال طلب الدعم بنجاح، سنتواصل معك قريباً
          </div>
        )}

        <button
          onClick={handleSend}
          disabled={!isValid || sending}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 active:scale-[0.98] transition-all"
        >
          {sending ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          {sending ? 'جاري الإرسال...' : 'إرسال'}
        </button>
      </div>
    </div>
  );
}