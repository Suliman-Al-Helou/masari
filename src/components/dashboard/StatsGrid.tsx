'use client';

type Props = {
  completedCredits: number;
  remainingCredits: number;
  totalCredits:     number;
  completedCourses: number;
  remainingCourses: number;
  cumulativeGPA:    number | null;  // ← null لما ما في مواد مكتملة
  semesterGPA:      number | null;
};

export default function StatsGrid({
  completedCredits,
  remainingCredits,
  totalCredits,
  completedCourses,
  remainingCourses,
  cumulativeGPA,
  semesterGPA,
}: Props) {
  const creditsPercent = totalCredits
    ? Math.round((completedCredits / totalCredits) * 100)
    : 0;

  const totalCourses = completedCourses + remainingCourses;
  const coursesPercent = totalCourses
    ? Math.round((completedCourses / totalCourses) * 100)
    : 0;

  const gpaPercent = Math.round((cumulativeGPA / 4) * 100);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

      {/* الساعات */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
        <p className="text-sm text-muted-foreground">الساعات المعتمدة</p>
        <div className="flex items-end gap-1">
          <span className="text-2xl font-semibold text-foreground">
            {completedCredits}
          </span>
          <span className="text-muted-foreground text-sm mb-1">
            / {totalCredits}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-muted-foreground/30" />
          {remainingCredits} ساعة متبقية
        </div>
        <div className="h-1.5 bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${creditsPercent}%` }}
          />
        </div>
      </div>

      {/* المواد */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
        <p className="text-sm text-muted-foreground">المواد</p>
        <div className="flex items-end gap-1">
          <span className="text-2xl font-semibold text-foreground">
            {completedCourses}
          </span>
          <span className="text-muted-foreground text-sm mb-1">مادة مكتملة</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-muted-foreground/30" />
          {remainingCourses} مادة متبقية
        </div>
        <div className="h-1.5 bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-success rounded-full transition-all duration-500"
            style={{ width: `${coursesPercent}%` }}
          />
        </div>
      </div>

      {/* المعدل */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
        <p className="text-sm text-muted-foreground">المعدل التراكمي</p>
        <div className="flex items-end gap-1">
          <span className="text-2xl font-semibold text-foreground">
     {(cumulativeGPA ?? 0).toFixed(2)}
          </span>
          <span className="text-muted-foreground text-sm mb-1">/ 4.00</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-info/50" />
          معدل الفصل: {(semesterGPA ?? 0).toFixed(2)}
        </div>
        <div className="h-1.5 bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-info rounded-full transition-all duration-500"
            style={{ width: `${gpaPercent}%` }}
          />
        </div>
      </div>

    </div>
  );
}