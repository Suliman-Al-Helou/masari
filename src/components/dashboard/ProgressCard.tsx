'use client';

type Props = {
  percent:         number;
  completedCredits: number;
  totalCredits:    number;
};

export default function ProgressCard({ percent, completedCredits, totalCredits }: Props) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-medium text-foreground">تقدمك في المسار</h2>
        <span className="text-xl font-semibold text-primary">{percent}%</span>
      </div>

      <div className="h-3 bg-border rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-700"
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="flex justify-between mt-3 text-xs text-muted-foreground">
        <span>بداية الفصل</span>
        <span>{completedCredits} من {totalCredits} ساعة مكتملة</span>
        <span>نهاية الفصل</span>
      </div>
    </div>
  );
}