'use client';

import Link from 'next/link';

type Note = {
  id:           string;
  title:        string;
  course_code:  string | null;
  content:      string | null;
  created_date: string | null;
  tags:         string[] | null;
};

const NOTE_COLORS = [
  'bg-primary/10 text-primary',
  'bg-success/10 text-success',
  'bg-warning/10 text-warning',
];

export default function RecentNotes({ notes }: { notes: Note[] }) {
  if (notes.length === 0) {
    return (
      <div className="bg-card border border-border rounded-2xl p-5">
        <h2 className="text-base font-medium text-foreground mb-4">
          آخر الملاحظات
        </h2>
        <p className="text-sm text-muted-foreground text-center py-6">
          لا يوجد ملاحظات بعد 📝
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-medium text-foreground">آخر الملاحظات</h2>
        <Link
          href="/semester-plan"
          className="text-xs text-primary hover:underline"
        >
          عرض الكل
        </Link>
      </div>

      <div className="space-y-2">
        {notes.map((note, idx) => {
          const colorClass = NOTE_COLORS[idx % NOTE_COLORS.length];
          const date = note.created_date
            ? new Date(note.created_date).toLocaleDateString('ar-SA', {
                month: 'short',
                day:   'numeric',
              })
            : null;

          // أول سطر من المحتوى كـ preview
          const preview = note.content
            ?.replace(/\n/g, ' ')
            .trim()
            .slice(0, 60);

          return (
            <Link
              key={note.id}
              href={note.course_code ? `/course/${note.course_code}` : '/semester-plan'}
              className="flex items-start gap-3 p-3 rounded-xl border border-border bg-background hover:bg-muted/40 transition-colors group"
            >
              {/* أيقونة المادة */}
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold ${colorClass}`}
                dir="ltr"
              >
                {note.course_code?.slice(0, 3) ?? '📝'}
              </div>

              {/* المحتوى */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                  {note.title}
                </p>
                {preview && (
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {preview}
                  </p>
                )}
                {/* Tags */}
                {note.tags && note.tags.length > 0 && (
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {note.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* التاريخ */}
              {date && (
                <span className="text-xs text-muted-foreground flex-shrink-0 mt-0.5">
                  {date}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}