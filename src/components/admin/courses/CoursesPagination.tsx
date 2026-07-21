import { ChevronLeft, ChevronRight } from "lucide-react";

interface CoursesPaginationProps {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onChange: (page: number) => void;
}

export function CoursesPagination({
  page,
  totalPages,
  total,
  pageSize,
  onChange,
}: CoursesPaginationProps) {
  if (total === 0) return null;
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <nav
      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3"
      aria-label="صفحات المواد"
    >
      <p className="text-xs text-muted-foreground">
        عرض {start}–{end} من {total} مادة
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          aria-label="الصفحة السابقة"
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border text-foreground disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight aria-hidden="true" className="h-4 w-4" />
        </button>
        <span className="min-w-20 text-center text-sm text-foreground">
          {page} / {totalPages}
        </span>
        <button
          type="button"
          onClick={() => onChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="الصفحة التالية"
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border text-foreground disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft aria-hidden="true" className="h-4 w-4" />
        </button>
      </div>
    </nav>
  );
}
