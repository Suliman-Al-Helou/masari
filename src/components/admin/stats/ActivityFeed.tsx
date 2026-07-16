import { BookOpen, MessageSquare, User, type LucideIcon } from "lucide-react";
import type { AdminActivity } from "@/types/admin";

interface ActivityTypeConfig {
  icon: LucideIcon;
  bg: string;
  color: string;
}

const DEFAULT_CONFIG: ActivityTypeConfig = {
  icon: User,
  bg: "bg-secondary",
  color: "text-muted-foreground",
};

const TYPE_CONFIG: Partial<Record<AdminActivity["type"], ActivityTypeConfig>> =
  {
    student_joined: {
      icon: User,
      bg: "bg-success/10",
      color: "text-success",
    },
    course_created: {
      icon: BookOpen,
      bg: "bg-primary/10",
      color: "text-primary",
    },
    doctor_created: {
      icon: User,
      bg: "bg-info/10",
      color: "text-info",
    },
    course_review_created: {
      icon: MessageSquare,
      bg: "bg-warning/10",
      color: "text-warning",
    },
    doctor_review_created: {
      icon: MessageSquare,
      bg: "bg-warning/10",
      color: "text-warning",
    },
    user_deleted: {
      icon: User,
      bg: "bg-destructive/10",
      color: "text-destructive",
    },
  };
// ── تنسيق الوقت ──
function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "الآن";
  if (mins < 60) return `منذ ${mins} د`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `منذ ${hrs} س`;
  return `منذ ${Math.floor(hrs / 24)} يوم`;
}

interface ActivityFeedProps {
  activities: AdminActivity[];
  isLoading: boolean;
}

export default function ActivityFeed({
  activities,
  isLoading,
}: ActivityFeedProps) {
  return (
    <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border">
        <h3 className="font-bold text-sm text-foreground">آخر النشاطات</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          أحدث 20 نشاط في المنصة
        </p>
      </div>

      {/* List */}
      <div className="divide-y divide-border max-h-96 overflow-y-auto">
        {isLoading ? (
          // Skeleton
          Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-5 py-3 animate-pulse"
            >
              <div className="w-8 h-8 rounded-xl bg-muted shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-muted rounded w-3/4" />
                <div className="h-2.5 bg-muted rounded w-1/3" />
              </div>
            </div>
          ))
        ) : activities.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-10">
            لا توجد نشاطات بعد
          </p>
        ) : (
          activities.map((activity) => {
            const config = TYPE_CONFIG[activity.type] ?? DEFAULT_CONFIG;
            const Icon = config.icon;
            return (
              <div
                key={activity.id}
                className="flex items-start gap-3 px-5 py-3 hover:bg-muted/40 transition-colors"
              >
                {/* Icon */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${config.bg}`}
                >
                  <Icon className={`w-4 h-4 ${config.color}`} />
                </div>
                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-foreground leading-relaxed">
                    {activity.description}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {activity.actorName}
                  </p>
                </div>
                {/* Time */}
                <span className="text-[10px] text-muted-foreground shrink-0 mt-1">
                  {timeAgo(activity.createdAt)}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
