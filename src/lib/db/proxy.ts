import "server-only";

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { env } from "@/config/env";

const PROTECTED_ROUTES = [
  "/profile",
  "/academic-path",
  "/semester-plan",
  "/students",
  "/course",
  "/support",
  "/onboarding",
  "/admin",
] as const;

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(
    (route) =>
      pathname === route ||
      pathname.startsWith(`${route}/`),
  );
}

function redirectWithCookies(
  url: URL,
  sourceResponse: NextResponse,
): NextResponse {
  const redirectResponse = NextResponse.redirect(url);

  // Preserve refreshed auth cookies during redirects.
  sourceResponse.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie);
  });

  return redirectResponse;
}

export async function updateSession(
  request: NextRequest,
): Promise<NextResponse> {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },

        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          response = NextResponse.next({ request });

          cookiesToSet.forEach(
            ({ name, value, options }) => {
              response.cookies.set(name, value, options);
            },
          );
        },
      },
    },
  );

  // Validate the access token before checking protected routes.
  const { data, error } =
    await supabase.auth.getClaims();

  const isAuthenticated =
    !error && Boolean(data?.claims?.sub);

  if (
    isProtectedRoute(request.nextUrl.pathname) &&
    !isAuthenticated
  ) {
    const loginUrl = new URL("/login", request.url);

    const callbackUrl =
      request.nextUrl.pathname +
      request.nextUrl.search;

    loginUrl.searchParams.set(
      "callbackUrl",
      callbackUrl,
    );

    return redirectWithCookies(loginUrl, response);
  }

  return response;
}