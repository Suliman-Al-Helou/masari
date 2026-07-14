// Path: src/schemas/admin-dashboard.schema.ts
// Create this as a new file

import { z } from "zod";

export type PlatformActivityMetric = z.infer<
  typeof platformActivityMetricSchema
>;

export type PlatformActivityPeriod = z.infer<
  typeof platformActivityPeriodSchema
>;

export type PlatformActivityFilters = z.infer<
  typeof platformActivityFiltersSchema
>;
// Validates the selected activity metric
export const platformActivityMetricSchema = z.enum([
  "all",
  "students",
  "courses",
  "tasks",
  "notes",
  "messages",
]);

// Validates the selected activity period
// Converts the URL value and restricts it to supported periods
export const platformActivityPeriodSchema = z.coerce
  .number()
  .pipe(z.union([z.literal(7), z.literal(30), z.literal(90)]));
// Validates all platform activity filters
export const platformActivityFiltersSchema = z.object({
  metric: platformActivityMetricSchema,
  period: platformActivityPeriodSchema,
});
