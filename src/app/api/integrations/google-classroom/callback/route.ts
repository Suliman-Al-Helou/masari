import { NextRequest, NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/session";
import { dbAdmin } from "@/lib/db/server-only";
import { createGoogleOAuthClient } from "@/features/integrations/google-classroom/server/google-classroom-oauth";
import { encryptGoogleToken } from "@/lib/integrations/google-classroom/token-crypto";

export const runtime = "nodejs";

const OAUTH_STATE_COOKIE = "google_classroom_oauth_state";

function redirectToProfile(
  request: NextRequest,
  status: "connected" | "error",
  reason?: string,
) {
  const url = new URL("/profile", request.url);

  url.searchParams.set("classroom", status);

  if (reason) {
    url.searchParams.set("reason", reason);
  }

  const response = NextResponse.redirect(url);

  response.cookies.delete(OAUTH_STATE_COOKIE);

  return response;
}

export async function GET(request: NextRequest) {
  const googleError =
    request.nextUrl.searchParams.get("error");

  if (googleError) {
    return redirectToProfile(
      request,
      "error",
      googleError,
    );
  }

  const code = request.nextUrl.searchParams.get("code");
  const returnedState =
    request.nextUrl.searchParams.get("state");
  const savedState =
    request.cookies.get(OAUTH_STATE_COOKIE)?.value;

  // Verify the OAuth state to prevent CSRF attacks.
  if (
    !code ||
    !returnedState ||
    !savedState ||
    returnedState !== savedState
  ) {
    return redirectToProfile(
      request,
      "error",
      "invalid_state",
    );
  }

  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return redirectToProfile(
      request,
      "error",
      "unauthorized",
    );
  }

  try {
    const oauthClient =
      createGoogleOAuthClient();

    const { tokens } = await oauthClient.getToken(code);

    if (!tokens.access_token) {
      return redirectToProfile(
        request,
        "error",
        "missing_access_token",
      );
    }

    // Preserve the existing refresh token when Google omits it.
    const {
      data: existingConnection,
      error: existingConnectionError,
    } = await dbAdmin
      .from("google_classroom_connections")
      .select("refresh_token_encrypted")
      .eq("user_id", currentUser.userId)
      .maybeSingle();

    if (existingConnectionError) {
      throw existingConnectionError;
    }

    const encryptedRefreshToken =
      tokens.refresh_token
        ? encryptGoogleToken(tokens.refresh_token)
        : existingConnection?.refresh_token_encrypted;

    if (!encryptedRefreshToken) {
      return redirectToProfile(
        request,
        "error",
        "missing_refresh_token",
      );
    }

    const now = new Date().toISOString();

    const { error: saveError } = await dbAdmin
      .from("google_classroom_connections")
      .upsert(
        {
          user_id: currentUser.userId,
          access_token_encrypted: encryptGoogleToken(
            tokens.access_token,
          ),
          refresh_token_encrypted:
            encryptedRefreshToken,
          token_type: tokens.token_type ?? null,
          granted_scopes: tokens.scope ?? null,
          expires_at: tokens.expiry_date
            ? new Date(tokens.expiry_date).toISOString()
            : null,
          is_active: true,
          connected_at: now,
          updated_at: now,
        },
        {
          onConflict: "user_id",
        },
      );

    if (saveError) {
      throw saveError;
    }

    return redirectToProfile(
      request,
      "connected",
    );
  } catch (error) {
    console.error(
      "Google Classroom callback failed:",
      error,
    );

    return redirectToProfile(
      request,
      "error",
      "callback_failed",
    );
  }
}