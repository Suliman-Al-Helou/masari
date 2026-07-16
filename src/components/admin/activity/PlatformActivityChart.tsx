// Path: src/components/admin/activity/PlatformActivityChart.tsx

"use client";

import { useId, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

import type { PlatformActivityPoint } from "@/types/admin";

interface PlatformActivityChartProps {
  points: PlatformActivityPoint[];
  isLoading: boolean;
}

type ChartPoint = {
  x: number;
  currentY: number;
  previousY: number;
};

// Formats chart dates in Arabic
function formatDate(value: string) {
  return new Intl.DateTimeFormat("ar", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export default function PlatformActivityChart({
  points,
  isLoading,
}: PlatformActivityChartProps) {
  const shouldReduceMotion = useReducedMotion();
  const gradientId = useId().replace(/:/g, "");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Displays a loading placeholder
  if (isLoading) {
    return (
      <div
        aria-label="جارٍ تحميل مخطط النشاط"
        className="h-72 animate-pulse rounded-2xl bg-muted/60"
      />
    );
  }

  // Displays an empty state when no chart points exist
  if (points.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center text-sm text-muted-foreground">
        لا توجد بيانات نشاط لهذه الفترة.
      </div>
    );
  }

  const width = 760;
  const height = 280;
  const paddingX =36;
  const paddingTop = 20;
  const paddingBottom = 38;
  const chartHeight = height - paddingTop - paddingBottom;

  const maxValue = Math.max(
    1,
    ...points.flatMap((point) => [
      point.currentCount,
      point.previousCount,
    ]),
  );

  // Converts activity values to SVG coordinates
  const chartPoints: ChartPoint[] = points.map((point, index) => {
    const x =
      paddingX +
      (index / Math.max(points.length - 1, 1)) *
        (width - paddingX * 2);

    return {
      x,
      currentY:
        paddingTop +
        chartHeight -
        (point.currentCount / maxValue) * chartHeight,
      previousY:
        paddingTop +
        chartHeight -
        (point.previousCount / maxValue) * chartHeight,
    };
  });

  const currentPolyline = chartPoints
    .map((point) => `${point.x},${point.currentY}`)
    .join(" ");

  const previousPolyline = chartPoints
    .map((point) => `${point.x},${point.previousY}`)
    .join(" ");

  const areaPath = [
    `M ${chartPoints[0].x} ${paddingTop + chartHeight}`,
    ...chartPoints.map(
      (point) => `L ${point.x} ${point.currentY}`,
    ),
    `L ${chartPoints.at(-1)?.x ?? paddingX} ${paddingTop + chartHeight}`,
    "Z",
  ].join(" ");

  const labelIndexes = Array.from(
    new Set([
      0,
      Math.floor((points.length - 1) * 0.25),
      Math.floor((points.length - 1) * 0.5),
      Math.floor((points.length - 1) * 0.75),
      points.length - 1,
    ]),
  );

  const activePoint =
    activeIndex === null ? null : chartPoints[activeIndex];

  const activeData =
    activeIndex === null ? null : points[activeIndex];

  return (
    <div className="relative w-full overflow-hidden">
      <svg
        role="img"
        aria-label="مقارنة نشاط المنصة بين الفترة الحالية والفترة السابقة"
        viewBox={`0 0 ${width} ${height}`}
        className="h-40 w-full"
        onPointerLeave={() => setActiveIndex(null)}
      >
        <defs>
          {/* Current period area gradient */}
          <linearGradient
            id={gradientId}
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.25" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Horizontal chart grid */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = paddingTop + chartHeight * ratio;

          return (
            <g key={ratio}>
              <line
                x1={paddingX}
                y1={y}
                x2={width - paddingX}
                y2={y}
                className="stroke-border"
                strokeWidth="1"
              />

              <text
                x={paddingX - 37}
                y={y + 4}
                textAnchor="end"
                className="fill-muted-foreground text-[25px] "
              >
                {Math.round(maxValue * (1 - ratio))}
              </text>
            </g>
          );
        })}

        {/* Current period area */}
        <motion.path
          d={areaPath}
          fill={`url(#${gradientId})`}
          className="text-primary"
          initial={shouldReduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />

        {/* Previous period line */}
        <motion.polyline
          points={previousPolyline}
          fill="none"
          className="stroke-muted-foreground"
          strokeWidth="2"
          strokeDasharray="6 6"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={shouldReduceMotion ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />

        {/* Current period line */}
        <motion.polyline
          points={currentPolyline}
          fill="none"
          className="stroke-primary"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={shouldReduceMotion ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />

        {/* Date labels */}
        {labelIndexes.map((index) => (
          <text
            key={index}
            x={chartPoints[index].x}
            y={height - 7}
            textAnchor="middle"
            className="fill-muted-foreground text-[25px]"
          >
            {formatDate(points[index].currentDate)}
          </text>
        ))}

        {/* Interactive chart areas */}
        {chartPoints.map((point, index) => {
          const nextX =
            chartPoints[index + 1]?.x ??
            point.x + (point.x - (chartPoints[index - 1]?.x ?? paddingX));

          const previousX =
            chartPoints[index - 1]?.x ??
            point.x - (nextX - point.x);

          return (
            <rect
              key={points[index].currentDate}
              x={(previousX + point.x) / 2}
              y={paddingTop}
              width={(nextX - previousX) / 2}
              height={chartHeight}
              fill="transparent"
              onPointerEnter={() => setActiveIndex(index)}
            />
          );
        })}

        {/* Active point indicator */}
        {activePoint && activeData && (
          <g aria-hidden="true">
            <line
              x1={activePoint.x}
              y1={paddingTop}
              x2={activePoint.x}
              y2={paddingTop + chartHeight}
              className="stroke-primary/40"
              strokeDasharray="4 4"
            />

            <circle
              cx={activePoint.x}
              cy={activePoint.currentY}
              r="5"
              className="fill-primary stroke-background"
              strokeWidth="3"
            />

            <circle
              cx={activePoint.x}
              cy={activePoint.previousY}
              r="4"
              className="fill-muted-foreground stroke-background"
              strokeWidth="2"
            />
          </g>
        )}
      </svg>

      {/* Active point tooltip */}
      {activePoint && activeData && (
        <div
          className="pointer-events-none absolute top-3 z-10 min-w-36 rounded-xl border border-border bg-popover p-3 text-xs shadow-lg"
          style={{
            left: `${(activePoint.x / width) * 100}%`,
            transform:
              activePoint.x > width / 2
                ? "translateX(-100%)"
                : "translateX(0)",
          }}
        >
          <p className="font-semibold text-foreground">
            {formatDate(activeData.currentDate)}
          </p>

          <p className="mt-2 text-primary">
            الفترة الحالية: {activeData.currentCount}
          </p>

          <p className="mt-1 text-muted-foreground">
            الفترة السابقة: {activeData.previousCount}
          </p>
        </div>
      )}
      <ul className="sr-only">
  {points.map((point) => (
    <li key={point.currentDate}>
      تاريخ {formatDate(point.currentDate)}،
      الفترة الحالية {point.currentCount}،
      الفترة السابقة {point.previousCount}
    </li>
  ))}
</ul>
    </div>

    
  );
}