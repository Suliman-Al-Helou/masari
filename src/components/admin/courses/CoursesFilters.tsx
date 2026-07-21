"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";

import CustomSelect from "@/components/ui/CustomSelect";
import { getMajorsForUniversity, MAJORS, UNIVERSITIES } from "@/lib/constants/academic";
import type { AdminCourseSort } from "@/types/admin";

interface CoursesFiltersProps {
  appliedSearch: string;
  university: string;
  major: string;
  sort: AdminCourseSort;
  status: "active" | "deleted";
  isSuperAdmin: boolean;
  onApplySearch: (value: string) => void;
  onUniversityChange: (value: string) => void;
  onMajorChange: (value: string) => void;
  onSortChange: (value: AdminCourseSort) => void;
  onStatusChange: (value: "active" | "deleted") => void;
  onClear: () => void;
}

const SORT_OPTIONS = [
  { value: "created_desc", label: "الأحدث إضافة" },
  { value: "name_asc", label: "الاسم" },
  { value: "code_asc", label: "رمز المادة" },
  { value: "rating_desc", label: "الأعلى تقييمًا" },
  { value: "rating_asc", label: "الأقل تقييمًا" },
  { value: "reviews_desc", label: "الأكثر تقييمًا" },
] as const;

export function CoursesFilters({
  appliedSearch,
  university,
  major,
  sort,
  status,
  isSuperAdmin,
  onApplySearch,
  onUniversityChange,
  onMajorChange,
  onSortChange,
  onStatusChange,
  onClear,
}: CoursesFiltersProps) {
  const [searchDraft, setSearchDraft] = useState(appliedSearch);
  const majors = university ? getMajorsForUniversity(university) : MAJORS;
  const activeFilters = [
    university && { key: "university", label: university },
    major && { key: "major", label: major },
    appliedSearch && { key: "search", label: `“${appliedSearch}”` },
  ].filter(Boolean) as { key: string; label: string }[];

  const clearOne = (key: string) => {
    if (key === "university") onUniversityChange("");
    if (key === "major") onMajorChange("");
    if (key === "search") {
      setSearchDraft("");
      onApplySearch("");
    }
  };

  return (
    <section className="space-y-3" aria-label="بحث وفلاتر المواد">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <form
          className="relative sm:col-span-2"
          onSubmit={(event) => {
            event.preventDefault();
            onApplySearch(searchDraft.trim());
          }}
          role="search"
        >
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          />
          <input
            value={searchDraft}
            onChange={(event) => setSearchDraft(event.target.value)}
            placeholder="ابحث باسم المادة أو رمزها أو الجامعة أو التخصص"
            className="h-11 w-full rounded-xl border border-border bg-card pr-10 pl-24 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          {searchDraft.trim() && (
            <button
              type="submit"
              className="absolute left-1.5 top-1.5 min-h-8 rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground"
            >
              بحث
            </button>
          )}
        </form>

        <CustomSelect
          value={university}
          onChange={(value) => {
            onUniversityChange(value);
            onMajorChange("");
          }}
          options={UNIVERSITIES}
          placeholder="كل الجامعات"
          ariaLabel="تصفية حسب الجامعة"
        />

        <CustomSelect
          value={major}
          onChange={onMajorChange}
          options={majors}
          placeholder="كل التخصصات"
          ariaLabel="تصفية حسب التخصص"
        />

        <CustomSelect
          value={sort}
          onChange={(value) => onSortChange(value as AdminCourseSort)}
          options={SORT_OPTIONS}
          placeholder="ترتيب المواد"
          ariaLabel="ترتيب المواد"
          showPlaceholderOption={false}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {activeFilters.map((filter) => (
            <button
              key={filter.key}
              type="button"
              onClick={() => clearOne(filter.key)}
              className="inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/10 px-2.5 text-xs text-primary"
            >
              {filter.label}
              <X aria-hidden="true" className="h-3.5 w-3.5" />
            </button>
          ))}
          {activeFilters.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setSearchDraft("");
                onClear();
              }}
              className="min-h-8 text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              مسح الكل
            </button>
          )}
        </div>

        {isSuperAdmin && (
          <div className="inline-flex rounded-xl border border-border bg-card p-1">
            <button
              type="button"
              aria-pressed={status === "active"}
              onClick={() => onStatusChange("active")}
              className={`min-h-9 rounded-lg px-3 text-xs font-medium ${
                status === "active"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground"
              }`}
            >
              المواد النشطة
            </button>
            <button
              type="button"
              aria-pressed={status === "deleted"}
              onClick={() => onStatusChange("deleted")}
              className={`min-h-9 rounded-lg px-3 text-xs font-medium ${
                status === "deleted"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground"
              }`}
            >
              المواد المحذوفة
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
