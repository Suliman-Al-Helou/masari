// Path: src/components/admin/activity/PlatformActivityFilters.tsx
// Replace the entire file with this code

"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Check,
  ChevronDown,
  Filter,
  RotateCcw,
} from "lucide-react";

import CustomSelect from "@/components/ui/CustomSelect";
import type {
  PlatformActivityFilters as ActivityFilters,
  PlatformActivityMetric,
  PlatformActivityPeriod,
} from "@/types/admin";

interface PlatformActivityFiltersProps {
  filters: ActivityFilters;
  onChange: (filters: ActivityFilters) => void;
}

// Available activity metrics
const METRIC_OPTIONS = [
  { value: "all", label: "جميع النشاطات" },
  { value: "students", label: "الطلاب الجدد" },
  { value: "courses", label: "المواد" },
  { value: "tasks", label: "المهام" },
  { value: "notes", label: "الملاحظات" },
  { value: "messages", label: "الرسائل" },
];

// Available activity periods
const PERIOD_OPTIONS = [
  { value: "7", label: "آخر 7 أيام" },
  { value: "30", label: "آخر 30 يومًا" },
  { value: "90", label: "آخر 90 يومًا" },
];

export default function PlatformActivityFilters({
  filters,
  onChange,
}: PlatformActivityFiltersProps) {
  const [draftFilters, setDraftFilters] =
    useState<ActivityFilters>(filters);

  const [open, setOpen] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    // Closes the filter when clicking outside
    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    // Closes the filter with the Escape key
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;

      setOpen(false);
      buttonRef.current?.focus();
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  // Opens the filter using the current values
  const handleToggle = () => {
    setDraftFilters(filters);
    setOpen((current) => !current);
  };

  // Applies the selected filters
  const handleApply = () => {
    onChange(draftFilters);
    setOpen(false);
    buttonRef.current?.focus();
  };

  // Restores the default filters
  const handleReset = () => {
    const defaultFilters: ActivityFilters = {
      metric: "all",
      period: 30,
    };

    setDraftFilters(defaultFilters);
    onChange(defaultFilters);
    setOpen(false);
    buttonRef.current?.focus();
  };

  return (
    <div ref={rootRef} className="relative shrink-0">
      {/* Filter trigger */}
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        aria-expanded={open}
        aria-controls="platform-activity-filters"
        className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-background px-3.5 text-sm font-medium text-foreground outline-none transition hover:border-primary/40 hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 motion-reduce:transition-none"
      >
        <Filter
          aria-hidden="true"
          className="h-4 w-4 text-primary"
        />

        <span>تصفية</span>

        <ChevronDown
          aria-hidden="true"
          className={`h-4 w-4 text-muted-foreground transition-transform motion-reduce:transition-none ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div
          id="platform-activity-filters"
          role="dialog"
          aria-label="تصفية نشاط المنصة"
          className="absolute end-0 top-[calc(100%+0.5rem)] z-40 w-[min(20rem,calc(100vw-3rem))] rounded-2xl border border-border bg-card p-4 shadow-xl"
        >
          <div className="space-y-4">
            {/* Metric filter */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-foreground">
                نوع النشاط
              </label>

              <CustomSelect
                value={draftFilters.metric}
                onChange={(value) =>
                  setDraftFilters((current) => ({
                    ...current,
                    metric: value as PlatformActivityMetric,
                  }))
                }
                options={METRIC_OPTIONS}
                placeholder="اختر نوع النشاط"
                ariaLabel="نوع النشاط"
                showPlaceholderOption={false}
              />
            </div>

            {/* Period filter */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-foreground">
                الفترة الزمنية
              </label>

              <CustomSelect
                value={String(draftFilters.period)}
                onChange={(value) =>
                  setDraftFilters((current) => ({
                    ...current,
                    period: Number(value) as PlatformActivityPeriod,
                  }))
                }
                options={PERIOD_OPTIONS}
                placeholder="اختر الفترة الزمنية"
                ariaLabel="الفترة الزمنية"
                showPlaceholderOption={false}
              />
            </div>
          </div>

          {/* Filter actions */}
          <div className="mt-5 flex gap-2 border-t border-border pt-4">
            <button
              type="button"
              onClick={handleApply}
              className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-3 text-sm font-medium text-primary-foreground outline-none transition hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 motion-reduce:transition-none"
            >
              <Check aria-hidden="true" className="h-4 w-4" />
              تطبيق
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-border px-3 text-sm font-medium text-muted-foreground outline-none transition hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary motion-reduce:transition-none"
            >
              <RotateCcw
                aria-hidden="true"
                className="h-4 w-4"
              />
              إعادة ضبط
            </button>
          </div>
        </div>
      )}
    </div>
  );
}