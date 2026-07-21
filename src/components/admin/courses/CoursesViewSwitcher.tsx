import { LayoutPanelLeft, Table2 } from "lucide-react";

export type CoursesViewMode = "table" | "details";

interface CoursesViewSwitcherProps {
  value: CoursesViewMode;
  onChange: (value: CoursesViewMode) => void;
}

export function CoursesViewSwitcher({ value, onChange }: CoursesViewSwitcherProps) {
  return (
    <div
      className="inline-flex rounded-xl border border-border bg-card p-1"
      aria-label="طريقة عرض المواد"
      role="group"
    >
      <button
        type="button"
        aria-pressed={value === "table"}
        onClick={() => onChange("table")}
        className={`inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-xs font-medium transition ${
          value === "table"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <Table2 aria-hidden="true" className="h-4 w-4" />
        جدول
      </button>
      <button
        type="button"
        aria-pressed={value === "details"}
        onClick={() => onChange("details")}
        className={`inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-xs font-medium transition ${
          value === "details"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <LayoutPanelLeft aria-hidden="true" className="h-4 w-4" />
        تفاصيل
      </button>
    </div>
  );
}
