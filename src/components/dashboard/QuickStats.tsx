import { QUICK_STATS } from '@/lib/constants/dashboard';

export default function QuickStats() {
  return (
    <div className="grid grid-cols-3 gap-3">
      {QUICK_STATS.map((stat) => (
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