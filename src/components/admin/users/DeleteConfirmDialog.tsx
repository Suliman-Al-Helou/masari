"use client";

import { Loader2 } from "lucide-react";
import { motion } from "motion/react";

import { buttonVariants, fadeIn, scaleIn } from "@/lib/motion";
import type { AdminProfile } from "@/types/admin";

interface DeleteConfirmDialogProps {
  user: AdminProfile;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}

export default function DeleteConfirmDialog({
  user,
  onConfirm,
  onCancel,
  loading,
}: DeleteConfirmDialogProps) {
  // Fallback name if the user has no full name.
  const displayName = user.full_name || "مستخدم بدون اسم";

  // Prevent closing the dialog while delete request is running.
  const handleCancel = () => {
    if (loading) return;
    onCancel();
  };

  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={handleCancel}
    >
      <motion.div
        variants={scaleIn}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
        className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <h3
          id="delete-dialog-title"
          className="mb-2 text-base font-semibold text-foreground"
        >
          تأكيد تعطيل الحساب
        </h3>

        <p
          id="delete-dialog-description"
          className="mb-1 text-sm text-muted-foreground"
        >
          هل أنت متأكد من تعطيل المستخدم:
        </p>

        <p className="mb-4 text-sm font-medium text-foreground">
          {displayName}
        </p>

        <p className="mb-6 text-xs text-destructive">
          لن تُحذف بياناته، ويمكن للأدمن الأساسي استعادة الحساب لاحقاً.
        </p>

        <div className="flex gap-3">
          <motion.button
            type="button"
            variants={buttonVariants}
            initial="initial"
            whileHover={loading ? undefined : "hover"}
            whileTap={loading ? undefined : "tap"}
            onClick={onConfirm}
            disabled={loading}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-destructive py-2 text-sm font-medium text-destructive-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading && (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            )}
            {loading ? "جاري التعطيل" : "تعطيل الحساب"}
          </motion.button>

          <motion.button
            type="button"
            variants={buttonVariants}
            initial="initial"
            whileHover={loading ? undefined : "hover"}
            whileTap={loading ? undefined : "tap"}
            onClick={handleCancel}
            disabled={loading}
            className="flex-1 rounded-xl border border-border py-2 text-sm text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            إلغاء
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
