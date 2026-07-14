'use client';

type Props = {
  activeCourses: number;
  pendingTasks:  number;
  daysToExam:    number | null;
};

export default function QuickStats({ activeCourses, pendingTasks, daysToExam }: Props) {
  return (
    <div className="grid grid-cols-3 gap-3">

      {/* المواد المسجلة */}
      <div className="bg-card border border-border rounded-2xl p-4 text-center">
        <p className="text-2xl font-semibold text-foreground">{activeCourses}</p>
        <p className="text-xs text-muted-foreground mt-1">مادة مسجلة</p>
      </div>

      {/* الواجبات */}
      <div className="bg-card border border-border rounded-2xl p-4 text-center">
        <p
          className={`text-2xl font-semibold ${
            pendingTasks > 0 ? 'text-warning' : 'text-success'
          }`}
        >
          {pendingTasks}
        </p>
        <p className="text-xs text-muted-foreground mt-1">واجبات قيد الانتظار</p>
      </div>

      {/* الامتحان */}
      <div className="bg-card border border-border rounded-2xl p-4 text-center">
        {daysToExam !== null ? (
          <>
            <p className="text-2xl font-semibold text-foreground" dir="ltr">
              {daysToExam}
            </p>
            <p className="text-xs text-muted-foreground mt-1">يوم حتى الامتحان</p>
          </>
        ) : (
          <>
            <p className="text-2xl font-semibold text-muted-foreground">—</p>
            <p className="text-xs text-muted-foreground mt-1">لا امتحانات قريبة</p>
          </>
        )}
      </div>

    </div>
  );
}