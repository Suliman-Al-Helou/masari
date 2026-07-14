import type {
  PlatformActivityFilters,
  PlatformActivityMetric,
  PlatformActivityTrendData,
} from "@/types/admin";

const METRIC_BASE: Record<PlatformActivityMetric, number> = {
  all: 120,
  students: 12,
  courses: 18,
  tasks: 75,
  notes: 45,
  messages: 60,
};

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function createActivityCount(
  metric: PlatformActivityMetric,
  index: number,
  isPreviousPeriod: boolean,
): number {
  const base = METRIC_BASE[metric];

  const weeklyChange = [
    4, 12, 20, 8, 26, 16, 6,
  ][index % 7];

  const growth = isPreviousPeriod
    ? 0
    : Math.floor(index / 5) + 8;

  const spike =
    index % 11 === 0
      ? Math.round(base * 0.65)
      : 0;

  const previousReduction = isPreviousPeriod
    ? Math.round(base * 0.18)
    : 0;

  return Math.max(
    0,
    base +
      weeklyChange +
      growth +
      spike -
      previousReduction,
  );
}

export function getPlatformActivityMock(
  filters: PlatformActivityFilters,
): PlatformActivityTrendData {
  const today = new Date();

  const points = Array.from(
    { length: filters.period },
    (_, index) => {
      const currentDate = new Date(today);
      currentDate.setDate(
        today.getDate() -
          filters.period +
          index +
          1,
      );

      const previousDate = new Date(currentDate);
      previousDate.setDate(
        currentDate.getDate() - filters.period,
      );

      return {
        currentDate: formatDate(currentDate),
        previousDate: formatDate(previousDate),

        currentCount: createActivityCount(
          filters.metric,
          index,
          false,
        ),

        previousCount: createActivityCount(
          filters.metric,
          index,
          true,
        ),
      };
    },
  );

  const currentTotal = points.reduce(
    (total, point) => total + point.currentCount,
    0,
  );

  const previousTotal = points.reduce(
    (total, point) => total + point.previousCount,
    0,
  );

  const changePercent =
    previousTotal === 0
      ? null
      : Number(
          (
            ((currentTotal - previousTotal) /
              previousTotal) *
            100
          ).toFixed(1),
        );

  return {
    metric: filters.metric,
    period: filters.period,
    currentTotal,
    previousTotal,
    changePercent,
    points,
  };
}