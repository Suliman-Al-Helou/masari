"use client";

import { motion, AnimatePresence } from "motion/react";
import { toastVariants } from "@/lib/motion";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastViewportProps {
  toasts: ToastItem[];
  duration: number;
  onDismiss: (id: string) => void;
}

const ICONS: Record<ToastType, string> = {
  success: "✓",
  error: "✕",
  warning: "⚠",
  info: "ℹ",
};

// 🎨 هون بس تتحكم بألوان كل نوع توست
const ICON_STYLES: Record<ToastType, string> = {
  success: "bg-success/15 text-success",
  error: "bg-destructive/15 text-destructive",
  warning: "bg-warning/15 text-warning",
  info: "bg-info/15 text-info",
};

const PROGRESS_STYLES: Record<ToastType, string> = {
  success: "bg-success",
  error: "bg-destructive",
  warning: "bg-warning",
  info: "bg-info",
};

export function ToastViewport({ toasts, duration, onDismiss }: ToastViewportProps) {
  return (
    <div
      dir="rtl"
      className="fixed bottom-6 left-6 z-[9999] flex w-[calc(100vw-3rem)] max-w-[360px] flex-col gap-2.5 pointer-events-none"
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            variants={toastVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative flex items-start gap-3 overflow-hidden rounded-xl border border-border bg-card p-3.5 shadow-[0_8px_32px_rgba(0,0,0,0.12)] pointer-events-auto"
          >
            <span
              className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-[0.8rem] font-bold ${ICON_STYLES[toast.type]}`}
            >
              {ICONS[toast.type]}
            </span>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold leading-snug text-foreground">
                {toast.title}
              </p>
              {toast.message && (
                <p className="mt-0.5 text-[0.8rem] leading-relaxed text-muted-foreground">
                  {toast.message}
                </p>
              )}
            </div>

            <button
              onClick={() => onDismiss(toast.id)}
              className="flex-shrink-0 cursor-pointer p-0.5 text-[0.7rem] text-muted-foreground opacity-60 transition-opacity hover:opacity-100"
            >
              ✕
            </button>

            {/* شريط التقدم: بنحركه بـ motion كمان، مش CSS */}
            <motion.div
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: duration / 1000, ease: "linear" }}
              className={`absolute bottom-0 right-0 h-[3px] rounded-b-xl ${PROGRESS_STYLES[toast.type]}`}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}