interface MiniSparklineProps {
  data: number[];
  isPositive?: boolean;
}

export function MiniSparkline({
  data,
  isPositive = true,
}: MiniSparklineProps) {
  // إذا ما في بيانات كافية، لا نرسم شيء
  if (!data || data.length < 2) return null;

  const width = 76;
  const height = 28;
  const padding = 2;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  // نحول القيم إلى نقاط داخل SVG
  const points = data
    .map((value, index) => {
      const x =
        padding + (index / (data.length - 1)) * (width - padding * 2);

      const y =
        height -
        padding -
        ((value - min) / range) * (height - padding * 2);

      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${width} ${height}`}
      className={`h-7 w-[76px] shrink-0 ${
        isPositive ? "text-primary" : "text-destructive"
      }`}
    >
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}