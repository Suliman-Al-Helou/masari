import "server-only";

import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url("NEXT_PUBLIC_SUPABASE_URL غير صالح"),

  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY مطلوب"),

  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(1, "SUPABASE_SERVICE_ROLE_KEY مطلوب"),

  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  NEXT_PUBLIC_USE_MOCK_DATA: z.enum(["true", "false"]).default("false"),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  const errors = parsedEnv.error.issues
    .map((issue) => {
      const variable = issue.path.join(".");
      return `- ${variable}: ${issue.message}`;
    })
    .join("\n");

  throw new Error(`متغيرات البيئة غير صحيحة:\n${errors}`);
}

export const env = parsedEnv.data;

export type Env = z.infer<typeof envSchema>;
