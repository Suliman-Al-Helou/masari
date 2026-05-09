import { GraduationCap, BookOpen, Sparkles } from 'lucide-react';

interface StatsGridProps {
  completedCredits: number;
  completedCourses: number;
}

export default function StatsGrid({ completedCredits, completedCourses }: StatsGridProps) {
  const stats = [
    {
      label: 'ساعة مكتملة',
      value: completedCredits > 0 ? `+${completedCredits}` : '0',
      icon: GraduationCap,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    },
    {
      label: 'مادة ناجحة',
      value: String(completedCourses),
      icon: BookOpen,
      color: 'bg-blue-50 text-blue-600 border-blue-200',
    },
    {
      label: 'مساري معك',
      value: '🎓',
      icon: Sparkles,
      color: 'bg-purple-50 text-purple-600 border-purple-200',
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`rounded-2xl border p-4 text-center ${stat.color}`}
        >
          <stat.icon className="w-5 h-5 mx-auto mb-2 opacity-70" />
          <p className="text-2xl font-bold">{stat.value}</p>
          <p className="text-xs mt-1 opacity-70">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
