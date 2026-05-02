import Link from 'next/link';
import { FEATURES } from '@/lib/constants/navigation';

export default function QuickFeatures() {
  return (
    <div>
      <h3 className="text-lg font-bold text-foreground mb-4">الميزات الرئيسية</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {FEATURES.map((feature) => (
          <Link
            key={feature.label}
            href={feature.path}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group"
          >
            <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
              <feature.icon className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium text-foreground text-center">{feature.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}