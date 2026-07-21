import { randomBytes } from "node:crypto";

import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { createServerSupabaseClient as createClient } from "@/lib/db/server";
import { createGoogleClassroomAuthUrl } from "@/features/integrations/google-classroom/server/google-classroom-oauth";

export const runtime = "nodejs";

const OAUTH_STATE_COOKIE = "google_classroom_oauth_state";

// Start the Google Classroom authorization flow.
export async function GET(request: NextRequest) {
  const supabase = await createClient();

  // Verify the current Masari user.
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Generate a random value to protect the OAuth callback.
  const state = randomBytes(32).toString("hex");

  const cookieStore = await cookies();

  // Store state securely until Google redirects back.
  cookieStore.set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/integrations/google-classroom",
    maxAge: 10 * 60,
  });

  // Redirect the student to Google's consent screen.
  const authorizationUrl = createGoogleClassroomAuthUrl(state);

  return NextResponse.redirect(authorizationUrl);
}
