"use client";

import {
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";

import { useAuth } from "@/lib/hooks/useAuth";

const PUBLIC_ROUTE = "/";

const AUTH_ROUTES = [
  "/login",
  "/register",
  "/verify-email",
] as const;

const SERVER_GUARDED_ROUTES = [
  "/admin",
  "/onboarding",
] as const;

type GuardDecision =
  | { status: "allow" }
  | { status: "loading" }
  | { status: "disabled" }
  | {
      status: "redirect";
      destination: string;
    };

function matchesRoute(
  pathname: string,
  route: string,
): boolean {
  return (
    pathname === route ||
    pathname.startsWith(`${route}/`)
  );
}

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />

        <p className="text-sm font-medium text-muted-foreground">
          جاري التحميل...
        </p>
      </div>
    </div>
  );
}

export default function AuthGuard({
  children,
}: {
  children: ReactNode;
}) {
  const {
    user,
    profile,
    isDisabled,
    loading,
    logout,
  } = useAuth();

  const pathname = usePathname();
  const disabledRedirectStarted = useRef(false);

  const isAuthRoute = AUTH_ROUTES.some((route) =>
    matchesRoute(pathname, route),
  );

  const isServerGuardedRoute =
    SERVER_GUARDED_ROUTES.some((route) =>
      matchesRoute(pathname, route),
    );

  let decision: GuardDecision;

  if (isServerGuardedRoute) {
    // Server Layout owns authorization for this route.
    decision = { status: "allow" };
  } else if (loading) {
    // Wait until Supabase restores the browser session.
    decision = { status: "loading" };
  } else if (user && isDisabled) {
    // Disabled accounts must lose their browser session.
    decision = { status: "disabled" };
  } else if (isAuthRoute) {
    // Auth pages control their own navigation.
    decision = { status: "allow" };
  } else if (!user) {
    decision =
      pathname === PUBLIC_ROUTE
        ? { status: "allow" }
        : {
            status: "redirect",
            destination: `/login?callbackUrl=${encodeURIComponent(
              pathname,
            )}`,
          };
  } else if (!profile) {
    // A user without a loaded profile cannot be routed safely.
    decision = { status: "loading" };
  } else if (profile.role === "admin") {
    decision = {
      status: "redirect",
      destination: "/admin",
    };
  } else if (!profile.onboarded) {
    decision = {
      status: "redirect",
      destination: "/onboarding",
    };
  } else {
    decision = { status: "allow" };
  }

  const redirectDestination =
    decision.status === "redirect"
      ? decision.destination
      : null;
useEffect(() => {
  // Temporary guard decision diagnostics.
  console.log("[AuthGuard decision]", {
    pathname,
    status: decision.status,
    redirectDestination,
    loading,
    hasUser: Boolean(user),
    hasProfile: Boolean(profile),
    role: profile?.role ?? null,
  });
}, [
  pathname,
  decision.status,
  redirectDestination,
  loading,
  user,
  profile,
]);
  useEffect(() => {
    if (decision.status === "disabled") {
      if (disabledRedirectStarted.current) return;

      disabledRedirectStarted.current = true;

      void logout().finally(() => {
        window.location.replace(
          "/login?reason=account-disabled",
        );
      });

      return;
    }

    if (redirectDestination) {
      console.log("[AuthGuard redirect]", {
  from: pathname,
  to: redirectDestination,
});
      // Reload across auth boundaries so the server reads fresh cookies.
      window.location.replace(redirectDestination);
    }
  }, [
    decision.status,
    redirectDestination,
    logout,
  ]);

  if (decision.status === "allow") {
    return <>{children}</>;
  }

  return <LoadingScreen />;
}