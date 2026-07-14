import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL;

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing public Supabase environment variables",
  );
}

// Reuse one Supabase client across Client Components.
export const supabase = createBrowserClient(
  supabaseUrl,
  supabaseAnonKey,
);