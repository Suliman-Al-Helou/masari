"use client";

import { Loader2, Trash2, X } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import type { AdminCourse } from "@/types/admin";

interface CourseDeleteConfirmProps {
  course: AdminCourse;
  isPending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function CourseDeleteConfirm({
  course,
  isPending,
  onConfirm,
  onCancel,
}: CourseDeleteConfirmProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isPending) onCancel();
      }}
    >
      <motion.div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-course-title"
        aria-describedby="delete-course-description"
        initial={reduceMotion ? false : { opacity: 0, scale: 0.97, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-xl"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
            <Trash2 aria-hidden="true" className="h-5 w-5" />
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            aria-label="إغلاق"
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted"
          >
            <X aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>
        <h2 id="delete-course-title" className="mt-4 text-lg font-semibold text-foreground">
          حذف المادة؟
        </h2>
        <p id="delete-course-description" className="mt-2 text-sm leading-6 text-muted-foreground">
          سيتم نقل <strong className="text-foreground">{course.name}</strong> إلى المواد
          المحذوفة، ويمكن للأدمن الأساسي استعادتها لاحقًا.
        </p>
        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-destructive px-4 text-sm font-medium text-destructive-foreground disabled:opacity-50"
          >
            {isPending && <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />}
            تأكيد الحذف
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="min-h-11 rounded-xl border border-border px-4 text-sm text-foreground hover:bg-muted"
          >
            إلغاء
          </button>
        </div>
      </motion.div>
    </div>
  );
}
