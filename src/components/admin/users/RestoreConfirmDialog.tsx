"use client";

import { Loader2 } from "lucide-react";
import { motion } from "motion/react";

import { buttonVariants, fadeIn, scaleIn } from "@/lib/motion";
import type { AdminProfile } from "@/types/admin";

interface RestoreConfirmDialogProps {
  user: AdminProfile;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function RestoreConfirmDialog({
  user,
  loading,
  onConfirm,
  onCancel,
}: RestoreConfirmDialogProps) {
  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={() => !loading && onCancel()}
    >
      <motion.div
        variants={scaleIn}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="restore-dialog-title"
        aria-describedby="restore-dialog-description"
        className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="restore-dialog-title" className="text-base font-semibold text-foreground">
          استعادة الحساب
        </h2>
        <p id="restore-dialog-description" className="mt-2 text-sm text-muted-foreground">
          سيتمكن {user.full_name || "المستخدم"} من تسجيل الدخول واستخدام حسابه مجدداً.
        </p>

        <div className="mt-6 flex gap-3">
          <motion.button
            type="button"
            variants={buttonVariants}
            initial="initial"
            whileHover={loading ? undefined : "hover"}
            whileTap={loading ? undefined : "tap"}
            onClick={onConfirm}
            disabled={loading}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            {loading && <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />}
            {loading ? "جاري الاستعادة" : "تأكيد الاستعادة"}
          </motion.button>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 rounded-xl border border-border py-2 text-sm text-foreground hover:bg-muted disabled:opacity-50"
          >
            إلغاء
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
