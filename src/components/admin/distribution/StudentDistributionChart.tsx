"use client";

import { motion, useReducedMotion } from "motion/react";

import type { StudentDistributionItem } from "@/types/admin";

interface StudentDistributionChartProps {
  items: StudentDistributionItem[];
  isLoading: boolean;
}

export default function StudentDistributionChart({
  items,
  isLoading,
}: StudentDistributionChartProps) {
  const shouldReduceMotion = useReducedMotion();
  const maxCount = Math.max(...items.map((item) => item.count), 1);

  if (isLoading) {
    return (
      <div className="space-y-5" aria-label="جاري تحميل توزيع الطلاب">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="grid grid-cols-[minmax(96px,160px)_minmax(90px,1fr)_64px] items-center gap-3"
          >
            <div className="h-4 animate-pulse rounded bg-muted motion-reduce:animate-none" />
            <div className="h-1 animate-pulse rounded bg-muted motion-reduce:animate-none" />
            <div className="h-4 animate-pulse rounded bg-muted motion-reduce:animate-none" />
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-56 items-center justify-center text-center">
        <div>
          <p className="text-sm font-medium text-foreground">
            لا توجد بيانات
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            جرّب تغيير الجامعة أو التخصص.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div role="list" className="space-y-5">
      {items.map((item, index) => {
        const position = Math.max(
          (item.count / maxCount) * 100,
          3,
        );

        return (
          <div
            role="listitem"
            key={item.label}
            aria-label={`${item.label}: ${item.count} طالب، ${item.percentage}%`}
            className="grid grid-cols-[minmax(96px,160px)_minmax(90px,1fr)_64px] items-center gap-3 sm:gap-4"
          >
            <p
              title={item.label}
              className="truncate text-sm font-medium text-foreground"
            >
              {item.label}
            </p>

            <div className="relative h-8" dir="ltr">
              <div
                aria-hidden="true"
                className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-primary/15"
              />

              <motion.div
                initial={
                  shouldReduceMotion ? false : { width: 0 }
                }
                animate={{ width: `${position}%` }}
                transition={{
                  duration: 0.65,
                  delay: index * 0.07,
                  ease: "easeOut",
                }}
                className="absolute left-0 top-1/2 h-0.5 -translate-y-1/2 bg-primary/35"
              >
                <motion.span
                  aria-hidden="true"
                  initial={
                    shouldReduceMotion
                      ? false
                      : { scale: 0, opacity: 0 }
                  }
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    duration: 0.25,
                    delay: 0.45 + index * 0.07,
                  }}
                  whileHover={
                    shouldReduceMotion
                      ? undefined
                      : { scale: 1.25 }
                  }
                  className="absolute -right-2 top-1/2 block h-4 w-4 -translate-y-1/2 rounded-full border-[3px] border-card bg-primary shadow-[0_0_0_3px_hsl(var(--primary)/0.14),0_3px_12px_hsl(var(--primary)/0.35)]"
                />
              </motion.div>
            </div>

            <div
              dir="ltr"
              className="flex items-center justify-end gap-2"
            >
              <span className="text-sm font-bold text-foreground">
                {item.count.toLocaleString("ar-SA")}
              </span>

              <span className="text-xs font-semibold text-primary">
                {item.percentage}%
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}