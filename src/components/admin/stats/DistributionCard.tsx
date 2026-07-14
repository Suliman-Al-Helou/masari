interface DistributionItem {
  label: string;
  count: number;
}

interface DistributionCardProps {
  title:     string;
  subtitle?: string;
  items:     DistributionItem[];
  isLoading: boolean;
}

export default function DistributionCard({
  title, subtitle, items, isLoading,
}: DistributionCardProps) {
  const max = Math.max(...items.map((i) => i.count), 1);

  return (
    <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border">
        <h3 className="font-bold text-sm text-foreground">{title}</h3>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>

      {/* Items */}
      <div className="p-5 space-y-3">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse space-y-1.5">
              <div className="h-3 bg-muted rounded w-1/2" />
              <div className="h-2 bg-muted rounded w-3/4" />
            </div>
          ))
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">لا توجد بيانات</p>
        ) : (
          items.map((item) => {
            const pct = Math.round((item.count / max) * 100);
            return (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-foreground truncate">{item.label}</span>
                  <span className="text-xs font-bold text-muted-foreground mr-2 shrink-0">
                    {item.count}
                  </span>
                </div>
                {/* Progress bar */}
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
