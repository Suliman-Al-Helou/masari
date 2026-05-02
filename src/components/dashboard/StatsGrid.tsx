import { STATS } from '@/lib/constants/dashboard';

export default function StatsGrid() {
  return (
    <div className="grid grid-cols-3 gap-3">
      {STATS.map((stat) => (
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