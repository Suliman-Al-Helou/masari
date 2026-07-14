// Path: src/app/onboarding/layout.tsx
// Create this file to protect onboarding on the server

import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/session";

interface OnboardingLayoutProps {
  children: React.ReactNode;
}

export default async function OnboardingLayout({
  children,
}: OnboardingLayoutProps) {
  // Requires a valid server session
  const session = await getCurrentUser();

  if (!session) {
    redirect("/login");
  }

  // Prevents admins from opening student onboarding
  if (session.role === "admin") {
    redirect("/admin");
  }
  if (session.onboarded) {
    redirect("/");
  }

  return children;
}
