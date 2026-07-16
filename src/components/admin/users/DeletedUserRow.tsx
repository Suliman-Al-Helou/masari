"use client";

import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { Loader2, MessageSquareText, RotateCcw, Save, X } from "lucide-react";
import { useEffect, useState } from "react";

import type { AdminProfile } from "@/types/admin";

interface DeletedUserRowProps {
  user: AdminProfile;
  isLast: boolean;
  restoreLoading: boolean;
  noteLoading: boolean;
  onRestore: () => void;
  onSaveNote: (note: string) => void;
}

export default function DeletedUserRow({
  user,
  isLast,
  restoreLoading,
  noteLoading,
  onRestore,
  onSaveNote,
}: DeletedUserRowProps) {
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState(user.deletion_note ?? "");
  const displayName = user.full_name || "مستخدم بدون اسم";

  useEffect(() => {
    setNote(user.deletion_note ?? "");
  }, [user.deletion_note]);

  const disabledAgo = user.deleted_at
    ? formatDistanceToNow(new Date(user.deleted_at), { locale: ar, addSuffix: true })
    : "—";

  return (
    <div className={!isLast ? "border-b border-border" : undefined}>
      <div className="flex flex-wrap items-center gap-4 px-5 py-4 hover:bg-muted/30">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-sm font-semibold text-destructive">
          {displayName.slice(0, 2)}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">{displayName}</p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            تم التعطيل {disabledAgo}
          </p>
          {user.deletion_note && !noteOpen && (
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
              السبب: {user.deletion_note}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={onRestore}
          disabled={restoreLoading || noteLoading}
          className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-primary px-3 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
        >
          {restoreLoading ? (
            <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
          ) : (
            <RotateCcw aria-hidden="true" className="h-4 w-4" />
          )}
          استعادة
        </button>

        <button
          type="button"
          onClick={() => setNoteOpen((current) => !current)}
          aria-expanded={noteOpen}
          aria-controls={`deletion-note-${user.id}`}
          className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-border px-3 text-sm font-medium text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <MessageSquareText aria-hidden="true" className="h-4 w-4" />
          ملاحظة
        </button>
      </div>

      {noteOpen && (
        <div id={`deletion-note-${user.id}`} className="border-t border-border/60 bg-muted/20 px-5 py-4">
          <label htmlFor={`deletion-note-input-${user.id}`} className="mb-2 block text-sm font-medium text-foreground">
            سبب تعطيل الحساب
          </label>
          <textarea
            autoFocus
            id={`deletion-note-input-${user.id}`}
            value={note}
            maxLength={500}
            rows={3}
            onChange={(event) => setNote(event.target.value)}
            placeholder="اكتب سبب التعطيل بشكل اختياري..."
            className="w-full resize-none rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <div className="mt-2 flex items-center justify-between gap-3">
            <span className="text-xs text-muted-foreground">{note.length}/500</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onSaveNote(note)}
                disabled={noteLoading}
                className="inline-flex min-h-9 items-center gap-2 rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground disabled:opacity-50"
              >
                {noteLoading ? (
                  <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
                ) : (
                  <Save aria-hidden="true" className="h-4 w-4" />
                )}
                حفظ
              </button>
              <button
                type="button"
                onClick={() => {
                  setNote(user.deletion_note ?? "");
                  setNoteOpen(false);
                }}
                disabled={noteLoading}
                className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-border px-3 text-xs text-foreground hover:bg-muted"
              >
                <X aria-hidden="true" className="h-4 w-4" />
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
