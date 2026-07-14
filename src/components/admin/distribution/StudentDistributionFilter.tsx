"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Filter, RotateCcw } from "lucide-react";

import {
  getMajorsForUniversity,
  MAJORS,
  UNIVERSITIES,
} from "@/lib/constants/academic";
import type { StudentDistributionFilters } from "@/types/admin";

interface StudentDistributionFilterProps {
  filters: StudentDistributionFilters;
  onApply: (filters: StudentDistributionFilters) => void;
}

export default function StudentDistributionFilter({
  filters,
  onApply,
}: StudentDistributionFilterProps) {
  const [draftFilters, setDraftFilters] =
    useState<StudentDistributionFilters>(filters);

  const [open, setOpen] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const universitySelectRef = useRef<HTMLSelectElement>(null);

  const universityId = useId();
  const majorId = useId();

  const activeFilterCount =
    Number(Boolean(filters.university)) + Number(Boolean(filters.major));

  const filterLabel =
    activeFilterCount === 0
      ? "تصفية"
      : activeFilterCount === 1
        ? "فلتر واحد"
        : "فلتران";

  const availableMajors = useMemo(() => {
    if (!draftFilters.university) return MAJORS;

    return getMajorsForUniversity(draftFilters.university);
  }, [draftFilters.university]);

  useEffect(() => {
    if (!open) return;

    universitySelectRef.current?.focus();

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

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

  const closeAndRestoreFocus = () => {
    setOpen(false);

    requestAnimationFrame(() => {
      buttonRef.current?.focus();
    });
  };

  const handleToggle = () => {
    setDraftFilters(filters);
    setOpen((current) => !current);
  };

  const handleUniversityChange = (university: string) => {
    const universityMajors = university
      ? getMajorsForUniversity(university)
      : MAJORS;

    setDraftFilters((current) => ({
      university: university || undefined,

      major:
        current.major && universityMajors.includes(current.major)
          ? current.major
          : undefined,
    }));
  };

  const handleApply = () => {
    onApply({
      university: draftFilters.university || undefined,

      major: draftFilters.major || undefined,
    });

    closeAndRestoreFocus();
  };

  const handleReset = () => {
    setDraftFilters({});
    onApply({});
    closeAndRestoreFocus();
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        aria-expanded={open}
        aria-controls="student-distribution-filter"
        className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-background px-3.5 text-sm font-medium text-foreground outline-none transition hover:border-primary/40 hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 motion-reduce:transition-none"
      >
        <Filter aria-hidden="true" className="h-4 w-4 text-primary" />

        <span>{filterLabel}</span>

        <ChevronDown
          aria-hidden="true"
          className={`h-4 w-4 text-muted-foreground transition-transform motion-reduce:transition-none ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div
          id="student-distribution-filter"
          role="dialog"
          aria-label="تصفية توزيع الطلاب"
          className="absolute left-0 top-[calc(100%+0.5rem)] z-30 w-[min(22rem,calc(100vw-3rem))] rounded-2xl border border-border bg-card p-4 shadow-xl"
        >
          <div className="space-y-4">
            <div>
              <label
                htmlFor={universityId}
                className="mb-1.5 block text-xs font-semibold text-foreground"
              >
                الجامعة
              </label>

              <select
                ref={universitySelectRef}
                id={universityId}
                value={draftFilters.university ?? ""}
                onChange={(event) => handleUniversityChange(event.target.value)}
                className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="">كل الجامعات</option>

                {UNIVERSITIES.map((university) => (
                  <option key={university} value={university}>
                    {university}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor={majorId}
                className="mb-1.5 block text-xs font-semibold text-foreground"
              >
                التخصص
              </label>

              <select
                id={majorId}
                value={draftFilters.major ?? ""}
                onChange={(event) =>
                  setDraftFilters((current) => ({
                    ...current,
                    major: event.target.value || undefined,
                  }))
                }
                className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="">كل التخصصات</option>

                {availableMajors.map((major) => (
                  <option key={major} value={major}>
                    {major}
                  </option>
                ))}
              </select>
            </div>
          </div>

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
              <RotateCcw aria-hidden="true" className="h-4 w-4" />
              إعادة ضبط
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
