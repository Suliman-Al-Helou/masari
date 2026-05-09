import { BookOpen, Target, Calendar } from 'lucide-react';

interface QuickStatsProps {
  activeCourses: number;
  pendingTasks: number;
  daysToExam: number | null;
}

export default function QuickStats({ activeCourses, pendingTasks, daysToExam }: QuickStatsProps) {
  const stats = [
    {
      label: 'مادة مسجلة',
      value: String(activeCourses),
      icon: BookOpen,
      color: 'bg-primary/10 text-primary',
    },
    {
      label: 'واجبات قيد الانتظار',
      value: String(pendingTasks),
      icon: Target,
      color: 'bg-warning/10 text-warning',
    },
    {
      label: 'يوم حتى الامتحان',
      value: daysToExam !== null ? String(daysToExam) : '—',
      icon: Calendar,
      color: 'bg-info/10 text-info',
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-2xl bg-card border border-border/50 p-4 text-center"
        >
          <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mx-auto mb-2`}>
            <stat.icon className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold text-foreground">{stat.value}</p>
          <p className="text-[11px] text-muted-foreground mt-1">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
