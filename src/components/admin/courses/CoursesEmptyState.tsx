import { BookOpen, Plus, SearchX } from "lucide-react";

interface CoursesEmptyStateProps {
  hasFilters: boolean;
  canAdd: boolean;
  onAdd: () => void;
  onClear: () => void;
}

export function CoursesEmptyState({
  hasFilters,
  canAdd,
  onAdd,
  onClear,
}: CoursesEmptyStateProps) {
  const Icon = hasFilters ? SearchX : BookOpen;

  return (
    <div className="rounded-2xl border border-dashed border-border bg-card px-5 py-14 text-center">
      <Icon aria-hidden="true" className="mx-auto h-10 w-10 text-muted-foreground/50" />
      <h2 className="mt-4 font-semibold text-foreground">
        {hasFilters ? "لا توجد نتائج مطابقة" : "لا توجد مواد دراسية بعد"}
      </h2>
      <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
        {hasFilters
          ? "جرّب تعديل البحث أو إزالة بعض الفلاتر."
          : "ابدأ بإضافة أول مادة إلى دليل الجامعة."}
      </p>
      <button
        type="button"
        onClick={hasFilters ? onClear : onAdd}
        disabled={!hasFilters && !canAdd}
        className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-50"
      >
        {hasFilters ? null : <Plus aria-hidden="true" className="h-4 w-4" />}
        {hasFilters ? "مسح الفلاتر" : "إضافة مادة"}
      </button>
    </div>
  );
}
