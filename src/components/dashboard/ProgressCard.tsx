import { TrendingUp } from 'lucide-react';

interface ProgressCardProps {
  percent: number;
  completedCredits: number;
  totalCredits: number;
}

export default function ProgressCard({ percent, completedCredits, totalCredits }: ProgressCardProps) {
  return (
    <div className="rounded-2xl bg-card border border-border/50 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-warning" />
          </div>
          <h3 className="font-bold text-foreground">تقدمك في المسار</h3>
        </div>
        <span className="text-sm font-bold text-primary">{percent}%</span>
      </div>

      <div className="h-3 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-700"
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="flex items-center justify-between mt-3">
        <span className="text-xs text-muted-foreground">
          {completedCredits} من {totalCredits} ساعة مكتملة
        </span>
        <span className="text-xs text-muted-foreground">{percent}% مكتمل</span>
      </div>
    </div>
  );
}
