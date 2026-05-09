'use client';

import { useState, useEffect, useCallback } from 'react';
import { StickyNote, Plus, Tag, Link2, X, Loader2 } from 'lucide-react';
import NoteCard from './NoteCard';
import { getNotesByCourse, addNote, deleteNote } from '@/lib/api';
import { useAuth } from '@/lib/hooks/useAuth';
import type { Note } from '@/lib/constants/dashboard';

interface Props {
  courseCode: string;
  courseName: string;
}

const EMPTY_FORM = {
  title: '',
  content: '',
  tagInput: '',
  tags: [] as string[],
  link: '',
};

export default function CourseNotes({ courseCode, courseName }: Props) {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // جلب الملاحظات من Supabase
  const fetchNotes = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getNotesByCourse(user.id, courseCode);
      setNotes(data as Note[]);
    } catch {
      setError('تعذّر تحميل الملاحظات');
    } finally {
      setLoading(false);
    }
  }, [user, courseCode]);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  const addTag = () => {
    const trimmed = form.tagInput.trim();
    if (trimmed && !form.tags.includes(trimmed)) {
      setForm(prev => ({ ...prev, tags: [...prev.tags, trimmed], tagInput: '' }));
    }
  };

  const removeTag = (t: string) =>
    setForm(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== t) }));

  const handleSubmit = async () => {
    if (!form.title || !user) return;
    setSaving(true);
    setError(null);
    try {
      const saved = await addNote({
        user_id: user.id,
        course_code: courseCode,
        title: form.title,
        content: form.link
          ? form.content + (form.content ? '\n\n' : '') + `[رابط]: ${form.link}`
          : form.content,
        tags: form.tags,
        link: form.link || null,
      });
      setNotes(prev => [saved as Note, ...prev]);
      setForm(EMPTY_FORM);
      setShowForm(false);
    } catch {
      setError('تعذّر حفظ الملاحظة، حاول مجدداً');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    // نحذف من الـ UI فوراً (optimistic) ثم نرسل لـ Supabase
    setNotes(prev => prev.filter(n => n.id !== id));
    try {
      await deleteNote(id);
    } catch {
      // نرجع الملاحظة إذا فشل الحذف
      fetchNotes();
    }
  };

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <StickyNote className="w-5 h-5 text-primary" />
          الملاحظات الدراسية
          {notes.length > 0 && (
            <span className="bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded-lg">
              {notes.length}
            </span>
          )}
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-3 py-2 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          ملاحظة جديدة
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-xl border border-destructive/20">
          <X className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="rounded-2xl bg-card border border-primary/20 p-5 space-y-4">

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">عنوان الملاحظة</label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
              placeholder="مثال: ملخص المحاضرة الأولى"
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">المحتوى</label>
            <textarea
              value={form.content}
              onChange={e => setForm(prev => ({ ...prev, content: e.target.value }))}
              placeholder="اكتب ملاحظاتك هنا..."
              rows={4}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" />الوسوم
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={form.tagInput}
                onChange={e => setForm(prev => ({ ...prev, tagInput: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="اكتب وسم واضغط Enter"
                className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button
                onClick={addTag}
                className="px-4 py-2.5 rounded-xl border border-border text-sm hover:bg-muted transition-colors"
              >
                إضافة
              </button>
            </div>
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {form.tags.map(t => (
                  <span
                    key={t}
                    onClick={() => removeTag(t)}
                    className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-lg flex items-center gap-1 cursor-pointer hover:bg-primary/20 transition-colors"
                  >
                    {t}<X className="w-3 h-3" />
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5" />رابط خارجي (اختياري)
            </label>
            <input
              type="text"
              value={form.link}
              onChange={e => setForm(prev => ({ ...prev, link: e.target.value }))}
              placeholder="https://..."
              dir="ltr"
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={!form.title || saving}
              className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  جاري الحفظ...
                </span>
              ) : 'حفظ الملاحظة'}
            </button>
            <button
              onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }}
              className="px-4 py-2.5 rounded-xl border border-border text-sm hover:bg-muted transition-colors"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 text-primary/40 animate-spin" />
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-dashed border-border bg-muted/30">
          <StickyNote className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">لا توجد ملاحظات بعد</p>
          <p className="text-muted-foreground/60 text-xs mt-1">ابدأ بإضافة أولى ملاحظاتك لمادة {courseName}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {notes.map(note => (
            <NoteCard
              key={note.id}
              note={note}
              onDelete={() => handleDelete(note.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
