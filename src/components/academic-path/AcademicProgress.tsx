import { STATUS_CONFIG } from '@/lib/constants/dashboard';

type Course = { status: string };

export default function AcademicProgress({ courses }: { courses: Course[] }) {
  const completed = courses.filter(c => c.status === 'مكتملة').length;
  const progress = Math.round((completed / (courses.length || 1)) * 100);

  return (
    <div className="rounded-2xl bg-card border border-border/50 p-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-foreground">نسبة الإكمال</h3>
        <span className="text-sm font-bold text-primary">{progress}%</span>
      </div>
      <div className="h-3 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex justify-around mt-4">
        {Object.keys(STATUS_CONFIG).map(status => (
          <div key={status} className="text-center">
            <p className="text-xl font-bold text-foreground">
              {courses.filter(c => c.status === status).length}
            </p>
            <p className="text-[11px] text-muted-foreground">{status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}